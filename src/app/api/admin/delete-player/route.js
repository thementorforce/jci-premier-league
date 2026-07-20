import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function DELETE(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('id');

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const player = await prisma.playerProfile.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // If this player was sold and assigned to a team, refund the team's points
    if (player.status === 'Sold' && player.teamId && player.soldPrice) {
      await prisma.team.update({
        where: { id: player.teamId },
        data: {
          pointsSpent: { decrement: player.soldPrice },
        },
      });
    }

    // Delete the player (BidHistory cascade-deletes automatically via Prisma schema)
    await prisma.playerProfile.delete({ where: { id: playerId } });

    return NextResponse.json({
      success: true,
      message: `Player "${player.fullName}" has been deleted.`,
      refunded: player.status === 'Sold' ? player.soldPrice : 0,
    });
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 });
  }
}
