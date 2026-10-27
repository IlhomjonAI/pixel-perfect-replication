import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/** Async query interface shared by handlers and tests; persisted with Node SQLite. */
export class SqliteDatabase implements Database {
  readonly connection: DatabaseSync;
  constructor(filename = ":memory:") {
    if (filename !== ":memory:")
      mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });
    this.connection = new DatabaseSync(filename, { timeout: 5000 });
    this.connection.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");
  }
  prepare(query: string): PreparedStatement {
    const connection = this.connection;
    function statement(values: SQLInputValue[] = []): PreparedStatement {
      return {
        bind: (...args: unknown[]) => statement(args as SQLInputValue[]),
        async first<T>() {
          return (connection.prepare(query).get(...values) as T | undefined) ?? null;
        },
        async all<T>() {
          return { results: connection.prepare(query).all(...values) as T[] };
        },
        async run() {
          const result = connection.prepare(query).run(...values);
          return {
            success: true,
            meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid) },
          };
        },
      };
    }
    return statement();
  }
  migrate() {
    const db = this.connection;
    db.exec(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    );
    // An imported D1 database already has these migrations; never apply ALTER twice.
    if (db.prepare("SELECT name FROM sqlite_master WHERE name='d1_migrations'").get()) {
      db.exec("INSERT OR IGNORE INTO schema_migrations (name) SELECT name FROM d1_migrations");
    }
    const directory = new URL("../migrations/", import.meta.url);
    for (const file of readdirSync(directory)
      .filter((f) => f.endsWith(".sql"))
      .sort()) {
      if (db.prepare("SELECT name FROM schema_migrations WHERE name=?").get(file)) continue;
      db.exec("BEGIN IMMEDIATE");
      try {
        db.exec(readFileSync(new URL(file, directory), "utf8"));
        db.prepare("INSERT INTO schema_migrations (name) VALUES (?)").run(file);
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    }
  }
  close() {
    this.connection.close();
  }
}
