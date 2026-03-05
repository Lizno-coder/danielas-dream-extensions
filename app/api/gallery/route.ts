import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { galleryImages } from "@/lib/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// Get gallery images
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const carouselOnly = searchParams.get("carousel") === "true";

    let query = db.select().from(galleryImages);

    if (carouselOnly) {
      query = query.where(eq(galleryImages.carousel, true));
    }

    const images = await query.orderBy(asc(galleryImages.order));

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Get gallery error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

// Add image (admin only)
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const { url, caption, carousel, order } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Bild-URL erforderlich" },
        { status: 400 }
      );
    }

    const [image] = await db
      .insert(galleryImages)
      .values({
        url,
        caption: caption || null,
        carousel: carousel || false,
        order: order || 0,
      })
      .returning();

    return NextResponse.json({ image });
  } catch (error) {
    console.error("Add gallery image error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
