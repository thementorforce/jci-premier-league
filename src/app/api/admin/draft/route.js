import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { readConfig, writeConfig } from '@/lib/config';
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
    if (!player || player.status !== 'Registered') {
      return NextResponse.json({ error: 'Player must be registered and approved before going live' }, { status: 400 });
    }

    await prisma.playerProfile.updateMany({
      where: { status: 'Bidding' },
      data: { status: 'Registered' },
    });

    const updatedPlayer = await prisma.playerProfile.update({
      where: { id: playerId },
      data: { status: 'Bidding' },
    });

    await prisma.bidHistory.deleteMany({ where: { playerId } });

    const config = readConfig();
    writeConfig({ ...config, auctionStatus: 'LIVE' });

    return NextResponse.json({ success: true, player: updatedPlayer });
  } catch (error) {
    console.error('Error changing active player draft:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
