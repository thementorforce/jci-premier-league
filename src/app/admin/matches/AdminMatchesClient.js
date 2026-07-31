"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Calendar, Save, Trash2, Trophy, ArrowRightIcon } from "lucide-react";
import Link from "next/link";

export default function AdminMatchesClient() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [team1Id, setTeam1Id] = useState("");
  const [team2Id, setTeam2Id] = useState("");

  // Scoring State
  const [scoringMatch, setScoringMatch] = useState(null);
  const [team1Score, setTeam1Score] = useState("");
  const [team2Score, setTeam2Score] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, tRes] = await Promise.all([
        fetch('/api/admin/matches'),
        fetch('/api/admin/teams')
      ]);
      setMatches(await mRes.json());
      setTeams(await tRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, venue, team1Id, team2Id })
      });
      if (res.ok) {
        setIsCreating(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateMatchStatus = async (id, status) => {
    try {
      await fetch('/api/admin/matches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateScore = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/admin/matches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: scoringMatch.id, 
          team1Score, 
          team2Score 
        })
      });
      setScoringMatch(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteMatch = async (match) => {
    const result = prompt("Enter match result (e.g., 'Team 1 won by 5 wickets'):");
    if (!result) return;
    try {
      await fetch('/api/admin/matches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: match.id, status: 'COMPLETED', result })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="page-container admin-console"><div className="admin-access-loading">Loading Matches...</div></div>;

  return (
    <div className="page-container admin-console">
      <div className="admin-header admin-console-header flex items-center justify-between">
        <div>
          <p className="eyebrow"><Trophy size={14} /> Tournament Operations</p>
          <h1 className="text-3xl font-black text-white">Fixtures & Scoring</h1>
        </div>
        <Link href="/admin" className="premium-button-secondary">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      <div className="admin-dashboard-grid mt-6">
        
        {/* Create Match Panel */}
        <div className="admin-panel h-fit">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">Scheduler</p>
              <h2>Create Match</h2>
            </div>
          </div>
          
          <form onSubmit={handleCreateMatch} className="flex flex-col gap-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Date & Time</label>
              <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required className="premium-input w-full" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Venue</label>
              <input type="text" value={venue} onChange={e => setVenue(e.target.value)} required placeholder="e.g. Tumkur Stadium" className="premium-input w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Team 1</label>
                <select value={team1Id} onChange={e => setTeam1Id(e.target.value)} required className="premium-input w-full">
                  <option value="">Select Team</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Team 2</label>
                <select value={team2Id} onChange={e => setTeam2Id(e.target.value)} required className="premium-input w-full">
                  <option value="">Select Team</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="premium-button w-full mt-2 justify-center">
              <Plus size={16} /> Schedule Fixture
            </button>
          </form>
        </div>

        {/* Fixtures List */}
        <div className="admin-panel col-span-1 lg:col-span-2">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">Live Feed</p>
              <h2>All Fixtures</h2>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col gap-3">
            {matches.map(match => (
              <div key={match.id} className="border border-gray-800 rounded-xl p-4 bg-gray-950 flex flex-col md:flex-row items-center justify-between gap-4">
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Match {match.matchNumber}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${match.status === 'LIVE' ? 'bg-red-500/20 text-red-500' : match.status === 'COMPLETED' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                      {match.status}
                    </span>
                  </div>
                  <div className="text-xl font-black text-white flex items-center gap-2">
                    {match.team1.name} <span className="text-gray-600 font-normal text-sm">vs</span> {match.team2.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(match.date).toLocaleString()} • {match.venue}
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  {match.status === 'SCHEDULED' && (
                    <button onClick={() => updateMatchStatus(match.id, 'LIVE')} className="premium-button w-full justify-center !bg-red-600 !border-red-500 !text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                      Go Live
                    </button>
                  )}
                  {match.status === 'LIVE' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setScoringMatch(match);
                          setTeam1Score(match.team1Score || "");
                          setTeam2Score(match.team2Score || "");
                        }} 
                        className="premium-button-secondary justify-center"
                      >
                        Update Score
                      </button>
                      <button onClick={() => handleCompleteMatch(match)} className="premium-button w-full justify-center">
                        End Match
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ))}
            {matches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                No matches scheduled yet.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Live Scorer Modal */}
      {scoringMatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Update Live Score</h3>
            <p className="text-sm text-gray-400 mb-6">{scoringMatch.team1.name} vs {scoringMatch.team2.name}</p>
            
            <form onSubmit={handleUpdateScore} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">{scoringMatch.team1.name} Score</label>
                <input 
                  type="text" 
                  value={team1Score} 
                  onChange={e => setTeam1Score(e.target.value)} 
                  placeholder="e.g. 150/4 (20.0)" 
                  className="premium-input w-full text-lg font-black" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">{scoringMatch.team2.name} Score</label>
                <input 
                  type="text" 
                  value={team2Score} 
                  onChange={e => setTeam2Score(e.target.value)} 
                  placeholder="e.g. 120/8 (18.3)" 
                  className="premium-input w-full text-lg font-black" 
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setScoringMatch(null)} className="premium-button-secondary w-full justify-center">Cancel</button>
                <button type="submit" className="premium-button w-full justify-center !bg-green-600 !border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]">Save Score</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
