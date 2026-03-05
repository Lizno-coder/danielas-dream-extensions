import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminAbsences, userAvailability, users } from "@/lib/db/schema";
import { eq, and, gte, lte, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { addDays, format, parseISO, startOfWeek } from "date-fns";

// Get all absences (admin only)
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const absences = await db
      .select()
      .from(adminAbsences)
      .orderBy(asc(adminAbsences.startDate));

    return NextResponse.json({ absences });
  } catch (error) {
    console.error("Get absences error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fehler" },
      { status: 500 }
    );
  }
}

// Add absence (admin only)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const { startDate, endDate, reason, allDay } = await req.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start- und Enddatum erforderlich" },
        { status: 400 }
      );
    }

    const [absence] = await db
      .insert(adminAbsences)
      .values({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        allDay: allDay ?? true,
      })
      .returning();

    return NextResponse.json({ absence });
  } catch (error) {
    console.error("Add absence error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fehler" },
      { status: 500 }
    );
  }
}

// Delete absence (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const { id } = await req.json();

    await db.delete(adminAbsences).where(eq(adminAbsences.id, id));

    return NextResponse.json({ message: "Gelöscht" });
  } catch (error) {
    console.error("Delete absence error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fehler" },
      { status: 500 }
    );
  }
}
