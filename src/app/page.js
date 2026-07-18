import prisma from '@/lib/db';
import Link from 'next/link';

// Disable caching for real-time status updates
export const revalidate = 0;

export default async function Home() {
  let stats = { playerCount: 0, teamCount: 0, soldCount: 0, totalPurse: 0 };
  let ads = [];
  let dbError = false;

  try {
    const playerCount = await prisma.playerProfile.count();
    const teamCount = await prisma.team.count();
    const soldCount = await prisma.playerProfile.count({ where: { status: 'Sold' } });
    const teams = await prisma.team.findMany({ select: { pointsPurse: true } });
    const totalPurse = teams.reduce((acc, t) => acc + t.pointsPurse, 0);

    stats = { playerCount, teamCount, soldCount, totalPurse };
    ads = await prisma.adPlacement.findMany({ where: { active: true } });
  } catch (error) {
    console.error("Database seed/connection issue on landing page:", error);
    dbError = true;
  }

  // Fallback sample ads if db not configured/seeded
  const activeAds = ads.length > 0 ? ads : [
    {
      id: 'default-1',
      title: 'Tumkur Premium Cricket Academy',
      imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
      targetUrl: '#',
      position: 'TOP_BANNER'
    }
  ];

  return (
    <div className="hero-gradient" style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', gap: '48px', alignItems: 'center' }}>
      
      {/* Top Banner Ad */}
      {activeAds.find(a => a.position === 'TOP_BANNER') && (
        <a 
          href={activeAds.find(a => a.position === 'TOP_BANNER').targetUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            width: '100%',
            maxWidth: '900px',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--glow-teal)',
            display: 'block',
            position: 'relative',
            height: '140px'
          }}
        >
          <img 
            src={activeAds.find(a => a.position === 'TOP_BANNER').imageUrl} 
            alt={activeAds.find(a => a.position === 'TOP_BANNER').title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'rgba(7, 11, 25, 0.8)', padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{activeAds.find(a => a.position === 'TOP_BANNER').title}</span>
            <span style={{ fontSize: '10px', background: 'var(--accent-gold)', color: '#070b19', padding: '2px 6px', borderRadius: '4px', fontWeight: '800' }}>Sponsored</span>
          </div>
        </a>
      )}

      {/* Main Hero Header */}
      <div style={{ textAlign: 'center', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.2' }}>
          Welcome to the <br />
          <span className="gold-gradient-text">Franchise Cricket League</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          Tumkur's premium points-based cricket auction and tournament. Register today, and get picked by top franchises!
        </p>

        {dbError && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '16px', color: 'var(--text-primary)', marginTop: '20px', textAlign: 'left' }}>
            <h3 style={{ color: 'var(--danger)', fontWeight: '700', marginBottom: '8px' }}>⚠️ Setup Required</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
              Database is not connected or initialized yet. To initialize:
              <br />
              1. Start the PostgreSQL database using <code>docker compose up -d</code>.
              <br />
              2. Run migrations and seed the database using <code>npx prisma db push && npx prisma db seed</code>.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '20px' }}>
          <Link href="/register" className="premium-button">
            Register as Player
          </Link>
          <Link href="/auction" className="premium-button-secondary">
            View Live Auction
          </Link>
        </div>
      </div>

      {/* Quick Info Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', width: '100%', maxWidth: '900px' }}>
        <div className="premium-card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Players</h3>
          <p className="teal-gradient-text" style={{ fontSize: '36px', fontWeight: '800', marginTop: '8px' }}>{stats.playerCount}</p>
        </div>
        <div className="premium-card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Franchise Teams</h3>
          <p className="gold-gradient-text" style={{ fontSize: '36px', fontWeight: '800', marginTop: '8px' }}>{stats.teamCount}</p>
        </div>
        <div className="premium-card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Players Drafted</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', marginTop: '8px', color: 'var(--success)' }}>{stats.soldCount}</p>
        </div>
        <div className="premium-card" style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Bid Purse</h3>
          <p style={{ fontSize: '36px', fontWeight: '800', marginTop: '8px', color: '#a855f7' }}>{stats.totalPurse.toLocaleString()} pts</p>
        </div>
      </div>

      {/* How it Works / Details Section */}
      <div style={{ maxWidth: '900px', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: '700' }} className="gold-gradient-text">How the Auction Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📝</span>
            <h4 style={{ fontWeight: '700' }}>1. Register Online</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Fill out the player registration form with your preferred playing role, jersey size, and cricket experience.</p>
          </div>
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>💰</span>
            <h4 style={{ fontWeight: '700' }}>2. Bidding Process</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Franchise owners bid for players during the live auction using points. Bidding starts at base values and goes up.</p>
          </div>
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🏆</span>
            <h4 style={{ fontWeight: '700' }}>3. Team Building</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Owners build complete squads strategically balancing points to form the ultimate winning combination.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
