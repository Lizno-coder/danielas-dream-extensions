import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, users } from "@/lib/db/schema";
import { eq, ne, desc, asc, and, or } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

// Get all chats overview
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (userId) {
      // Get specific chat
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
            and(eq(messages.senderId, parseInt(userId)), eq(messages.receiverId, 1)),
            and(eq(messages.senderId, 1), eq(messages.receiverId, parseInt(userId)))
          )
        )
        .orderBy(asc(messages.createdAt));

      // Mark as read
      await db
        .update(messages)
        .set({ read: true })
        .where(
          and(
            eq(messages.receiverId, 1),
            eq(messages.senderId, parseInt(userId)),
            eq(messages.read, false)
          )
        );

      return NextResponse.json({ messages: userMessages });
    }

    // Get all chats overview
    const allMessages = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        receiverId: messages.receiverId,
        content: messages.content,
        createdAt: messages.createdAt,
        read: messages.read,
        senderName: users.name,
        senderEmail: users.email,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(ne(messages.senderId, 1)) // Exclude admin messages
      .orderBy(desc(messages.createdAt));

    // Group by user
    const chatsMap = new Map();
    allMessages.forEach((msg) => {
      const userId = msg.senderId;
      if (!chatsMap.has(userId)) {
        chatsMap.set(userId, {
          userId,
          userName: msg.senderName,
          userEmail: msg.senderEmail,
          lastMessage: msg.content,
          lastMessageAt: msg.createdAt,
          unreadCount: msg.read ? 0 : 1,
        });
      } else if (!msg.read) {
        chatsMap.get(userId).unreadCount++;
      }
    });

    return NextResponse.json({ chats: Array.from(chatsMap.values()) });
  } catch (error) {
    console.error("Admin chats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}

// Send message as admin
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const { userId, content } = await req.json();

    if (!userId || !content) {
      return NextResponse.json(
        { error: "User-ID und Nachricht erforderlich" },
        { status: 400 }
      );
    }

    const [message] = await db
      .insert(messages)
      .values({
        senderId: 1, // Admin
        receiverId: parseInt(userId),
        content: content.trim(),
        read: false,
      })
      .returning();

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Send admin message error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
