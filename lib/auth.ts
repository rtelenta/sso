import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { jwt } from "better-auth/plugins";
import { oauthProvider } from "@better-auth/oauth-provider";
import { uuidv7 } from "uuidv7";
import { db } from "@/db";
import * as schema from "@/db/schema";
import {
  BETTER_AUTH_SECRET,
  EMAIL_API_TOKEN,
  EMAIL_API_URL,
  NEXT_PUBLIC_APP_URL,
} from "@/lib/constants";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  secret: BETTER_AUTH_SECRET,
  baseURL: NEXT_PUBLIC_APP_URL,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await fetch(`${EMAIL_API_URL}/api/v1/send`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${EMAIL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateName: "recover password",
          to: user.email,
          content: { resetLink: url },
        }),
      });
    },
  },
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
