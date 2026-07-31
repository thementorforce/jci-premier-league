'use client';

import { useState, useMemo, useEffect } from 'react';
import { Shield, Search, Users, Trophy, Star, Crown } from 'lucide-react';

export default function TeamsListClient({ initialTeams = [], dbError = false, errorMessage = '' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTeamId, setActiveTeamId] = useState(initialTeams[0]?.id || null);

  // Filtering logic
  const filteredTeams = useMemo(() => {
    return initialTeams.map(team => {
      const query = searchTerm.trim().toLowerCase();
      
      const matchesTeamName = team.name.toLowerCase().includes(query) || 
                              team.ownerName.toLowerCase().includes(query);
      
      const filteredPlayers = (team.players || []).filter(player => 
        player.fullName.toLowerCase().includes(query) ||
        (player.preferredRole || '').toLowerCase().includes(query) ||
        (player.organization || '').toLowerCase().includes(query)
      );

      const displayPlayers = query ? (matchesTeamName ? team.players : filteredPlayers) : team.players;

      if (!query || matchesTeamName || filteredPlayers.length > 0) {
        return {
          ...team,
          players: displayPlayers,
          totalSquadCount: team.players?.length || 0,
          matchedCount: displayPlayers?.length || 0
        };
      }
      return null;
    }).filter(Boolean);
  }, [initialTeams, searchTerm]);

  // Keep active tab valid
  useEffect(() => {
    if (filteredTeams.length > 0 && !filteredTeams.find(t => t.id === activeTeamId)) {
      setActiveTeamId(filteredTeams[0].id);
    }
  }, [filteredTeams, activeTeamId]);

  const activeTeam = filteredTeams.find(t => t.id === activeTeamId) || filteredTeams[0];

  // Group players for active team
  const { groupedPlayers, highestPrice } = useMemo(() => {
    if (!activeTeam) return { groupedPlayers: {}, highestPrice: 0 };
    
    const groups = {
      'Batsman': [],
      'All-Rounder': [],
      'Wicketkeeper': [],
      'Bowler': [],
      'Other': []
    };
    
    let maxPrice = 0;
    
    activeTeam.players.forEach(p => {
      if ((p.soldPrice || 0) > maxPrice) maxPrice = p.soldPrice;
      
      const role = p.preferredRole || 'Other';
      if (role.includes('Batsman')) groups['Batsman'].push(p);
      else if (role.includes('All-Rounder')) groups['All-Rounder'].push(p);
      else if (role.includes('Wicketkeeper')) groups['Wicketkeeper'].push(p);
      else if (role.includes('Bowler')) groups['Bowler'].push(p);
      else groups['Other'].push(p);
    });
    
    return { groupedPlayers: groups, highestPrice: maxPrice };
  }, [activeTeam]);

  const totalMatchingPlayers = filteredTeams.reduce((sum, t) => sum + (searchTerm ? t.matchedCount : t.totalSquadCount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Search Bar */}
      <div className="premium-card" style={{ padding: '16px 24px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder="Search players or franchise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="premium-input"
            style={{ paddingLeft: '44px', width: '100%', fontSize: '15px' }}
          />
          <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {dbError && (
        <div className="premium-card" style={{ border: '1px solid var(--danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
          <p>Database connection error.</p>
        </div>
      )}

      {filteredTeams.length === 0 && !dbError ? (
        <div className="premium-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No matching teams or players found.</p>
        </div>
      ) : activeTeam && (
        <>
          {/* Horizontal Franchise Tab Bar */}
          <div style={{ 
            display: 'flex', 
            overflowX: 'auto', 
            gap: '12px', 
            paddingBottom: '12px',
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none' /* IE 10+ */
          }} className="hide-scrollbar">
            {filteredTeams.map(team => {
              const isActive = team.id === activeTeamId;
              return (
                <button
                  key={team.id}
                  onClick={() => setActiveTeamId(team.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 20px',
                    borderRadius: '100px',
                    background: isActive ? 'linear-gradient(135deg, rgba(218,165,32,0.15), rgba(218,165,32,0.05))' : 'var(--bg-secondary)',
                    border: `1px solid ${isActive ? 'var(--accent-gold)' : 'var(--card-border)'}`,
                    color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    fontWeight: isActive ? '800' : '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 0 15px rgba(218,165,32,0.1)' : 'none'
                  }}
                >
                  {team.logoUrl ? (
                    <img src={team.logoUrl} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <Shield size={18} />
                  )}
                  {team.name}
                </button>
              );
            })}
          </div>

          {/* Franchise Hero Banner */}
          <div className="premium-card" style={{ 
            position: 'relative', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            padding: '32px'
          }}>
            {/* Ambient Background Glow based on logo if available */}
            {activeTeam.logoUrl && (
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '400px',
                height: '400px',
                backgroundImage: `url(${activeTeam.logoUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(100px) opacity(0.15)',
                zIndex: 0,
                pointerEvents: 'none'
              }} />
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
              {activeTeam.logoUrl ? (
                <img src={activeTeam.logoUrl} alt={activeTeam.name} style={{ width: '100px', height: '100px', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--accent-gold)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} />
              ) : (
                <div style={{ width: '100px', height: '100px', borderRadius: '16px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-gold)' }}>
                  <Shield size={48} color="var(--accent-gold)" />
                </div>
              )}
              
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-0.02em', margin: 0 }} className="gold-gradient-text">{activeTeam.name}</h2>
                </div>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>
                  Owner: <strong style={{ color: 'var(--text-primary)' }}>{activeTeam.ownerName}</strong> 
                  {activeTeam.ownerContact && ` • ${activeTeam.ownerContact}`}
                </p>
              </div>

              {/* Franchise Stats Block */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--card-border)', padding: '10px 16px', borderRadius: '12px', minWidth: '80px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Squad</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Users size={14} color="var(--accent-teal)" />
                    <span style={{ fontSize: '16px', fontWeight: '800' }}>{activeTeam.players.length}</span>
                  </div>
                </div>
                
                <div style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '10px 16px', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Played</span>
                  <p style={{ fontSize: '16px', fontWeight: '800', color: 'white', margin: '4px 0 0' }}>{activeTeam.matchesPlayed || 0}</p>
                </div>
                
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '10px 16px', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Won</span>
                  <p style={{ fontSize: '16px', fontWeight: '800', color: '#34d399', margin: '4px 0 0' }}>{activeTeam.won || 0}</p>
                </div>
                
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '10px 16px', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lost</span>
                  <p style={{ fontSize: '16px', fontWeight: '800', color: '#f87171', margin: '4px 0 0' }}>{activeTeam.lost || 0}</p>
                </div>

                <div style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)', padding: '10px 16px', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Points</span>
                  <p style={{ fontSize: '16px', fontWeight: '900', color: 'var(--accent-gold)', margin: '4px 0 0' }}>{activeTeam.points || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Categorized Squad Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '10px' }}>
            {Object.entries(groupedPlayers).map(([role, players]) => {
              if (players.length === 0) return null;
              
              return (
                <div key={role}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                      {role}s <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '600' }}>({players.length})</span>
                    </h3>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px', justifyItems: 'center' }}>
                    {players.map((player) => {
                      const isMarquee = player.soldPrice === highestPrice && highestPrice > 0;
                      
                      return (
                        <div key={player.id} className={`fut-card-small ${player.gender === 'Female' ? 'female' : 'male'}`} style={{ transform: isMarquee ? 'scale(1.05)' : 'none', zIndex: isMarquee ? 2 : 1 }}>
                          {isMarquee && (
                            <div style={{
                              position: 'absolute',
                              top: '0',
                              left: '0',
                              width: '100%',
                              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                              color: '#000',
                              fontSize: '10px',
                              fontWeight: '900',
                              padding: '4px 0',
                              zIndex: 10,
                              textAlign: 'center',
                              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '3px'
                            }}>
                              <Crown size={12} /> MARQUEE
                            </div>
                          )}
                          
                          {/* Captain / Vice Captain Badge */}
                          {(player.isCaptain || player.isViceCaptain) && (
                            <div className="absolute top-1 right-1 bg-yellow-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black z-10 shadow-md border-2 border-gray-950">
                              {player.isCaptain ? 'C' : 'VC'}
                            </div>
                          )}

                          <div className="fut-photo-container">
                            <img src={`/api/player/${player.id}/photo`} alt={player.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          
                          <div className="fut-details">
                            <h4 className="fut-name">{player.fullName}</h4>
                            <p className="fut-org">{player.organization}</p>
                          </div>

                          <div className="fut-price-tag">{player.soldPrice?.toLocaleString()} pts</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}
