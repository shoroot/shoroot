import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tournaments, users } from "@/lib/db/schema";
import { authMiddleware } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
  try {
    const user = await authMiddleware(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [dbUser] = await db
      .select({ status: users.status })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!dbUser || dbUser.status !== "active") {
      return NextResponse.json({ error: "User is not active" }, { status: 403 });
    }

    const rows = await db
      .select({
        id: tournaments.id,
        title: tournaments.title,
        tournamentType: tournaments.tournamentType,
        status: tournaments.status,
        createdAt: tournaments.createdAt,
        updatedAt: tournaments.updatedAt,
      })
      .from(tournaments)
      .where(eq(tournaments.userId, user.id))
      .orderBy(desc(tournaments.updatedAt));

    return NextResponse.json({ tournaments: rows });
  } catch (error) {
    console.error("List tournaments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authMiddleware(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [dbUser] = await db
      .select({ status: users.status })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!dbUser || dbUser.status !== "active") {
      return NextResponse.json({ error: "User is not active" }, { status: 403 });
    }

    const body = await request.json();
    const { title, tournamentType, status, definition, state } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "Tournament title is required" }, { status: 400 });
    }

    if (!definition || !state) {
      return NextResponse.json({ error: "Tournament definition and state are required" }, { status: 400 });
    }

    const [created] = await db
      .insert(tournaments)
      .values({
        userId: user.id,
        title: title.trim(),
        tournamentType: typeof tournamentType === "string" ? tournamentType : "world-cup-2026",
        status:
          status === "completed" || status === "in_progress" || status === "draft"
            ? status
            : "draft",
        definition: JSON.stringify(definition),
        state: JSON.stringify(state),
        updatedAt: new Date(),
      })
      .returning({
        id: tournaments.id,
        title: tournaments.title,
        tournamentType: tournaments.tournamentType,
        status: tournaments.status,
        createdAt: tournaments.createdAt,
        updatedAt: tournaments.updatedAt,
      });

    return NextResponse.json({ tournament: created }, { status: 201 });
  } catch (error) {
    console.error("Create tournament error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}