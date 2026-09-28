import { Hono } from "hono";

const hono = new Hono();

hono.get("/", async (c) => {
	const status = {
		status: "healthy",
		timestamp: new Date().toISOString(),
		services: {
			api: "up",
		},
	};

	return c.json(status, 200);
});

export { hono as health };
