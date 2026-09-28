import * as cheerio from "cheerio";
import { env } from "../config/env.js";
import { PriceChartingProduct } from "../models/price-charting-data.js";

const baseUrl = "https://www.pricecharting.com/api";
const usdToCad = 1.42;
const requestIntervalMs = 1500;

let requestQueue: Promise<unknown> = Promise.resolve();

type PriceChartingData = {
	id: string;
	"product-name": string;
	"console-name": string;
	genre: string;
	upc: string;
	"release-date": string;
	"loose-price": number;
	"cib-price": number;
	"new-price": number;
	"graded-price": number;
	"box-only-price": number;
	"manual-only-price": number;
	status: "success";
};

type PriceChartingError = {
	status: "error";
	error: string;
	"error-message": string;
};

export async function getProduct(params: {
	id?: string;
	q?: string;
	upc?: string;
}) {
	let url = `${baseUrl}/product?t=${env.PRICE_CHARTING_API_KEY}`;

	if (params.id) {
		url += `&id=${params.id}`;
	}

	if (params.q) {
		url += `&q=${params.q}`;
	}

	if (params.upc) {
		url += `&upc=${params.upc}`;
	}

	const response = await enqueue(() =>
		fetch(url, {
			method: "GET",
		})
	);

	if (!response.ok) {
		throw new Error(`PriceCharting request failed: ${response.status}`);
	}

	const data = (await response.json()) as
		| PriceChartingError
		| PriceChartingData;

	if (data.status !== "success") {
		throw new Error(data["error-message"] ?? "Unknown PriceCharting error");
	}

	return {
		id: data.id,
		productName: data["product-name"],
		consoleName: data["console-name"],
		genre: data.genre,
		upc: data.upc,
		releaseDate: data["release-date"],
		pricing: {
			loosePrice: Math.round(data["loose-price"] * usdToCad) / 100,
			cibPrice: Math.round(data["cib-price"] * usdToCad) / 100,
			newPrice: Math.round(data["new-price"] * usdToCad) / 100,
			gradedPrice: Math.round(data["graded-price"] * usdToCad) / 100,
			boxOnlyPrice: Math.round(data["box-only-price"] * usdToCad) / 100,
			manualOnlyPrice:
				Math.round(data["manual-only-price"] * usdToCad) / 100,
		},
	} as PriceChartingProduct;
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
	const result = requestQueue.then(task);
	requestQueue = result
		.catch(() => {})
		.then(
			() =>
				new Promise((resolve) => setTimeout(resolve, requestIntervalMs))
		);
	return result;
}
