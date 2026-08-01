"use client";

import { useState } from "react";

const TABS = [
  { id: "runs",    label: "🟠 Orange Cap",   subtitle: "Most Runs",    unit: "Runs",   accentColor: "#f97316" },
  { id: "wickets", label: "🟣 Purple Cap",   subtitle: "Most Wickets", unit: "Wkts",   accentColor: "#a855f7" },
  { id: "sixes",   label: "💥 Most Sixes",   subtitle: "Sixes Hit",    unit: "Sixes",  accentColor: "#3b82f6" },
];

export default function StatsClient({ topRuns, topWickets, topSixes }) {
  const [activeTab, setActiveTab] = useState("runs");

  const dataMap = { runs: topRuns, wickets: topWickets, sixes: topSixes };
  const activeTabCfg = TABS.find(t => t.id === activeTab);
  const data = dataMap[activeTab] || [];

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p className="eyebrow">Season 1</p>
        <h1 className="gold-gradient-text section-title">Tournament Stats</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          The ultimate leaderboard for the best performers of the season.
        </p>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '8px',
        background: 'var(--bg-secondary)',
        padding: '6px',
        borderRadius: '16px',
        border: '1px solid var(--card-border)',
        marginBottom: '28px',
        overflowX: 'auto',
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: '130px',
              padding: '10px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '14px',
              transition: 'all 0.2s',
              background: activeTab === tab.id ? activeTabCfg.accentColor : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab === tab.id ? `0 0 20px ${activeTabCfg.accentColor}55` : 'none',
            }}
          >
            {tab.label}
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
            return (
              <div
                key={stat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: isFirst ? '20px 20px' : '14px 20px',
                  borderBottom: '1px solid var(--card-border)',
                  background: isFirst
                    ? 'linear-gradient(90deg, rgba(216,240,107,0.08) 0%, transparent 100%)'
                    : 'transparent',
                  borderLeft: isFirst ? '3px solid var(--accent-gold)' : '3px solid transparent',
                  transition: 'background 0.2s',
                }}
              >
                {/* Rank */}
                <div style={{
                  width: '32px',
                  textAlign: 'center',
                  fontWeight: '900',
                  fontSize: isFirst ? '28px' : '18px',
                  color: isFirst ? 'var(--accent-gold)' : index === 1 ? '#d1d5db' : index === 2 ? '#92400e' : 'var(--text-secondary)',
                  flexShrink: 0,
                }}>
                  #{index + 1}
                </div>

                {/* Player Photo */}
                <div style={{
                  width: isFirst ? '60px' : '44px',
                  height: isFirst ? '60px' : '44px',
                  flexShrink: 0,
                  borderRadius: '50%',
                  border: `2px solid ${isFirst ? 'var(--accent-gold)' : 'var(--card-border)'}`,
                  overflow: 'hidden',
                  background: 'var(--bg-tertiary)',
                  transition: 'all 0.2s',
                }}>
                  <img
                    src={stat.player.photoUrl}
                    alt={stat.player.fullName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                  />
                </div>

                {/* Name & Team */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: '800',
                    fontSize: isFirst ? '18px' : '15px',
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {stat.player.fullName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {stat.player.team?.name || '—'} &nbsp;·&nbsp; {stat.matches} match{stat.matches !== 1 ? 'es' : ''}
                  </div>
                </div>

                {/* Stat Value */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontWeight: '900',
                    fontSize: isFirst ? '36px' : '26px',
                    color: isFirst ? 'var(--accent-gold)' : 'var(--text-primary)',
                    lineHeight: 1,
                    filter: isFirst ? 'drop-shadow(0 0 8px var(--accent-gold-glow))' : undefined,
                  }}>
                    {value}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
                    {activeTabCfg.unit}
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
