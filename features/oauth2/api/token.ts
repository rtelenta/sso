import { Hono } from "hono";
import { z } from "zod";
import { SignJWT } from "jose";
import { eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { db } from "@/db";
import { authCode, refreshToken, user } from "@/db/schema";
import { JWT_SECRET, OAUTH_CLIENTS } from "@/lib/constants";

export const tokenRouter = new Hono();

const tokenBodySchema = z.object({
  grant_type: z.literal("authorization_code"),
  code: z.string(),
  redirect_uri: z.string(),
  client_id: z.string(),
  client_secret: z.string(),
});

const refreshBodySchema = z.object({
  refresh_token: z.string(),
  client_id: z.string(),
  client_secret: z.string(),
});

function jwtSecret() {
  return new TextEncoder().encode(JWT_SECRET);
}

async function signAccessToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(jwtSecret());
}

tokenRouter.post("/token", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid_request" }, 400);
  }

  const parsed = tokenBodySchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "invalid_request" }, 400);

  const { code, redirect_uri, client_id, client_secret } = parsed.data;

  if (OAUTH_CLIENTS[client_id] !== client_secret) {
    return c.json({ error: "invalid_client" }, 401);
  }

  const [codeRow] = await db
    .select()
    .from(authCode)
    .where(eq(authCode.code, code))
    .limit(1);

  if (!codeRow) return c.json({ error: "invalid_grant", error_description: "Unknown code" }, 400);
  if (codeRow.usedAt) return c.json({ error: "invalid_grant", error_description: "Code already used" }, 400);
  if (codeRow.expiresAt < new Date()) return c.json({ error: "invalid_grant", error_description: "Code expired" }, 400);
  if (codeRow.redirectUri !== redirect_uri) return c.json({ error: "invalid_grant", error_description: "redirect_uri mismatch" }, 400);

  const [userRow] = await db.select().from(user).where(eq(user.id, codeRow.userId)).limit(1);
  if (!userRow) return c.json({ error: "invalid_grant" }, 400);

  await db.update(authCode).set({ usedAt: new Date() }).where(eq(authCode.id, codeRow.id));

  const accessToken = await signAccessToken(userRow.id, userRow.email);

  const refreshTokenValue = Buffer.from(crypto.getRandomValues(new Uint8Array(64))).toString("hex");
  await db.insert(refreshToken).values({
    id: uuidv7(),
    token: refreshTokenValue,
    userId: userRow.id,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return c.json({
    access_token: accessToken,
    refresh_token: refreshTokenValue,
    token_type: "Bearer",
    expires_in: 900,
  });
});

tokenRouter.post("/token/refresh", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid_request" }, 400);
  }

  const parsed = refreshBodySchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "invalid_request" }, 400);

  const { refresh_token: tokenValue, client_id, client_secret } = parsed.data;

  if (OAUTH_CLIENTS[client_id] !== client_secret) {
    return c.json({ error: "invalid_client" }, 401);
  }

  const [tokenRow] = await db
    .select()
    .from(refreshToken)
    .where(eq(refreshToken.token, tokenValue))
    .limit(1);

  if (!tokenRow) return c.json({ error: "invalid_grant" }, 401);
  if (tokenRow.revokedAt) return c.json({ error: "invalid_grant", error_description: "Token revoked" }, 401);
  if (tokenRow.expiresAt < new Date()) return c.json({ error: "invalid_grant", error_description: "Token expired" }, 401);

  const [userRow] = await db.select().from(user).where(eq(user.id, tokenRow.userId)).limit(1);
  if (!userRow) return c.json({ error: "invalid_grant" }, 401);

  const accessToken = await signAccessToken(userRow.id, userRow.email);

  return c.json({
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: 900,
  });
});

tokenRouter.all("/token", (c) => c.text("Method Not Allowed", 405));
tokenRouter.all("/token/refresh", (c) => c.text("Method Not Allowed", 405));
