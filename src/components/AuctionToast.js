'use client';
import { useState, useEffect } from 'react';

const STATUS_CONFIG = {
  NOT_STARTED: { text: 'Auction Not Started', color: '#94a3b8', icon: '\u23F3', sub: 'Stay tuned for updates.' },
  LIVE: { text: 'Auction is Live', color: '#10b981', icon: '\uD83D\uDD34', sub: 'Join the bidding now!' },
  BREAK: { text: 'Auction on Break', color: '#f59e0b', icon: '\u2615', sub: 'We will be right back.' },
  PAUSED: { text: 'Auction Paused', color: '#ef4444', icon: '\u23F8\uFE0F', sub: 'Auction temporarily halted.' },
  ENDED: { text: 'Auction Ended', color: '#6366f1', icon: '\uD83C\uDFC1', sub: 'Thanks for participating.' },
};

export default function AuctionToast() {
  const [status, setStatus] = useState('NOT_STARTED');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/auction/status');
        if (res.ok) {
          const json = await res.json();
          setStatus(json.auctionStatus || 'NOT_STARTED');
        }
      } catch (e) {
        console.error('Error fetching auction status:', e);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_STARTED;

  // The auction page and the new league hub already explain inactive states.
  // Reserve the floating alert for the one moment that needs immediate attention.
  if (status !== 'LIVE') return null;

  return (
    <div
      className="auction-toast"
      style={{
        border: `1px solid ${config.color}`,
        boxShadow: `0 4px 20px ${config.color}40`,
        animation: status === 'LIVE' ? 'pulse-glow 2s infinite' : 'none',
      }}
    >
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
