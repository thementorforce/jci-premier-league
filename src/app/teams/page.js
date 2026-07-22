import prisma from '@/lib/db';
import TeamsListClient from './TeamsListClient';

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
  
  const filteredAds = ads.filter(ad => {
    if (!ad.position) return false;
    if (ad.position.includes('/')) {
      return ad.position.split(',').map(p => p.trim()).includes('/teams');
    }
    return ad.position === 'SIDEBAR';
  });
  const sponsorList = filteredAds.length > 0 ? filteredAds : DEFAULT_SPONSORS;

  return (
    <div className="page-container-lg">
      
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 className="gold-gradient-text section-title">🏆 Franchise Squads</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View team budgets, purses, and recruited player lists</p>
      </div>

      <TeamsListClient initialTeams={teams} sponsorList={sponsorList} dbError={dbError} errorMessage={errorMessage} />

    </div>
  );
}
