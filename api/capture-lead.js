/* Vercel serverless function — capture demo signup leads.
 *
 * Mirrors the backend hookups used by /book-demo on www.teambridge.com so
 * signups from the Free Tier demo land in the same admin panel + HubSpot
 * CRM. Two requests fire in parallel:
 *
 *   1. Convex `leads.capture` mutation — writes a `leads` row with
 *      source = "free_tier_signup", plus optional geo from Vercel headers.
 *   2. HubSpot Forms API — same portal + form ID as the prod book-demo
 *      handler, so the contact is created/upserted in HubSpot.
 *
 * Both calls tolerate the other failing — partial success still returns 200.
 * The browser doesn't block on this (LeadCaptureGate fires it and lets the
 * user proceed into the demo immediately), so latency here doesn't hurt UX.
 *
 * Required env (Vercel project settings):
 *   CONVEX_URL  — Convex deployment URL. Defaults to the Teambridge prod
 *                 deployment (`bright-squirrel-966.convex.cloud`).
 */

const CONVEX_URL = (process.env.CONVEX_URL || "https://bright-squirrel-966.convex.cloud").replace(/\/+$/, "");
const HUBSPOT_FORM_URL =
  "https://api.hsforms.com/submissions/v3/integration/submit/46744128/23a819f9-e970-4685-a048-fd7a3e678665";
const SOURCE = "free_tier_signup";

