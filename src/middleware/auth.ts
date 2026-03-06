import type { Context, Next } from "hono";
import { env } from "../config/env.js";

declare module "hono" {
	interface ContextVariableMap {
		apiKey: string;
	}
}

export async function authMiddleware(c: Context, next: Next) {
	const existingApiKey = c.get("apiKey");
	if (existingApiKey) {
		await next();
		return;
	}

	const authHeader = c.req.header("Authorization");
	if (!authHeader) {
		return c.json({ error: "Missing Authorization header" }, 401);
	}

	const [scheme, token] = authHeader.split(" ");
	if (scheme !== "Bearer" || !token) {
		return c.json({ error: "Invalid Authorization header format" }, 401);
	}

	const apiKey = await validateApiKey(token);

	if (!apiKey) {
		return c.json({ error: "Invalid or expired API key" }, 401);
	}

	c.set("apiKey", apiKey);

	await next();
}

async function validateApiKey(key: string) {
	if (key === env.API_KEY) {
		return key;
	}

	return null;
}
