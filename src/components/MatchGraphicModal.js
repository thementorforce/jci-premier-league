import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Download, Loader2 } from 'lucide-react';

export default function MatchGraphicModal({ match, onClose }) {
  const graphicRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!match) return null;

  const matchDate = new Date(match.date);
  const dateStr = matchDate.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const timeStr = matchDate.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  const team1Logo = match.team1.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team1.name)}&background=0D8ABC&color=fff&size=200`;
  const team2Logo = match.team2.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team2.name)}&background=E53935&color=fff&size=200`;

  const handleDownload = async () => {
    if (!graphicRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(graphicRef.current, {
        quality: 1.0,
        pixelRatio: 1, // Force exact pixels
      });
      const link = document.createElement('a');
      link.download = `match-${match.matchNumber}-graphic.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Failed to generate image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', padding: '20px' }}>
      {/* Close Button */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '12px', zIndex: 10 }}>
        <button onClick={onClose} style={{ width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        {/* Preview Container - Scaled down for screen but actual size 1080x1080 */}
        <div style={{
          width: '1080px', 
          height: '1080px', 
          transform: 'scale(0.45)', // Fits on smaller laptop screens
          transformOrigin: 'center center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          borderRadius: '24px',
          overflow: 'hidden',
          marginBottom: '-280px', // Compensate for scale
          marginTop: '-280px'
        }}>
          {/* THE GRAPHIC NODE TO CAPTURE */}
          <div
            ref={graphicRef}
            style={{
              width: '1080px',
              height: '1080px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0a0a0a',
              backgroundImage: 'radial-gradient(circle at 50% 0%, #1e1e1e 0%, #000000 100%)',
              fontFamily: '"Inter", sans-serif',
              color: 'white',
              position: 'relative',
              padding: '40px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '80px' }}>
              <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#eab308', letterSpacing: '-0.02em', marginBottom: '16px', textTransform: 'uppercase' }}>
                JCI Premier League
              </h1>
              <div style={{ fontSize: '32px', fontWeight: '600', color: '#a3a3a3', background: 'rgba(255, 255, 255, 0.1)', padding: '12px 32px', borderRadius: '999px' }}>
                Match {match.matchNumber}
              </div>
            </div>

            {/* Teams */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 60px', marginBottom: '80px' }}>
              {/* Team 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '350px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '280px', height: '280px', borderRadius: '50%', backgroundColor: 'white', overflow: 'hidden', border: '8px solid #262626', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', marginBottom: '32px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={team1Logo} alt={match.team1.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
                </div>
                <h2 style={{ fontSize: '48px', fontWeight: '700', textAlign: 'center', lineHeight: '1.2' }}>
                  {match.team1.name}
                </h2>
              </div>

              {/* VS */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#eab308', color: 'black', fontSize: '48px', fontWeight: '900', fontStyle: 'italic', boxShadow: '0 0 50px 15px rgba(234, 179, 8, 0.3)' }}>
                VS
              </div>

              {/* Team 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '350px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '280px', height: '280px', borderRadius: '50%', backgroundColor: 'white', overflow: 'hidden', border: '8px solid #262626', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)', marginBottom: '32px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={team2Logo} alt={match.team2.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} crossOrigin="anonymous" />
                </div>
                <h2 style={{ fontSize: '48px', fontWeight: '700', textAlign: 'center', lineHeight: '1.2' }}>
                  {match.team2.name}
                </h2>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '40px 80px', borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ fontSize: '36px', fontWeight: '500', color: '#d4d4d4', marginBottom: '16px' }}>
                {dateStr} • {timeStr}
              </div>
              <div style={{ fontSize: '32px', fontWeight: '500', color: '#a3a3a3' }}>
                📍 {match.venue}
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <button 
          onClick={handleDownload} 
          disabled={downloading}
          className="premium-button" 
          style={{ padding: '16px 48px', fontSize: '18px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '12px', zIndex: 10, cursor: downloading ? 'not-allowed' : 'pointer' }}
        >
          {downloading ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
          {downloading ? "Generating PNG..." : "Download Graphic"}
        </button>
      </div>
    </div>
  );
}
