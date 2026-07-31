import StandingsClient from "./StandingsClient";
import prisma from "@/lib/db";
import SponsorMarquee from "@/components/SponsorMarquee";

export const dynamic = 'force-dynamic';

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

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <SponsorMarquee />
      <StandingsClient initialStandings={standings} />
    </div>
  );
}
