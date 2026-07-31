import MatchesClient from "./MatchesClient";
import prisma from "@/lib/db";
import SponsorMarquee from "@/components/SponsorMarquee";

export const dynamic = 'force-dynamic';

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

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <SponsorMarquee />
      <MatchesClient initialMatches={matches} />
    </div>
  );
}
