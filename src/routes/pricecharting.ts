import { Hono } from "hono";
import { getPricingData } from "../services/pricecharting-service.js";
import { PricingData } from "../models/pricing-data.js";

const hono = new Hono();

hono.get("/price/:category/:item", async (c) => {
	const category = c.req.param("category");
	if (!category) {
		return c.json({ error: "Missing category, and item parameters" }, 400);
	}

	const item = c.req.param("item");
	if (!item) {
		return c.json({ error: "Missing item parameter" }, 400);
	}

	const priceType = c.req.query("priceType");

	let pricing: PricingData | null = null;
	try {
		pricing = await getPricingData(category, item);
	} catch (error) {
		return c.json({ error: "Failed to retrieve data" }, 502);
	}

	if (!pricing) {
		return c.json({ error: "Failed to fetch pricing data" }, 404);
	}

	if (priceType) {
		const price = pricing.prices[priceType] ?? null;

		if (price === null) {
			return c.json(
				{ error: "Failed to find price for price type" },
				404
			);
		}

		return c.text(price.toString());
	}

	return c.json(pricing);
});

export { hono as pricecharting };
