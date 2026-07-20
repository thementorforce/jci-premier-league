'use client';

import { useState, useEffect } from 'react';
import { Award, Users, Search, RefreshCw, Volume2, Clock, Radio, Coffee, Pause, Flag } from 'lucide-react';
import Link from 'next/link';
import SponsorMarquee from '@/components/SponsorMarquee';

const STATUS_CONFIG = {
  NOT_STARTED: { label: 'Not Started', icon: Clock,  color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', description: 'The auction has not started yet. Stay tuned!' },
  LIVE:        { label: 'Live',        icon: Radio,  color: '#10b981', bg: 'rgba(16,185,129,0.12)', description: 'Bidding is live! Watch the draft in real time.' },
  BREAK:       { label: 'On Break',    icon: Coffee, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', description: 'Short break in progress. Bidding resumes shortly.' },
  PAUSED:      { label: 'Paused',      icon: Pause,  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  description: 'Auction is temporarily paused.' },
  ENDED:       { label: 'Ended',       icon: Flag,   color: '#6366f1', bg: 'rgba(99,102,241,0.12)', description: 'The auction has concluded. Check the final squads!' },
};

export default function LiveAuction() {
  const [data, setData] = useState({
    activePlayer: null,
    soldPlayers: [],
    unsoldPlayers: [],
    draftPool: [],
    teams: [],
    ads: [],
    auctionStatus: 'NOT_STARTED'
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [lastBidAmount, setLastBidAmount] = useState(0);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/auction/status');
      if (res.ok) {
        const json = await res.json();
        
        // Play simple audio alert if a new bid is placed
        if (json.activePlayer && json.activePlayer.currentBid > lastBidAmount) {
          if (soundEnabled && typeof window !== 'undefined') {
            const synth = window.speechSynthesis;
            if (synth) {
              const utterance = new SpeechSynthesisUtterance(`${json.activePlayer.highestBidder} bid ${json.activePlayer.currentBid}`);
              utterance.rate = 1.1;
              synth.speak(utterance);
            }
          }
          setLastBidAmount(json.activePlayer.currentBid);
        } else if (!json.activePlayer) {
          setLastBidAmount(0);
        }

        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Poll database every 3s
    return () => clearInterval(interval);
  }, [soundEnabled, lastBidAmount]);

  const filteredDraft = data.draftPool.filter(p => 
    p.fullName.toLowerCase().includes(search.toLowerCase()) || 
    p.preferredRole.toLowerCase().includes(search.toLowerCase()) ||
    p.organization.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && !data.teams.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <RefreshCw className="animate-spin" size={48} color="var(--accent-teal)" />
        <p style={{ color: 'var(--text-secondary)' }}>Connecting to auction arena...</p>
      </div>
    );
  }

  const { activePlayer, soldPlayers, unsoldPlayers, teams } = data;

  return (
    <div className="page-container-lg">
      
      {/* Header Dashboard */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="gold-gradient-text section-title">⚡ Live Auction Arena</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Real-time updates directly from the bidding console</p>
        </div>

        {/* Audio helper toggle */}
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)} 
          className="premium-button-secondary" 
          style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Volume2 size={16} />
          {soundEnabled ? 'Speech Engine: ON' : 'Speech Engine: OFF'}
        </button>
      </div>

      {/* ── Auction Status Banner ── */}
      {(() => {
        const sc = STATUS_CONFIG[data.auctionStatus] || STATUS_CONFIG.NOT_STARTED;
        const StatusIcon = sc.icon;
        const isLive = data.auctionStatus === 'LIVE';
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 20px',
            borderRadius: '12px',
            background: sc.bg,
            border: `1px solid ${sc.color}55`,
            boxShadow: isLive ? `0 0 20px ${sc.color}33` : 'none',
            animation: isLive ? 'pulse-glow 2s infinite' : 'none',
          }}>
            {/* Dot */}
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: sc.color,
              flexShrink: 0,
              boxShadow: isLive ? `0 0 8px ${sc.color}` : 'none',
              animation: isLive ? 'pulse-glow 1.5s infinite' : 'none',
            }} />
            <StatusIcon size={18} color={sc.color} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>Auction Status</span>
              <p style={{ fontWeight: '800', fontSize: '15px', color: sc.color, margin: 0 }}>{sc.label}</p>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, textAlign: 'right' }}>
              {sc.description}
            </p>
          </div>
        );
      })()}

      <SponsorMarquee ads={data.ads || []} title="Official Tournament Sponsors" />

      <div className="grid-auction-main">
        
        {/* Left Side: Live Auction Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Active Player Cards */}
          {activePlayer ? (
            <div className="premium-card" style={{ border: '2px solid var(--accent-gold)', boxShadow: 'var(--glow-gold)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '0', right: '0', background: 'var(--accent-gold)', color: '#070b19', padding: '4px 16px', fontWeight: '800', borderBottomLeftRadius: '12px', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }} className="badge-bidding">
                Active Bidding
              </div>

              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '12px' }}>
                {/* Photo */}
                <div style={{ width: '150px', height: '180px', borderRadius: '12px', background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--card-border)' }}>
                  {activePlayer.photoUrl ? (
                    <img src={activePlayer.photoUrl} alt={activePlayer.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ fontSize: '48px' }}>👤</div>
                  )}
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1', minWidth: '220px' }}>
                  <span className="badge badge-registered" style={{ alignSelf: 'flex-start' }}>{activePlayer.preferredRole}</span>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px' }}>{activePlayer.fullName}</h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Organization</span>
                      <p style={{ fontWeight: '600' }}>{activePlayer.organization}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Jersey Size</span>
                      <p style={{ fontWeight: '600' }}>{activePlayer.jerseySize}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Experience</span>
                      <p style={{ fontWeight: '600' }}>{activePlayer.experience}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bidding Telemetry Block */}
              <div style={{ marginTop: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Highest Bidding Team</span>
                  <p className="teal-gradient-text" style={{ fontSize: '24px', fontWeight: '800' }}>{activePlayer.highestBidder}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Bid Amount</span>
                  <p className="gold-gradient-text" style={{ fontSize: '32px', fontWeight: '800' }}>
                    {activePlayer.currentBid > 0 ? `${activePlayer.currentBid.toLocaleString()} pts` : 'Starting...'}
                  </p>
                </div>
              </div>
            </div>
          ) : data.auctionStatus === 'NOT_STARTED' ? (
            <div className="premium-card" style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--card-border)' }}>
              <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>⏳</span>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--accent-gold)' }}>Not Started Yet</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                The live auction has not started yet. Bidding will begin when the host activates the draft.
              </p>
            </div>
          ) : data.auctionStatus === 'BREAK' ? (
            <div className="premium-card" style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--card-border)' }}>
              <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>☕</span>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#f59e0b' }}>On Break</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                The auction is currently on break. The bidding session will resume shortly.
              </p>
            </div>
          ) : data.auctionStatus === 'PAUSED' ? (
            <div className="premium-card" style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--card-border)' }}>
              <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>⏸️</span>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#ef4444' }}>Paused</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                The live auction is currently paused. Bidding will resume as soon as the session starts again.
              </p>
            </div>
          ) : data.auctionStatus === 'ENDED' ? (
            <div className="premium-card" style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--card-border)' }}>
              <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>🏁</span>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#6366f1' }}>Auction Ended</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                The live auction has concluded! View the final squads in the Franchise Teams page.
              </p>
            </div>
          ) : (
            <div className="premium-card" style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--card-border)' }}>
              <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>💤</span>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>No Active Bidding Session</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                The auctioneer has not started bidding on a player. Keep this window open; it will update automatically when the admin starts the draft.
              </p>
            </div>
          )}

          {/* Sold and Unsold Players (Tabs / Split View) */}
          <div className="grid-sold-unsold">
            
            {/* Recently Sold */}
            <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={18} color="var(--success)" /> Sold Drafts
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
                {soldPlayers.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No players sold yet.</p>
                ) : (
                  soldPlayers.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(7, 11, 25, 0.4)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid var(--success)' }}>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '13px' }}>{p.fullName}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Sold to: <strong>{p.team?.name}</strong></p>
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-gold)' }}>{p.soldPrice?.toLocaleString()} pts</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Unsold Players */}
            <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={18} color="var(--danger)" /> Unsold Pool
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
                {unsoldPlayers.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No unsold players yet.</p>
                ) : (
                  unsoldPlayers.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(7, 11, 25, 0.4)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid var(--danger)' }}>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '13px' }}>{p.fullName}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.preferredRole} • {p.organization}</p>
                      </div>
                      <span className="badge badge-unsold" style={{ fontSize: '9px' }}>Unsold</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Franchise Purses (Budgets) & Registered Pool Lookup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Team Purse Standing */}
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', borderBottom: '1px solid var(--card-border)', paddingBottom: '8px' }}>
              💰 Franchise Points Standing
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {teams.map(t => {
                const remaining = t.pointsPurse - t.pointsSpent;
                const percentSpent = (t.pointsSpent / t.pointsPurse) * 100;
                return (
                  <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ fontWeight: '600' }}>{t.name}</span>
                      <span style={{ fontWeight: '800', color: 'var(--accent-teal)' }}>{remaining.toLocaleString()} pts</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, percentSpent))}%`, background: 'var(--accent-gold)' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Searchable Player Draft Pool */}
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800' }}>🔍 Draft Pool Search</h3>
            
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search player, role or org..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="premium-input"
                style={{ paddingLeft: '40px' }}
              />
              <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
              {filteredDraft.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>No matching players</p>
              ) : (
                filteredDraft.map(p => (
                  <div key={p.id} style={{ padding: '8px 12px', borderRadius: '6px', background: 'rgba(7, 11, 25, 0.4)', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: '700' }}>{p.fullName}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '10px' }}>{p.preferredRole} • {p.organization}</p>
                    </div>
                    <span className="badge badge-registered" style={{ fontSize: '8px' }}>Draft Pool</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
