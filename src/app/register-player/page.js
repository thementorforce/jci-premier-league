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
  { id: 'default-1', title: 'Decathlon Sports Tumkur', imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80', targetUrl: 'https://www.decathlon.in' },
  { id: 'default-2', title: 'Tumkur Cricket Academy', imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80', targetUrl: '#' },
  { id: 'default-3', title: 'JCI Tumkur Metro', imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607be7e72?auto=format&fit=crop&w=800&q=80', targetUrl: '#' },
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
        {sponsorList.map((sponsor) => <a key={sponsor.id} href={sponsor.targetUrl || '#'} target="_blank" rel="noopener noreferrer" className="sponsor-sidebar-item">{sponsor.imageUrl && <img src={sponsor.imageUrl} alt={sponsor.title} />}<div><span className="sponsor-name">{sponsor.title}</span><span className="sponsor-label"><ExternalLink size={9} /> Official Sponsor</span></div></a>)}
      </aside>
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
