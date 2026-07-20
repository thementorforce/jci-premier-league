import prisma from '@/lib/db';
import { Shield, Coins, Users, Trophy } from 'lucide-react';
import Link from 'next/link';
import SponsorMarquee from '@/components/SponsorMarquee';

export const revalidate = 30;

export default async function TeamsPage() {
  let teams = [];
  let ads = [];
  let dbError = false;
  let errorMessage = '';

  try {
    teams = await prisma.team.findMany({
      include: {
        players: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    ads = await prisma.adPlacement.findMany({
      where: { active: true }
    });
  } catch (error) {
    console.error("Error loading teams:", error);
    dbError = true;
    errorMessage = error.message || String(error);
  }

  // Fallback for sponsors if DB has none (like registration page)
  const DEFAULT_SPONSORS = [
    { id: 'default-1', title: 'Decathlon Sports Tumkur', imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80', targetUrl: 'https://www.decathlon.in', position: 'SIDEBAR' },
    { id: 'default-2', title: 'Tumkur Cricket Academy', imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80', targetUrl: '#', position: 'SIDEBAR' },
    { id: 'default-3', title: 'JCI Tumkur Metro', imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607be7e72?auto=format&fit=crop&w=800&q=80', targetUrl: '#', position: 'SIDEBAR' },
  ];
  
  const sponsorList = ads.length > 0 ? ads : DEFAULT_SPONSORS;

  return (
    <div className="page-container-lg">
      
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 className="gold-gradient-text section-title">🏆 Franchise Squads</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View team budgets, purses, and recruited player lists</p>
      </div>

      <div style={{ margin: '30px 0 10px 0' }}>
        <SponsorMarquee ads={sponsorList} title="Supported By" />
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
          {teams.length === 0 && !dbError && (
            <div className="premium-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No franchise teams found in the database. Head over to the Console to initialize teams.</p>
            </div>
          )}

          {teams.map((team) => {
            const purseRemaining = team.pointsPurse - team.pointsSpent;
            return (
              <div key={team.id} className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Team Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--card-border)', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Shield size={32} color="var(--accent-gold)" />
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: '800' }}>{team.name}</h2>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Owner: <strong>{team.ownerName}</strong></span>
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
                    <Users size={16} /> Players Recruited ({team.players.length})
                  </h3>

                  {team.players.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '14px' }}>No players drafted yet.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', justifyItems: 'center' }}>
                      {team.players.map((player) => (
                        <div key={player.id} className="fut-card">
                          <div className="fut-photo-container">
                            {player.photoUrl ? (
                              <img src={player.photoUrl} alt={player.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ fontSize: '32px' }}>👤</div>
                            )}
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
                <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div style={{ padding: '12px', background: 'var(--bg-secondary)' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700' }}>{ad.title}</p>
                  <span style={{ fontSize: '10px', background: 'rgba(255, 183, 3, 0.2)', color: 'var(--accent-gold)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '6px' }}>Ad</span>
                </div>
              </a>
            ))}
            
            {ads.length === 0 && (
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
