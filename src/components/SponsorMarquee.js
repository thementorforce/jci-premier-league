'use client';

import React from 'react';
import { Award, ExternalLink } from 'lucide-react';

const DEFAULT_SPONSORS = [
  {
    id: 'default-1',
    title: 'Decathlon Sports Tumkur',
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
    targetUrl: 'https://www.decathlon.in',
    position: 'TOP_BANNER',
  },
  {
    id: 'default-2',
    title: 'Tumkur Cricket Academy',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80',
    targetUrl: '#',
    position: 'TOP_BANNER',
  },
  {
    id: 'default-3',
    title: 'JCI Tumkur Metro',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607be7e72?auto=format&fit=crop&w=800&q=80',
    targetUrl: '#',
    position: 'TOP_BANNER',
  },
  {
    id: 'default-4',
    title: 'Rotary Tumkur Prerana',
    imageUrl: 'https://images.unsplash.com/photo-1624526267662-791473f29493?auto=format&fit=crop&w=800&q=80',
    targetUrl: '#',
    position: 'TOP_BANNER',
  },
];

export default function SponsorMarquee({ ads = [], title = "Official Sponsors & Partners" }) {
  const activeAds = ads && ads.length > 0 ? ads : DEFAULT_SPONSORS;

  // Duplicate list to create seamless infinite scrolling effect
  const marqueeItems = [...activeAds, ...activeAds, ...activeAds];

  return (
    <div style={{ width: '100%', margin: '24px 0', overflow: 'hidden' }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '14px', color: 'var(--accent-gold)' }}>
          <Award size={16} />
          <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {title}
          </span>
        </div>
      )}
      
      <div className="marquee-container marquee-container-rtl" style={{ background: 'rgba(7, 11, 25, 0.4)', borderRadius: '12px', border: '1px solid var(--card-border)', padding: '12px 0' }}>
        <div className="marquee-content marquee-content-rtl" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {marqueeItems.map((ad, idx) => (
            <div key={`${ad.id}-${idx}`} className="marquee-item marquee-item-responsive" style={{ flex: '0 0 auto' }}>
              <a
                href={ad.targetUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 16px',
                  background: 'rgba(2, 14, 7, 0.6)',
                  borderRadius: '10px',
                  border: '1px solid rgba(217, 244, 225, 0.15)',
                  textDecoration: 'none',
                  color: '#edf6ef',
                  transition: 'all 0.2s ease',
                }}
              >
                {ad.imageUrl && (
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                )}
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '700', display: 'block', whiteSpace: 'nowrap' }}>
                    {ad.title}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Official Sponsor <ExternalLink size={10} />
                  </span>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
