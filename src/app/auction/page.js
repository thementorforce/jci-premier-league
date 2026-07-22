'use client';

import { useState, useEffect, useRef } from 'react';
import { Award, Users, Search, RefreshCw, Clock, Radio, Coffee, Pause, Flag } from 'lucide-react';
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
  const [recentlySoldPlayer, setRecentlySoldPlayer] = useState(null);
  
  const lastBidRef = useRef(0);

  const playChime = () => {
    if (typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.25);
        } catch {}
      }
    }
  };

  const playSuccessChime = () => {
    if (typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        try {
          const ctx = new AudioContext();
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.06, ctx.currentTime + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.3);
            osc.start(ctx.currentTime + i * 0.08);
            osc.stop(ctx.currentTime + i * 0.08 + 0.35);
          });
        } catch {}
      }
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/auction/status');
      if (res.ok) {
        const json = await res.json();
        
        // Audio bid notification trigger
        if (json.activePlayer) {
          if (json.activePlayer.currentBid > lastBidRef.current) {
            playChime();
            lastBidRef.current = json.activePlayer.currentBid;
          }
        } else {
          lastBidRef.current = 0;
        }

        setData(prev => {
          if (prev.activePlayer && !json.activePlayer) {
            const soldVersion = json.soldPlayers.find(p => p.id === prev.activePlayer.id);
            if (soldVersion) {
              playSuccessChime();
              setRecentlySoldPlayer({
                ...prev.activePlayer,
                soldPrice: soldVersion.soldPrice,
                team: soldVersion.team
              });
              setTimeout(() => {
                setRecentlySoldPlayer(null);
              }, 12000); // Flipped display duration
            }
          }
          // If a new player becomes active, clear any flipped card immediately
          if (json.activePlayer) {
            setRecentlySoldPlayer(null);
          }
          return json;
        });
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
  }, []);

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

      <SponsorMarquee ads={(data.ads || []).filter(ad => {
        if (!ad.position) return false;
        if (ad.position.includes('/')) {
          return ad.position.split(',').map(p => p.trim()).includes('/auction');
        }
        return ad.position === 'TOP_BANNER';
      })} title="Official Tournament Sponsors" />

      {/* Modern Scrolling Ticker */}
      <div className="modern-ticker-container">
        <div className="modern-ticker-wrap">
          <div className="modern-ticker-content">
            JCI TUMKUR METRO &nbsp;&nbsp;&bull;&nbsp;&nbsp; JCOM L TUMKUR 1.0 &nbsp;&nbsp;&bull;&nbsp;&nbsp; JAC TUMKUR &nbsp;&nbsp;&bull;&nbsp;&nbsp; ROTARY TUMKUR PRERANA &nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
          <div className="modern-ticker-content">
            JCI TUMKUR METRO &nbsp;&nbsp;&bull;&nbsp;&nbsp; JCOM L TUMKUR 1.0 &nbsp;&nbsp;&bull;&nbsp;&nbsp; JAC TUMKUR &nbsp;&nbsp;&bull;&nbsp;&nbsp; ROTARY TUMKUR PRERANA &nbsp;&nbsp;&nbsp;&nbsp;&bull;&nbsp;&nbsp;&nbsp;&nbsp;
          </div>
        </div>
      </div>

      <div className="grid-auction-main">
        
        {/* Left Side: Live Auction Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Active Player Cards */}
          {(activePlayer || recentlySoldPlayer) ? (
            <div className={`flip-card ${recentlySoldPlayer ? 'is-flipped' : ''}`}>
              <div className="flip-card-inner">
                {/* Front Side: Bidding details */}
                <div className="flip-card-front">
                  {(() => {
                    const displayPlayer = activePlayer || recentlySoldPlayer;
                    if (!displayPlayer) return null;
                    return (
                      <div className="premium-card" style={{ border: '2px solid var(--accent-gold)', boxShadow: 'var(--glow-gold)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '0', right: '0', background: 'var(--accent-gold)', color: '#070b19', padding: '4px 16px', fontWeight: '800', borderBottomLeftRadius: '12px', fontSize: '12px', letterSpacing: '0.05em', textTransform: 'uppercase' }} className="badge-bidding">
                          {recentlySoldPlayer ? 'Sold!' : 'Active Bidding'}
                        </div>

                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '12px' }}>
                          {/* Photo */}
                          <div style={{ width: '150px', height: '180px', borderRadius: '12px', background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--card-border)' }}>
                            {displayPlayer.photoUrl ? (
                              <img src={displayPlayer.photoUrl} alt={displayPlayer.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ fontSize: '48px' }}>👤</div>
                            )}
                          </div>

                          {/* Details */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1', minWidth: '220px' }}>
                            <span className="badge badge-registered" style={{ alignSelf: 'flex-start' }}>{displayPlayer.preferredRole}</span>
                            <h2 style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px' }}>{displayPlayer.fullName}</h2>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                              <div>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Organization</span>
                                <p style={{ fontWeight: '600' }}>{displayPlayer.organization}</p>
                              </div>
                              <div>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Jersey Size</span>
                                <p style={{ fontWeight: '600' }}>{displayPlayer.jerseySize}</p>
                              </div>
                              <div>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Experience</span>
                                <p style={{ fontWeight: '600' }}>{displayPlayer.experience}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bidding Telemetry Block */}
                        <div style={{ marginTop: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                          <div>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Highest Bidding Team</span>
                            <p className="teal-gradient-text" style={{ fontSize: '24px', fontWeight: '800' }}>{displayPlayer.highestBidder}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Bid Amount</span>
                            <p className="gold-gradient-text" style={{ fontSize: '32px', fontWeight: '800' }}>
                              {displayPlayer.currentBid > 0 ? `${displayPlayer.currentBid.toLocaleString()} pts` : 'Starting...'}
                            </p>
                          </div>
                        </div>

                        {/* Live Bidding Activity Feed */}
                        {displayPlayer.bidHistory && displayPlayer.bidHistory.length > 0 && (
                          <div style={{ marginTop: '20px', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.05em' }}>
                              ⚡ Bidding Activity Log
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '120px', overflowY: 'auto' }}>
                              {displayPlayer.bidHistory.slice(0, 3).map((bid, i) => (
                                <div key={bid.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', background: i === 0 ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)', padding: '6px 12px', borderRadius: '6px', border: i === 0 ? '1px solid var(--accent-teal)' : '1px solid transparent' }}>
                                  <span style={{ color: i === 0 ? '#fff' : 'var(--text-secondary)' }}>
                                    {i === 0 ? '🔥 New Highest Bid' : 'Bid Placed'} by <strong>{bid.teamName}</strong>
                                  </span>
                                  <span style={{ fontWeight: '800', color: i === 0 ? 'var(--accent-teal)' : 'var(--accent-gold)' }}>
                                    {bid.amount.toLocaleString()} pts
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Back Side: Congratulations Sold details */}
                <div className="flip-card-back">
                  <div className="premium-card" style={{
                    border: '2px solid var(--success)',
                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '100%',
                    minHeight: '340px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
                    textAlign: 'center',
                    padding: '24px'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎉</div>
                    <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>
                      Congratulations!
                    </h2>
                    <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', margin: '0 0 12px' }}>
                      Player <strong style={{ color: 'var(--accent-gold)' }}>{recentlySoldPlayer?.fullName}</strong> has been drafted!
                    </p>
                    
                    <div style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1.5px solid var(--success)',
                      borderRadius: '10px',
                      padding: '12px 20px',
                      marginBottom: '16px',
                      width: '100%',
                      maxWidth: '360px'
                    }}>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                        Sold To
                      </span>
                      <p style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 6px' }}>
                        {recentlySoldPlayer?.team?.name}
                      </p>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                        Final Price
                      </span>
                      <p style={{ fontSize: '22px', fontWeight: '900', color: 'var(--accent-gold)', margin: 0 }}>
                        {recentlySoldPlayer?.soldPrice?.toLocaleString()} pts
                      </p>
                    </div>

                    <div style={{
                      marginTop: 'auto',
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.4)',
                      letterSpacing: '0.02em',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingTop: '8px',
                      width: '100%',
                      textAlign: 'center'
                    }}>
                      This website is powered by The Metro force and Evenzo
                    </div>
                  </div>
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
