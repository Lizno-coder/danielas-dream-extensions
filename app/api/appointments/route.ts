import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments, users } from "@/lib/db/schema";
import { eq, desc, asc, and, gte } from "drizzle-orm";
import { requireAuth, requireAdmin } from "@/lib/auth";

// Get appointments
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const payload = await requireAuth(token);

    let query = db
      .select({
        id: appointments.id,
        datetime: appointments.datetime,
        type: appointments.type,
        status: appointments.status,
        address: appointments.address,
        notes: appointments.notes,
        userId: appointments.userId,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
      })
      .from(appointments)
      .leftJoin(users, eq(appointments.userId, users.id));

    if (payload.role !== "admin") {
      // Regular users only see their own appointments
      query = query.where(eq(appointments.userId, payload.userId)) as typeof query;
    }

    const userAppointments = await query.orderBy(asc(appointments.datetime));

    return NextResponse.json({ appointments: userAppointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

// Create appointment (admin only)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const { userId, datetime, type, address, notes } = await req.json();

    if (!userId || !datetime) {
      return NextResponse.json(
        { error: "User und Datum erforderlich" },
        { status: 400 }
      );
    }

    // Check for double booking
    const existingAppointment = await db.query.appointments.findFirst({
      where: and(
        eq(appointments.datetime, new Date(datetime)),
        eq(appointments.status, "confirmed")
      ),
    });

    if (existingAppointment) {
      return NextResponse.json(
        { 
          error: "Doppelbuchung", 
          message: "Es gibt bereits einen Termin zu dieser Zeit",
          existingAppointment 
        },
        { status: 409 }
      );
    }

    const [appointment] = await db
      .insert(appointments)
      .values({
        userId: parseInt(userId),
        datetime: new Date(datetime),
        type: type || "extension",
        address: address || "Graf-zu-Toerring-Straße",
        notes: notes || null,
        status: "confirmed",
      })
      .returning();

    return NextResponse.json({ appointment });
  } catch (error) {
    console.error("Create appointment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
