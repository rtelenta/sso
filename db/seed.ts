import { db } from "@/db";
import { oauthClient } from "@/db/schema";
import { OAUTH_CLIENTS } from "@/lib/constants";
import { eq } from "drizzle-orm";
import { generateId } from "better-auth";

async function seed() {
  for (const client of OAUTH_CLIENTS) {
    const existing = await db
      .select({ id: oauthClient.id })
      .from(oauthClient)
      .where(eq(oauthClient.clientId, client.clientId))
      .limit(1);

    if (existing.length > 0) {
      console.log(`${client.clientId} already exists, skipping`);
      continue;
    }

    await db.insert(oauthClient).values({
      id: generateId(),
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      name: client.name,
      redirectUris: client.redirectUris,
      postLogoutRedirectUris: client.postLogoutRedirectUris,
      skipConsent: client.skipConsent ?? true,
      requirePKCE: client.requirePKCE ?? false,
      grantTypes: client.grantTypes ?? ["authorization_code", "refresh_token"],
      responseTypes: client.responseTypes ?? ["code"],
      tokenEndpointAuthMethod:
        client.tokenEndpointAuthMethod ?? "client_secret_post",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`Seeded ${client.clientId}`);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
