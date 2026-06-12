import { Hono } from "hono";
import { auth } from "@/lib/auth";
import { oauthRouter } from "@/features/oauth2/api/oauth";
import { tokenRouter } from "@/features/oauth2/api/token";

export const app = new Hono().basePath("/api");

app.get("/health", (c) => c.json({ status: "ok" }));

app.all("/auth/*", (c) => auth.handler(c.req.raw));
app.route("/", oauthRouter);
app.route("/", tokenRouter);
