/** Lifecycle shared by remote PostgreSQL and the optional local SQLite database. */
export interface ManagedDatabase extends Database {
  readonly dialect: "postgres" | "sqlite";
  migrate(): void | Promise<void>;
  close(): void | Promise<void>;
  transaction<T>(work: (database: Database) => Promise<T>): Promise<T>;
}
