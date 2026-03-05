import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy database connection
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function createDb() {
  if (typeof window !== "undefined") {
    // Client-side: return mock
    return {} as ReturnType<typeof drizzle<typeof schema>>;
  }
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    // During build or if not set, throw error only when actually used
    console.warn("DATABASE_URL not set - using mock for build");
    return {} as ReturnType<typeof drizzle<typeof schema>>;
  }
  
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(target, prop, receiver) {
    if (!dbInstance) {
      dbInstance = createDb();
    }
    return Reflect.get(dbInstance, prop, receiver);
  },
});
