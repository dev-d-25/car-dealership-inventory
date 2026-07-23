import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const res = await pool.query('SELECT id, email, name, role FROM "user" LIMIT 5');
  console.log('Users:', JSON.stringify(res.rows, null, 2));
  const vehicleCount = await pool.query('SELECT COUNT(*) FROM vehicle');
  console.log('Vehicle count:', vehicleCount.rows[0]);
  await pool.end();
}

main().catch(console.error);
