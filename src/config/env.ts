import "dotenv/config";

function getEnvVar(key: string, defaultValue?: string): string {
	const value = process.env[key] ?? defaultValue;
	if (value === undefined) {
		throw new Error(`Missing required environment variable: ${key}`);
	}

	return value;
}

function getEnvVarAsNumber(key: string, defaultValue: number): number {
	const value = process.env[key];
	if (value === undefined) {
		return defaultValue;
	}

	const parsed = parseInt(value, 10);
	if (isNaN(parsed)) {
		throw new Error(`Environment variable ${key} must be a number`);
	}

	return parsed;
}

export const env = {
	API_KEY: getEnvVar("API_KEY"),
	PRICECHARTING_API_KEY: getEnvVar("PRICECHARTING_API_KEY"),
	PRICECHARTING_TIMEOUT: getEnvVarAsNumber("PRICECHARTING_TIMEOUT", 1500),
} as const;
