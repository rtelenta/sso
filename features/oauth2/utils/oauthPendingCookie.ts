const COOKIE_NAME = "oauth_pending";
const TTL_SECONDS = 600; // 10 minutes

interface OAuthPendingPayload {
  redirect_uri: string;
  state: string;
  client_id: string;
  exp: number;
}

async function hmacSign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Buffer.from(sig).toString("base64url");
}

async function hmacVerify(value: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const sig = Buffer.from(signature, "base64url");
  return crypto.subtle.verify("HMAC", key, sig, new TextEncoder().encode(value));
}

export async function createOAuthPendingCookieValue(
  redirectUri: string,
  state: string,
  clientId: string,
  secret: string
): Promise<string> {
  const payload: OAuthPendingPayload = {
    redirect_uri: redirectUri,
    state,
    client_id: clientId,
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = await hmacSign(encoded, secret);
  return `${encoded}.${signature}`;
}

export async function parseOAuthPendingCookieValue(
  cookieValue: string,
  secret: string
): Promise<OAuthPendingPayload | null> {
  const dotIndex = cookieValue.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const encoded = cookieValue.slice(0, dotIndex);
  const signature = cookieValue.slice(dotIndex + 1);

  const valid = await hmacVerify(encoded, signature, secret);
  if (!valid) return null;

  let payload: OAuthPendingPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (Math.floor(Date.now() / 1000) > payload.exp) return null;

  return payload;
}

export { COOKIE_NAME, TTL_SECONDS };
