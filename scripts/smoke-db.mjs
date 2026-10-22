import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config({ path: '.env.local' });
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL no está configurada.');
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`select 1 as ok, current_database() as database`;
if (rows[0]?.ok !== 1) throw new Error('Postgres devolvió un resultado inesperado.');
console.log(`Postgres OK: consulta SELECT 1 ejecutada en ${rows[0].database}.`);
