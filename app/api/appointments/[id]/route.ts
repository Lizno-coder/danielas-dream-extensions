import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// Update appointment
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const appointmentId = parseInt(params.id);
    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { error: "Ungültige Termin-ID" },
        { status: 400 }
      );
    }

    const { datetime, status, notes, force } = await req.json();

    // Check for double booking if datetime is being updated
    if (datetime) {
      const newDate = new Date(datetime);
      const existingAppointment = await db.query.appointments.findFirst({
        where: and(
          eq(appointments.datetime, newDate),
          eq(appointments.status, "confirmed"),
          ne(appointments.id, appointmentId)
        ),
      });

      if (existingAppointment && !force) {
        return NextResponse.json(
          { 
            warning: "Doppelbuchung möglich",
            message: "Es gibt bereits einen anderen Termin zu dieser Zeit. Möchtest du wirklich fortfahren?",
            existingAppointment 
          },
          { status: 409 }
        );
      }
    }

    const updateData: Partial<typeof appointments.$inferInsert> = {};
    if (datetime) updateData.datetime = new Date(datetime);
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const [updatedAppointment] = await db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, appointmentId))
      .returning();

    if (!updatedAppointment) {
      return NextResponse.json(
        { error: "Termin nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment: updatedAppointment });
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

// Delete appointment
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const appointmentId = parseInt(params.id);
    if (isNaN(appointmentId)) {
      return NextResponse.json(
        { error: "Ungültige Termin-ID" },
        { status: 400 }
      );
    }

    await db.delete(appointments).where(eq(appointments.id, appointmentId));

    return NextResponse.json({ message: "Termin gelöscht" });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
