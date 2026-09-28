# pricecharting-api

A small REST API that scrapes video game prices from [PriceCharting](https://www.pricecharting.com).

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

### `GET /api/product`

Returns the product from PriceCharting.

```
GET /api/product/?id=2456
```

```json
{
	"id": "2456",
	"productName": "Pokemon FireRed",
	"consoleName": "GameBoy Advance",
	"genre": "RPG",
	"upc": "045496734114",
	"releaseDate": "2004-09-01",
	"pricing": {
		"loosePrice": 151.8,
		"cibPrice": 553.8,
		"newPrice": 1739.5,
		"gradedPrice": 4366.5,
		"boxOnlyPrice": 269.1,
		"manualOnlyPrice": 24.85
	}
}
```

#### Query params

| Param       | Description                                      |
| ----------- | ------------------------------------------------ |
| `id`        | Gets the product based on the id                 |
| `q`         | Gets the product based on the search query       |
| `upc`       | Gets the product based on the upc                |
| `priceType` | Return a single price by key (e.g. `used_price`) |

```
GET /api/product?id=2456&priceType=usedPrice
→ 38.86
```

## Environment Variables

| Variable                | Default      | Description                                  |
| ----------------------- | ------------ | -------------------------------------------- |
| `API_KEY`               | _(required)_ | Bearer token for authenticating API requests |
| `PRICECHARTING_API_KEY` | _(required)_ | Token for authenticating with PriceCharting  |
| `PRICECHARTING_TIMEOUT` | `5000`       | Fetch timeout in milliseconds                |
