export const DATABASE_URL = process.env.DATABASE_URL!;
export const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET!;
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
export const OAUTH_CLIENTS: OAuthClientSeed[] = JSON.parse(
  process.env.OAUTH_CLIENTS ?? "[]"
);

export interface OAuthClientSeed {
  clientId: string;
  clientSecret: string;
  name: string;
  redirectUris: string[];
  postLogoutRedirectUris?: string[];
  skipConsent?: boolean;
  requirePKCE?: boolean;
  grantTypes?: string[];
  responseTypes?: string[];
  tokenEndpointAuthMethod?: string;
}
