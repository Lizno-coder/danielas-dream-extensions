import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, messages, consultationSlots, appointments } from "@/lib/db/schema";
import { eq, ne, and, gte, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    // Get unread messages count
    const unreadMessages = await db
      .select({ count: count() })
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, 1),
          eq(messages.read, false)
        )
      );

    // Get pending consultation requests
    const pendingConsultations = await db
      .select({ count: count() })
      .from(consultationSlots)
      .where(eq(consultationSlots.status, "requested"));

    // Get upcoming appointments
    const upcomingAppointments = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          gte(appointments.datetime, new Date()),
          eq(appointments.status, "confirmed")
        )
      );

    // Get total users
    const totalUsers = await db
      .select({ count: count() })
      .from(users)
      .where(ne(users.role, "admin"));

    return NextResponse.json({
      stats: {
        unreadMessages: unreadMessages[0]?.count || 0,
        pendingConsultations: pendingConsultations[0]?.count || 0,
        upcomingAppointments: upcomingAppointments[0]?.count || 0,
        totalUsers: totalUsers[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten" },
      { status: 500 }
    );
  }
}
