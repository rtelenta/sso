import { createAuthClient } from "better-auth/client";
import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { NEXT_PUBLIC_APP_URL } from "@/lib/constants";

export const authClient = createAuthClient({
  baseURL: NEXT_PUBLIC_APP_URL,
  plugins: [oauthProviderClient()],
});
