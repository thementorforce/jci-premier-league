"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Activity } from "lucide-react";

const STATUS_CONFIG = {
  LIVE: { label: 'LIVE', bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.4)' },
  COMPLETED: { label: 'FT', bg: 'rgba(74,222,128,0.1)', color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
  SCHEDULED: { label: 'UPCOMING', bg: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: 'var(--card-border)' },
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleString('en-IN', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function MatchesClient({ initialMatches }) {
  const [matches] = useState(initialMatches);

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p className="eyebrow">Season 1</p>
        <h1 className="gold-gradient-text section-title">Fixtures & Results</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          Track upcoming matches, live scores, and past results.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="premium-card" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <Calendar size={48} style={{ margin: '0 auto 16px', color: 'var(--text-secondary)', opacity: 0.4 }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>No Matches Scheduled</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>The tournament schedule has not been released yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {matches.map((match) => {
            const cfg = STATUS_CONFIG[match.status] || STATUS_CONFIG.SCHEDULED;
            const isLive = match.status === 'LIVE';
            return (
              <div
                key={match.id}
                className="premium-card"
                style={{
                  overflow: 'hidden',
                  border: `1px solid ${isLive ? 'rgba(239,68,68,0.5)' : 'var(--card-border)'}`,
                  boxShadow: isLive ? '0 0 24px rgba(239,68,68,0.15)' : undefined,
                }}
              >
                {/* Match header bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 16px',
                  background: 'rgba(0,0,0,0.3)',
                  borderBottom: '1px solid var(--card-border)',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Match {match.matchNumber}</span>
                  <span style={{
                    background: cfg.bg,
                    color: cfg.color,
                    border: `1px solid ${cfg.border}`,
                    padding: '2px 10px',
                    borderRadius: '99px',
                    fontSize: '10px',
                    animation: isLive ? 'pulse 2s infinite' : undefined,
                  }}>
                    {cfg.label}
                  </span>
                </div>

                {/* Teams & Score */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1fr',
                  alignItems: 'center',
                  padding: '20px 16px',
                  gap: '16px',
                }}>
                  {/* Team 1 */}
                  <Link href={`/teams?teamId=${match.team1.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    <div style={{
                      width: '48px', height: '48px', flexShrink: 0,
                      borderRadius: '50%', background: 'var(--bg-tertiary)',
                      border: '2px solid var(--card-border)', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {match.team1.logoUrl
                        ? <img src={match.team1.logoUrl} alt={match.team1.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Activity size={20} style={{ color: 'var(--text-secondary)' }} />
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.2 }}>{match.team1.name}</div>
                      {match.team1Score && (
                        <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--accent-gold)', marginTop: '2px' }}>{match.team1Score}</div>
                      )}
                    </div>
                  </Link>

                  {/* VS */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'var(--bg-tertiary)', border: '1px solid var(--card-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '900', color: 'var(--text-secondary)',
                    flexShrink: 0,
                  }}>VS</div>

                  {/* Team 2 */}
                  <Link href={`/teams?teamId=${match.team2.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', flexDirection: 'row-reverse', textAlign: 'right' }}>
                    <div style={{
                      width: '48px', height: '48px', flexShrink: 0,
                      borderRadius: '50%', background: 'var(--bg-tertiary)',
                      border: '2px solid var(--card-border)', overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {match.team2.logoUrl
                        ? <img src={match.team2.logoUrl} alt={match.team2.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <Activity size={20} style={{ color: 'var(--text-secondary)' }} />
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '15px', lineHeight: 1.2 }}>{match.team2.name}</div>
                      {match.team2Score && (
                        <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--accent-gold)', marginTop: '2px' }}>{match.team2Score}</div>
                      )}
                    </div>
                  </Link>
                </div>

                {/* Footer: result / venue */}
                <div style={{
                  padding: '10px 16px',
                  background: 'rgba(0,0,0,0.2)',
                  borderTop: '1px solid var(--card-border)',
                  textAlign: 'center',
                  fontSize: '13px',
                }}>
                  {match.status === 'COMPLETED' ? (
                    <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>{match.result}</span>
                  ) : match.status === 'LIVE' ? (
                    <span style={{ color: '#f87171', fontWeight: '600' }}>Match in Progress...</span>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <MapPin size={13} /> {match.venue} &nbsp;·&nbsp; {formatDate(match.date)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
