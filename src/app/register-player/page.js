'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Award, Camera, CheckCircle2, ExternalLink, Upload } from 'lucide-react';
import SponsorMarquee from '@/components/SponsorMarquee';

const EMPTY_FORM = {
  fullName: '',
  email: '',
  mobileNumber: '',
  organization: 'JCI Tumkur Metro',
  gender: 'Male',
  ageGroup: '25–40 Years',
  jerseySize: 'L',
  preferredRole: 'All-Rounder',
  experience: 'Intermediate',
  photoBase64: '',
  paymentScreenshot: '',
};

const DEFAULT_SPONSORS = [
  { id: 'ds-1', title: 'Diamond Opticals', label: 'Title Sponsor', targetUrl: '#', gradient: 'linear-gradient(135deg, #1a0030 0%, #4b0082 55%, #2d0060 100%)', emoji: '💎' },
  { id: 'ds-2', title: 'Franchise Owners', label: 'Team Owners', targetUrl: '#', gradient: 'linear-gradient(135deg, #0b1d3a 0%, #0d4f9e 60%, #062a6b 100%)', emoji: '🤝' },
  { id: 'ds-3', title: 'Trophy Sponsor', label: 'Awarding Excellence', targetUrl: '#', gradient: 'linear-gradient(135deg, #1f0800 0%, #8b2000 55%, #5c1500 100%)', emoji: '🏆' },
  { id: 'ds-4', title: 'Food Sponsor', label: 'Fueling Champions', targetUrl: '#', gradient: 'linear-gradient(135deg, #001a12 0%, #004d2e 55%, #00341f 100%)', emoji: '🍽️' },
];

export default function Register() {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });
  const [registeredPlayer, setRegisteredPlayer] = useState(null);
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/ads');
        if (response.ok) {
          setAds((await response.json()).filter((ad) => ad.active));
        }
      } catch {}
    };
    fetchAds();
  }, []);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleImageUpload = (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatus({ type: 'error', message: 'Please choose an image file.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'Image size must be less than 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 1000;
        const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        setFormData((current) => ({ ...current, [field]: canvas.toDataURL('image/jpeg', 0.75) }));
        setStatus({ type: null, message: '' });
      };
      image.src = loadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.photoBase64 || !formData.paymentScreenshot) {
      setStatus({ type: 'error', message: 'Please upload your photo and payment screenshot before submitting.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
      setRegisteredPlayer({ fullName: data.player.fullName, email: data.player.email });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Failed to connect to the server.' });
    } finally {
      setLoading(false);
    }
  };

  const sponsorList = ads.length ? ads : DEFAULT_SPONSORS;

  return (
    <div className="register-layout">
      {/* JPL Season Banner - Full Width Top */}
      <div style={{ gridColumn: '1 / -1', marginBottom: '8px' }}>
        <div style={{ padding: '36px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #0a2113 0%, #030a05 100%)', border: '1px solid rgba(216, 240, 107, 0.2)', borderRadius: '20px', boxShadow: '0 16px 40px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative Background Glow */}
          <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '150px', background: 'var(--accent-gold)', filter: 'blur(100px)', opacity: 0.15, pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px', marginTop: '8px' }}>
            <span style={{ fontSize: 'clamp(60px, 12vw, 90px)', fontWeight: '900', background: 'linear-gradient(to bottom, #ffffff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))', lineHeight: 0.9, letterSpacing: '-0.02em' }}>
              JPL
            </span>
            <span className="gold-gradient-text" style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase', textShadow: '0 0 20px rgba(216, 240, 107, 0.4)', marginTop: '8px' }}>
              Season 1 <span style={{ display: 'inline-block', margin: '0 8px', color: '#fff', WebkitTextFillColor: '#fff', opacity: 0.5 }}>|</span> 2026
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: '800' }}>Co-hosted By</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: '24px', color: '#e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>JCI Tumkur Metro</span>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: '24px', color: '#e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>JCOM L Tumkur 1.0</span>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: '24px', color: '#e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>JAC Tumkur</span>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 16px', borderRadius: '24px', color: '#e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>Rotary Tumkur Prerana</span>
            </div>
          </div>
        </div>
      </div>

      <div className="register-main">
        <div className="register-mobile-sponsors"><SponsorMarquee ads={ads} title="Powered By" /></div>
        <div className="premium-kk" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 className="gold-gradient-text" style={{ fontSize: '28px', fontWeight: '800' }}>🏏 Player Registration</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Franchise Cricket League – Season Draft</p>
          </div>

          {status.type === 'error' && <Notice icon={<AlertCircle color="var(--danger)" size={24} />} tone="danger">{status.message}</Notice>}

          {registeredPlayer ? (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '30px 10px' }}>
              <CheckCircle2 size={64} color="var(--success)" />
              <div style={{ maxWidth: '440px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)' }}>Registration Submitted</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginTop: '12px' }}>
                  Thank you, <strong style={{ color: 'var(--text-primary)' }}>{registeredPlayer.fullName}</strong>. Your payment will be verified and confirmation will be sent to your email ID, <strong>{registeredPlayer.email}</strong>.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '420px' }}>
                <Link href="/" className="premium-button-secondary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>Back to Home</Link>
                <button type="button" onClick={() => { setFormData(EMPTY_FORM); setRegisteredPlayer(null); }} className="premium-button" style={{ flex: 1, justifyContent: 'center' }}>Register Another</button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <TextField label="1. Full Name *" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name" />
              <TextField label="2. Mobile Number *" name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleChange} placeholder="Enter 10-digit mobile number" />
              <TextField label="3. Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
              <SelectField label="4. Organization *" name="organization" value={formData.organization} onChange={handleChange} options={['JCI Tumkur Metro', 'JCOM', 'JAC', 'Rotary Tumkur Prerana']} />
              <div className="grid-2-col">
                <SelectField label="5. Gender *" name="gender" value={formData.gender} onChange={handleChange} options={['Male', 'Female']} />
                <SelectField label="6. Age Group *" name="ageGroup" value={formData.ageGroup} onChange={handleChange} options={['Below 25 Years', '25–40 Years', 'Above 40 Years']} />
              </div>
              <div className="grid-2-col">
                <SelectField label="7. Jersey Size *" name="jerseySize" value={formData.jerseySize} onChange={handleChange} options={['S', 'M', 'L', 'XL', 'XXL', 'XXXL']} />
                <SelectField label="8. Preferred Playing Role *" name="preferredRole" value={formData.preferredRole} onChange={handleChange} options={['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper', 'Any Role']} />
              </div>
              <SelectField label="9. Cricket Playing Experience *" name="experience" value={formData.experience} onChange={handleChange} options={['Beginner', 'Intermediate', 'Experienced']} />
              <ImageField label="10. Upload Your Photo *" field="photoBase64" value={formData.photoBase64} onChange={handleImageUpload} icon={<Camera size={24} color="var(--text-secondary)" />} />
              <ImageField label="11. Upload Payment Screenshot *" field="paymentScreenshot" value={formData.paymentScreenshot} onChange={handleImageUpload} icon={<Upload size={24} color="var(--text-secondary)" />} help="Upload the successful payment screenshot for admin verification." />
              <Notice icon={<AlertCircle color="var(--accent-teal)" size={21} />} tone="info">Your payment will be verified and confirmation will be sent to your email ID.</Notice>
              <button type="submit" disabled={loading} className="premium-button" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}>{loading ? 'Submitting...' : 'Submit Registration'}</button>
            </form>
          )}
        </div>
      </div>
      <aside className="register-sponsor-sidebar">
        <h3><Award size={13} /> Official Sponsors</h3><div className="sponsor-sidebar-divider" />
        <SidebarCarousel sponsors={sponsorList} />
      </aside>
    </div>
  );
}

