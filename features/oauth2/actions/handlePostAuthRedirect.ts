"use server";

import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";
import { BETTER_AUTH_SECRET } from "@/lib/constants";
import { parseOAuthPendingCookieValue, COOKIE_NAME } from "@/features/oauth2/utils/oauthPendingCookie";
import { generateAuthCode } from "@/features/oauth2/utils/generateAuthCode";

export async function handlePostAuthRedirect(): Promise<string> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value;

  if (!cookieValue) return "/";

  const pending = await parseOAuthPendingCookieValue(cookieValue, BETTER_AUTH_SECRET);
  if (!pending) return "/";

  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user?.id) return "/";

  const code = await generateAuthCode(session.user.id, pending.redirect_uri);

  cookieStore.delete(COOKIE_NAME);

  const url = new URL(pending.redirect_uri);
  url.searchParams.set("code", code);
  if (pending.state) url.searchParams.set("state", pending.state);

  return url.toString();
}
