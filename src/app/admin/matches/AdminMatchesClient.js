"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Calendar, Trophy, Shield, Star } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS = {
  LIVE:      { bg: 'rgba(239,68,68,0.15)',  color: '#f87171', border: 'rgba(239,68,68,0.4)' },
  COMPLETED: { bg: 'rgba(74,222,128,0.1)', color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
  SCHEDULED: { bg: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '#374151' },
};

export default function AdminMatchesClient() {
  const [matches, setMatches]       = useState([]);
  const [teams, setTeams]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeSection, setActiveSection] = useState("fixtures"); // "fixtures" | "captains"

  // Match form
  const [date, setDate]       = useState("");
  const [venue, setVenue]     = useState("");
  const [team1Id, setTeam1Id] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const [saving, setSaving]   = useState(false);
  const [matchError, setMatchError] = useState("");

  // Score modal
  const [scoringMatch, setScoringMatch] = useState(null);
  const [team1Score, setTeam1Score]     = useState("");
  const [team2Score, setTeam2Score]     = useState("");

  // Captain/VC
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [captainId, setCaptainId]       = useState("");
  const [viceCaptainId, setViceCaptainId] = useState("");
  const [cvSaving, setCvSaving]         = useState(false);
  const [cvMsg, setCvMsg]               = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, tRes] = await Promise.all([
        fetch('/api/admin/matches'),
        fetch('/api/admin/teams'),
      ]);
      const matchData = await mRes.json();
      const teamData  = await tRes.json();
      setMatches(Array.isArray(matchData) ? matchData : []);
      setTeams(Array.isArray(teamData) ? teamData : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  /* ── Match actions ── */
  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setMatchError("");
    if (team1Id === team2Id) { setMatchError("Team 1 and Team 2 must be different."); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, venue, team1Id, team2Id }),
      });
      if (res.ok) {
        setDate(""); setVenue(""); setTeam1Id(""); setTeam2Id("");
        fetchData();
      } else {
        const d = await res.json();
        setMatchError(d.error || "Failed to create match.");
      }
    } catch { setMatchError("Network error."); }
    setSaving(false);
  };

  const updateMatchStatus = async (id, status) => {
    await fetch('/api/admin/matches', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    fetchData();
  };

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    await fetch('/api/admin/matches', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: scoringMatch.id, team1Score, team2Score }),
    });
    setScoringMatch(null);
    fetchData();
  };

  const handleCompleteMatch = async (match) => {
    const result = prompt(`Enter result for Match ${match.matchNumber}:\n(e.g. "${match.team1.name} won by 5 wickets")`);
    if (!result) return;
    await fetch('/api/admin/matches', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: match.id, status: 'COMPLETED', result }),
    });
    fetchData();
  };

  const handleDeleteMatch = async (match) => {
    if (!confirm(`Delete Match ${match.matchNumber}: ${match.team1.name} vs ${match.team2.name}?\n\nThis cannot be undone.`)) return;
    await fetch('/api/admin/matches', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: match.id }),
    });
    fetchData();
  };

  /* ── Captain actions ── */
  const handleTeamSelect = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    setSelectedTeam(team || null);
    setCvMsg("");
    if (team) {
      const cap = team.players.find(p => p.isCaptain);
      const vc  = team.players.find(p => p.isViceCaptain);
      setCaptainId(cap?.id || "");
      setViceCaptainId(vc?.id || "");
    }
  };

  const handleSaveCaptains = async (e) => {
    e.preventDefault();
    if (!selectedTeam) return;
    setCvSaving(true); setCvMsg("");
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: selectedTeam.id, captainId, viceCaptainId }),
      });
      const d = await res.json();
      setCvMsg(res.ok ? "✅ Saved!" : `❌ ${d.error}`);
      if (res.ok) fetchData();
    } catch { setCvMsg("❌ Network error."); }
    setCvSaving(false);
  };

  if (loading) return (
    <div className="page-container admin-console">
      <div className="admin-access-loading">Loading Tournament Data...</div>
    </div>
  );

  return (
    <div className="page-container admin-console">

      {/* Header */}
      <div className="admin-header admin-console-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p className="eyebrow"><Trophy size={14} style={{ display: 'inline', marginRight: '4px' }} /> Tournament Operations</p>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)' }}>Matches & Captains</h1>
        </div>
        <Link href="/admin" className="premium-button-secondary">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* Section Toggle */}
      <div style={{ display: 'flex', gap: '8px', margin: '24px 0 0', background: 'var(--bg-secondary)', padding: '6px', borderRadius: '14px', border: '1px solid var(--card-border)', width: 'fit-content' }}>
        {[
          { id: "fixtures", label: "📅 Fixtures & Scoring" },
          { id: "captains", label: "🏅 Captain & Vice Captain" },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '14px',
              background: activeSection === s.id ? 'var(--accent-gold)' : 'transparent',
              color: activeSection === s.id ? '#000' : 'var(--text-secondary)',
              transition: 'all 0.2s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ════════════════ FIXTURES SECTION ════════════════ */}
      {activeSection === "fixtures" && (
        <div className="admin-dashboard-grid" style={{ marginTop: '24px' }}>

          {/* Create Match Form */}
          <div className="admin-panel" style={{ height: 'fit-content' }}>
            <div className="admin-panel-heading">
              <div>
                <p className="admin-kicker">Scheduler</p>
                <h2>Create New Match</h2>
              </div>
            </div>

            <form onSubmit={handleCreateMatch} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date & Time</label>
                <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required className="premium-input" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Venue</label>
                <input type="text" value={venue} onChange={e => setVenue(e.target.value)} required placeholder="e.g. Tumkur Stadium" className="premium-input" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Team 1</label>
                  <select value={team1Id} onChange={e => setTeam1Id(e.target.value)} required className="premium-input" style={{ width: '100%' }}>
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Team 2</label>
                  <select value={team2Id} onChange={e => setTeam2Id(e.target.value)} required className="premium-input" style={{ width: '100%' }}>
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              {matchError && <p style={{ color: '#f87171', fontSize: '13px', fontWeight: '600' }}>{matchError}</p>}
              <button type="submit" disabled={saving} className="premium-button" style={{ justifyContent: 'center' }}>
                <Plus size={16} /> {saving ? "Scheduling..." : "Schedule Fixture"}
              </button>
            </form>
          </div>

          {/* All Fixtures */}
          <div className="admin-panel" style={{ gridColumn: 'span 2' }}>
            <div className="admin-panel-heading">
              <div><p className="admin-kicker">Live Feed</p><h2>All Fixtures ({matches.length})</h2></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {matches.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Calendar size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                  <p>No matches scheduled yet. Use the form to create the first fixture.</p>
                </div>
              ) : matches.map(match => {
                const cfg = STATUS_COLORS[match.status] || STATUS_COLORS.SCHEDULED;
                return (
                  <div key={match.id} style={{
                    background: 'var(--bg-tertiary)',
                    border: `1px solid ${match.status === 'LIVE' ? 'rgba(239,68,68,0.5)' : 'var(--card-border)'}`,
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                    boxShadow: match.status === 'LIVE' ? '0 0 20px rgba(239,68,68,0.15)' : 'none',
                  }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', borderRadius: '6px', textTransform: 'uppercase' }}>
                          Match {match.matchNumber}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: '6px', textTransform: 'uppercase' }}>
                          {match.status}
                        </span>
                      </div>
                      <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)' }}>
                        {match.team1.name} <span style={{ color: 'var(--text-secondary)', fontWeight: '400', fontSize: '13px' }}>vs</span> {match.team2.name}
                      </div>
                      {(match.team1Score || match.team2Score) && (
                        <div style={{ fontSize: '13px', color: 'var(--accent-gold)', fontWeight: '700', marginTop: '4px' }}>
                          {match.team1Score} — {match.team2Score}
                        </div>
                      )}
                      {match.result && (
                        <div style={{ fontSize: '13px', color: '#4ade80', fontWeight: '600', marginTop: '4px' }}>{match.result}</div>
                      )}
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={11} /> {new Date(match.date).toLocaleString()} · {match.venue}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {match.status === 'SCHEDULED' && (
                        <button onClick={() => updateMatchStatus(match.id, 'LIVE')} className="premium-button" style={{ background: 'rgba(239,68,68,0.85)', borderColor: '#f87171', color: '#fff', boxShadow: '0 0 15px rgba(239,68,68,0.4)' }}>
                          🔴 Go Live
                        </button>
                      )}
                      {match.status === 'LIVE' && (
                        <>
                          <button onClick={() => { setScoringMatch(match); setTeam1Score(match.team1Score || ""); setTeam2Score(match.team2Score || ""); }} className="premium-button-secondary">
                            📝 Update Score
                          </button>
                          <button onClick={() => handleCompleteMatch(match)} className="premium-button">
                            ✅ End Match
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteMatch(match)}
                        title="Delete fixture"
                        style={{
                          padding: '8px 12px',
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          borderRadius: '10px',
                          color: '#f87171',
                          cursor: 'pointer',
                          fontSize: '16px',
                          transition: 'all 0.2s',
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ CAPTAINS SECTION ════════════════ */}
      {activeSection === "captains" && (
        <div style={{ marginTop: '24px', maxWidth: '640px' }}>
          <div className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <p className="admin-kicker">Assign Roles</p>
                <h2>Captain & Vice Captain</h2>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>
              Select a team to assign its Captain and Vice Captain. This will update the badge shown on the Teams page.
            </p>

            {/* Team Selector */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {teams.map(team => {
                const isSelected = selectedTeam?.id === team.id;
                const cap = team.players.find(p => p.isCaptain);
                const vc  = team.players.find(p => p.isViceCaptain);
                return (
                  <button
                    key={team.id}
                    onClick={() => handleTeamSelect(team.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      background: isSelected ? 'rgba(216,240,107,0.08)' : 'var(--bg-tertiary)',
                      border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'var(--card-border)'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--card-border)', flexShrink: 0, background: 'var(--bg-primary)' }}>
                      {team.logoUrl && <img src={team.logoUrl} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '15px' }}>{team.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {team.players.length} players · 
                        C: <strong style={{ color: cap ? 'var(--accent-gold)' : '#6b7280' }}>{cap ? cap.fullName : 'Not set'}</strong>
                        &nbsp;· VC: <strong style={{ color: vc ? 'var(--accent-gold)' : '#6b7280' }}>{vc ? vc.fullName : 'Not set'}</strong>
                      </div>
                    </div>
                    {isSelected && <Star size={16} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </div>

            {/* Assignment Form */}
            {selectedTeam && (
              <form onSubmit={handleSaveCaptains} style={{ marginTop: '24px', padding: '20px', background: 'rgba(216,240,107,0.04)', border: '1px solid rgba(216,240,107,0.2)', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '16px', margin: 0 }}>
                  <Shield size={16} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent-gold)' }} />
                  Assigning for: {selectedTeam.name}
                </h3>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    🏏 Captain (C)
                  </label>
                  <select value={captainId} onChange={e => setCaptainId(e.target.value)} className="premium-input" style={{ width: '100%' }}>
                    <option value="">— None —</option>
                    {selectedTeam.players.filter(p => p.id !== viceCaptainId).map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.preferredRole})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    🥈 Vice Captain (VC)
                  </label>
                  <select value={viceCaptainId} onChange={e => setViceCaptainId(e.target.value)} className="premium-input" style={{ width: '100%' }}>
                    <option value="">— None —</option>
                    {selectedTeam.players.filter(p => p.id !== captainId).map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.preferredRole})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button type="submit" disabled={cvSaving} className="premium-button">
                    <Shield size={16} /> {cvSaving ? "Saving..." : "Save Captains"}
                  </button>
                  {cvMsg && <span style={{ fontSize: '14px', fontWeight: '600', color: cvMsg.startsWith('✅') ? '#4ade80' : '#f87171' }}>{cvMsg}</span>}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Score Update Modal */}
      {scoringMatch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '20px', width: '100%', maxWidth: '420px', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>📝 Update Live Score</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>Match {scoringMatch.matchNumber}: {scoringMatch.team1.name} vs {scoringMatch.team2.name}</p>

            <form onSubmit={handleUpdateScore} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>{scoringMatch.team1.name}</label>
                <input type="text" value={team1Score} onChange={e => setTeam1Score(e.target.value)} placeholder="e.g. 150/4 (20.0)" className="premium-input" style={{ width: '100%', fontSize: '18px', fontWeight: '800' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>{scoringMatch.team2.name}</label>
                <input type="text" value={team2Score} onChange={e => setTeam2Score(e.target.value)} placeholder="e.g. 120/8 (18.3)" className="premium-input" style={{ width: '100%', fontSize: '18px', fontWeight: '800' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setScoringMatch(null)} className="premium-button-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="premium-button" style={{ flex: 1, justifyContent: 'center', background: 'rgba(74,222,128,0.8)', borderColor: '#4ade80', boxShadow: '0 0 15px rgba(74,222,128,0.3)' }}>Save Score</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
