import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import {
  bets,
  betOptions,
  betParticipations,
  betAssignees,
  users,
} from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";

// Helper function to check if user can view bet
async function canViewBet(
  userId: number,
  userRole: string,
  betId: number,
): Promise<boolean> {
  if (userRole === "admin") return true;

  const bet = await db.select().from(bets).where(eq(bets.id, betId)).limit(1);
  if (!bet.length) return false;

  if (bet[0].visibility === "public") return true;

  // Check if user is assigned
  const assignment = await db
    .select()
    .from(betAssignees)
    .where(and(eq(betAssignees.betId, betId), eq(betAssignees.userId, userId)))
    .limit(1);

  return assignment.length > 0;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const betId = parseInt(id);

    if (isNaN(betId)) {
      return NextResponse.json({ error: "Invalid bet ID" }, { status: 400 });
    }

    // Get authentication (optional for public bets, required for private)
    const authHeader = request.headers.get("authorization");
    let userId: number | null = null;
    let userRole: string = "user";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded: any = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
        userId = decoded.userId;
        userRole = decoded.role;
      } catch (error) {
        // Token invalid, continue as unauthenticated
      }
    }

    // Get the bet
    const [bet] = await db
      .select({
        id: bets.id,
        title: bets.title,
        description: bets.description,
        amount: bets.amount,
        status: bets.status,
        visibility: bets.visibility,
        winningOption: bets.winningOption,
        createdAt: bets.createdAt,
        updatedAt: bets.updatedAt,
      })
      .from(bets)
      .where(eq(bets.id, betId))
      .limit(1);

    if (!bet) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    // Check visibility authorization
    if (bet.visibility === "private") {
      if (!userId) {
        return NextResponse.json(
          { error: "Authentication required to view this bet" },
          { status: 401 },
        );
      }

      const canView = await canViewBet(userId, userRole, betId);
      if (!canView) {
        return NextResponse.json(
          { error: "You do not have permission to view this bet" },
          { status: 403 },
        );
      }
    }

    // Get all options for this bet
    const options = await db
      .select({
        id: betOptions.id,
        optionText: betOptions.optionText,
      })
      .from(betOptions)
      .where(eq(betOptions.betId, betId))
      .orderBy(betOptions.id);

    // Get participants for this bet with user details
    const participants = await db
      .select({
        id: betParticipations.id,
        userId: betParticipations.userId,
        userEmail: users.email,
        userFullName: users.fullName,
        selectedOptionId: betParticipations.selectedOptionId,
        isWinner: betParticipations.isWinner,
        participatedAt: betParticipations.participatedAt,
      })
      .from(betParticipations)
      .innerJoin(users, eq(betParticipations.userId, users.id))
      .where(eq(betParticipations.betId, betId))
      .orderBy(betParticipations.participatedAt);

    // Format participants with option details and user info
    const formattedParticipants = participants.map((participant) => ({
      id: participant.id,
      userId: participant.userId,
      userEmail: participant.userEmail,
      userFullName: participant.userFullName,
      selectedOptionText: participant.selectedOptionId
        ? options.find((opt) => opt.id === participant.selectedOptionId)
            ?.optionText
        : null,
      isWinner: participant.isWinner,
      participatedAt: participant.participatedAt,
    }));

    // Get assignees for private bets
    let assignees = undefined;
    let isAssigned = undefined;
    if (bet.visibility === "private") {
      const assigneesData = await db
        .select({
          userId: betAssignees.userId,
          email: users.email,
          fullName: users.fullName,
          assignedAt: betAssignees.assignedAt,
        })
        .from(betAssignees)
        .innerJoin(users, eq(betAssignees.userId, users.id))
        .where(eq(betAssignees.betId, betId));

      assignees = assigneesData;
      isAssigned = userId
        ? assigneesData.some((a) => a.userId === userId)
        : false;
    }

    return NextResponse.json({
      bet: {
        id: bet.id,
        title: bet.title,
        description: bet.description,
        amount: bet.amount,
        status: bet.status,
        visibility: bet.visibility,
        winningOption: bet.winningOption,
        options,
        participants: formattedParticipants,
        participationCount: participants.length,
        assignees,
        isAssigned,
        createdAt: bet.createdAt,
        updatedAt: bet.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get single bet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
