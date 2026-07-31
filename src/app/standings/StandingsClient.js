"use client";

import { useState } from "react";
import Image from "next/image";
import { Trophy, Activity, Info } from "lucide-react";
import Link from "next/link";

export default function StandingsClient({ initialStandings }) {
  const [standings] = useState(initialStandings);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 uppercase tracking-tight mb-4 filter drop-shadow-lg">
          Points Table
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
          Season 1 Standings. Top 4 teams qualify for the Playoffs.
        </p>
      </div>

      {/* Standings Table Card */}
      <div className="premium-card p-1 md:p-4 overflow-hidden rounded-2xl border border-yellow-500/20 bg-gray-900/80 backdrop-blur-md shadow-[0_0_30px_rgba(255,215,0,0.1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-yellow-500/30 bg-gray-950/50">
                <th className="py-4 px-4 font-bold text-gray-300 text-sm uppercase tracking-wider">Team</th>
                <th className="py-4 px-2 font-bold text-gray-300 text-sm uppercase tracking-wider text-center" title="Matches Played">P</th>
                <th className="py-4 px-2 font-bold text-gray-300 text-sm uppercase tracking-wider text-center" title="Won">W</th>
                <th className="py-4 px-2 font-bold text-gray-300 text-sm uppercase tracking-wider text-center" title="Lost">L</th>
                <th className="py-4 px-2 font-bold text-gray-300 text-sm uppercase tracking-wider text-center" title="Net Run Rate">NRR</th>
                <th className="py-4 px-4 font-black text-yellow-400 text-sm uppercase tracking-wider text-center" title="Points">PTS</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => {
                const isTop4 = index < 4;
                return (
                  <tr 
                    key={team.id} 
                    className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                      isTop4 ? "bg-gradient-to-r from-yellow-500/5 to-transparent" : ""
                    }`}
                  >
                    <td className="py-3 px-4">
                      <Link href={`/teams?teamId=${team.id}`} className="flex items-center gap-3 md:gap-4 hover:opacity-80 transition-opacity">
                        <div className="w-6 h-6 md:w-8 md:h-8 flex-shrink-0 font-black text-gray-500 flex items-center justify-center text-sm md:text-base">
                          {index + 1}
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 relative flex-shrink-0 bg-gray-950 rounded-full border border-gray-700 overflow-hidden flex items-center justify-center p-1">
                          {team.logoUrl ? (
                            <Image 
                              src={team.logoUrl} 
                              alt={team.name} 
                              fill 
                              className="object-contain p-1" 
                            />
                          ) : (
                            <Trophy size={16} className="text-gray-600" />
                          )}
                        </div>
                        <div className="font-bold text-white text-sm md:text-base truncate max-w-[120px] md:max-w-xs">
                          {team.name}
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 px-2 text-center text-gray-300 text-sm md:text-base">{team.matchesPlayed}</td>
                    <td className="py-3 px-2 text-center text-green-400 font-medium text-sm md:text-base">{team.won}</td>
                    <td className="py-3 px-2 text-center text-red-400 font-medium text-sm md:text-base">{team.lost}</td>
                    <td className="py-3 px-2 text-center text-gray-400 text-xs md:text-sm">
                      {team.nrr > 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-center font-black text-yellow-400 text-lg md:text-xl drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">
                      {team.points}
                    </td>
                  </tr>
                );
              })}
              {standings.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <Activity size={32} className="mx-auto mb-3 opacity-50" />
                    <p>Tournament hasn't started yet.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-center gap-2 text-gray-500 text-xs md:text-sm">
        <Info size={14} />
        <p>Teams are ranked on Points. If Points are equal, Net Run Rate (NRR) will decide the ranking.</p>
      </div>
    </main>
  );
}
