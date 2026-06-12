import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { signOut } from "@/features/auth/actions/signOut";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    return (
      <form action={signOut}>
        <button type="submit">Sign out</button>
      </form>
    );
  }

  return <Link href="/sign-in">Sign in</Link>;
}
