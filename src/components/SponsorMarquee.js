'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Award, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

/* ─── Helper to format target URLs ───────────────────────────────────── */
function getFormattedUrl(targetUrl) {
  if (!targetUrl || targetUrl === '#') return null;
  const trimmed = String(targetUrl).trim();
  if (!trimmed || trimmed === '#') return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/* ─── Dummy banners (replace with DB data) ───────────────────────────── */
const DEFAULT_SPONSORS = [
  {
    id: 'ds-1',
    title: 'Diamond Opticals',
    tagline: 'Title Sponsor',
    category: 'Title Sponsor',
    gradient: 'linear-gradient(135deg, #1a0030 0%, #4b0082 55%, #2d0060 100%)',
    accentColor: '#b47fff',
    shape: 'M40,0 L200,0 L200,100 L0,100 Z',
    emoji: '💎',
    targetUrl: '#',
  },
  {
    id: 'ds-2',
    title: 'Franchise Owners',
    tagline: 'Team Owners & Managers',
    category: 'Franchise Owners',
    gradient: 'linear-gradient(135deg, #0b1d3a 0%, #0d4f9e 60%, #062a6b 100%)',
    accentColor: '#5ba3f5',
    shape: 'M0,0 L200,0 L160,100 L0,100 Z',
    emoji: '🤝',
    targetUrl: '#',
  },
  {
    id: 'ds-3',
    title: 'Trophy Sponsor',
    tagline: 'Awarding Excellence',
    category: 'Trophy Sponsor',
    gradient: 'linear-gradient(135deg, #1f0800 0%, #8b2000 55%, #5c1500 100%)',
    accentColor: '#ff7940',
    shape: 'M0,20 L200,0 L200,100 L0,100 Z',
    emoji: '🏆',
    targetUrl: '#',
  },
  {
    id: 'ds-4',
    title: 'Food Sponsor',
    tagline: 'Fueling the Champions',
    category: 'Food Sponsor',
    gradient: 'linear-gradient(135deg, #001a12 0%, #004d2e 55%, #00341f 100%)',
    accentColor: '#3ecf8e',
    shape: 'M0,0 L200,0 L200,80 L0,100 Z',
    emoji: '🍽️',
    targetUrl: '#',
  },
];

/* ─── 3D transform calculator ─────────────────────────────────────────── */
function getSlideStyle(offset, isMobile) {
  const abs = Math.abs(offset);
  if (abs > 2) return { display: 'none' };
  
  // Hide outer cards on mobile to prevent squishing and overflow
  if (isMobile && abs > 1) return { display: 'none', opacity: 0 };

  const m = isMobile ? 0.45 : 1; // Reduce translate and rotate spread on mobile
  const scaleM = isMobile ? 0.95 : 1; // Slight scale adjust on mobile side cards

  const configs = {
    0:    { scale: 1,    rotateY: 0,   translateX:   0,  translateZ:   0, opacity: 1,    brightness: 1,    zIndex: 10 },
    1:    { scale: 0.82 * scaleM, rotateY: -32 * m, translateX:  52 * m,  translateZ: -60, opacity: 0.85, brightness: 0.72, zIndex:  5 },
   '-1':  { scale: 0.82 * scaleM, rotateY:  32 * m, translateX: -52 * m,  translateZ: -60, opacity: 0.85, brightness: 0.72, zIndex:  5 },
    2:    { scale: 0.64, rotateY: -48, translateX:  92,  translateZ:-120, opacity: 0.50, brightness: 0.42, zIndex:  1 },
   '-2':  { scale: 0.64, rotateY:  48, translateX: -92,  translateZ:-120, opacity: 0.50, brightness: 0.42, zIndex:  1 },
  };

  const key = offset === 0 ? 0 : offset > 0 ? Math.min(offset, 2) : Math.max(offset, -2);
  const cfg = configs[key] ?? configs[offset < 0 ? -2 : 2];

  return {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: `translateX(${cfg.translateX}%) rotateY(${cfg.rotateY}deg) scale(${cfg.scale}) translateZ(${cfg.translateZ}px)`,
    zIndex: cfg.zIndex,
    opacity: cfg.opacity,
    filter: `brightness(${cfg.brightness})`,
    transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    cursor: offset === 0 ? 'default' : 'pointer',
  };
}

/* ─── A single gradient card (used when no imageUrl) ─────────────────── */
function GradientCard({ sponsor, isCenter }) {
  const formattedUrl = getFormattedUrl(sponsor.targetUrl);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: sponsor.gradient,
        borderRadius: '14px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '22px 26px',
        boxSizing: 'border-box',
      }}
    >
      {/* decorative polygon fill */}
      <svg
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '55%',
          height: '100%',
          right: 0,
          left: 'auto',
          opacity: 0.12,
        }}
      >
        <path d={sponsor.shape} fill={sponsor.accentColor} />
      </svg>

      {/* decorative glow blob */}
      <div
        style={{
          position: 'absolute',
          right: '-30px',
          top: '-30px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: sponsor.accentColor,
          opacity: 0.08,
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        {/* emoji badge */}
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: `${sponsor.accentColor}22`,
            border: `1px solid ${sponsor.accentColor}44`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            backdropFilter: 'blur(4px)',
          }}
        >
          {sponsor.emoji}
        </div>

        {/* category pill */}
        <span
          style={{
            fontSize: '9px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: sponsor.accentColor,
            background: `${sponsor.accentColor}18`,
            border: `1px solid ${sponsor.accentColor}30`,
            borderRadius: '20px',
            padding: '4px 10px',
          }}
        >
          {sponsor.category}
        </span>
      </div>

      {/* bottom text */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3
          style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '800',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: '5px',
          }}
        >
          {sponsor.title}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '11px',
            color: 'rgba(255,255,255,0.55)',
            fontWeight: '500',
            letterSpacing: '0.01em',
          }}
        >
          {sponsor.tagline}
        </p>

        {isCenter && (
          formattedUrl ? (
            <a
              href={formattedUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginTop: '10px',
                fontSize: '10px',
                fontWeight: '700',
                color: sponsor.accentColor,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              Visit Partner <ExternalLink size={10} />
            </a>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginTop: '10px',
                fontSize: '10px',
                fontWeight: '700',
                color: sponsor.accentColor,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Official Partner
            </div>
          )
        )}
      </div>

      {/* bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, transparent, ${sponsor.accentColor}, transparent)`,
          opacity: isCenter ? 0.9 : 0.4,
        }}
      />
    </div>
  );
}

/* ─── Image card (when DB provides imageUrl) ──────────────────────────── */
function ImageCard({ ad, isCenter }) {
  const formattedUrl = getFormattedUrl(ad.targetUrl);

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
      <img src={ad.imageUrl} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)',
        }}
      />
      <div style={{ position: 'absolute', bottom: '16px', left: '18px', right: '18px' }}>
        <span style={{ display: 'block', fontSize: '16px', fontWeight: '800', color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
          {ad.title}
        </span>
        {isCenter && (
          formattedUrl ? (
            <a
              href={formattedUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10px',
                color: 'var(--accent-teal, #4ecca3)',
                marginTop: '5px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              Official Sponsor <ExternalLink size={10} />
            </a>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--accent-teal, #4ecca3)', marginTop: '3px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Official Sponsor
            </span>
          )
        )}
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────── */
export default function SponsorMarquee({ ads = [], title = 'Official Sponsors & Partners' }) {
  const activeAds = ads && ads.length > 0 ? ads : DEFAULT_SPONSORS;
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const total = activeAds.length;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const goTo = useCallback((idx) => setCurrent(((idx % total) + total) % total), [total]);
  const next  = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev  = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    intervalRef.current = setInterval(next, 4000);
    return () => clearInterval(intervalRef.current);
  }, [next]);

  const resetTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 4000);
  }, [next]);

  const handlePrev = () => { prev(); resetTimer(); };
  const handleNext = () => { next(); resetTimer(); };

  return (
    <div style={{ width: '100%', margin: '20px 0' }}>

      {/* ── Title ── */}
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', marginBottom: '16px' }}>
          <Award size={13} color="var(--accent-gold, #f5c518)" />
          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--accent-gold, #f5c518)', opacity: 0.85 }}>
            {title}
          </span>
        </div>
      )}

      {/* ── Carousel wrapper ── */}
      <div style={{ position: 'relative', width: '100%' }}>

        {/* Prev arrow */}
        <button
          id="sponsor-prev"
          aria-label="Previous sponsor"
          onClick={handlePrev}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={17} />
        </button>

        {/* Next arrow */}
        <button
          id="sponsor-next"
          aria-label="Next sponsor"
          onClick={handleNext}
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          <ChevronRight size={17} />
        </button>

        {/* 3D perspective stage */}
        <div
          style={{
            width: isMobile ? 'calc(100% - 20px)' : 'calc(100% - 80px)',
            maxWidth: '640px',
            margin: '0 auto',
            height: isMobile ? '160px' : '220px',
            perspective: '900px',
            perspectiveOrigin: '50% 50%',
            overflow: 'visible',
          }}
        >
          {/* preserve-3d container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
            }}
          >
            {activeAds.map((ad, idx) => {
              const raw    = ((idx - current + total) % total + total) % total;
              const norm   = raw > Math.floor(total / 2) ? raw - total : raw;
              const slideStyle = getSlideStyle(norm, isMobile);
              const isCenter   = norm === 0;
              const formattedUrl = getFormattedUrl(ad.targetUrl);

              const handleCardClick = () => {
                if (!isCenter) {
                  goTo(idx);
                  resetTimer();
                } else if (formattedUrl) {
                  window.open(formattedUrl, '_blank', 'noopener,noreferrer');
                }
              };

              return (
                <div
                  key={ad.id}
                  style={{
                    ...slideStyle,
                    borderRadius: '14px',
                    boxShadow: isCenter
                      ? '0 16px 48px rgba(0,0,0,0.65), 0 0 0 1.5px rgba(245,197,24,0.5)'
                      : '0 6px 24px rgba(0,0,0,0.4)',
                    border: isCenter
                      ? '1.5px solid rgba(245,197,24,0.45)'
                      : '1px solid rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                    cursor: !isCenter ? 'pointer' : (formattedUrl ? 'pointer' : 'default'),
                  }}
                  onClick={handleCardClick}
                >
                  {ad.imageUrl ? (
                    <ImageCard ad={ad} isCenter={isCenter} />
                  ) : (
                    <GradientCard sponsor={{ ...DEFAULT_SPONSORS.find(d => d.id === ad.id) || DEFAULT_SPONSORS[idx % DEFAULT_SPONSORS.length], ...ad }} isCenter={isCenter} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>


      {/* ── Dots ── */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '14px' }}>
        {activeAds.map((_, i) => (
          <button
            key={i}
            aria-label={`Go to sponsor ${i + 1}`}
            onClick={() => { goTo(i); resetTimer(); }}
            style={{
              width: i === current ? '20px' : '6px',
              height: '6px',
              borderRadius: '3px',
              border: 'none',
              background: i === current ? 'var(--accent-gold, #f5c518)' : 'rgba(255,255,255,0.2)',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
