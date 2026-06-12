import { Hono } from "hono";
import { auth } from "@/lib/auth";

export const app = new Hono().basePath("/api");

app.get("/health", (c) => c.json({ status: "ok" }));

app.all("/auth/*", (c) => auth.handler(c.req.raw));
