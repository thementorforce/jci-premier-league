import StandingsClient from "./StandingsClient";
import prisma from "@/lib/db";
import SponsorMarquee from "@/components/SponsorMarquee";

export const dynamic = 'force-dynamic';

async function getSponsors() {
  try {
    const ads = await prisma.adPlacement.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
    return ads.filter(ad => { const p = (ad.position || '').split(',').map(x => x.trim().toLowerCase()); return p.includes('all') || p.includes('standings'); });
  } catch { return []; }
}

export default async function StandingsPage() {
  let standings = [];
  try {
    standings = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true,
        matchesPlayed: true,
        won: true,
        lost: true,
        points: true,
        nrr: true
      },
      orderBy: [
        { points: 'desc' },
        { nrr: 'desc' }
      ]
    });
  } catch (e) {
    console.error("Standings page DB error:", e.message);
  }

  const sponsors = await getSponsors();
  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <SponsorMarquee ads={sponsors} />
      <StandingsClient initialStandings={standings} />
    </div>
  );
}
