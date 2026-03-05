import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { eq, or, and, desc, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

const ADMIN_ID = 1; // Assuming admin is user ID 1

// Get messages between user and admin
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const payload = await requireAuth(token);

    const userId = payload.userId;

    const userMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        createdAt: messages.createdAt,
        read: messages.read,
        senderName: users.name,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        or(
          and(eq(messages.senderId, userId), eq(messages.receiverId, ADMIN_ID)),
          and(eq(messages.senderId, ADMIN_ID), eq(messages.receiverId, userId))
        )
      )
      .orderBy(asc(messages.createdAt));

    // Mark messages as read
    await db
      .update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.read, false)
        )
      );

    return NextResponse.json({ messages: userMessages });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

// Send message
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    const payload = await requireAuth(token);

    const { content } = await req.json();

    if (!content || content.trim() === "") {
      return NextResponse.json(
        { error: "Nachricht darf nicht leer sein" },
        { status: 400 }
      );
    }

    const senderId = payload.userId;
    const receiverId = payload.role === "admin" ? 
      // If admin, need to get target user from request
      (await req.json()).targetUserId || ADMIN_ID : 
      ADMIN_ID;

    const [message] = await db
      .insert(messages)
      .values({
        senderId,
        receiverId: payload.role === "admin" ? receiverId : ADMIN_ID,
        content: content.trim(),
        read: false,
      })
      .returning();

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
