'use client';

import { useState } from 'react';
import { Search, Shield, Users } from 'lucide-react';
import Link from 'next/link';

export default function TeamsListClient({ initialTeams = [], sponsorList = [], dbError = false, errorMessage = '' }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtering logic
  const filteredTeams = initialTeams.map(team => {
    const query = searchTerm.trim().toLowerCase();
    
    // Check if team name or owner matches query
    const matchesTeamName = team.name.toLowerCase().includes(query) || 
                            team.ownerName.toLowerCase().includes(query);
    
    // Check if any player matches query
    const filteredPlayers = (team.players || []).filter(player => 
      player.fullName.toLowerCase().includes(query) ||
      (player.preferredRole || '').toLowerCase().includes(query) ||
      (player.organization || '').toLowerCase().includes(query)
    );

    // If search is active:
    // - If team matches the query, show all its players.
    // - Otherwise, show only the matching players in that team.
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

  // Total matching players count
  const totalMatchingPlayers = filteredTeams.reduce((sum, t) => sum + (searchTerm ? t.matchedCount : t.totalSquadCount), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Search Input Card */}
      <div className="premium-card" style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type="text"
            placeholder="Search players by name, role, organization, or search team names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="premium-input"
            style={{ paddingLeft: '44px', width: '100%', fontSize: '15px' }}
          />
          <Search 
            size={20} 
            color="var(--text-secondary)" 
            style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
          />
        </div>
        {searchTerm.trim() && (
          <p style={{ fontSize: '13px', color: 'var(--accent-teal)', margin: '0' }}>
            Found <strong>{filteredTeams.length}</strong> matching teams and <strong>{totalMatchingPlayers}</strong> matching players
          </p>
        )}
      </div>

      {dbError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '16px', borderRadius: '8px', textAlign: 'center', color: 'var(--text-primary)' }}>
          <p>Database connection issues. Please make sure the migrations and seeds are applied.</p>
          {errorMessage && (
            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '4px', borderLeft: '3px solid var(--danger)', fontFamily: 'monospace', fontSize: '12px', overflowX: 'auto', whiteSpace: 'pre-wrap', textAlign: 'left', wordBreak: 'break-all' }}>
              <strong>Error Details:</strong>
              <br />
              {errorMessage}
            </div>
          )}
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid-teams-layout">
        
        {/* Teams List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {filteredTeams.length === 0 && !dbError && (
            <div className="premium-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No matching teams or players found.</p>
            </div>
          )}

          {filteredTeams.map((team) => {
            const purseRemaining = team.pointsPurse - team.pointsSpent;
            return (
              <div key={team.id} className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Team Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {team.logoUrl ? (
                      <img src={team.logoUrl} alt={`${team.name} Logo`} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--accent-gold)' }} />
                    ) : (
                      <Shield size={32} color="var(--accent-gold)" />
                    )}
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: '800' }}>{team.name}</h2>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Owner: <strong>{team.ownerName}</strong>{team.ownerContact ? ` · Contact: ${team.ownerContact}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Purse Tracker */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ background: 'rgba(7, 11, 25, 0.6)', border: '1px solid var(--card-border)', padding: '8px 16px', borderRadius: '8px', textAlign: 'center' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Points Spent</span>
                      <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{team.pointsSpent.toLocaleString()}</p>
                    </div>
                    <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid var(--accent-teal)', padding: '8px 16px', borderRadius: '8px', textAlign: 'center' }}>
                      <span style={{ fontSize: '10px', color: 'var(--accent-teal)', textTransform: 'uppercase' }}>Purse Remaining</span>
                      <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-teal)' }}>{purseRemaining.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Team Squad */}
                <div>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} /> 
                    {searchTerm ? (
                      <span>Players Found ({team.players.length} of {team.totalSquadCount})</span>
                    ) : (
                      <span>Players Recruited ({team.players.length})</span>
                    )}
                  </h3>

                  {team.players.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {searchTerm ? 'No matching players on this squad.' : 'No players drafted yet.'}
                    </p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px', justifyItems: 'center' }}>
                      {team.players.map((player) => (
                        <div key={player.id} className={`fut-card-small ${player.gender === 'Female' ? 'female' : 'male'}`}>
                          <div className="fut-photo-container">
                            <img src={`/api/player/${player.id}/photo`} alt={player.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div className="fut-badge-role">{player.preferredRole}</div>
                          
                          <div className="fut-details">
                            <h4 className="fut-name">{player.fullName}</h4>
                            <p className="fut-org">{player.organization}</p>
                          </div>

                          <div className="fut-price-tag">{player.soldPrice?.toLocaleString()} pts</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Sidebar Ads */}
        <div>
          <div className="sidebar-sticky">
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Sponsors</h3>
            
            {sponsorList.map((ad) => (
              <a 
                key={ad.id} 
                href={ad.targetUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="premium-card" 
                style={{ display: 'block', padding: '0', overflow: 'hidden', position: 'relative', marginBottom: '16px' }}
              >
                <div style={{ position: 'relative' }}>
                  <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  {ad.sponsorType && ad.sponsorType !== 'General' && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '0',
                      background: 'linear-gradient(135deg, rgba(245,197,24,0.95), rgba(218,165,32,0.9))',
                      color: '#000',
                      fontSize: '9px',
                      fontWeight: '900',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      padding: '4px 12px 4px 8px',
                      borderRadius: '0 5px 5px 0',
                      boxShadow: '0 2px 10px rgba(245,197,24,0.4)',
                    }}>
                      ★ {ad.sponsorType}
                    </div>
                  )}
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-secondary)' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700' }}>{ad.title}</p>
                  {ad.contact && (
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Contact: <strong>{ad.contact}</strong>
                    </p>
                  )}
                </div>
              </a>
            ))}
            
            {sponsorList.length === 0 && (
              <div className="premium-card" style={{ padding: '16px', textAlign: 'center', background: 'rgba(6, 182, 212, 0.05)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Support Franchise Cricket League by placing ads here!</p>
                <Link href="/admin/login" style={{ fontSize: '11px', color: 'var(--accent-teal)', marginTop: '8px', display: 'inline-block', fontWeight: '600' }}>Manage Ads &rarr;</Link>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
