import StatsClient from "./StatsClient";
import prisma from "@/lib/db";
import SponsorMarquee from "@/components/SponsorMarquee";

export const dynamic = 'force-dynamic';

async function getTopStats(category) {
  try {
    const orderBy = {};
    orderBy[category] = 'desc';
    return await prisma.playerStats.findMany({
      take: 10,
      orderBy: [orderBy, { matches: 'asc' }],
      where: { [category]: { gt: 0 } },
      include: {
        player: {
          select: {
            id: true,
            fullName: true,
            photoUrl: true,
            team: { select: { name: true } }
          }
        }
      }
    });
  } catch (e) {
    console.error(`Stats DB error (${category}):`, e.message);
    return [];
  }
}

export default async function StatsPage() {
  const [topRuns, topWickets, topSixes] = await Promise.all([
    getTopStats('runs'),
    getTopStats('wickets'),
    getTopStats('sixes')
  ]);
  
  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <SponsorMarquee />
      <StatsClient 
        topRuns={topRuns} 
        topWickets={topWickets} 
        topSixes={topSixes} 
      />
    </div>
  );
}
