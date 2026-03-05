import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Ensure DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not set!");
  throw new Error("DATABASE_URL environment variable is required");
}

// Create SQL client with config for serverless
const sql = neon(databaseUrl, {
  fetchOptions: {
    // @ts-ignore - neon types
    timeout: 10000, // 10 second timeout
  },
});

// Create drizzle client
export const db = drizzle(sql, { schema });

// Test connection function
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log("Database connected:", result);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
