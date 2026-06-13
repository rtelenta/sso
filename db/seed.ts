import { db } from "@/db";
import { oauthClient } from "@/db/schema";
import { DEV_CLIENT_SECRET } from "@/lib/constants";
import { eq } from "drizzle-orm";
import { generateId } from "better-auth";

async function seed() {
  const existing = await db
    .select({ id: oauthClient.id })
    .from(oauthClient)
    .where(eq(oauthClient.clientId, "dev-client"))
    .limit(1);

  if (existing.length > 0) {
    console.log("dev-client already exists, skipping");
    return;
  }

  await db.insert(oauthClient).values({
    id: generateId(),
    clientId: "dev-client",
    clientSecret: DEV_CLIENT_SECRET,
    redirectUris: ["http://localhost:3001/callback"],
    skipConsent: true,
    requirePKCE: false,
    grantTypes: ["authorization_code", "refresh_token"],
    responseTypes: ["code"],
    tokenEndpointAuthMethod: "client_secret_post",
    name: "Dev Client",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Seeded dev-client");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
