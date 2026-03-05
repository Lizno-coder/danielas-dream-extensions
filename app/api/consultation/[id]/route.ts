import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consultationSlots } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// Update slot status (accept/decline)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const slotId = parseInt(params.id);
    if (isNaN(slotId)) {
      return NextResponse.json(
        { error: "Ungültige Slot-ID" },
        { status: 400 }
      );
    }

    const { status } = await req.json();

    if (!["available", "requested", "booked", "declined"].includes(status)) {
      return NextResponse.json(
        { error: "Ungültiger Status" },
        { status: 400 }
      );
    }

    const [updatedSlot] = await db
      .update(consultationSlots)
      .set({ status })
      .where(eq(consultationSlots.id, slotId))
      .returning();

    if (!updatedSlot) {
      return NextResponse.json(
        { error: "Slot nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ slot: updatedSlot });
  } catch (error) {
    console.error("Update slot error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

// Delete slot
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const slotId = parseInt(params.id);
    if (isNaN(slotId)) {
      return NextResponse.json(
        { error: "Ungültige Slot-ID" },
        { status: 400 }
      );
    }

    await db.delete(consultationSlots).where(eq(consultationSlots.id, slotId));

    return NextResponse.json({ message: "Slot gelöscht" });
  } catch (error) {
    console.error("Delete slot error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
