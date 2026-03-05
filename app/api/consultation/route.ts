import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consultationSlots, users } from "@/lib/db/schema";
import { eq, gte, asc, and, or } from "drizzle-orm";
import { requireAuth, requireAdmin } from "@/lib/auth";

// Get available consultation slots
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";
    
    let query = db
      .select({
        id: consultationSlots.id,
        datetime: consultationSlots.datetime,
        type: consultationSlots.type,
        status: consultationSlots.status,
        notes: consultationSlots.notes,
        userId: consultationSlots.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(consultationSlots)
      .leftJoin(users, eq(consultationSlots.userId, users.id));

    if (!showAll) {
      // Only show available slots to regular users
      query = query.where(
        or(
          eq(consultationSlots.status, "available"),
          eq(consultationSlots.status, "requested")
        )
      ) as typeof query;
    }

    const slots = await query.orderBy(asc(consultationSlots.datetime));

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Get slots error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

// Create new slot (admin only)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const { datetime, type, notes } = await req.json();

    if (!datetime || !type) {
      return NextResponse.json(
        { error: "Datum und Typ erforderlich" },
        { status: 400 }
      );
    }

    const [slot] = await db
      .insert(consultationSlots)
      .values({
        datetime: new Date(datetime),
        type,
        notes: notes || null,
        status: "available",
      })
      .returning();

    return NextResponse.json({ slot });
  } catch (error) {
    console.error("Create slot error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
