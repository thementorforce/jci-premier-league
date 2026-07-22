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
        select: {
          id: true,
          fullName: true,
          preferredRole: true,
          organization: true,
          soldPrice: true,
          updatedAt: true,
          status: true,
          email: true,
          mobileNumber: true,
          team: {
            select: { id: true, name: true }
          }
        },
      }),
      // Unsold players
      prisma.playerProfile.findMany({
        where: { status: 'Unsold' },
        orderBy: { fullName: 'asc' },
        select: {
          id: true,
          fullName: true,
          preferredRole: true,
          organization: true,
          status: true,
        },
      }),
      // Draft pool
      prisma.playerProfile.findMany({
        where: { status: 'Registered', paymentStatus: 'Approved' },
        orderBy: { fullName: 'asc' },
        select: {
          id: true,
          fullName: true,
          preferredRole: true,
          organization: true,
          experience: true,
          jerseySize: true,
          photoUrl: true,
          status: true,
          gender: true,
          ageGroup: true,
        },
      }),
      // Teams
      prisma.team.findMany({
        orderBy: { name: 'asc' },
        include: {
          players: {
            select: {
              id: true,
              fullName: true,
              preferredRole: true,
              organization: true,
              soldPrice: true,
              status: true,
              gender: true,
              photoUrl: true,
            }
          }
        }
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
        select: {
          id: true,
          fullName: true,
          email: true,
          mobileNumber: true,
          organization: true,
          preferredRole: true,
          paymentStatus: true,
          transactionId: true,
          paymentScreenshot: true,
          photoUrl: true,
          createdAt: true,
          status: true,
          gender: true,
          ageGroup: true,
          jerseySize: true,
          experience: true,
        },
      }),
      // All payments
      prisma.playerProfile.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          mobileNumber: true,
          paymentStatus: true,
          transactionId: true,
          createdAt: true,
          status: true,
        },
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
