import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    },
    tests: {},
  };

  try {
    // Test 1: Database connection
    const allUsers = await db.query.users.findMany({
      columns: { id: true, email: true, name: true, role: true },
    });
    results.tests.dbConnection = "OK";
    results.tests.userCount = allUsers.length;
    results.tests.users = allUsers;
  } catch (error) {
    results.tests.dbConnection = "FAILED";
    results.tests.dbError = error instanceof Error ? error.message : String(error);
  }

  try {
    // Test 2: bcrypt
    const testPass = "test123";
    const hash = await bcrypt.hash(testPass, 10);
    const valid = await bcrypt.compare(testPass, hash);
    results.tests.bcrypt = valid ? "OK" : "FAILED";
  } catch (error) {
    results.tests.bcrypt = "FAILED";
    results.tests.bcryptError = error instanceof Error ? error.message : String(error);
  }

  try {
    // Test 3: Create test user if not exists
    const testEmail = "debug@daniela.de";
    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, testEmail),
    });
    
    if (!existing) {
      const hash = await bcrypt.hash("debug123", 10);
      await db.insert(users).values({
        email: testEmail,
        name: "Debug User",
        password: hash,
        role: "user",
      });
      results.tests.testUser = "CREATED";
    } else {
      results.tests.testUser = "EXISTS";
      // Verify password works
      const verifyResult = await bcrypt.compare("debug123", existing.password || "");
      results.tests.passwordVerify = verifyResult;
    }
  } catch (error) {
    results.tests.testUser = "FAILED";
    results.tests.testUserError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(results);
}
