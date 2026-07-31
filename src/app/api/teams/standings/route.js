import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true,
        matchesPlayed: true,
        won: true,
        lost: true,
        points: true,
        nrr: true,
      },
      orderBy: [
        { points: "desc" },
        { nrr: "desc" },
      ],
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Standings API Error:", error);
    return NextResponse.json({ error: "Failed to fetch standings" }, { status: 500 });
  }
}
