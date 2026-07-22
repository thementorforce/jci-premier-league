import prisma from '@/lib/db';
import Link from 'next/link';
import SponsorMarquee from '@/components/SponsorMarquee';
import {
  ArrowRight,
  BadgeIndianRupee,
  CircleDot,
  Radio,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';

export const revalidate = 15;

const STATUS_COPY = {
  NOT_STARTED: 'Auction room opens soon',
  LIVE: 'Auction is live now',
  BREAK: 'Auction is taking a short break',
  PAUSED: 'Auction is temporarily paused',
  ENDED: 'Auction is complete',
};

function formatPoints(value) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

export default async function Home() {
  let dbError = false;
  let auctionStatus = 'NOT_STARTED';
  let stats = { playerCount: 0, teamCount: 0, soldCount: 0, totalPurse: 0 };
  let teams = [];
  let latestSale = null;
  let activePlayer = null;
  let ads = [];

  try {
    const { readConfig } = await import('@/lib/config');
    const [playerCount, teamRows, soldCount, latestSold, biddingPlayer, adRows, configData] = await Promise.all([
      prisma.playerProfile.count(),
      prisma.team.findMany({ include: { players: true }, orderBy: { pointsSpent: 'desc' } }),
      prisma.playerProfile.count({ where: { status: 'Sold' } }),
      prisma.playerProfile.findFirst({
        where: { status: 'Sold' },
        orderBy: { updatedAt: 'desc' },
        include: { team: true },
      }),
      prisma.playerProfile.findFirst({
        where: { status: 'Bidding' },
        include: { bids: { orderBy: { amount: 'desc' }, take: 1, include: { team: true } } },
      }),
      prisma.adPlacement.findMany({ where: { active: true } }),
      readConfig(),
    ]);

    teams = teamRows;
    stats = {
      playerCount,
      teamCount: teamRows.length,
      soldCount,
      totalPurse: teamRows.reduce((sum, team) => sum + team.pointsPurse, 0),
    };
    latestSale = latestSold;
    activePlayer = biddingPlayer;
    ads = adRows.filter(ad => {
      if (!ad.position) return false;
      if (ad.position.includes('/')) {
        return ad.position.split(',').map(p => p.trim()).includes('/');
      }
      return ad.position === 'TOP_BANNER';
    });
    auctionStatus = configData.auctionStatus || 'NOT_STARTED';
  } catch (error) {
    console.error('Database issue on landing page:', error);
    dbError = true;
  }

  const totalProcessed = stats.soldCount + (activePlayer ? 1 : 0);
  const auctionProgress = stats.playerCount ? Math.round((totalProcessed / stats.playerCount) * 100) : 0;
  const featuredBid = activePlayer?.bids?.[0];

  return (
    <div className="league-home">
      <div className="home-shell" style={{ paddingTop: '16px', paddingBottom: '0' }}>
        <SponsorMarquee ads={ads} title="Tournament Sponsors & Partners" />
      </div>
      <section className="league-hero">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="home-shell hero-grid">
          <div className="hero-copy">
            <div className={`live-pill ${auctionStatus === 'LIVE' ? 'is-live' : ''}`}>
              <span className="live-dot" />
              <span>{STATUS_COPY[auctionStatus] || STATUS_COPY.NOT_STARTED}</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '12px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', marginBottom: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
              <Sparkles size={22} color="var(--accent-gold)" />
              <p style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#fff', margin: 0 }}>
                Diamond Opticals Presents
              </p>
            </div>

            <div style={{ marginBottom: '36px' }}>
              <h1 className="gold-gradient-text" style={{ fontSize: 'clamp(6rem, 16vw, 12rem)', letterSpacing: '-0.06em', lineHeight: 0.85, textShadow: 'var(--glow-gold)', marginBottom: '8px' }}>JPL</h1>
              <p style={{ fontSize: 'clamp(24px, 5.5vw, 48px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-gold)', textShadow: '0 0 20px rgba(216, 240, 107, 0.4)', margin: 0 }}>
                Season 1 - 2026
              </p>
            </div>
            <div className="eyebrow" style={{ fontSize: "22px" }}>Jointly Hosted by</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '36px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '24px', color: '#cbd5e1' }}>JCI Tumkur Metro</span>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '24px', color: '#cbd5e1' }}>JCOM L Tumkur 1.0</span>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '24px', color: '#cbd5e1' }}>JAC Tumkur</span>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '24px', color: '#cbd5e1' }}>Rotary Tumkur Prerana</span>
            </div>

            <p style={{ fontSize: 'clamp(20px, 4vw, 24px)', color: 'rgba(255,255,255,0.95)', marginBottom: '32px', fontWeight: '600', lineHeight: '1.4' }}>
              Get ready to bid, strategize, and build your dream team.
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', lineHeight: '1.15', fontWeight: '800', letterSpacing: '-0.02em' }}>Where local cricket<br /><em style={{ color: 'var(--accent-teal)', fontStyle: 'normal' }}>plays like a league.</em></h2>
            <p className="hero-description" style={{ marginTop: '20px', opacity: 0.8 }}>
              The official home of the Franchise Cricket League — follow the auction, discover every squad, and be part of Tumkur&apos;s next cricket story.
            </p>
            <div className="hero-actions">
              <Link href="/register-player" className="home-primary-button">
                Join the player pool <ArrowRight size={18} />
              </Link>
              <Link href="/auction" className="home-secondary-button">
                <Radio size={17} /> Watch auction
              </Link>
            </div>
            <div className="hero-trust-row">
              <span><Trophy size={16} /> Community first</span>
              <span><CircleDot size={16} /> Live draft updates</span>
            </div>
          </div>

          <aside className="auction-pulse-card">
            <div className="pulse-card-topline">
              <span>Draft centre</span>
              <Link href="/auction">Open live board <ArrowRight size={14} /></Link>
            </div>
            {activePlayer ? (
              <>
                <div className="pulse-player">
                  <div className="pulse-avatar">
                    {activePlayer.photoUrl ? <img src={activePlayer.photoUrl} alt="" /> : <Users size={28} />}
                  </div>
                  <div>
                    <p className="pulse-overline">Now on the block</p>
                    <h2>{activePlayer.fullName}</h2>
                    <p>{activePlayer.preferredRole} · {activePlayer.organization}</p>
                  </div>
                </div>
                <div className="bid-readout">
                  <div><span>Current bid</span><strong>{formatPoints(featuredBid?.amount)} <small>PTS</small></strong></div>
                  <div><span>Leading franchise</span><b>{featuredBid?.team?.name || 'Opening soon'}</b></div>
                </div>
              </>
            ) : (
              <div className="pulse-empty">
                <div className="pulse-empty-icon"><Radio size={25} /></div>
                <p className="pulse-overline">Auction desk</p>
                <h2>{auctionStatus === 'ENDED' ? 'Final squads are ready.' : 'The next player is loading.'}</h2>
                <p>Keep the live board open for every bid and completed signing.</p>
              </div>
            )}
            <div className="auction-progress">
              <div><span>Draft progress</span><b>{totalProcessed} / {stats.playerCount} players</b></div>
              <div className="progress-track"><span style={{ width: `${auctionProgress}%` }} /></div>
            </div>
          </aside>
        </div>
      </section>

      <section className="home-shell stat-strip" aria-label="League totals">
        <div><Users size={20} /><span><b>{stats.playerCount}</b> players registered</span></div>
        <div><Shield size={20} /><span><b>{stats.teamCount}</b> franchises</span></div>
        <div><Trophy size={20} /><span><b>{stats.soldCount}</b> signings completed</span></div>
        <div><BadgeIndianRupee size={20} /><span><b>{formatPoints(stats.totalPurse)}</b> total points</span></div>
      </section>


      <main className="home-shell home-content">
        {dbError && (
          <div className="home-notice"><strong>League data is temporarily unavailable.</strong> The public dashboard will resume once the database connection is restored.</div>
        )}

        <section className="home-section-heading">
          <div><p className="eyebrow">The market</p><h2>Franchise intelligence</h2></div>
          <p>See who is building momentum, at a glance.</p>
        </section>

        <section className="market-grid">
          <div className="market-card featured-market-card">
            <div className="card-kicker"><Trophy size={16} /> Latest signing</div>
            {latestSale ? (
              <>
                <h3>{latestSale.fullName}</h3>
                <p>{latestSale.preferredRole} · secured by <strong>{latestSale.team?.name || 'a franchise'}</strong></p>
                <div className="signing-price">{formatPoints(latestSale.soldPrice)} <span>PTS</span></div>
              </>
            ) : (
              <><h3>The auction awaits.</h3><p>Every signing will appear here as the squad race begins.</p><div className="signing-price">—</div></>
            )}
          </div>
          <div className="market-card market-action-card">
            <div className="card-kicker"><Users size={16} /> Player registration</div>
            <h3>Bring your game.</h3>
            <p>Enter the pool and make your case to every franchise owner.</p>
            <Link href="/register-player">Register now <ArrowRight size={16} /></Link>
          </div>
          <div className="market-card market-action-card">
            <div className="card-kicker"><Shield size={16} /> Squad rooms</div>
            <h3>Meet the franchises.</h3>
            <p>Explore every roster, budget and emerging team build.</p>
            <Link href="/teams">View all squads <ArrowRight size={16} /></Link>
          </div>
        </section>

        <section className="leaderboard-section">
          <div className="leaderboard-heading"><div><p className="eyebrow">Franchise board</p><h2>Squad build leaderboard</h2></div><Link href="/teams">See franchise squads <ArrowRight size={16} /></Link></div>
          <div className="leaderboard-list">
            {teams.length ? teams.slice(0, 5).map((team, index) => {
              const spentShare = team.pointsPurse ? Math.min(100, Math.round((team.pointsSpent / team.pointsPurse) * 100)) : 0;
              return (
                <div className="leaderboard-row" key={team.id}>
                  <span className="team-rank">0{index + 1}</span>
                  <div className="team-shield"><Shield size={19} /></div>
                  <div className="team-summary"><b>{team.name}</b><span>{team.players.length} player{team.players.length === 1 ? '' : 's'} signed</span></div>
                  <div className="team-spend"><span>Points deployed</span><b>{formatPoints(team.pointsSpent)} <small>PTS</small></b></div>
                  <div className="team-bar"><span style={{ width: `${spentShare}%` }} /></div>
                </div>
              );
            }) : <p className="leaderboard-empty">Franchise activity will appear here as teams are set up.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
