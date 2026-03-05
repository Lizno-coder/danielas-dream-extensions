import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consultationSlots } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

// Book a consultation slot
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const payload = await requireAuth(token);

    const slotId = parseInt(params.id);
    if (isNaN(slotId)) {
      return NextResponse.json(
        { error: "Ungültige Slot-ID" },
        { status: 400 }
      );
    }

    // Check if slot is available
    const slot = await db.query.consultationSlots.findFirst({
      where: eq(consultationSlots.id, slotId),
    });

    if (!slot) {
      return NextResponse.json(
        { error: "Slot nicht gefunden" },
        { status: 404 }
      );
    }

    if (slot.status !== "available") {
      return NextResponse.json(
        { error: "Dieser Termin ist nicht mehr verfügbar" },
        { status: 409 }
      );
    }

    // Book the slot
    const [updatedSlot] = await db
      .update(consultationSlots)
      .set({
        status: "requested",
        userId: payload.userId,
      })
      .where(
        and(
          eq(consultationSlots.id, slotId),
          eq(consultationSlots.status, "available")
        )
      )
      .returning();

    if (!updatedSlot) {
      return NextResponse.json(
        { error: "Termin konnte nicht gebucht werden" },
        { status: 409 }
      );
    }

    return NextResponse.json({ slot: updatedSlot });
  } catch (error) {
    console.error("Book slot error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
