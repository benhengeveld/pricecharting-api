import { Hono } from "hono";
import { prettyJSON } from "hono/pretty-json";
import { pricecharting } from "./routes/pricecharting";
import { health } from "./routes/health";
import { authMiddleware } from "./middleware/auth";

const app = new Hono();

app.use("*", prettyJSON());
app.use("/api/*", authMiddleware);

app.route("/api", pricecharting);
app.route("/health", health);

app.notFound((c) => {
	return c.json({ error: "Not Found" }, 404);
});

app.onError((err, c) => {
	console.error("Unhandled error:", err);
	return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
