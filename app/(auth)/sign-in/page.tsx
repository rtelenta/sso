import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SignInPage } from "@/features/auth/pages/SignInPage";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });

  const initialSession = session
    ? { user: { name: session.user.name ?? null, email: session.user.email } }
    : null;
  return <SignInPage initialSession={initialSession} />;
}
