import Database from "better-sqlite3";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".mnemosyne");
const DB_PATH = path.join(DATA_DIR, "mnemosyne.sqlite");
const SCHEMA_PATH = path.join(process.cwd(), "sqlite", "create_tables.sql");

let database: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (database) return database;

  mkdirSync(DATA_DIR, { recursive: true });
  database = new Database(DB_PATH);
  database.pragma("journal_mode = WAL");
  database.exec(readFileSync(SCHEMA_PATH, "utf-8"));

  return database;
}

export function closeDatabase(): void {
  database?.close();
  database = null;
}
