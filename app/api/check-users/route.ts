import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    // Get all users with password check
    const allUsers = await db.query.users.findMany();
    
    const userStatus = allUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      hasPassword: !!u.password,
      passwordLength: u.password?.length || 0,
    }));

    // Create a guaranteed working test user
    const testEmail = "working@daniela.de";
    const testPassword = "pass123";
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    try {
      await db.insert(users).values({
        email: testEmail,
        name: "Working Test",
        password: hashedPassword,
        role: "user",
      });
    } catch {
      // User exists, update password
      await db.update(users)
        .set({ password: hashedPassword })
        .where(users.email.eq(testEmail));
    }

    // Verify the password works
    const workingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, testEmail),
    });
    
    const verifyTest = workingUser?.password 
      ? await bcrypt.compare(testPassword, workingUser.password)
      : false;

    return NextResponse.json({
      userStatus,
      workingTestUser: {
        email: testEmail,
        password: testPassword,
        passwordHashLength: workingUser?.password?.length,
        verifyTest,
      },
      message: "Versuch dich mit working@daniela.de / pass123 anzumelden",
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