function SidebarCarousel({ sponsors }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!sponsors || sponsors.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % sponsors.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [sponsors]);

  if (!sponsors || sponsors.length === 0) return null;
  const sponsor = sponsors[current];
  const isClickable = sponsor.targetUrl && sponsor.targetUrl !== '#';
  const Wrapper = isClickable ? 'a' : 'div';
  const props = isClickable ? { href: sponsor.targetUrl, target: '_blank', rel: 'noopener noreferrer' } : { style: { cursor: 'default' } };

  return (
    <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden', borderRadius: '12px' }}>
      {sponsors.map((s, idx) => (
        <div
          key={s.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: current === idx ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            pointerEvents: current === idx ? 'auto' : 'none',
          }}
        >
          <Wrapper className="sponsor-sidebar-item" {...(current === idx ? props : {})} style={{ width: '100%', height: '100%', padding: '16px', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)', background: s.gradient || 'var(--bg-secondary)', textDecoration: 'none', cursor: isClickable ? 'pointer' : 'default' }}>
            {s.imageUrl ? (
              <img src={s.imageUrl} alt={s.title} style={{ width: '80px', height: '80px', objectFit: 'contain', marginBottom: '12px' }} />
            ) : (
              <div style={{ width: '70px', height: '70px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {s.emoji || '🏏'}
              </div>
            )}
            <div>
              <span className="sponsor-name" style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginBottom: '6px', display: 'block' }}>{s.title}</span>
              <span className="sponsor-label" style={{ fontSize: '11px', color: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                {isClickable && <ExternalLink size={11} />}
                {s.label || 'Official Sponsor'}
              </span>
            </div>
          </Wrapper>
        </div>
      ))}
      
      {/* Carousel Dots */}
      <div style={{ position: 'absolute', bottom: '12px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '6px' }}>
        {sponsors.map((_, idx) => (
          <div key={idx} style={{ width: current === idx ? '16px' : '6px', height: '6px', borderRadius: '3px', background: current === idx ? 'var(--accent-gold)' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s ease' }} />
        ))}
      </div>
    </div>
  );
}

function TextField({ label, ...props }) {
  return <div><label className="form-label">{label}</label><input required className="premium-input" {...props} /></div>;
}

function SelectField({ label, options, ...props }) {
  return <div><label className="form-label">{label}</label><select className="premium-select" {...props}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>;
}

function ImageField({ label, field, value, onChange, icon, help }) {
  const inputId = `${field}-upload`;
  return (
    <div>
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
        <div style={{ width: '80px', height: '80px', flex: '0 0 80px', borderRadius: '8px', background: 'rgba(7, 11, 25, 0.8)', border: value ? '2px solid var(--success)' : '1px dashed var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {value ? <img src={value} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : icon}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1', minWidth: '160px' }}>
          <input type="file" accept="image/*" id={inputId} required onChange={(event) => onChange(event, field)} style={{ display: 'none' }} />
          <label htmlFor={inputId} className="premium-button-secondary" style={{ padding: '8px 16px', fontSize: '14px', cursor: 'pointer', textAlign: 'center', justifyContent: 'center' }}>
            Choose Image
          </label>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{help || 'Required · Max file size: 5MB'}</span>
        </div>
      </div>
    </div>
  );
}

function Notice({ icon, tone, children }) {
  const color = tone === 'danger' ? 'var(--danger)' : 'var(--accent-teal)';
  return <div style={{ background: tone === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(6, 182, 212, 0.08)', border: `1px solid ${color}`, borderRadius: '8px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-primary)' }}>{icon}<p style={{ fontSize: '14px', lineHeight: '1.5' }}>{children}</p></div>;
}
