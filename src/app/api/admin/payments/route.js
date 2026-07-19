import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { readConfig } from '@/lib/config';

export async function GET() {
  try {
    const config = readConfig();
    const regFee = parseInt(config.regFee, 10) || 0;

    const [allPlayers, pendingCount, approvedCount] = await Promise.all([
      prisma.playerProfile.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          mobileNumber: true,
          organization: true,
          preferredRole: true,
          photoUrl: true,
          status: true,
          paymentStatus: true,
          transactionId: true,
          paymentScreenshot: true,
          createdAt: true,
        },
      }),
      prisma.playerProfile.count({ where: { paymentStatus: 'Pending' } }),
      prisma.playerProfile.count({ where: { paymentStatus: 'Approved' } }),
    ]);

    return NextResponse.json({
      players: allPlayers,
      stats: {
        total: allPlayers.length,
        pending: pendingCount,
        approved: approvedCount,
        totalRevenue: approvedCount * regFee,
        regFee,
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
