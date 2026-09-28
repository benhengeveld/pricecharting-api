import { Hono } from "hono";
import * as PriceChartingService from "../services/pricecharting-service.js";
import { PriceChartingProduct } from "../models/price-charting-data.js";

const hono = new Hono();

hono.get("/product", async (c) => {
	const id = c.req.query("id");
	const q = c.req.query("q");
	const upc = c.req.query("upc");

	const priceType = c.req.query("priceType");

	let product: PriceChartingProduct;
	try {
		product = await PriceChartingService.getProduct({ id, q, upc });
	} catch (error) {
		if (error instanceof Error) {
			return c.json({ error: error.message }, 502);
		} else {
			return c.json({ error: "PriceCharting request failed" }, 502);
		}
	}

	if (priceType) {
		let price: number | null = null;
		switch (priceType) {
			case "loosePrice":
				price = product.pricing.loosePrice;
			case "cibPrice":
				price = product.pricing.cibPrice;
			case "newPrice":
				price = product.pricing.newPrice;
			case "gradedPrice":
				price = product.pricing.gradedPrice;
			case "boxOnlyPrice":
				price = product.pricing.boxOnlyPrice;
			case "manualOnlyPrice":
				price = product.pricing.manualOnlyPrice;
		}

		if (price === null) {
			return c.json(
				{ error: "Failed to find price for price type" },
				404
			);
		}

		return c.text(price.toString());
	}

	return c.json(product);
});

export { hono as pricecharting };
