import { env } from 'cloudflare:workers';

export interface D1Result<T> {
  results: T[];
  success: boolean;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<D1Result<T>>;
  run(): Promise<unknown>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
}

export function getDb(): D1Database {
  const db = (env as unknown as { CONTENT_DB?: D1Database }).CONTENT_DB;
  if (!db) throw new Error('CONTENT_DB binding is not configured');
  return db;
}

export async function queryAll<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await getDb()
    .prepare(sql)
    .bind(...params)
    .all<T>();
  return result.results ?? [];
}

export async function queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  return getDb()
    .prepare(sql)
    .bind(...params)
    .first<T>();
}

export async function execute(sql: string, params: unknown[] = []): Promise<unknown> {
  return getDb()
    .prepare(sql)
    .bind(...params)
    .run();
}
