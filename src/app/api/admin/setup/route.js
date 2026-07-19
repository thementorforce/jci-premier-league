import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request) {
  try {
    const { action } = await request.json();

    if (action === 'reset_all') {
      // Clear data
      await prisma.bidHistory.deleteMany({});
      await prisma.playerProfile.deleteMany({});
      await prisma.team.deleteMany({});
      await prisma.adPlacement.deleteMany({});

      // Seed Teams
      const defaultTeams = [
        { name: 'Tumkur Titans', ownerName: 'Rajesh Gowda', pointsPurse: 100000, pointsSpent: 0 },
        { name: 'Metro Mavericks', ownerName: 'Amit Shah', pointsPurse: 100000, pointsSpent: 0 },
        { name: 'Prerana Panthers', ownerName: 'Dr. Ramesh', pointsPurse: 100000, pointsSpent: 0 },
        { name: 'JCI Warriors', ownerName: 'Kiran Kumar', pointsPurse: 100000, pointsSpent: 0 },
        { name: 'Royal Challengers Tumkur', ownerName: 'Sanjay Murthy', pointsPurse: 100000, pointsSpent: 0 },
      ];

      for (const t of defaultTeams) {
        await prisma.team.create({ data: t });
      }

      // Seed default ad
      await prisma.adPlacement.create({
        data: {
          title: 'Decathlon Sports Tumkur',
          imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
          targetUrl: 'https://www.decathlon.in',
          position: 'TOP_BANNER',
        }
      });

      return NextResponse.json({ success: true, message: 'Database reset and teams initialized successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
