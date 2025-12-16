// This file is kept for backwards compatibility but is no longer used.
// The app now uses Convex instead of PostgreSQL.
// If you need to use PostgreSQL, uncomment the code below and set DATABASE_URL.

/*
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({ client: pool, schema, casing: "snake_case" });
*/

// Placeholder exports for compatibility
export const pool = null as any;
export const db = null as any;
