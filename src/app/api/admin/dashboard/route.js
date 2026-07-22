import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { readConfig } from '@/lib/config';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const config = await readConfig();

    const activePlayer = await prisma.playerProfile.findFirst({
      where: { status: 'Bidding' },
      include: {
        bids: {
          orderBy: { amount: 'desc' },
          include: { team: true },
        },
      },
    });

    const [
      soldPlayers,
      unsoldPlayers,
      draftPool,
      teams,
      soldCount,
      unsoldCount,
      registeredCount,
      ads,
      pendingPlayers,
      allPlayers
    ] = await Promise.all([
      // Sold players
      prisma.playerProfile.findMany({
        where: { status: 'Sold' },
        orderBy: { updatedAt: 'desc' },
        include: { team: true },
      }),
      // Unsold players
      prisma.playerProfile.findMany({
        where: { status: 'Unsold' },
        orderBy: { fullName: 'asc' },
      }),
      // Draft pool
      prisma.playerProfile.findMany({
        where: { status: 'Registered', paymentStatus: 'Approved' },
        orderBy: { fullName: 'asc' },
      }),
      // Teams
      prisma.team.findMany({
        orderBy: { name: 'asc' },
        include: { players: true }
      }),
      // Stats counts
      prisma.playerProfile.count({ where: { status: 'Sold' } }),
      prisma.playerProfile.count({ where: { status: 'Unsold' } }),
      prisma.playerProfile.count({ where: { status: 'Registered', paymentStatus: 'Approved' } }),
      // Active ads
      prisma.adPlacement.findMany({}),
      // Pending approvals
      prisma.playerProfile.findMany({
        where: { paymentStatus: 'Pending' },
        orderBy: { createdAt: 'desc' },
      }),
      // All payments
      prisma.playerProfile.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const highestBid = activePlayer?.bids[0];

    // Compute stats for payments page
    const totalPayments = allPlayers.length;
    const approvedPayments = allPlayers.filter(p => p.paymentStatus === 'Approved').length;
    const pendingPaymentsCount = allPlayers.filter(p => p.paymentStatus === 'Pending').length;
    const rejectedPayments = allPlayers.filter(p => p.paymentStatus === 'Rejected').length;

    return NextResponse.json({
      auctionStatus: config.auctionStatus,
      ads,
      activePlayer: activePlayer
        ? {
            id: activePlayer.id,
            fullName: activePlayer.fullName,
            organization: activePlayer.organization,
            preferredRole: activePlayer.preferredRole,
            experience: activePlayer.experience,
            photoUrl: activePlayer.photoUrl,
            jerseySize: activePlayer.jerseySize,
            currentBid: highestBid ? highestBid.amount : 0,
            highestBidder: highestBid ? highestBid.team.name : 'No Bids Yet',
            highestBidderId: highestBid ? highestBid.team.id : null,
            bidHistory: activePlayer.bids.map((b) => ({
              id: b.id,
              amount: b.amount,
              teamName: b.team.name,
              teamId: b.team.id,
              createdAt: b.createdAt,
            })),
          }
        : null,
      soldPlayers,
      unsoldPlayers,
      draftPool,
      teams,
      pendingPlayers,
      allPayments: allPlayers,
      paymentStats: {
        total: totalPayments,
        approved: approvedPayments,
        pending: pendingPaymentsCount,
        rejected: rejectedPayments
      },
      summary: {
        sold: soldCount,
        unsold: unsoldCount,
        registered: registeredCount,
        total: soldCount + unsoldCount + registeredCount + (activePlayer ? 1 : 0),
      },
    });

  } catch (error) {
    console.error('Error fetching consolidated admin dashboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
