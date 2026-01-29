import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { bets, betOptions, betAssignees, users } from "@/lib/db/schema";
import { notifyAllUsers } from "@/lib/notifications";
import { notifyBetCreation } from "@/lib/telegram";
import { eq, inArray } from "drizzle-orm";

export async function POST(request: NextRequest) {
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
      options,
      visibility,
      assignees: betAssigneesList,
    } = await request.json();

    // Validation
    if (!title || !description || !amount || !options) {
      return NextResponse.json(
        { error: "Title, description, amount, and options are required" },
        { status: 400 },
      );
    }

    // Validate visibility
    const betVisibility = visibility || "public";
    if (betVisibility !== "public" && betVisibility !== "private") {
      return NextResponse.json(
        { error: "Visibility must be 'public' or 'private'" },
        { status: 400 },
      );
    }

    // Validate assignees for private bets
    if (betVisibility === "private") {
      if (
        !betAssigneesList ||
        !Array.isArray(betAssigneesList) ||
        betAssigneesList.length === 0
      ) {
        return NextResponse.json(
          { error: "Private bets require at least one assignee" },
          { status: 400 },
        );
      }
    }

    if (typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Title must be a non-empty string" },
        { status: 400 },
      );
    }

    if (typeof description !== "string" || description.trim().length === 0) {
      return NextResponse.json(
        { error: "Description must be a non-empty string" },
        { status: 400 },
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "At least 2 options are required" },
        { status: 400 },
      );
    }

    if (
      options.some(
        (option) => typeof option !== "string" || option.trim().length === 0,
      )
    ) {
      return NextResponse.json(
        { error: "All options must be non-empty strings" },
        { status: 400 },
      );
    }

    // Create bet with options in transaction
    const result = await db.transaction(async (tx) => {
      // Insert bet
      const [newBet] = await tx
        .insert(bets)
        .values({
          title: title.trim(),
          description: description.trim(),
          amount,
          status: "active",
          visibility: betVisibility,
        })
        .returning();

      // Insert options
      const newOptions = await tx
        .insert(betOptions)
        .values(
          options.map((option: string) => ({
            betId: newBet.id,
            optionText: option.trim(),
          })),
        )
        .returning();

      // Insert assignees for private bets
      let assigneesData: {
        userId: number;
        email: string;
        fullName: string | null;
      }[] = [];
      if (
        betVisibility === "private" &&
        betAssigneesList &&
        betAssigneesList.length > 0
      ) {
        // Validate that assignees exist
        const assigneeUserIds = betAssigneesList.map((id: number) =>
          Number(id),
        );
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

        // Create assignee records
        await tx.insert(betAssignees).values(
          existingUsers.map((user) => ({
            betId: newBet.id,
            userId: user.id,
            assignedBy: decoded.userId,
          })),
        );

        assigneesData = existingUsers.map((user) => ({
          userId: user.id,
          email: user.email,
          fullName: user.fullName,
        }));
      }

      return { bet: newBet, options: newOptions, assignees: assigneesData };
    });

    // Notify all users about the new bet
    notifyAllUsers(
      "new_bet",
      `New bet: ${result.bet.title}`,
      `A new bet has been created: "${result.bet.title}". Amount: ${result.bet.amount} toman.`,
      {
        betId: result.bet.id,
        betTitle: result.bet.title,
      },
    );

    // Send Telegram notification about the new bet
    notifyBetCreation({
      id: result.bet.id,
      title: result.bet.title,
      description: result.bet.description,
      amount: result.bet.amount,
      options: result.options.map((opt) => opt.optionText),
    });

    return NextResponse.json(
      {
        bet: {
          id: result.bet.id,
          title: result.bet.title,
          description: result.bet.description,
          amount: result.bet.amount,
          status: result.bet.status,
          visibility: result.bet.visibility,
          options: result.options.map((opt) => ({
            id: opt.id,
            optionText: opt.optionText,
          })),
          assignees: result.assignees,
          createdAt: result.bet.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create bet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
