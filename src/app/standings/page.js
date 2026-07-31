import StandingsClient from "./StandingsClient";
import prisma from "@/lib/db";
import SponsorMarquee from "@/components/SponsorMarquee";
import { unstable_cache } from "next/cache";

export const revalidate = 30; // Revalidate every 30 seconds

const getStandings = unstable_cache(
  async () => {
    return await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        logoUrl: true,
        matchesPlayed: true,
        won: true,
        lost: true,
        points: true,
        nrr: true,
      },
      orderBy: [
        { points: "desc" },
        { nrr: "desc" },
      ],
    });
  },
  ['tournament-standings'],
  { tags: ['teams', 'matches'], revalidate: 30 }
);

export default async function StandingsPage() {
  const standings = await getStandings();
  
  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <SponsorMarquee />
      <StandingsClient initialStandings={standings} />
    </div>
  );
}
