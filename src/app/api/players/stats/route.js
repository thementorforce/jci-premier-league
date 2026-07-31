import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'runs'; // runs, wickets, sixes

  try {
    const orderBy = {};
    orderBy[category] = 'desc';

    const topPlayers = await prisma.playerStats.findMany({
      take: 10,
      orderBy: [
        orderBy,
        { matches: 'asc' } // Tiebreaker: fewer matches is better
      ],
      where: {
        [category]: { gt: 0 } // Only fetch players who have scored/taken at least 1
      },
      include: {
        player: {
          select: {
            id: true,
            fullName: true,
            photoUrl: true,
            team: {
              select: { name: true }
            }
          }
        }
      }
    });

    return NextResponse.json(topPlayers);
  } catch (error) {
    console.error("Player Stats API Error:", error);
    return NextResponse.json({ error: "Failed to fetch player stats" }, { status: 500 });
  }
}
