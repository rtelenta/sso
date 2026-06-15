import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { uuidv7 } from "uuidv7";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { BETTER_AUTH_SECRET, NEXT_PUBLIC_APP_URL } from "@/lib/constants";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  secret: BETTER_AUTH_SECRET,
  baseURL: NEXT_PUBLIC_APP_URL,
  emailAndPassword: { enabled: true },
  advanced: {
    database: { generateId: () => uuidv7() },
  },
  plugins: [
    jwt(),
    oauthProvider({
      loginPage: "/sign-in",
      consentPage: "/sign-in",
      silenceWarnings: { oauthAuthServerConfig: true },
    }),
  ],
});
