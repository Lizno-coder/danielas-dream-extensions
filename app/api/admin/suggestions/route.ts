import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appointments, consultationSlots, adminAbsences, userAvailability, users, messages } from "@/lib/db/schema";
import { eq, and, gte, lte, asc, ne } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { addDays, format, parseISO, startOfDay, endOfDay, isSameDay, getDay, setHours, setMinutes, isWithinInterval } from "date-fns";

// Find best appointment slots for a user
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth-token")?.value;
    await requireAdmin(token);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const fromDate = searchParams.get("from"); // Start searching from this date
    const daysToCheck = parseInt(searchParams.get("days") || "30");

    if (!userId) {
      return NextResponse.json({ error: "userId erforderlich" }, { status: 400 });
    }

    const startDate = fromDate ? parseISO(fromDate) : new Date();
    const endDate = addDays(startDate, daysToCheck);

    // 1. Get user's availability
    const userAvailabilities = await db
      .select()
      .from(userAvailability)
      .where(eq(userAvailability.userId, parseInt(userId)));

    if (userAvailabilities.length === 0) {
      return NextResponse.json({ 
        suggestions: [],
        message: "Kunde hat keine Verfügbarkeiten eingetragen"
      });
    }

    // 2. Get admin absences
    const absences = await db
      .select()
      .from(adminAbsences)
      .where(
        and(
          lte(adminAbsences.startDate, endDate),
          gte(adminAbsences.endDate, startDate)
        )
      );

    // 3. Get existing appointments
    const existingAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.datetime, startDate),
          lte(appointments.datetime, endDate),
          eq(appointments.status, "confirmed")
        )
      );

    // 4. Get existing consultation slots
    const existingSlots = await db
      .select()
      .from(consultationSlots)
      .where(
        and(
          gte(consultationSlots.datetime, startDate),
          lte(consultationSlots.datetime, endDate),
          ne(consultationSlots.status, "declined")
        )
      );

    // 5. Find available slots
    const suggestions = [];
    const checkedDates = new Set();

    for (let i = 0; i < daysToCheck; i++) {
      const currentDate = addDays(startDate, i);
      const dateStr = format(currentDate, "yyyy-MM-dd");
      
      if (checkedDates.has(dateStr)) continue;
      checkedDates.add(dateStr);

      const dayOfWeek = getDay(currentDate); // 0 = Sunday
      
      // Check if admin is absent
      const isAbsent = absences.some(absence => 
        isWithinInterval(currentDate, {
          start: startOfDay(absence.startDate),
          end: endOfDay(absence.endDate)
        })
      );
      
      if (isAbsent) continue;

      // Find user's availability for this day
      const userSlots = userAvailabilities.filter(a => a.dayOfWeek === dayOfWeek);
      
      for (const avail of userSlots) {
        const [startHour, startMinute] = avail.startTime.split(":").map(Number);
        const [endHour, endMinute] = avail.endTime.split(":").map(Number);
        
        const slotStart = setMinutes(setHours(currentDate, startHour), startMinute);
        const slotEnd = setMinutes(setHours(currentDate, endHour), endMinute);
        
        // Check for conflicts with existing appointments
        const hasConflict = existingAppointments.some(appt => {
          const apptTime = new Date(appt.datetime);
          return isSameDay(apptTime, currentDate) && 
                 apptTime >= slotStart && 
                 apptTime < slotEnd;
        });
        
        if (!hasConflict) {
          // Calculate score (prefer earlier dates, respect notes)
          const score = daysToCheck - i + (avail.notes ? 1 : 0);
          
          suggestions.push({
            date: currentDate,
            startTime: avail.startTime,
            endTime: avail.endTime,
            score,
            userAvailabilityId: avail.id,
            notes: avail.notes,
          });
        }
      }
    }

    // Sort by score (higher = better)
    suggestions.sort((a, b) => b.score - a.score);

    return NextResponse.json({ 
      suggestions: suggestions.slice(0, 10), // Top 10 suggestions
      totalChecked: daysToCheck,
      userAvailabilitiesCount: userAvailabilities.length
    });
  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fehler" },
      { status: 500 }
    );
  }
}
