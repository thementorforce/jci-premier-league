import MatchesClient from "./MatchesClient";
import prisma from "@/lib/db";
import SponsorMarquee from "@/components/SponsorMarquee";

export const dynamic = 'force-dynamic';

async function getSponsors() {
  try {
    const ads = await prisma.adPlacement.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
    return ads.filter(ad => { const p = (ad.position || '').split(',').map(x => x.trim().toLowerCase()); return p.includes('all') || p.includes('matches'); });
  } catch { return []; }
}

export default async function MatchesPage() {
  let matches = [];
  try {
    matches = await prisma.match.findMany({
      include: {
        team1: { select: { id: true, name: true, logoUrl: true } },
        team2: { select: { id: true, name: true, logoUrl: true } },
        winner: {
          select: { id: true, name: true }
        }
      },
      orderBy: { matchNumber: "asc" }
    });
  } catch (e) {
    console.error("Matches page DB error:", e.message);
  }

  const sponsors = await getSponsors();
  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <SponsorMarquee ads={sponsors} />
      <MatchesClient initialMatches={matches} />
    </div>
  );
}
