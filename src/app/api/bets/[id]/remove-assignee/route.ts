import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { bets, betAssignees, users } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";

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

    const { userId: assigneeUserId } = await request.json();

    if (!assigneeUserId || typeof assigneeUserId !== "number") {
      return NextResponse.json(
        { error: "User ID is required" },
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

    // Check if the assignee exists for this bet
    const [existingAssignee] = await db
      .select()
      .from(betAssignees)
      .where(
        and(
          eq(betAssignees.betId, betId),
          eq(betAssignees.userId, assigneeUserId),
        ),
      )
      .limit(1);

    if (!existingAssignee) {
      return NextResponse.json(
        { error: "User is not assigned to this bet" },
        { status: 404 },
      );
    }

    // Count current assignees
    const assigneeCount = await db
      .select({ count: count() })
      .from(betAssignees)
      .where(eq(betAssignees.betId, betId));

    // Prevent removing the last assignee (optional - can be removed if not desired)
    if (assigneeCount[0].count <= 1) {
      return NextResponse.json(
        {
          error:
            "Cannot remove the last assignee from a private bet. Add another assignee first or change visibility to public.",
        },
        { status: 400 },
      );
    }

    // Remove the assignee
    await db
      .delete(betAssignees)
      .where(
        and(
          eq(betAssignees.betId, betId),
          eq(betAssignees.userId, assigneeUserId),
        ),
      );

    // Get remaining assignees
    const remainingAssignees = await db
      .select({
        userId: betAssignees.userId,
        email: users.email,
        fullName: users.fullName,
        assignedAt: betAssignees.assignedAt,
      })
      .from(betAssignees)
      .innerJoin(users, eq(betAssignees.userId, users.id))
      .where(eq(betAssignees.betId, betId));

    return NextResponse.json({
      message: "Assignee removed successfully",
      assignees: remainingAssignees,
    });
  } catch (error) {
    console.error("Remove assignee error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
