import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { galleryImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// Update image
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const imageId = parseInt(params.id);
    if (isNaN(imageId)) {
      return NextResponse.json(
        { error: "Ungültige Bild-ID" },
        { status: 400 }
      );
    }

    const { caption, carousel, order } = await req.json();

    const updateData: Partial<typeof galleryImages.$inferInsert> = {};
    if (caption !== undefined) updateData.caption = caption;
    if (carousel !== undefined) updateData.carousel = carousel;
    if (order !== undefined) updateData.order = order;

    const [updatedImage] = await db
      .update(galleryImages)
      .set(updateData)
      .where(eq(galleryImages.id, imageId))
      .returning();

    if (!updatedImage) {
      return NextResponse.json(
        { error: "Bild nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json({ image: updatedImage });
  } catch (error) {
    console.error("Update gallery image error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

// Delete image
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const imageId = parseInt(params.id);
    if (isNaN(imageId)) {
      return NextResponse.json(
        { error: "Ungültige Bild-ID" },
        { status: 400 }
      );
    }

    await db.delete(galleryImages).where(eq(galleryImages.id, imageId));

    return NextResponse.json({ message: "Bild gelöscht" });
  } catch (error) {
    console.error("Delete gallery image error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
