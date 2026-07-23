'use client';

import { useState, useEffect, useRef } from 'react';
import { Award, Users, Search, RefreshCw, Clock, Radio, Coffee, Pause, Flag } from 'lucide-react';
import Link from 'next/link';
import SponsorMarquee from '@/components/SponsorMarquee';

const STATUS_CONFIG = {
  NOT_STARTED: { label: 'Not Started', icon: Clock, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', description: 'The auction has not started yet. Stay tuned!' },
  LIVE: { label: 'Live', icon: Radio, color: '#10b981', bg: 'rgba(16,185,129,0.12)', description: 'Bidding is live! Watch the draft in real time.' },
  BREAK: { label: 'On Break', icon: Coffee, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', description: 'Short break in progress. Bidding resumes shortly.' },
  PAUSED: { label: 'Paused', icon: Pause, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', description: 'Auction is temporarily paused.' },
  ENDED: { label: 'Ended', icon: Flag, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', description: 'The auction has concluded. Check the final squads!' },
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
  const lastDataRef = useRef('');

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
        } catch { }
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
        } catch { }
      }
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/auction/status');
      if (res.ok) {
        const json = await res.json();

        const jsonStr = JSON.stringify(json);
        if (jsonStr === lastDataRef.current) {
          setLoading(false);
          return;
        }
        lastDataRef.current = jsonStr;

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
              }, 12000);
            }
          }
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
    const interval = setInterval(fetchStatus, 5000);
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

  // Build sold news ticker text
  const soldTickerItems = soldPlayers.length > 0
    ? soldPlayers.map(p => `\u{1F3CF} ${p.fullName} sold to ${p.team?.name || 'a franchise'} for ${p.soldPrice?.toLocaleString() || '\u2014'} pts`)
    : ['\u{1F3CF} No players sold yet \u2014 stay tuned for the first signing!'];
  const soldTickerText = soldTickerItems.join('     \u2605     ');

  return (
    <div className="auction-fullscreen">

      {/* Top Bar: Title + Status */}
      <div className="auction-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 className="gold-gradient-text" style={{ fontSize: '18px', fontWeight: '800', margin: 0, whiteSpace: 'nowrap' }}>{'\u26A1'} Live Auction</h1>
          {(() => {
            const sc = STATUS_CONFIG[data.auctionStatus] || STATUS_CONFIG.NOT_STARTED;
            const StatusIcon = sc.icon;
            const isLive = data.auctionStatus === 'LIVE';
            return (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px',
                borderRadius: '8px', background: sc.bg, border: `1px solid ${sc.color}44`,
                animation: isLive ? 'pulse-glow 2s infinite' : 'none',
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', background: sc.color, flexShrink: 0,
                  boxShadow: isLive ? `0 0 6px ${sc.color}` : 'none',
                  animation: isLive ? 'pulse-glow 1.5s infinite' : 'none',
                }} />
                <StatusIcon size={14} color={sc.color} style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: '800', fontSize: '12px', color: sc.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sc.label}</span>
              </div>
            );
          })()}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>Real-time updates from bidding console</p>
      </div>

      {/* Sold Players News Ticker */}
      <div className="auction-news-ticker">
        <div className="auction-news-ticker-label">
          <Award size={12} /> SOLD
        </div>
        <div className="auction-news-ticker-track">
          <div className="auction-news-ticker-scroll">
            <span>{soldTickerText}</span>
            <span>{soldTickerText}</span>
          </div>
        </div>
      </div>

      {/* Organization Logos Ticker */}
      <div className="modern-ticker-container">
        <div className="modern-ticker-wrap">
          <div className="modern-ticker-content">
            <div className="ticker-org-item" style={{ flexShrink: 0 }}>
              <img src="/logos/jci_metro.svg" alt="JCI" style={{ height: '30px', width: '75px', borderRadius: '4px', flexShrink: 0 }} />
              <span className="ticker-text-gradient" style={{ flexShrink: 0, fontSize: '14px' }}>JCI TUMKUR METRO</span>
            </div>
            <div className="ticker-org-item" style={{ flexShrink: 0 }}>
              <div style={{ background: '#ffffff', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30px', width: '80px', flexShrink: 0 }}>
                <img src="/logos/jcom.svg" alt="JCOM" style={{ height: '22px', width: '68px', flexShrink: 0 }} />
              </div>
              <span className="ticker-text-gradient" style={{ flexShrink: 0, fontSize: '14px' }}>JCOM L TUMKUR 1.0</span>
            </div>
            <div className="ticker-org-item" style={{ flexShrink: 0 }}>
              <div style={{ background: '#ffffff', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30px', width: '74px', flexShrink: 0 }}>
                <img src="/logos/jac.svg" alt="JAC" style={{ height: '22px', width: '62px', flexShrink: 0 }} />
              </div>
              <span className="ticker-text-gradient" style={{ flexShrink: 0, fontSize: '14px' }}>JAC TUMKUR</span>
            </div>
            <div className="ticker-org-item" style={{ flexShrink: 0 }}>
              <div style={{ background: '#ffffff', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30px', width: '80px', flexShrink: 0 }}>
                <img src="/logos/rotary.svg" alt="Rotary" style={{ height: '22px', width: '68px', flexShrink: 0 }} />
              </div>
              <span className="ticker-text-gradient" style={{ flexShrink: 0, fontSize: '14px' }}>ROTARY TUMKUR PRERANA</span>
            </div>
          </div>
          <div className="modern-ticker-content">
            <div className="ticker-org-item" style={{ flexShrink: 0 }}>
              <img src="/logos/jci_metro.svg" alt="JCI" style={{ height: '30px', width: '75px', borderRadius: '4px', flexShrink: 0 }} />
              <span className="ticker-text-gradient" style={{ flexShrink: 0, fontSize: '14px' }}>JCI TUMKUR METRO</span>
            </div>
            <div className="ticker-org-item" style={{ flexShrink: 0 }}>
              <div style={{ background: '#ffffff', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30px', width: '80px', flexShrink: 0 }}>
                <img src="/logos/jcom.svg" alt="JCOM" style={{ height: '22px', width: '68px', flexShrink: 0 }} />
              </div>
              <span className="ticker-text-gradient" style={{ flexShrink: 0, fontSize: '14px' }}>JCOM L TUMKUR 1.0</span>
            </div>
            <div className="ticker-org-item" style={{ flexShrink: 0 }}>
              <div style={{ background: '#ffffff', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30px', width: '74px', flexShrink: 0 }}>
                <img src="/logos/jac.svg" alt="JAC" style={{ height: '22px', width: '62px', flexShrink: 0 }} />
              </div>
              <span className="ticker-text-gradient" style={{ flexShrink: 0, fontSize: '14px' }}>JAC TUMKUR</span>
            </div>
            <div className="ticker-org-item" style={{ flexShrink: 0 }}>
              <div style={{ background: '#ffffff', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30px', width: '80px', flexShrink: 0 }}>
                <img src="/logos/rotary.svg" alt="Rotary" style={{ height: '22px', width: '68px', flexShrink: 0 }} />
              </div>
              <span className="ticker-text-gradient" style={{ flexShrink: 0, fontSize: '14px' }}>ROTARY TUMKUR PRERANA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="auction-main-grid">

        {/* LEFT: Active Player Card */}
        <div className="auction-left-col">
          {(activePlayer || recentlySoldPlayer) ? (
            <div className={`flip-card ${recentlySoldPlayer ? 'is-flipped' : ''}`} style={{ height: '100%' }}>
              <div className="flip-card-inner" style={{ height: '100%' }}>
                <div className="flip-card-front" style={{ height: '100%' }}>
                  {(() => {
                    const displayPlayer = activePlayer || recentlySoldPlayer;
                    if (!displayPlayer) return null;
                    return (
                      <div className="premium-card auction-player-card">
                        <div style={{ position: 'absolute', top: '0', right: '0', background: 'var(--accent-gold)', color: '#070b19', padding: '3px 14px', fontWeight: '800', borderBottomLeftRadius: '10px', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase' }} className="badge-bidding">
                          {recentlySoldPlayer ? 'Sold!' : 'Active Bidding'}
                        </div>

                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
                          <div style={{ width: '120px', height: '140px', borderRadius: '10px', background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--card-border)', flexShrink: 0 }}>
                            {displayPlayer.photoUrl ? (
                              <img src={displayPlayer.photoUrl} alt={displayPlayer.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ fontSize: '40px' }}>{'\uD83D\uDC64'}</div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1', minWidth: '180px' }}>
                            <span className="badge badge-registered" style={{ alignSelf: 'flex-start', fontSize: '10px', padding: '2px 8px' }}>{displayPlayer.preferredRole}</span>
                            <h2 style={{ fontSize: '22px', fontWeight: '800', marginTop: '2px' }}>{displayPlayer.fullName}</h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '4px' }}>
                              <div>
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Organization</span>
                                <p style={{ fontWeight: '600', fontSize: '12px' }}>{displayPlayer.organization}</p>
                              </div>
                              <div>
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Jersey Size</span>
                                <p style={{ fontWeight: '600', fontSize: '12px' }}>{displayPlayer.jerseySize}</p>
                              </div>
                              <div>
                                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Experience</span>
                                <p style={{ fontWeight: '600', fontSize: '12px' }}>{displayPlayer.experience}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div style={{ marginTop: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Highest Bidding Team</span>
                            <p className="teal-gradient-text" style={{ fontSize: '20px', fontWeight: '800' }}>{displayPlayer.highestBidder}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Bid Amount</span>
                            <p className="gold-gradient-text" style={{ fontSize: '28px', fontWeight: '800' }}>
                              {displayPlayer.currentBid > 0 ? `${displayPlayer.currentBid.toLocaleString()} pts` : 'Starting...'}
                            </p>
                          </div>
                        </div>

                        {displayPlayer.bidHistory && displayPlayer.bidHistory.length > 0 && (
                          <div style={{ marginTop: '10px', borderTop: '1px solid var(--card-border)', paddingTop: '10px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
                              {'\u26A1'} Bidding Activity
                            </span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {displayPlayer.bidHistory.slice(0, 3).map((bid, i) => (
                                <div key={bid.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', background: i === 0 ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)', padding: '4px 10px', borderRadius: '5px', border: i === 0 ? '1px solid var(--accent-teal)' : '1px solid transparent' }}>
                                  <span style={{ color: i === 0 ? '#fff' : 'var(--text-secondary)' }}>
                                    {i === 0 ? '\uD83D\uDD25 Highest' : 'Bid'} by <strong>{bid.teamName}</strong>
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

                <div className="flip-card-back" style={{ height: '100%' }}>
                  <div className="premium-card" style={{
                    border: '2px solid var(--success)', boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)',
                    position: 'relative', overflow: 'hidden', height: '100%',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', textAlign: 'center', padding: '20px'
                  }}>
                    <div style={{ fontSize: '40px', marginBottom: '6px' }}>{'\uD83C\uDF89'}</div>
                    <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px' }}>Congratulations!</h2>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', margin: '0 0 10px' }}>
                      Player <strong style={{ color: 'var(--accent-gold)' }}>{recentlySoldPlayer?.fullName}</strong> has been drafted!
                    </p>
                    <div style={{ background: 'rgba(0,0,0,0.4)', border: '1.5px solid var(--success)', borderRadius: '10px', padding: '10px 18px', marginBottom: '12px', width: '100%', maxWidth: '320px' }}>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Sold To</span>
                      <p style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: '0 0 4px' }}>{recentlySoldPlayer?.team?.name}</p>
                      <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Final Price</span>
                      <p style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent-gold)', margin: 0 }}>{recentlySoldPlayer?.soldPrice?.toLocaleString()} pts</p>
                    </div>
                    <div style={{ marginTop: 'auto', fontSize: '10px', color: 'rgba(255, 255, 255, 0.4)', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '6px', width: '100%', textAlign: 'center' }}>
                      This website is powered by The Metro force and Evenzo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : data.auctionStatus === 'NOT_STARTED' ? (
            <div className="premium-card auction-status-placeholder">
              <span style={{ fontSize: '40px', marginBottom: '12px', display: 'block' }}>{'\u23F3'}</span>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px', color: 'var(--accent-gold)' }}>Not Started Yet</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '400px', margin: '0 auto' }}>Bidding will begin when the host activates the draft.</p>
            </div>
          ) : data.auctionStatus === 'BREAK' ? (
            <div className="premium-card auction-status-placeholder">
              <span style={{ fontSize: '40px', marginBottom: '12px', display: 'block' }}>{'\u2615'}</span>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px', color: '#f59e0b' }}>On Break</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '400px', margin: '0 auto' }}>The bidding session will resume shortly.</p>
            </div>
          ) : data.auctionStatus === 'PAUSED' ? (
            <div className="premium-card auction-status-placeholder">
              <span style={{ fontSize: '40px', marginBottom: '12px', display: 'block' }}>{'\u23F8\uFE0F'}</span>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px', color: '#ef4444' }}>Paused</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '400px', margin: '0 auto' }}>Bidding will resume as soon as the session starts again.</p>
            </div>
          ) : data.auctionStatus === 'ENDED' ? (
            <div className="premium-card auction-status-placeholder">
              <span style={{ fontSize: '40px', marginBottom: '12px', display: 'block' }}>{'\uD83C\uDFC1'}</span>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px', color: '#6366f1' }}>Auction Ended</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '400px', margin: '0 auto' }}>View the final squads in the Franchise Teams page.</p>
            </div>
          ) : (
            <div className="premium-card auction-status-placeholder">
              <span style={{ fontSize: '40px', marginBottom: '12px', display: 'block' }}>{'\uD83D\uDCA4'}</span>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>No Active Bidding</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '400px', margin: '0 auto' }}>Keep this window open; it updates automatically.</p>
            </div>
          )}
        </div>

        {/* MIDDLE: Sold & Unsold panels stacked */}
        <div className="auction-mid-col">
          <div className="premium-card auction-compact-panel">
            <h3 style={{ fontSize: '13px', fontWeight: '800', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
              <Award size={14} color="var(--success)" /> Sold ({soldPlayers.length})
            </h3>
            <div className="auction-scroll-list">
              {soldPlayers.length === 0 ? (
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No players sold yet.</p>
              ) : (
                soldPlayers.map(p => (
                  <div key={p.id} className="auction-list-item" style={{ borderLeft: '3px solid var(--success)' }}>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '12px' }}>{p.fullName}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{'\u2192'} {p.team?.name}</p>
                    </div>
                    <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold)', whiteSpace: 'nowrap' }}>{p.soldPrice?.toLocaleString()} pts</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="premium-card auction-compact-panel">
            <h3 style={{ fontSize: '13px', fontWeight: '800', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px', margin: 0 }}>
              <Users size={14} color="var(--danger)" /> Unsold ({unsoldPlayers.length})
            </h3>
            <div className="auction-scroll-list">
              {unsoldPlayers.length === 0 ? (
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No unsold players yet.</p>
              ) : (
                unsoldPlayers.map(p => (
                  <div key={p.id} className="auction-list-item" style={{ borderLeft: '3px solid var(--danger)' }}>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '12px' }}>{p.fullName}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{p.preferredRole}</p>
                    </div>
                    <span className="badge badge-unsold" style={{ fontSize: '8px' }}>Unsold</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Team purses & draft pool */}
        <div className="auction-right-col">
          <div className="premium-card auction-compact-panel">
            <h3 style={{ fontSize: '13px', fontWeight: '800', borderBottom: '1px solid var(--card-border)', paddingBottom: '6px', margin: 0 }}>
              {'\uD83D\uDCB0'} Franchise Points
            </h3>
            <div className="auction-scroll-list">
              {teams.map(t => {
                const remaining = t.pointsPurse - t.pointsSpent;
                const percentSpent = (t.pointsSpent / t.pointsPurse) * 100;
                return (
                  <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ fontWeight: '600' }}>{t.name}</span>
                      <span style={{ fontWeight: '800', color: 'var(--accent-teal)', fontSize: '11px' }}>{remaining.toLocaleString()} pts</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--bg-tertiary)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, percentSpent))}%`, background: 'var(--accent-gold)' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="premium-card auction-compact-panel">
            <h3 style={{ fontSize: '13px', fontWeight: '800', margin: 0 }}>{'\uD83D\uDD0D'} Draft Pool</h3>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search player, role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="premium-input"
                style={{ paddingLeft: '32px', fontSize: '12px', padding: '8px 10px 8px 32px' }}
              />
              <Search size={14} color="var(--text-secondary)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            </div>
            <div className="auction-scroll-list">
              {filteredDraft.length === 0 ? (
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>No matching players</p>
              ) : (
                filteredDraft.map(p => (
                  <div key={p.id} className="auction-list-item">
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '11px' }}>{p.fullName}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>{p.preferredRole} {'\u2022'} {p.organization}</p>
                    </div>
                    <span className="badge badge-registered" style={{ fontSize: '7px' }}>Pool</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sponsor Bar */}
      <div className="auction-bottom-sponsors">
        <SponsorMarquee ads={(data.ads || []).filter(ad => {
          if (!ad.position) return false;
          if (ad.position.includes('/')) {
            return ad.position.split(',').map(p => p.trim()).includes('/auction');
          }
          return ad.position === 'TOP_BANNER';
        })} title="Official Tournament Sponsors" />
      </div>
    </div>
  );
}
