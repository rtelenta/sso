import { Hono } from "hono";
import { z } from "zod";
import { eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { refreshToken } from "@/db/schema";
import { OAUTH_CLIENTS } from "@/lib/constants";

export const logoutRouter = new Hono();

const logoutBodySchema = z.object({
  refresh_token: z.string(),
  client_id: z.string(),
  client_secret: z.string(),
});

logoutRouter.post("/logout", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "invalid_request" }, 400);
  }

  const parsed = logoutBodySchema.safeParse(body);
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

  if (!tokenRow) return c.json({ error: "not_found" }, 404);

  if (!tokenRow.revokedAt) {
    await db
      .update(refreshToken)
      .set({ revokedAt: new Date() })
      .where(eq(refreshToken.id, tokenRow.id));
  }

  return c.json({});
});

logoutRouter.all("/logout", (c) => c.text("Method Not Allowed", 405));
