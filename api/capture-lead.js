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

  const { name, company, email, pageUrl, referrer } = body || {};
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "email_required" });
  }

  const { firstName, lastName } = splitName(name);

  // Geo enrichment — Vercel edge headers (undefined locally).
  const country = decodeHeader(req.headers["x-vercel-ip-country"]);
  const city = decodeHeader(req.headers["x-vercel-ip-city"]);
  const region = decodeHeader(req.headers["x-vercel-ip-country-region"]);
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
    },
  };
  // Drop undefined values — Convex validators are strict about extras.
  convexBody.args = Object.fromEntries(
    Object.entries(convexBody.args).filter(([, v]) => v !== undefined)
  );

  const hubspotBody = {
    fields: [
      { objectTypeId: "0-1", name: "email", value: email },
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
