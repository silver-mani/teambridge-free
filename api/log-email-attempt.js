/* Vercel serverless function — silently log a blocked email attempt.
 * Called fire-and-forget from LeadCaptureGate when the user submits a
 * personal or disposable email. Never returns an error to the client.
 */

const CONVEX_URL = (process.env.CONVEX_URL || "https://bright-squirrel-966.convex.cloud").replace(/\/+$/, "");

function decodeHeader(v) {
  if (!v) return undefined;
  try { return decodeURIComponent(v); } catch { return v; }
}

function getClientIp(headers) {
  return (
    headers["x-vercel-forwarded-for"] ||
    headers["x-forwarded-for"] ||
    headers["x-real-ip"] ||
    undefined
  );
}

export default async function handler(req, res) {
  // Always 200 — this is fire-and-forget
  if (req.method !== "POST") return res.status(200).json({ ok: true });

  let body;
  try {
    body = req.body && typeof req.body === "object"
      ? req.body
      : JSON.parse(req.body || "{}");
  } catch {
    return res.status(200).json({ ok: true });
  }

  const { sessionId, attemptedEmail, emailQuality, userAgent } = body || {};
  if (!sessionId || !attemptedEmail || !emailQuality) {
    return res.status(200).json({ ok: true });
  }

  const country   = decodeHeader(req.headers["x-vercel-ip-country"]);
  const city      = decodeHeader(req.headers["x-vercel-ip-city"]);
  const region    = decodeHeader(req.headers["x-vercel-ip-country-region"]);
  const ipAddress = getClientIp(req.headers);

  const args = Object.fromEntries(
    Object.entries({
      sessionId:      String(sessionId).slice(0, 120),
      attemptedEmail: String(attemptedEmail).slice(0, 200),
      emailQuality:   String(emailQuality).slice(0, 20),
      ipAddress,
      country,
      city,
      region,
      userAgent: userAgent ? String(userAgent).slice(0, 500) : undefined,
    }).filter(([, v]) => v !== undefined)
  );

  try {
    await fetch(`${CONVEX_URL}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "leads:logEmailAttempt", format: "json", args }),
    });
  } catch {
    // Swallowed — log failure is non-fatal
  }

  return res.status(200).json({ ok: true });
}
