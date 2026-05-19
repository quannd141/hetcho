import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

export type DatabaseClient = ReturnType<typeof createClient>;

export function createClient(databaseUrl: string) {
  const sql = postgres(databaseUrl, { max: 10, idle_timeout: 20 });
  return drizzle(sql, { schema });
}
