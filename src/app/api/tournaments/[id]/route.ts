import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tournaments, users } from "@/lib/db/schema";
import { authMiddleware } from "@/lib/auth/middleware";

function parseId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const tournamentId = parseId(resolvedParams.id);
    if (!tournamentId) {
      return NextResponse.json({ error: "Invalid tournament id" }, { status: 400 });
    }

    const [row] = await db
      .select()
      .from(tournaments)
      .where(and(eq(tournaments.id, tournamentId), eq(tournaments.userId, user.id)))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({
      tournament: {
        id: row.id,
        title: row.title,
        tournamentType: row.tournamentType,
        status: row.status,
        definition: JSON.parse(row.definition),
        state: JSON.parse(row.state),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get tournament error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const tournamentId = parseId(resolvedParams.id);
    if (!tournamentId) {
      return NextResponse.json({ error: "Invalid tournament id" }, { status: 400 });
    }

    const body = await request.json();
    const { title, tournamentType, status, definition, state } = body;

    const [existing] = await db
      .select({ id: tournaments.id })
      .from(tournaments)
      .where(and(eq(tournaments.id, tournamentId), eq(tournaments.userId, user.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(tournaments)
      .set({
        title: typeof title === "string" && title.trim() ? title.trim() : undefined,
        tournamentType: typeof tournamentType === "string" ? tournamentType : undefined,
        status:
          status === "completed" || status === "in_progress" || status === "draft"
            ? status
            : undefined,
        definition: definition ? JSON.stringify(definition) : undefined,
        state: state ? JSON.stringify(state) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(tournaments.id, tournamentId), eq(tournaments.userId, user.id)))
      .returning({
        id: tournaments.id,
        title: tournaments.title,
        tournamentType: tournaments.tournamentType,
        status: tournaments.status,
        createdAt: tournaments.createdAt,
        updatedAt: tournaments.updatedAt,
      });

    return NextResponse.json({ tournament: updated });
  } catch (error) {
    console.error("Update tournament error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}