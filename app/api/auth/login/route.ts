import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "danielas-dream-secret-key-2026");

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

    const normalizedEmail = email.toLowerCase().trim();
    
    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    console.log("User lookup:", { found: !!user, email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten" },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Passwort nicht gesetzt" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    console.log("Password check:", isValid);
    
    if (!isValid) {
      return NextResponse.json(
        { error: "Ungültige Anmeldedaten" },
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

    // Set cookie - WICHTIG für Production!
    const cookieStore = cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: true, // Immer true in Production
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    console.log("Login success:", user.email);

    return NextResponse.json({
      success: true,
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
      { error: "Server-Fehler" },
      { status: 500 }
    );
  }
}
