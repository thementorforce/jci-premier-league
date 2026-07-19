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

    const player = await prisma.playerProfile.findUnique({ where: { id: playerId } });
    if (!player || player.status !== 'Bidding') {
      return NextResponse.json({ error: 'Player is not in active bidding state' }, { status: 400 });
    }

    // Set player status to Unsold
    const updatedPlayer = await prisma.playerProfile.update({
      where: { id: playerId },
      data: { status: 'Unsold' }
    });

    return NextResponse.json({ success: true, player: updatedPlayer });
  } catch (error) {
    console.error('Error marking player as unsold:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
