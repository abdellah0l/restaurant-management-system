import * as dotenv from "dotenv";
import { Pool } from 'pg';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