function decodeHeader(v) {
  if (!v) return undefined;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

function getClientIp(headers) {
  return (
    headers["x-vercel-forwarded-for"] ||
    headers["x-forwarded-for"] ||
    headers["x-real-ip"] ||
    undefined
  );
}

function splitName(full) {
  const trimmed = (full || "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const i = trimmed.indexOf(" ");
  if (i === -1) return { firstName: trimmed, lastName: "" };
  return {
    firstName: trimmed.slice(0, i),
    lastName: trimmed.slice(i + 1).trim(),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  let body;
  try {
    body =
      req.body && typeof req.body === "object"
        ? req.body
        : JSON.parse(req.body || "{}");
  } catch {
    return res.status(400).json({ error: "invalid_json" });
  }

  const {
    name,
    company,
    email,
    pageUrl,
    referrer,
    demoSessionId,
    industry,
    view,
    route,
    path,
    landingPage,
    timeInDemoMs,
    emailQuality,
    emailAttempts,
  } = body || {};
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "email_required" });
  }

  const { firstName, lastName } = splitName(name);

  // Geo enrichment — Vercel edge headers (undefined locally).
  const country = decodeHeader(req.headers["x-vercel-ip-country"]);
  const city = decodeHeader(req.headers["x-vercel-ip-city"]);
  const region = decodeHeader(req.headers["x-vercel-ip-country-region"]);
  const ipTimezone = decodeHeader(req.headers["x-vercel-ip-timezone"]);
  const ipAddress = getClientIp(req.headers);
  const userAgent = req.headers["user-agent"];

  const convexBody = {
    path: "leads:capture",
    format: "json",
    args: {
      email,
      source: SOURCE,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      company: company || undefined,
      pageUrl: pageUrl || undefined,
      pageName: "Free Tier Demo Signup",
      referrer: referrer || undefined,
      userAgent,
      country,
      city,
      region,
      ipTimezone,
      ipAddress,
      demoSessionId: demoSessionId || undefined,
      emailQuality: typeof emailQuality === 'string' ? emailQuality : undefined,
      emailAttempts: Array.isArray(emailAttempts) ? emailAttempts.slice(0, 20) : undefined,
      industry: industry || undefined,
      firstTouchLandingPage: landingPage || undefined,
      firstTouchReferrer: referrer || undefined,
      sessionDurationMs:
        typeof timeInDemoMs === "number" ? Math.max(0, timeInDemoMs) : undefined,
      extraFields: [
        ...(industry ? [{ key: "demo_industry", value: String(industry) }] : []),
        ...(view ? [{ key: "demo_view", value: String(view) }] : []),
        ...(route ? [{ key: "demo_route", value: String(route) }] : []),
        ...(path ? [{ key: "demo_path", value: String(path) }] : []),
        ...(demoSessionId ? [{ key: "demo_session_id", value: String(demoSessionId) }] : []),
      ],
    },
  };
  // Drop undefined values — Convex validators are strict about extras.
  convexBody.args = Object.fromEntries(
    Object.entries(convexBody.args).filter(([, v]) => v !== undefined)
  );

  // The HubSpot form 23a819f9-… is the same one /book-demo on
  // www.teambridge.com posts to. That form has `phone` and
  // `numberofemployees` marked as required. Our gate only collects
  // name / company / email, so we send placeholders for the
  // two HubSpot-required fields. HubSpot treats empty-string as
  // "missing" for required fields, so we send "Unknown" instead.
  // Sales can backfill the real values when they reach out — or we
  // can iterate the gate to ask for them if conversion data warrants
  // the extra friction.
  const hubspotBody = {
    fields: [
      { objectTypeId: "0-1", name: "email",             value: email },
      // Phone accepted as a free-text field; an obvious placeholder
      // is safer than empty string because HubSpot treats "" as
      // missing on a required field.
      { objectTypeId: "0-1", name: "phone",             value: "Not provided" },
      // numberofemployees is a HubSpot enumeration on this form
      // ("1 - 5", "6 - 50", "51 - 200", …). Send the first bucket as
      // a stand-in so the submission validates. Sales can correct
      // when they reach out.
      { objectTypeId: "0-1", name: "numberofemployees", value: "1 - 5" },
      ...(firstName
        ? [{ objectTypeId: "0-1", name: "firstname", value: firstName }]
        : []),
      ...(lastName
        ? [{ objectTypeId: "0-1", name: "lastname", value: lastName }]
        : []),
      ...(company
        ? [{ objectTypeId: "0-1", name: "company", value: company }]
        : []),
    ],
    context: {
      pageUri: pageUrl || "https://teambridge-free.vercel.app/",
      pageName: "Free Tier Demo Signup",
    },
  };

  const [convexResult, hubspotResult] = await Promise.allSettled([
    fetch(`${CONVEX_URL}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(convexBody),
    }).then(async r => {
      if (!r.ok) {
        const text = await r.text();
        throw new Error(`Convex ${r.status}: ${text.slice(0, 300)}`);
      }
      return r.json().catch(() => ({}));
    }),

    fetch(HUBSPOT_FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hubspotBody),
    }).then(async r => {
      if (!r.ok) {
        const text = await r.text();
        throw new Error(`HubSpot ${r.status}: ${text.slice(0, 300)}`);
      }
      return r.json().catch(() => ({}));
    }),
  ]);

  let leadId;
  if (convexResult.status === "fulfilled") {
    leadId =
      convexResult.value?.value?.leadId ||
      convexResult.value?.leadId ||
      undefined;
  }

  if (demoSessionId) {
    await fetch(`${CONVEX_URL}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "demoTracking:identifyLead",
        format: "json",
        args: Object.fromEntries(
          Object.entries({
            sessionId: demoSessionId,
            email,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            company: company || undefined,
            leadId,
          }).filter(([, v]) => v !== undefined)
        ),
      }),
    }).catch(err => {
      console.error("[capture-lead] demo identify failed:", err);
    });
  }

  const errors = [];
  if (convexResult.status === "rejected") {
    console.error("[capture-lead] Convex failed:", convexResult.reason);
    errors.push({ which: "convex", error: String(convexResult.reason) });
  }
  if (hubspotResult.status === "rejected") {
    console.error("[capture-lead] HubSpot failed:", hubspotResult.reason);
    errors.push({ which: "hubspot", error: String(hubspotResult.reason) });
  }

  return res.status(200).json({ ok: errors.length < 2, errors });
}
