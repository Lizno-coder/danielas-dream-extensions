import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userAvailability } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

// Get user's availability
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const payload = await requireAuth(token);

    const availability = await db
      .select()
      .from(userAvailability)
      .where(eq(userAvailability.userId, payload.userId));

    return NextResponse.json({ availability });
  } catch (error) {
    console.error("Get availability error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fehler" },
      { status: 500 }
    );
  }
}

// Add availability slot
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const payload = await requireAuth(token);

    const { dayOfWeek, startTime, endTime, notes } = await req.json();

    if (dayOfWeek === undefined || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Tag, Startzeit und Endzeit erforderlich" },
        { status: 400 }
      );
    }

    const [slot] = await db
      .insert(userAvailability)
      .values({
        userId: payload.userId,
        dayOfWeek,
        startTime,
        endTime,
        notes,
      })
      .returning();

    return NextResponse.json({ slot });
  } catch (error) {
    console.error("Add availability error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fehler" },
      { status: 500 }
    );
  }
}

// Delete availability slot
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const payload = await requireAuth(token);

    const { id } = await req.json();

    await db
      .delete(userAvailability)
      .where(and(eq(userAvailability.id, id), eq(userAvailability.userId, payload.userId)));

    return NextResponse.json({ message: "Gelöscht" });
  } catch (error) {
    console.error("Delete availability error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fehler" },
      { status: 500 }
    );
  }
}
