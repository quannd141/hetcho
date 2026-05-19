import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const migrationsFolder = resolve(__dirname, '../drizzle');

  console.log(`[migrate] Applying migrations from ${migrationsFolder}`);
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder });
  console.log('[migrate] Done.');
  await client.end();
}

main().catch((err) => {
  console.error('[migrate] Failed:', err);
  process.exit(1);
});
