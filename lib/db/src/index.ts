import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let _pool: pg.Pool | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getPool(): pg.Pool {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    // Supabase (and many hosted Postgres providers) present a cert chain that
    // Node rejects unless we relax verification. Prefer Session pooler URIs on
    // IPv4-only hosts (Render free); Direct is IPv6-only by default.
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "false" ? undefined : { rejectUnauthorized: false },
    });
  }
  return _pool;
}

function getDb() {
  if (!_db) {
    _db = drizzle(getPool(), { schema });
  }
  return _db;
}

/** Lazy so dotenv / host env can load before first query. */
export const pool = new Proxy({} as pg.Pool, {
  get(_t, prop, receiver) {
    const p = getPool();
    const value = Reflect.get(p, prop, receiver);
    return typeof value === "function" ? value.bind(p) : value;
  },
});

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_t, prop, receiver) {
    const d = getDb();
    const value = Reflect.get(d as object, prop, receiver);
    return typeof value === "function" ? value.bind(d) : value;
  },
});

export * from "./schema";
