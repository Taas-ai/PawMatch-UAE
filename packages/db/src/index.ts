import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema.js';

export * from './schema.js';
export { schema };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createDb(dbPath: string = './pawmatch.db') {
  const sqlite = new Database(dbPath);
  if (dbPath !== ':memory:') {
    sqlite.pragma('journal_mode = WAL');
  }
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema });

  // For in-memory databases, create tables from migration SQL
  if (dbPath === ':memory:') {
    const migrationPath = join(__dirname, '..', 'migrations', '0000_fantastic_sinister_six.sql');
    const migrationSql = readFileSync(migrationPath, 'utf-8');
    const statements = migrationSql
      .split('--> statement-breakpoint')
      .map((s: string) => s.trim())
      .filter(Boolean);
    for (const stmt of statements) {
      sqlite.exec(stmt);
    }
  }

  return db;
}

export type PawMatchDb = ReturnType<typeof createDb>;
