import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Database } from "bun:sqlite";
import { env } from "../config/env.js";
import { PricingData } from "../models/pricing-data.js";

mkdirSync(dirname(env.CACHE_DB_PATH), { recursive: true });
const db = new Database(env.CACHE_DB_PATH);

db.run(`
	CREATE TABLE IF NOT EXISTS prices (
		id        INTEGER PRIMARY KEY AUTOINCREMENT,
		category  TEXT NOT NULL,
		item      TEXT NOT NULL,
		prices    TEXT NOT NULL,
		cached_at INTEGER NOT NULL
	)
`);

db.run(
	"CREATE INDEX IF NOT EXISTS idx_prices_lookup ON prices (category, item, cached_at)"
);

export function getCachedPrices(category: string, item: string) {
	const ttlMs = env.CACHE_TTL_SECONDS * 1000;
	const cutoff = Date.now() - ttlMs;

	const row = db
		.query<
			{ prices: string; cached_at: number },
			[string, string, number]
		>("SELECT prices, cached_at FROM prices WHERE category = ? AND item = ? AND cached_at > ? ORDER BY cached_at DESC LIMIT 1")
		.get(category, item, cutoff);

	if (!row) {
		return null;
	}

	const prices = JSON.parse(row.prices) as Record<string, number>;

	return {
		prices,
		cached_at: row.cached_at,
	};
}

export function setCachedPrices(
	category: string,
	item: string,
	prices: Record<string, number>
) {
	db.run(
		"INSERT INTO prices (category, item, prices, cached_at) VALUES (?, ?, ?, ?)",
		[category, item, JSON.stringify(prices), Date.now()]
	);
}
