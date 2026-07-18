import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request) {
  try {
    const { playerId } = await request.json();

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    // 1. Reset any current player in bidding state back to Registered
    await prisma.playerProfile.updateMany({
      where: { status: 'Bidding' },
      data: { status: 'Registered' }
    });

    // 2. Set chosen player to Bidding
    const updatedPlayer = await prisma.playerProfile.update({
      where: { id: playerId },
      data: { status: 'Bidding' }
    });

    // 3. Clear any dynamic bids left from prior sessions on this player
    await prisma.bidHistory.deleteMany({
      where: { playerId }
    });

    return NextResponse.json({ success: true, player: updatedPlayer });
  } catch (error) {
    console.error('Error changing active player draft:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
