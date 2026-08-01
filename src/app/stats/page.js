import StatsClient from "./StatsClient";
import prisma from "@/lib/db";
import SponsorMarquee from "@/components/SponsorMarquee";

export const dynamic = 'force-dynamic';

async function getSponsors() {
  try {
    const ads = await prisma.adPlacement.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
    return ads.filter(ad => { const p = (ad.position || '').split(',').map(x => x.trim().toLowerCase()); return p.includes('all') || p.includes('stats'); });
  } catch { return []; }
}

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
  
  const sponsors = await getSponsors();
  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <SponsorMarquee ads={sponsors} />
      <StatsClient topRuns={topRuns} topWickets={topWickets} topSixes={topSixes} />
    </div>
  );
}
