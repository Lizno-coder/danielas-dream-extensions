import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "your-secret-key");

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    
    console.log("Login attempt:", { email: email?.toLowerCase() });

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email und Passwort erforderlich" },
        { status: 400 }
      );
    }

    // Find user
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Searching for user:", normalizedEmail);
    
    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    console.log("User found:", user ? { id: user.id, email: user.email, hasPassword: !!user.password } : "Not found");

    if (!user) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten", debug: "User not found" },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten", debug: "No password set" },
        { status: 401 }
      );
    }

    // Verify password
    console.log("Comparing passwords...");
    const isValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isValid);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten", debug: "Password mismatch" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // Set cookie
    cookies().set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    console.log("Login successful for:", user.email);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten", debug: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
