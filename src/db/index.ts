import { drizzle } from 'drizzle-orm/postgres-js';

type Database = ReturnType<typeof drizzle>;

declare global {
	// eslint-disable-next-line no-var
	var _db: Database | undefined;
}

export function db(): Database {
	if (global._db) return global._db;

	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error('DATABASE_URL is not set');
	}

	const database = drizzle(url);

	if (process.env.NODE_ENV !== 'production') {
		global._db = database;
	}

	return database;
}
