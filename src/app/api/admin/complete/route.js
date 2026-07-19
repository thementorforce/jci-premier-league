import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    // 1. Fetch player and check if status is Bidding
    const player = await prisma.playerProfile.findUnique({
      where: { id: playerId },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1,
          include: { team: true }
        }
      }
    });

    if (!player || player.status !== 'Bidding') {
      return NextResponse.json({ error: 'Player is not in active bidding state' }, { status: 400 });
    }

    const highestBid = player.bids[0];
    if (!highestBid) {
      return NextResponse.json({ error: 'No bids placed yet. Mark as unsold instead.' }, { status: 400 });
    }

    // 2. Perform database transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Update player profile
      await tx.playerProfile.update({
        where: { id: playerId },
        data: {
          status: 'Sold',
          soldPrice: highestBid.amount,
          teamId: highestBid.teamId
        }
      });

      // Update team pointsSpent
      await tx.team.update({
        where: { id: highestBid.teamId },
        data: {
          pointsSpent: {
            increment: highestBid.amount
          }
        }
      });
    });

    return NextResponse.json({ success: true, message: `Player sold to ${highestBid.team.name} for ${highestBid.amount} points.` });
  } catch (error) {
    console.error('Error completing bidding:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
