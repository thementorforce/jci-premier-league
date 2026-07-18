import prisma from '@/lib/db';
import { Shield, Coins, Users, Trophy } from 'lucide-react';

export const revalidate = 0;

export default async function TeamsPage() {
  let teams = [];
  let ads = [];
  let dbError = false;

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
      where: { active: true, position: 'SIDEBAR' }
    });
  } catch (error) {
    console.error("Error loading teams:", error);
    dbError = true;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 className="gold-gradient-text" style={{ fontSize: '36px', fontWeight: '800' }}>🏆 Franchise Squads</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View team budgets, purses, and recruited player lists</p>
      </div>

      {dbError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
          <p>Database connection issues. Please make sure the migrations and seeds are applied.</p>
        </div>
      )}

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '32px' }}>
        
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
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                      {team.players.map((player) => (
                        <div key={player.id} style={{ background: 'rgba(7, 11, 25, 0.5)', border: '1px solid rgba(255, 183, 3, 0.1)', borderRadius: '12px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyObject: 'center', flexShrink: 0 }}>
                            {player.photoUrl ? (
                              <img src={player.photoUrl} alt={player.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ fontSize: '20px', margin: 'auto' }}>👤</div>
                            )}
                          </div>
                          <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.fullName}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{player.preferredRole} • {player.organization}</p>
                            <p style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: '800', marginTop: '2px' }}>{player.soldPrice?.toLocaleString()} pts</p>
                          </div>
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
          <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>Sponsors</h3>
            
            {ads.length > 0 ? (
              ads.map((ad) => (
                <a 
                  key={ad.id} 
                  href={ad.targetUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="premium-card" 
                  style={{ display: 'block', padding: '0', overflow: 'hidden', position: 'relative' }}
                >
                  <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  <div style={{ padding: '12px', background: 'var(--bg-secondary)' }}>
                    <p style={{ fontSize: '14px', fontWeight: '700' }}>{ad.title}</p>
                    <span style={{ fontSize: '10px', background: 'rgba(255, 183, 3, 0.2)', color: 'var(--accent-gold)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '6px' }}>Ad</span>
                  </div>
                </a>
              ))
            ) : (
              <div className="premium-card" style={{ padding: '16px', textAlign: 'center', background: 'rgba(6, 182, 212, 0.05)' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Support Franchise Cricket League by placing ads here!</p>
                <Link href="/admin" style={{ fontSize: '11px', color: 'var(--accent-teal)', marginTop: '8px', display: 'inline-block', fontWeight: '600' }}>Manage Ads &rarr;</Link>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
