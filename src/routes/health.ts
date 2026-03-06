import { Hono } from "hono";
import { isPriceChartingUp } from "../services/pricecharting-service.js";

const hono = new Hono();

hono.get("/", async (c) => {
	const priceChartingUp = await isPriceChartingUp();

	const status = {
		status: priceChartingUp ? "healthy" : "degraded",
		timestamp: new Date().toISOString(),
		services: {
			api: "up",
			priceCharting: priceChartingUp ? "up" : "down",
		},
	};

	return c.json(status, 200);
});

export { hono as health };
