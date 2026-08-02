import { ImageResponse } from 'next/og';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs'; // Use Node.js runtime for Prisma compatibility

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('id');

    if (!matchId) {
      return new Response('Match ID is required', { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        team1: true,
        team2: true,
      },
    });

    if (!match) {
      return new Response('Match not found', { status: 404 });
    }

    // Format date and time
    const matchDate = new Date(match.date);
    const dateStr = matchDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const timeStr = matchDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Provide default logos if they are missing
    const team1Logo = match.team1.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team1.name)}&background=0D8ABC&color=fff&size=200`;
    const team2Logo = match.team2.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team2.name)}&background=E53935&color=fff&size=200`;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0a0a0a',
            backgroundImage: 'radial-gradient(circle at 50% 0%, #1e1e1e 0%, #000000 100%)',
            fontFamily: '"Inter", sans-serif',
            color: 'white',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 40,
            }}
          >
            <h1
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: '#eab308',
                letterSpacing: '-0.02em',
                marginBottom: 10,
                textTransform: 'uppercase',
              }}
            >
              JCI Premier League
            </h1>
            <div
              style={{
                fontSize: 32,
                fontWeight: 600,
                color: '#a3a3a3',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '8px 24px',
                borderRadius: 999,
              }}
            >
              Match {match.matchNumber}
            </div>
          </div>

          {/* Teams Container */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0 80px',
              marginTop: 40,
              marginBottom: 60,
            }}
          >
            {/* Team 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '300px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 250,
                  height: 250,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  overflow: 'hidden',
                  border: '8px solid #262626',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  marginBottom: 30,
                }}
              >
                <img src={team1Logo} alt="Team 1 Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h2 style={{ fontSize: 40, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
                {match.team1.name}
              </h2>
            </div>

            {/* VS Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: '#eab308',
                color: 'black',
                fontSize: 40,
                fontWeight: 900,
                fontStyle: 'italic',
                boxShadow: '0 0 40px 10px rgba(234, 179, 8, 0.3)',
              }}
            >
              VS
            </div>

            {/* Team 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '300px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 250,
                  height: 250,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  overflow: 'hidden',
                  border: '8px solid #262626',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  marginBottom: 30,
                }}
              >
                <img src={team2Logo} alt="Team 2 Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h2 style={{ fontSize: 40, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>
                {match.team2.name}
              </h2>
            </div>
          </div>

          {/* Footer Details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              padding: '30px 60px',
              borderRadius: 24,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginTop: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 12 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span style={{ fontSize: 32, fontWeight: 500, color: '#d4d4d4' }}>
                {dateStr} • {timeStr}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 12 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span style={{ fontSize: 28, fontWeight: 500, color: '#a3a3a3' }}>
                {match.venue}
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
      }
    );
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
