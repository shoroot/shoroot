import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import {
  bets,
  betOptions,
  betParticipations,
  betAssignees,
} from "@/lib/db/schema";
import { eq, count, desc, and, or, inArray, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
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

    const userId = decoded.userId;
    const userRole = decoded.role;
    const isAdmin = userRole === "admin";

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const tab = searchParams.get("tab") || "all"; // all, active, in-progress, resolved, private

    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 },
      );
    }

    const offset = (page - 1) * limit;

    // Build where conditions
    let conditions = [];

    // Status condition based on tab
    if (tab === "active") {
      conditions.push(eq(bets.status, "active"));
    } else if (tab === "in-progress") {
      conditions.push(eq(bets.status, "in-progress"));
    } else if (tab === "resolved") {
      conditions.push(eq(bets.status, "resolved"));
    } else if (tab === "private") {
      // For private tab, only show private bets
      conditions.push(eq(bets.visibility, "private"));
    }

    // Visibility filter for non-admin users
    // Admins see all bets, regular users see public bets + private bets they're assigned to
    if (!isAdmin) {
      // Get list of private bet IDs that the user is assigned to
      const userAssignedBets = await db
        .select({ betId: betAssignees.betId })
        .from(betAssignees)
        .where(eq(betAssignees.userId, userId));

      const assignedBetIds = userAssignedBets.map((b) => b.betId);

      if (tab === "private") {
        // For private tab, only show private bets the user is assigned to
        if (assignedBetIds.length > 0) {
          conditions.push(
            and(
              eq(bets.visibility, "private"),
              inArray(bets.id, assignedBetIds),
            ),
          );
        } else {
          // User has no private bets assigned, return empty
          conditions.push(eq(bets.id, -1)); // Impossible condition to return empty
        }
      } else {
        // Build visibility condition: public OR (private AND in assigned list)
        if (assignedBetIds.length > 0) {
          conditions.push(
            or(
              eq(bets.visibility, "public"),
              and(
                eq(bets.visibility, "private"),
                inArray(bets.id, assignedBetIds),
              ),
            ),
          );
        } else {
          // User has no private bets assigned, only show public
          conditions.push(eq(bets.visibility, "public"));
        }
      }
    }

    // Combine conditions
    const whereCondition =
      conditions.length > 0
        ? conditions.length === 1
          ? conditions[0]
          : and(...conditions)
        : undefined;

    // Get total count
    const totalQuery = whereCondition
      ? await db.select({ count: count() }).from(bets).where(whereCondition)
      : await db.select({ count: count() }).from(bets);

    const total = totalQuery[0].count;
    const totalPages = Math.ceil(total / limit);

    // Get bets with pagination
    const betsQuery = whereCondition
      ? await db
          .select({
            id: bets.id,
            title: bets.title,
            description: bets.description,
            amount: bets.amount,
            status: bets.status,
            visibility: bets.visibility,
            winningOption: bets.winningOption,
            createdAt: bets.createdAt,
          })
          .from(bets)
          .where(whereCondition)
          .orderBy(desc(bets.createdAt))
          .limit(limit)
          .offset(offset)
      : await db
          .select({
            id: bets.id,
            title: bets.title,
            description: bets.description,
            amount: bets.amount,
            status: bets.status,
            visibility: bets.visibility,
            winningOption: bets.winningOption,
            createdAt: bets.createdAt,
          })
          .from(bets)
          .orderBy(desc(bets.createdAt))
          .limit(limit)
          .offset(offset);

    const betsData = betsQuery;

    // Get all options for each bet
    const optionsPromises = betsData.map(async (bet) => {
      const betOptionsData = await db
        .select({
          id: betOptions.id,
          optionText: betOptions.optionText,
        })
        .from(betOptions)
        .where(eq(betOptions.betId, bet.id))
        .orderBy(betOptions.id);

      return betOptionsData;
    });

    const optionsLists = await Promise.all(optionsPromises);

    // Get participation counts for each bet
    const participationPromises = betsData.map(async (bet) => {
      const result = await db
        .select({ count: count() })
        .from(betParticipations)
        .where(eq(betParticipations.betId, bet.id));

      return result[0].count;
    });

    const participationCounts = await Promise.all(participationPromises);

    // Check if user has already participated in each bet
    const userParticipationPromises = betsData.map(async (bet) => {
      const result = await db
        .select({ count: count() })
        .from(betParticipations)
        .where(
          and(
            eq(betParticipations.betId, bet.id),
            eq(betParticipations.userId, userId),
          ),
        );
      return result.length > 0 && result[0].count > 0;
    });

    const userParticipations = await Promise.all(userParticipationPromises);

    // Check if user is assigned to private bets
    const userAssignmentPromises = betsData.map(async (bet) => {
      if (bet.visibility !== "private") return false;
      const result = await db
        .select({ count: count() })
        .from(betAssignees)
        .where(
          and(eq(betAssignees.betId, bet.id), eq(betAssignees.userId, userId)),
        );
      return result.length > 0 && result[0].count > 0;
    });

    const userAssignments = await Promise.all(userAssignmentPromises);

    // Get winning option text for resolved bets
    const winningOptionPromises = betsData.map(async (bet) => {
      if (bet.status === "resolved" && bet.winningOption) {
        const winningOptionId = parseInt(bet.winningOption);
        const [winningOption] = await db
          .select({
            optionText: betOptions.optionText,
          })
          .from(betOptions)
          .where(eq(betOptions.id, winningOptionId));

        return winningOption?.optionText || null;
      }
      return null;
    });

    const winningOptions = await Promise.all(winningOptionPromises);

    // Combine data
    const formattedBets = betsData.map((bet, index) => ({
      id: bet.id,
      title: bet.title,
      description: bet.description,
      amount: bet.amount,
      status: bet.status,
      visibility: bet.visibility,
      winningOption: bet.winningOption,
      winningOptionText: winningOptions[index],
      options: optionsLists[index],
      participationCount: participationCounts[index],
      hasUserParticipated: userParticipations[index],
      isAssigned:
        bet.visibility === "private" ? userAssignments[index] : undefined,
      createdAt: bet.createdAt,
    }));

    return NextResponse.json({
      bets: formattedBets,
      total_pages: totalPages,
    });
  } catch (error) {
    console.error("Get user bets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
