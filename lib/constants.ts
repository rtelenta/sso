export const DATABASE_URL = process.env.DATABASE_URL!;
export const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET!;
export const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
export const JWT_SECRET = process.env.JWT_SECRET!;
export const OAUTH_CLIENTS: Record<string, string> = JSON.parse(
  process.env.OAUTH_CLIENTS ?? "{}"
);
