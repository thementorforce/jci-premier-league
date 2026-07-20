import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { readConfig } from '@/lib/config';

export const revalidate = 0;

export async function GET() {
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

    const [soldPlayers, unsoldPlayers, draftPool, teams, soldCount, unsoldCount, registeredCount, ads] =
      await Promise.all([
        prisma.playerProfile.findMany({
          where: { status: 'Sold' },
          orderBy: { updatedAt: 'desc' },
          take: 10,
          include: { team: true },
        }),
        prisma.playerProfile.findMany({
          where: { status: 'Unsold' },
          orderBy: { fullName: 'asc' },
        }),
        prisma.playerProfile.findMany({
          where: { status: 'Registered', paymentStatus: 'Approved' },
          orderBy: { fullName: 'asc' },
        }),
        prisma.team.findMany({ orderBy: { name: 'asc' } }),
        prisma.playerProfile.count({ where: { status: 'Sold' } }),
        prisma.playerProfile.count({ where: { status: 'Unsold' } }),
        prisma.playerProfile.count({ where: { status: 'Registered', paymentStatus: 'Approved' } }),
        prisma.adPlacement.findMany({ where: { active: true } }),
      ]);

    const highestBid = activePlayer?.bids[0];

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
      summary: {
        sold: soldCount,
        unsold: unsoldCount,
        registered: registeredCount,
        total: soldCount + unsoldCount + registeredCount + (activePlayer ? 1 : 0),
      },
    });
  } catch (error) {
    console.error('Error fetching auction status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
