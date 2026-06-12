"use server";

import { db } from "@/db";
import { authCode } from "@/db/schema";
import { uuidv7 } from "uuidv7";

export async function generateAuthCode(userId: string, redirectUri: string): Promise<string> {
  const code = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await db.insert(authCode).values({
    id: uuidv7(),
    code,
    userId,
    redirectUri,
    expiresAt,
  });

  return code;
}
