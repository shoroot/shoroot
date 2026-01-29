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

    const {
      title,
      description,
      amount,
      visibility,
      assignees: newAssignees,
    } = await request.json();

    if (!title || !description || !amount) {
      return NextResponse.json(
        { error: "Title, description, and amount are required" },
        { status: 400 },
      );
    }

    const numericAmount = parseInt(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    // Validate visibility if provided
    if (visibility && visibility !== "public" && visibility !== "private") {
      return NextResponse.json(
        { error: "Visibility must be 'public' or 'private'" },
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

    // Don't allow editing resolved bets
    if (existingBet.status === "resolved") {
      return NextResponse.json(
        { error: "Cannot edit resolved bets" },
        { status: 400 },
      );
    }

    // Update the bet in a transaction
    const result = await db.transaction(async (tx) => {
      // Update the bet
      const updateData: any = {
        title: title.trim(),
        description: description.trim(),
        amount: numericAmount,
        updatedAt: new Date(),
      };

      if (visibility) {
        updateData.visibility = visibility;
      }

      await tx.update(bets).set(updateData).where(eq(bets.id, betId));

      // Handle assignees update if visibility is changing to private or if assignees are provided
      if (
        visibility === "private" &&
        newAssignees &&
        Array.isArray(newAssignees)
      ) {
        // Validate that assignees exist
        const assigneeUserIds = newAssignees.map((id: number) => Number(id));
        const existingUsers = await tx
          .select({
            id: users.id,
            email: users.email,
            fullName: users.fullName,
          })
          .from(users)
          .where(inArray(users.id, assigneeUserIds));

        if (existingUsers.length !== assigneeUserIds.length) {
          throw new Error("One or more assignees do not exist");
        }

        // Remove existing assignees
        await tx.delete(betAssignees).where(eq(betAssignees.betId, betId));

        // Add new assignees
        if (existingUsers.length > 0) {
          await tx.insert(betAssignees).values(
            existingUsers.map((user) => ({
              betId,
              userId: user.id,
              assignedBy: decoded.userId,
            })),
          );
        }

        return {
          assignees: existingUsers.map((user) => ({
            userId: user.id,
            email: user.email,
            fullName: user.fullName,
          })),
        };
      }

      // If changing from private to public, remove all assignees
      if (existingBet.visibility === "private" && visibility === "public") {
        await tx.delete(betAssignees).where(eq(betAssignees.betId, betId));
      }

      return { assignees: null };
    });

    // Get updated bet data
    const [updatedBet] = await db
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

    return NextResponse.json({
      bet: {
        ...updatedBet,
        assignees: result.assignees,
      },
    });
  } catch (error) {
    console.error("Edit bet error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
