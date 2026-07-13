import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function truncate() {
  console.log("Truncating users table...");
  try {
    await sql`TRUNCATE TABLE users CASCADE`;
    console.log("Truncated successfully.");
  } catch (e) {
    console.error("Truncate failed:", e);
  }
}

truncate();
