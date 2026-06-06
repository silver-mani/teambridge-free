import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_SKEW_MS = 60 * 1000;

function secret() {
  return process.env.DEMO_ACCESS_SECRET || process.env.AUTH_SECRET || "teambridge-demo-access-v1";
}

function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function verifyToken(token) {
  const [encoded, signature] = String(token || "").split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || payload.exp + TOKEN_TTL_SKEW_MS < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  let body;
  try {
    body = req.body && typeof req.body === "object" ? req.body : JSON.parse(req.body || "{}");
  } catch {
    return res.status(400).json({ valid: false, error: "invalid_json" });
  }

  const payload = verifyToken(body?.token);
  if (!payload) {
    return res.status(401).json({ valid: false });
  }

  return res.status(200).json({
    valid: true,
    email: typeof payload.email === "string" ? payload.email : undefined,
    source: typeof payload.source === "string" ? payload.source : undefined,
    demoSessionId: typeof payload.demoSessionId === "string" ? payload.demoSessionId : undefined,
  });
}
