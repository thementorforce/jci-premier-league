import StatsClient from "./StatsClient";
import prisma from "@/lib/db";
import SponsorMarquee from "@/components/SponsorMarquee";
import { unstable_cache } from "next/cache";

export const revalidate = 60; // Revalidate every minute

const getTopStats = unstable_cache(
  async (category) => {
    const orderBy = {};
    orderBy[category] = 'desc';

    return await prisma.playerStats.findMany({
      take: 10,
      orderBy: [
        orderBy,
        { matches: 'asc' }
      ],
      where: {
        [category]: { gt: 0 }
      },
      include: {
        player: {
          select: {
            id: true,
            fullName: true,
            photoUrl: true,
            team: {
              select: { name: true }
            }
          }
        }
      }
    });
  },
  ['tournament-stats'],
  { tags: ['stats'], revalidate: 60 }
);

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
