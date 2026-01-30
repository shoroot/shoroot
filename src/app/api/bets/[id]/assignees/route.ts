import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { bets, betAssignees, users } from "@/lib/db/schema";
import { eq, inArray, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const betId = parseInt(id);

    if (isNaN(betId)) {
      return NextResponse.json({ error: "Invalid bet ID" }, { status: 400 });
    }

    // Verify admin authentication
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { assignees: newAssignees } = await request.json();

    if (
      !newAssignees ||
      !Array.isArray(newAssignees) ||
      newAssignees.length === 0
    ) {
      return NextResponse.json(
        { error: "Assignees array is required" },
        { status: 400 },
      );
    }

    // Check if bet exists
    const [existingBet] = await db
      .select()
      .from(bets)
      .where(eq(bets.id, betId))
      .limit(1);

    if (!existingBet) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    // Bet must be private to have assignees
    if (existingBet.visibility !== "private") {
      return NextResponse.json(
        { error: "Cannot add assignees to a public bet" },
        { status: 400 },
      );
    }

    // Get current assignees to prevent duplicates
    const currentAssignees = await db
      .select({ userId: betAssignees.userId })
      .from(betAssignees)
      .where(eq(betAssignees.betId, betId));

    const currentAssigneeIds = currentAssignees.map((a) => a.userId);

    // Filter out already assigned users
    const newAssigneeIds = newAssignees
      .map((id: number) => Number(id))
      .filter((id: number) => !currentAssigneeIds.includes(id));

    if (newAssigneeIds.length === 0) {
      return NextResponse.json(
        { error: "All specified users are already assigned to this bet" },
        { status: 400 },
      );
    }

    // Validate that all assignees exist and are active
    const existingUsers = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        status: users.status,
      })
      .from(users)
      .where(inArray(users.id, newAssigneeIds));

    if (existingUsers.length !== newAssigneeIds.length) {
      return NextResponse.json(
        { error: "One or more users do not exist" },
        { status: 400 },
      );
    }

    // Check that all users are active
    const inactiveUsers = existingUsers.filter((u) => u.status !== "active");
    if (inactiveUsers.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot assign inactive users (pending or deactivated) to bets",
        },
        { status: 400 },
      );
    }

    // Add new assignees
    await db.insert(betAssignees).values(
      existingUsers.map((user) => ({
        betId,
        userId: user.id,
        assignedBy: decoded.userId,
      })),
    );

    // Get all current assignees after update - only active users
    const allAssignees = await db
      .select({
        userId: betAssignees.userId,
        email: users.email,
        fullName: users.fullName,
        assignedAt: betAssignees.assignedAt,
      })
      .from(betAssignees)
      .innerJoin(users, eq(betAssignees.userId, users.id))
      .where(and(eq(betAssignees.betId, betId), eq(users.status, "active")));

    return NextResponse.json({
      message: "Assignees added successfully",
      assignees: allAssignees,
    });
  } catch (error) {
    console.error("Add assignees error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
