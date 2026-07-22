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
    if (!player || player.status !== 'Unsold') {
      return NextResponse.json({ error: 'Player is not in unsold state' }, { status: 400 });
    }

    // Reset player status back to Registered (putting them back to the draft pool)
    const updatedPlayer = await prisma.playerProfile.update({
      where: { id: playerId },
      data: { status: 'Registered' }
    });

    return NextResponse.json({ success: true, player: updatedPlayer });
  } catch (error) {
    console.error('Error resetting unsold player:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
