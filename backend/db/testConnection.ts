import dotenv from "dotenv";
import pool from "./pool";

dotenv.config();

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("Successfully connected to the database!");

    const result = await client.query("SELECT COUNT(*) FROM products");
    console.log(`Number of products in database: ${result.rows[0].count}`);

    client.release();
    await pool.end();
  } catch (error: any) {
    console.error("Error testing database connection:", error.message);
  }
}

testConnection();
