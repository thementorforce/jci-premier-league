"use client";

import { useState } from "react";

const TABS = [
  { id: "runs",    label: "🟠 Orange Cap",  subtitle: "Most Runs",    unit: "Runs",  color: "#f97316" },
  { id: "wickets", label: "🟣 Purple Cap",  subtitle: "Most Wickets", unit: "Wkts",  color: "#a855f7" },
  { id: "sixes",   label: "💥 Most Sixes",  subtitle: "Sixes Hit",    unit: "Sixes", color: "#3b82f6" },
];

export default function StatsClient({ topRuns, topWickets, topSixes }) {
  const [activeTab, setActiveTab] = useState("runs");

  const dataMap = { runs: topRuns, wickets: topWickets, sixes: topSixes };
  const tab = TABS.find(t => t.id === activeTab);
  const data = dataMap[activeTab] || [];

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <p className="eyebrow">Season 1</p>
        <h1 className="gold-gradient-text section-title">Tournament Stats</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          The ultimate leaderboard for the best performers of the season.
        </p>
      </div>

      {/* Tab Switcher — uses responsive CSS class */}
      <div className="stats-tab-bar">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="stats-tab-btn"
            style={{
              background: activeTab === t.id ? t.color : 'transparent',
              color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab === t.id ? `0 0 20px ${t.color}55` : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
        {data.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📊</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>No Stats Available</h3>
            <p style={{ fontSize: '14px' }}>Matches haven't generated any stats for this category yet.</p>
          </div>
        ) : (
          data.map((stat, index) => {
            const isFirst = index === 0;
            const value = stat[activeTab];
            const photoSize = isFirst ? 56 : 42;

            return (
              <div
                key={stat.id}
                className="stats-leaderboard-row"
                style={{
                  background: isFirst
                    ? 'linear-gradient(90deg, rgba(216,240,107,0.07) 0%, transparent 100%)'
                    : 'transparent',
                  borderLeft: isFirst ? '3px solid var(--accent-gold)' : '3px solid transparent',
                }}
              >
                {/* Rank */}
                <div
                  className="stats-rank-num"
                  style={{
                    width: '28px',
                    textAlign: 'center',
                    fontWeight: '900',
                    fontSize: isFirst ? '24px' : '16px',
                    color: isFirst ? 'var(--accent-gold)'
                      : index === 1 ? '#d1d5db'
                      : index === 2 ? '#b45309'
                      : 'var(--text-secondary)',
                    flexShrink: 0,
                  }}
                >
                  #{index + 1}
                </div>

                {/* Player Photo */}
                <div
                  className="stats-player-photo"
                  style={{
                    width: photoSize,
                    height: photoSize,
                    border: `2px solid ${isFirst ? 'var(--accent-gold)' : 'var(--card-border)'}`,
                  }}
                >
                  <img src={stat.player.photoUrl} alt={stat.player.fullName} />
                </div>

                {/* Name & Team */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: '800',
                    fontSize: isFirst ? '16px' : '14px',
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {stat.player.fullName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {stat.player.team?.name || '—'} · {stat.matches}m
                  </div>
                </div>

                {/* Stat Value */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontWeight: '900',
                    fontSize: isFirst ? '32px' : '24px',
                    color: isFirst ? 'var(--accent-gold)' : 'var(--text-primary)',
                    lineHeight: 1,
                    filter: isFirst ? 'drop-shadow(0 0 8px var(--accent-gold-glow))' : undefined,
                  }}>
                    {value}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
                    {tab.unit}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
