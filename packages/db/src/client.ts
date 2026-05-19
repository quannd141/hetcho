import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

export type DatabaseClient = ReturnType<typeof drizzle<typeof schema>>;

export interface ClientHandle {
  db: DatabaseClient;
  end: () => Promise<void>;
}

export function createClient(databaseUrl: string): DatabaseClient {
  const sql = postgres(databaseUrl, { max: 10, idle_timeout: 20 });
  return drizzle(sql, { schema });
}

export function createClientWithHandle(databaseUrl: string): ClientHandle {
  const sql = postgres(databaseUrl, { max: 10, idle_timeout: 20 });
  const db = drizzle(sql, { schema });
  return { db, end: () => sql.end() };
}
