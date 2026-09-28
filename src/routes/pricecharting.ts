import { Hono } from "hono";
import * as PriceChartingService from "../services/pricecharting-service.js";
import { PriceChartingProduct } from "../models/price-charting-data.js";

const hono = new Hono();

hono.get("/price", async (c) => {
	const product = await PriceChartingService.getProduct({ id: "2456" });
	console.log(JSON.stringify(product));
	return c.json(product);
	// return c.json({ error: "Failed to fetch pricing data" }, 404);
});

export { hono as pricecharting };
