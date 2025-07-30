import * as dotenv from "dotenv";
import { Pool } from 'pg';

dotenv.config();

// if (!process.env.DATABASE_URL) {
//   console.error('Error: DATABASE_URL environment variable is not set.');
//   process.exit(1);
// }

const pool = new Pool({
  connectionString: "postgresql://postgres:nDkrDGpJPkfBomrhjNZfVTecJrLEzeHD@caboose.proxy.rlwy.net:10845/railway"
});

pool.connect().then(() => {
  console.log("Connected to the database");
  pool.query("SELECT COUNT(*) FROM users").then((res) => {
    console.log(`Number of users in database: ${res.rows[0].count}`);
  });
}).catch((err) => {
  console.error("Error connecting to the database", err);
});


export default pool;
