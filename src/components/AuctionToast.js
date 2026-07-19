'use client';
import { useState, useEffect } from 'react';

export default function AuctionToast() {
  const [status, setStatus] = useState('NOT_STARTED');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/auction/status');
        if (res.ok) {
          const json = await res.json();
          
          // Determine status based on live data
          const activePlayer = json.activePlayer;
          const soldCount = json.soldPlayers?.length || 0;
          const unsoldCount = json.unsoldPlayers?.length || 0;
          const draftPoolCount = json.draftPool?.length || 0;
          
          const totalProcessed = soldCount + unsoldCount;

          if (activePlayer) {
            setStatus('LIVE');
          } else if (totalProcessed > 0 && draftPoolCount > 0) {
            setStatus('BREAK');
          } else if (totalProcessed > 0 && draftPoolCount === 0) {
            setStatus('ENDED');
          } else {
            setStatus('NOT_STARTED');
          }
        }
      } catch (e) {
        console.error('Error fetching auction status for toast:', e);
      }
    };

    // Poll status immediately and then every 3s
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'LIVE': return { text: 'Auction is Live', color: '#10b981', icon: '🔴', sub: 'Join the bidding now!' };
      case 'BREAK': return { text: 'Auction on Break', color: 'var(--accent-gold)', icon: '☕', sub: 'We will be right back.' };
      case 'ENDED': return { text: 'Auction Ended', color: '#ef4444', icon: '🏁', sub: 'Thanks for participating.' };
      default: return { text: 'Auction Not Started', color: 'var(--text-secondary)', icon: '⏳', sub: 'Stay tuned for updates.' };
    }
  };

  const config = getStatusConfig();

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: 'rgba(10, 33, 0, 0.91)', // Matching the premium-kk card background
      backdropFilter: 'blur(16px)',
      border: `1px solid ${config.color}`,
      boxShadow: `0 4px 20px ${config.color}40`,
      borderRadius: '12px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      transition: 'all 0.3s ease',
      animation: status === 'LIVE' ? 'pulse-glow 2s infinite' : 'none'
    }}>
      <div style={{ fontSize: '24px', animation: status === 'LIVE' ? 'float 2s ease-in-out infinite' : 'none' }}>
        {config.icon}
      </div>
      <div>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: config.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {config.text}
        </h4>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          {config.sub}
        </p>
      </div>
    </div>
  );
}
