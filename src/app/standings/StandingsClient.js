"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Activity, Info } from "lucide-react";

export default function StandingsClient({ initialStandings }) {
  const [standings] = useState(initialStandings);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p className="eyebrow">Season 1</p>
        <h1 className="gold-gradient-text section-title">Points Table</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Top 4 teams qualify for the Playoffs.
        </p>
      </div>

      {/* Table */}
      <div className="premium-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(216, 240, 107, 0.2)' }}>
        {/* Header Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 50px 50px 50px 80px 70px',
          padding: '12px 16px',
          background: 'rgba(0,0,0,0.4)',
          borderBottom: '1px solid var(--card-border)',
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-secondary)',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>#</span>
          <span>Team</span>
          <span style={{ textAlign: 'center' }}>P</span>
          <span style={{ textAlign: 'center' }}>W</span>
          <span style={{ textAlign: 'center' }}>L</span>
          <span style={{ textAlign: 'center' }}>NRR</span>
          <span style={{ textAlign: 'center', color: 'var(--accent-gold)' }}>PTS</span>
        </div>

        {standings.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <Activity size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontWeight: '600' }}>Tournament hasn't started yet.</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Matches have not been played.</p>
          </div>
        ) : (
          standings.map((team, index) => {
            const isTop4 = index < 4;
            return (
              <Link
                key={team.id}
                href={`/teams?teamId=${team.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 50px 50px 50px 80px 70px',
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--card-border)',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  background: isTop4 ? 'rgba(216, 240, 107, 0.03)' : 'transparent',
                  transition: 'background 0.2s',
                  borderLeft: isTop4 ? '3px solid var(--accent-gold)' : '3px solid transparent',
                }}
              >
                {/* Rank */}
                <span style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  color: index === 0 ? 'var(--accent-gold)' : index < 3 ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}>
                  {index + 1}
                </span>

                {/* Team Name + Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    flexShrink: 0,
                    borderRadius: '50%',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--card-border)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Trophy size={16} style={{ color: 'var(--text-secondary)' }} />
                    )}
                  </div>
                  <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {team.name}
                  </span>
                </div>

                <span style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>{team.matchesPlayed}</span>
                <span style={{ textAlign: 'center', color: '#4ade80', fontWeight: '600', fontSize: '14px' }}>{team.won}</span>
                <span style={{ textAlign: 'center', color: '#f87171', fontWeight: '600', fontSize: '14px' }}>{team.lost}</span>
                <span style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  {team.nrr > 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3)}
                </span>
                <span style={{
                  textAlign: 'center',
                  fontWeight: '900',
                  fontSize: '20px',
                  color: 'var(--accent-gold)',
                  filter: 'drop-shadow(0 0 6px var(--accent-gold-glow))',
                }}>
                  {team.points}
                </span>
              </Link>
            );
          })
        )}
      </div>

      {/* Footer note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '12px' }}>
        <Info size={14} />
        <span>Teams ranked by Points. Equal points decided by Net Run Rate (NRR).</span>
      </div>
    </div>
  );
}
