# pricecharting-api

A small REST API that scrapes video game prices from [PriceCharting](https://www.pricecharting.com) and caches them locally in a SQLite database.

## Requirements

- [Bun](https://bun.sh)

## Setup

```bash
bun install
cp .env.example .env
# fill in API_KEY in .env
```

## Running

```bash
bun run dev
```

## Endpoints

All `/api/*` routes require an `Authorization: Bearer <API_KEY>` header.

### `GET /health`

Returns the API status and whether PriceCharting is reachable.

```json
{
	"status": "healthy",
	"timestamp": "2026-03-06T12:00:00.000Z",
	"services": {
		"api": "up",
		"priceCharting": "up"
	}
}
```

### `GET /api/price/:category/:item`

Returns all available prices for a game. The `category` and `item` come from the PriceCharting URL: `pricecharting.com/game/:category/:item`.

```
GET /api/price/nintendo-64/super-mario-64
```

```json
{
	"used_price": 38.86,
	"complete_price": 140.14,
	"new_price": 1075.01,
	"graded_price": 4612.7,
	"box_only_price": 46.54,
	"manual_only_price": 8.8
}
```

#### Query params

| Param       | Description                                      |
| ----------- | ------------------------------------------------ |
| `priceType` | Return a single price by key (e.g. `used_price`) |

```
GET /api/price/nintendo-64/super-mario-64?priceType=used_price
→ 38.86
```

## Caching

Prices are cached in a local SQLite database. Each fetch appends a new row, preserving full price history. On subsequent requests within the TTL window, the most recent cached entry is returned without hitting PriceCharting.

```bash
bun run cache:clear   # delete the local cache DB
```

## Environment Variables

| Variable                | Default           | Description                                     |
| ----------------------- | ----------------- | ----------------------------------------------- |
| `API_KEY`               | _(required)_      | Bearer token for authenticating API requests    |
| `PRICECHARTING_TIMEOUT` | `5000`            | Fetch timeout in milliseconds                   |
| `CACHE_DB_PATH`         | `.cache/cache.db` | Path to the SQLite cache database file          |
| `CACHE_TTL_SECONDS`     | `86400`           | Time-to-live for cached prices (default: 1 day) |
