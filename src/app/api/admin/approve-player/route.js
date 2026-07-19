import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const pendingPlayers = await prisma.playerProfile.findMany({
      where: { paymentStatus: 'Pending' },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(pendingPlayers);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { playerId, action } = await request.json();

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    if (action === 'approve') {
      const updatedPlayer = await prisma.playerProfile.update({
        where: { id: playerId },
        data: {
          status: 'Registered',
          paymentStatus: 'Approved'
        }
      });
      return NextResponse.json({ success: true, player: updatedPlayer });
    } else if (action === 'reject') {
      // Rejects payment and deletes registration
      await prisma.playerProfile.delete({ where: { id: playerId } });
      return NextResponse.json({ success: true, message: 'Registration rejected and deleted.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error approving/rejecting player payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
