import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        team1: {
          select: { id: true, name: true, logoUrl: true }
        },
        team2: {
          select: { id: true, name: true, logoUrl: true }
        },
        winner: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        date: "asc"
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Matches API Error:", error);
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
