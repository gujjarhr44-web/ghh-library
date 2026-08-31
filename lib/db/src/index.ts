import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const rawDbUrl = process.env.DATABASE_URL;

function createPool(): pg.Pool | null {
  if (!rawDbUrl) return null;

  const isSupabase =
    rawDbUrl.includes("supabase.co") ||
    rawDbUrl.includes("pooler.supabase.com") ||
    rawDbUrl.includes("sslmode=require") ||
    process.env.NODE_ENV === "production";

  // When connecting to Supabase via node-postgres, passing ?sslmode=require in the URI
  // makes pg-connection-string override ssl options and reject Supabase intermediate certs.
  // Stripping sslmode parameter allows the explicit ssl: { rejectUnauthorized: false } to handle SSL smoothly.
  let connectionString = rawDbUrl;
  try {
    const parsed = new URL(rawDbUrl);
    parsed.searchParams.delete("sslmode");
    parsed.searchParams.delete("ssl");

    if (parsed.username.startsWith("postgres.")) {
      const ref = parsed.username.split(".")[1];
      if (parsed.hostname.endsWith(".supabase.co")) {
        parsed.username = "postgres";
      } else if (parsed.hostname.includes("pooler.supabase.com")) {
        // Direct database host fallback connects directly to project host on port 5432
        parsed.hostname = `db.${ref}.supabase.co`;
        parsed.port = "5432";
        parsed.username = "postgres";
      }
    }

    connectionString = parsed.toString();
  } catch {
    // Fallback if URL parsing fails
  }

  const p = new Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });

  p.on("error", (err) => {
    console.error("[PostgreSQL Pool Error]:", err.message);
  });

  return p;
}

export const pool = createPool();

export const db = pool
  ? drizzle(pool, { schema })
  : (null as unknown as ReturnType<typeof drizzle<typeof schema>>);

export * from "./schema";
