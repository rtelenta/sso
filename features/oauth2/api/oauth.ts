import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { BETTER_AUTH_SECRET } from "@/lib/constants";
import {
  createOAuthPendingCookieValue,
  COOKIE_NAME,
  TTL_SECONDS,
} from "@/features/oauth2/utils/oauthPendingCookie";

export const oauthRouter = new Hono();

oauthRouter.get("/oauth/start", async (c) => {
  const redirectUri = c.req.query("redirect_uri");
  if (!redirectUri) return c.redirect("/sign-in");

  const state = c.req.query("state") ?? "";
  const clientId = c.req.query("client_id") ?? "";

  const cookieValue = await createOAuthPendingCookieValue(
    redirectUri,
    state,
    clientId,
    BETTER_AUTH_SECRET
  );

  setCookie(c, COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: "Lax",
    maxAge: TTL_SECONDS,
    path: "/",
  });

  return c.redirect("/sign-in");
});

oauthRouter.all("/oauth/start", (c) => c.text("Method Not Allowed", 405));
