"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, isNull, eq } from "drizzle-orm";
import { db } from "@/db";
import { refreshToken } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function signOut(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user?.id) {
    await db
      .update(refreshToken)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshToken.userId, session.user.id), isNull(refreshToken.revokedAt))
      );
  }

  await auth.api.signOut({ headers: await headers() });

  redirect("/");
}
