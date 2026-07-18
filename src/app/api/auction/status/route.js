import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const revalidate = 0;

export async function GET() {
  try {
    // 1. Fetch player currently undergoing bidding
    const activePlayer = await prisma.playerProfile.findFirst({
      where: { status: 'Bidding' },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
          include: { team: true }
        }
      }
    });

    // 2. Fetch recently sold players (up to 10)
    const soldPlayers = await prisma.playerProfile.findMany({
      where: { status: 'Sold' },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: { team: true }
    });

    // 3. Fetch unsold players
    const unsoldPlayers = await prisma.playerProfile.findMany({
      where: { status: 'Unsold' },
      orderBy: { fullName: 'asc' }
    });

    // 4. Fetch yet-to-be-auctioned players (Registered status)
    const draftPool = await prisma.playerProfile.findMany({
      where: { status: 'Registered' },
      orderBy: { fullName: 'asc' }
    });

    // 5. Fetch teams stats (budget standing)
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      activePlayer: activePlayer ? {
        id: activePlayer.id,
        fullName: activePlayer.fullName,
        organization: activePlayer.organization,
        preferredRole: activePlayer.preferredRole,
        experience: activePlayer.experience,
        photoUrl: activePlayer.photoUrl,
        jerseySize: activePlayer.jerseySize,
        currentBid: activePlayer.bids[0] ? activePlayer.bids[0].amount : 0,
        highestBidder: activePlayer.bids[0] ? activePlayer.bids[0].team.name : 'No Bids Yet',
        highestBidderId: activePlayer.bids[0] ? activePlayer.bids[0].team.id : null,
      } : null,
      soldPlayers,
      unsoldPlayers,
      draftPool,
      teams
    });
  } catch (error) {
    console.error('Error fetching auction status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
