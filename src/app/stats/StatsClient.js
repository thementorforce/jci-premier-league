"use client";

import { useState } from "react";
import Image from "next/image";
import { Medal, Flame, Zap, User } from "lucide-react";

export default function StatsClient({ topRuns, topWickets, topSixes }) {
  const [activeTab, setActiveTab] = useState("runs");

  const tabs = [
    { id: "runs", label: "Orange Cap (Runs)", icon: <Flame size={16} />, data: topRuns, unit: "Runs", color: "from-orange-500 to-orange-300" },
    { id: "wickets", label: "Purple Cap (Wickets)", icon: <Zap size={16} />, data: topWickets, unit: "Wkts", color: "from-purple-600 to-purple-400" },
    { id: "sixes", label: "Most Sixes", icon: <Medal size={16} />, data: topSixes, unit: "Sixes", color: "from-blue-500 to-blue-300" }
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-500 uppercase tracking-tight mb-4 filter drop-shadow-lg">
          Tournament Stats
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base">
          The ultimate leaderboard for the best performers of the season.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 bg-gray-900/50 p-2 rounded-2xl border border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm md:text-base transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-4">
        {activeTabData.data.length === 0 ? (
          <div className="premium-card p-12 text-center rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
            <User size={48} className="mx-auto mb-4 text-gray-500 opacity-50" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">No Stats Available</h3>
            <p className="text-gray-500 text-sm">Matches haven't generated any stats for this category yet.</p>
          </div>
        ) : (
          activeTabData.data.map((stat, index) => {
            const isFirst = index === 0;
            return (
              <div 
                key={stat.id} 
                className={`premium-card overflow-hidden rounded-2xl border transition-all ${
                  isFirst ? 'border-yellow-500/50 shadow-[0_0_25px_rgba(255,215,0,0.15)] bg-gradient-to-r from-gray-900 to-gray-800 scale-[1.02]' : 'border-gray-800 bg-gray-950/80 hover:bg-gray-900'
                } flex items-center p-3 md:p-4 gap-4`}
              >
                {/* Rank */}
                <div className={`w-8 md:w-12 text-center font-black ${
                  isFirst ? 'text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-yellow-600' : 
                  index === 1 ? 'text-2xl md:text-3xl text-gray-300' :
                  index === 2 ? 'text-2xl md:text-3xl text-amber-600' :
                  'text-xl md:text-2xl text-gray-600'
                }`}>
                  #{index + 1}
                </div>

                {/* Photo */}
                <div className={`relative flex-shrink-0 rounded-full border-2 overflow-hidden ${
                  isFirst ? 'w-16 h-16 md:w-20 md:h-20 border-yellow-500' : 'w-12 h-12 md:w-14 md:h-14 border-gray-700'
                }`}>
                  <Image 
                    src={stat.player.photoUrl} 
                    alt={stat.player.fullName} 
                    fill 
                    className="object-cover object-top" 
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold truncate ${isFirst ? 'text-xl md:text-2xl text-white' : 'text-lg md:text-xl text-gray-200'}`}>
                    {stat.player.fullName}
                  </h3>
                  <div className="text-gray-500 text-xs md:text-sm truncate">
                    {stat.player.team?.name || 'Unassigned'} • {stat.matches} Matches
                  </div>
                </div>

                {/* Stat Value */}
                <div className="text-right">
                  <div className={`font-black ${isFirst ? 'text-3xl md:text-4xl text-yellow-400' : 'text-2xl md:text-3xl text-white'}`}>
                    {activeTab === 'runs' && stat.runs}
                    {activeTab === 'wickets' && stat.wickets}
                    {activeTab === 'sixes' && stat.sixes}
                  </div>
                  <div className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider">
                    {activeTabData.unit}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
