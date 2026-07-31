"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, Trophy, Activity, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function MatchesClient({ initialMatches }) {
  const [matches] = useState(initialMatches);

  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">
      {/* Header Section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 uppercase tracking-tight mb-4 filter drop-shadow-lg">
          Fixtures & Results
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
          Track the live action, upcoming fixtures, and past match results.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="premium-card p-12 text-center rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <Calendar size={48} className="mx-auto mb-4 text-gray-500 opacity-50" />
          <h3 className="text-xl font-bold text-gray-300 mb-2">No Matches Scheduled</h3>
          <p className="text-gray-500 text-sm">The tournament schedule has not been released yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => (
            <div 
              key={match.id} 
              className={`premium-card overflow-hidden rounded-2xl border transition-all hover:scale-[1.01] ${
                match.status === 'LIVE' ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 
                match.status === 'COMPLETED' ? 'border-yellow-500/20 shadow-[0_0_20px_rgba(255,215,0,0.05)] bg-gray-900/80' : 
                'border-gray-800 bg-gray-950/80'
              } backdrop-blur-md`}
            >
              {/* Match Header (Date & Venue) */}
              <div className={`px-4 py-2 flex justify-between items-center text-xs md:text-sm font-semibold uppercase tracking-wider ${
                match.status === 'LIVE' ? 'bg-red-500/20 text-red-400' : 
                'bg-gray-900 border-b border-gray-800 text-gray-400'
              }`}>
                <div className="flex items-center gap-2">
                  <span>Match {match.matchNumber}</span>
                  {match.status === 'LIVE' && (
                    <span className="flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                      <Activity size={10} /> LIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-right">
                  <span>{formatDate(match.date)}</span>
                </div>
              </div>

              {/* Match Body (Teams & Scores) */}
              <div className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative">
                
                {/* Team 1 */}
                <div className="flex items-center justify-between md:justify-start w-full md:w-[40%] gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 md:w-16 md:h-16 relative flex-shrink-0 bg-gray-950 rounded-full border border-gray-700 overflow-hidden flex items-center justify-center p-1">
                      {match.team1.logoUrl ? (
                        <Image src={match.team1.logoUrl} alt={match.team1.name} fill className="object-contain p-1" />
                      ) : (
                        <Trophy size={20} className="text-gray-600" />
                      )}
                    </div>
                    <Link href={`/teams?teamId=${match.team1.id}`} className="font-bold text-white text-lg md:text-xl truncate hover:text-yellow-400 transition-colors">
                      {match.team1.name}
                    </Link>
                  </div>
                  {match.team1Score && (
                    <div className="font-black text-2xl md:text-3xl text-yellow-400">{match.team1Score}</div>
                  )}
                </div>

                {/* VS Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-gray-950 border border-gray-800 rounded-full w-10 h-10 flex items-center justify-center text-xs font-black text-gray-500 hidden md:flex">
                  VS
                </div>

                {/* Team 2 */}
                <div className="flex items-center justify-between md:justify-end w-full md:w-[40%] gap-4 flex-row-reverse md:flex-row">
                  <div className="flex items-center gap-3 flex-row-reverse md:flex-row">
                    <div className="w-12 h-12 md:w-16 md:h-16 relative flex-shrink-0 bg-gray-950 rounded-full border border-gray-700 overflow-hidden flex items-center justify-center p-1">
                      {match.team2.logoUrl ? (
                        <Image src={match.team2.logoUrl} alt={match.team2.name} fill className="object-contain p-1" />
                      ) : (
                        <Trophy size={20} className="text-gray-600" />
                      )}
                    </div>
                    <Link href={`/teams?teamId=${match.team2.id}`} className="font-bold text-white text-lg md:text-xl truncate text-right hover:text-yellow-400 transition-colors">
                      {match.team2.name}
                    </Link>
                  </div>
                  {match.team2Score && (
                    <div className="font-black text-2xl md:text-3xl text-yellow-400">{match.team2Score}</div>
                  )}
                </div>
              </div>

              {/* Match Footer (Result / Venue) */}
              <div className="px-4 py-3 bg-gray-950/50 border-t border-gray-800 flex justify-center text-sm">
                {match.status === 'COMPLETED' ? (
                  <span className="font-bold text-yellow-400 tracking-wide text-center uppercase">{match.result}</span>
                ) : match.status === 'LIVE' ? (
                  <span className="font-semibold text-red-400 tracking-wide text-center animate-pulse">Match in Progress...</span>
                ) : (
                  <div className="flex items-center gap-1 text-gray-500 font-medium">
                    <MapPin size={14} /> {match.venue}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
