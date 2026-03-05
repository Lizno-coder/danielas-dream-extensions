import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    
    if (!email) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 });
    }

    // Try to find user
    console.log("Debug: Searching for user:", email.toLowerCase());
    
    const allUsers = await db.query.users.findMany();
    console.log("Debug: Total users in DB:", allUsers.length);
    console.log("Debug: All users:", allUsers.map(u => ({ id: u.id, email: u.email, hasPass: !!u.password })));
    
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return NextResponse.json({ 
        error: "User not found",
        searchedEmail: email.toLowerCase(),
        availableEmails: allUsers.map(u => u.email)
      }, { status: 404 });
    }

    // Test password comparison
    const testPassword = "test123";
    const testHash = await bcrypt.hash(testPassword, 10);
    const testCompare = await bcrypt.compare(testPassword, testHash);

    return NextResponse.json({
      userFound: true,
      userId: user.id,
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
      bcryptTest: testCompare,
      dbConnection: "OK",
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({
      error: "Debug error",
      message: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

// Test login with plain text (for debugging only)
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    const allUsers = await db.query.users.findMany();
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || !user.password) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    return NextResponse.json({
      email: user.email,
      passwordValid: isValid,
      storedHash: user.password.substring(0, 20) + "...",
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
