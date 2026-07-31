import MatchesClient from "./MatchesClient";
import prisma from "@/lib/db";
import SponsorMarquee from "@/components/SponsorMarquee";
import { unstable_cache } from "next/cache";

export const revalidate = 30;

const getMatches = unstable_cache(
  async () => {
    return await prisma.match.findMany({
      include: {
        team1: {
          select: { id: true, name: true, logoUrl: true }
        },
        team2: {
          select: { id: true, name: true, logoUrl: true }
        },
        winner: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        date: "asc"
      }
    });
  },
  ['tournament-matches'],
  { tags: ['matches', 'teams'], revalidate: 30 }
);

export default async function MatchesPage() {
  const matches = await getMatches();
  
  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <SponsorMarquee />
      <MatchesClient initialMatches={matches} />
    </div>
  );
}
