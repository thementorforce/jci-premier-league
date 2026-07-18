import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request) {
  try {
    const { playerId, teamId, amount } = await request.json();

    if (!playerId || !teamId || !amount) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const bidAmount = parseInt(amount, 10);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      return NextResponse.json({ error: 'Bid amount must be a positive number' }, { status: 400 });
    }

    // 1. Fetch player and verify active bidding status
    const player = await prisma.playerProfile.findUnique({
      where: { id: playerId },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          take: 1
        }
      }
    });

    if (!player || player.status !== 'Bidding') {
      return NextResponse.json({ error: 'Player is not currently up for active bidding' }, { status: 400 });
    }

    // Validate bid amount is greater than current highest bid
    const currentHighestBid = player.bids[0] ? player.bids[0].amount : 0;
    if (bidAmount <= currentHighestBid) {
      return NextResponse.json({ error: `Bid must be higher than current highest bid of ${currentHighestBid}` }, { status: 400 });
    }

    // 2. Fetch team and verify points purse availability
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const remainingPurse = team.pointsPurse - team.pointsSpent;
    if (bidAmount > remainingPurse) {
      return NextResponse.json({ error: `Team does not have enough points. Remaining purse: ${remainingPurse}` }, { status: 400 });
    }

    // 3. Create the BidHistory record
    const newBid = await prisma.bidHistory.create({
      data: {
        playerId,
        teamId,
        amount: bidAmount
      },
      include: { team: true }
    });

    return NextResponse.json({ success: true, bid: newBid });
  } catch (error) {
    console.error('Error placing bid:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
