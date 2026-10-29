import { Pool, types, type PoolConfig } from "pg";
import { readFileSync, readdirSync } from "node:fs";
import type { ManagedDatabase } from "./managed";

/** API uses SQLite-compatible ? placeholders; never substitute values into SQL. */
export function postgresQuery(sql: string) {
  let position = 0;
  return sql.replace(
    /'(?:''|[^'])*'|"(?:""|[^"])*"|--[^\n]*|\/\*[\s\S]*?\*\/|\$(\w*)\$[\s\S]*?\$\1\$|\?/g,
    (token) => (token === "?" ? `$${++position}` : token),
  );
}

export function postgresConfig(env: Record<string, string | undefined>): PoolConfig {
  const url = new URL(env["DATABASE_URL"] ?? "");
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new Error("DATABASE_URL: PostgreSQL ulanish manzili kerak.");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  // Keep certificate verification enabled, even when a copied URL says sslmode=require.
  for (const key of ["sslmode", "sslrootcert", "sslcert", "sslkey"]) url.searchParams.delete(key);
  const max = Number(env["DATABASE_POOL_MAX"] ?? 5);
  if (!Number.isInteger(max) || max < 1 || max > 20)
    throw new Error("DATABASE_POOL_MAX: 1–20 oralig‘ida bo‘lishi kerak.");
  return {
    connectionString: url.toString(),
    ssl:
      local && env["DATABASE_SSL"] === "false"
        ? false
        : {
            rejectUnauthorized: true,
            ...(env["DATABASE_CA_CERT"]
              ? { ca: env["DATABASE_CA_CERT"].replace(/\\n/g, "\n") }
              : {}),
          },
    max,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    statement_timeout: 20000,
    options: "-c search_path=school_app,pg_catalog -c timezone=UTC",
    types: {
      getTypeParser(oid, format) {
        if (oid === 20 && format !== "binary")
          return (value: string) => {
            const number = Number(value);
            if (!Number.isSafeInteger(number))
              throw new Error("PostgreSQL integer exceeds safe range");
            return number;
          };
        return types.getTypeParser(oid, format as "text");
      },
    },
  };
}

type Queryable = Pick<Pool, "query">;
function statements(connection: Queryable): Database {
  return {
    prepare(sql) {
      const query = postgresQuery(sql);
      const statement = (values: unknown[] = []): PreparedStatement => ({
        bind: (...args) => statement(args),
        async first<T>() {
          return ((await connection.query(query, values)).rows[0] as T) ?? null;
        },
        async all<T>() {
          return { results: (await connection.query(query, values)).rows as T[] };
        },
        async run() {
          const result = await connection.query(query, values);
          return { success: true, meta: { changes: result.rowCount ?? 0 } };
        },
      });
      return statement();
    },
  };
}

export class PostgresDatabase implements ManagedDatabase {
  readonly dialect = "postgres" as const;
  constructor(readonly pool: Pool) {
    pool.on("error", () =>
      console.error("PostgreSQL ulanishi uzildi; keyingi so‘rov qayta ulanadi."),
    );
  }
  prepare(sql: string) {
    return statements(this.pool).prepare(sql);
  }
  async transaction<T>(work: (database: Database) => Promise<T>) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const value = await work(statements(client));
      await client.query("COMMIT");
      return value;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  async migrate() {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("CREATE SCHEMA IF NOT EXISTS school_app");
      await client.query("REVOKE ALL ON SCHEMA school_app FROM PUBLIC");
      await client.query("SET LOCAL search_path TO school_app, pg_catalog");
      await client.query(
        "CREATE TABLE IF NOT EXISTS schema_migrations(name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text)",
      );
      await client.query("LOCK TABLE schema_migrations IN EXCLUSIVE MODE");
      const directory = new URL("../migrations/postgres/", import.meta.url);
      for (const file of readdirSync(directory)
        .filter((f) => f.endsWith(".sql"))
        .sort()) {
        if (
          (await client.query("SELECT name FROM schema_migrations WHERE name=$1", [file])).rows
            .length
        )
          continue;
        await client.query(readFileSync(new URL(file, directory), "utf8"));
        await client.query("INSERT INTO schema_migrations(name) VALUES($1)", [file]);
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  async close() {
    await this.pool.end();
  }
}
