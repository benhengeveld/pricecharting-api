import * as cheerio from "cheerio";
import { env } from "../config/env.js";
import { getCachedPrices, setCachedPrices } from "./cache-service.js";
import { PricingData } from "../models/pricing-data.js";

const baseUrl = "https://www.pricecharting.com";

const isPriceChartingUpCacheDuration = 60 * 1000;
let isPriceChartingUpLastCheck = 0;
let isPriceChartingUpLastResult = false;

export async function isPriceChartingUp() {
	const now = Date.now();

	if (now - isPriceChartingUpLastCheck < isPriceChartingUpCacheDuration) {
		return isPriceChartingUpLastResult;
	}

	try {
		const response = await fetchPriceCharting(baseUrl, {
			method: "HEAD",
		});

		isPriceChartingUpLastResult = response.ok;
		isPriceChartingUpLastCheck = now;

		return response.ok;
	} catch (error) {
		isPriceChartingUpLastResult = false;
		isPriceChartingUpLastCheck = now;

		return false;
	}
}

export async function getPricingData(category: string, item: string) {
	const cached = getCachedPrices(category, item);
	if (cached) {
		return {
			prices: cached.prices,
			timestamp: cached.cached_at,
		} as PricingData;
	}

	const response = await fetchPriceCharting(
		`${baseUrl}/game/${category}/${item}`,
		{
			method: "GET",
		}
	);

	if (!response.ok) {
		throw new Error("Failed to fetch pricing data");
	}

	const html = await response.text();
	const prices = extractPricesFromPriceChartingHtml(html);
	if (prices) {
		setCachedPrices(category, item, prices);
	}

	return {
		prices,
		timestamp: Date.now(),
	} as PricingData;
}

async function fetchPriceCharting(
	input: string | URL | Request,
	init?: RequestInit
) {
	const controller = new AbortController();
	const timeout = setTimeout(
		() => controller.abort(),
		env.PRICECHARTING_TIMEOUT
	);

	try {
		const response = await fetch(input, {
			...init,
			signal: init?.signal ?? controller.signal,
		});
		return response;
	} finally {
		clearTimeout(timeout);
	}
}

function extractPricesFromPriceChartingHtml(html: string) {
	const $ = cheerio.load(html);

	const prices: Record<string, number> = {};

	const row = $("#price_data tbody tr").first();

	if (!row.length) {
		return null;
	}

	row.find("td[id]").each((_i, element) => {
		const id = $(element).attr("id");

		if (!id) {
			return;
		}

		const priceText = $(element).find("span.price.js-price").first().text();
		const price = parsePrice(priceText);

		if (price !== null) {
			prices[id] = price;
		}
	});

	return prices;
}

function parsePrice(text: string) {
	const cleaned = text.trim().replace(/[^\d.]/g, "");

	const n = Number(cleaned);
	return Number.isFinite(n) ? n : null;
}
