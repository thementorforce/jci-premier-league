'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SponsorMarquee from '@/components/SponsorMarquee';
import { Camera, CheckCircle2, AlertCircle, CreditCard, ArrowRight, ArrowLeft, Copy, Check, Smartphone, Award, ExternalLink } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // 'pending' | 'completed'
  const [registeredPlayer, setRegisteredPlayer] = useState(null);
  const [formData, setFormData] = useState({
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
    transactionId: '',
    paymentScreenshot: ''
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'File size should be less than 5MB' });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimensions
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setFormData({ ...formData, [field]: dataUrl });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRefCode = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = 'FCL-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const nextStep = () => {
    if (!formData.fullName || !formData.mobileNumber || !formData.email) {
      setStatus({ type: 'error', message: 'Please enter your Full Name, Email, and Mobile Number.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (!formData.photoBase64) {
      setStatus({ type: 'error', message: 'Please upload your photo before continuing to payment.' });
      return;
    }
    
    // Auto-generate reference code if not set
    if (!formData.transactionId) {
      setFormData((prev) => ({ ...prev, transactionId: generateRefCode() }));
    }
    
    setStatus({ type: null, message: '' });
    setStep(2);
  };

  const prevStep = () => {
    setStatus({ type: null, message: '' });
    setStep(1);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(config.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.mobileNumber || !formData.email) {
      setStatus({ type: 'error', message: 'Please enter your Full Name, Email, and Mobile Number.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    if (!formData.photoBase64) {
      setStatus({ type: 'error', message: 'Please upload your photo before submitting.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    const finalTxId = formData.transactionId || generateRefCode();
    const payload = { ...formData, transactionId: finalTxId };

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setRegisteredPlayer({
          fullName: formData.fullName,
          email: formData.email,
          refId: finalTxId
        });
        setIsSubmitted(true);
        // Do NOT clear formData yet, we might need it, or we just rely on registeredPlayer
      } else {
        setStatus({ type: 'error', message: data.error || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to connect to the server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setPaymentStatus('pending');
    setFormData({
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
      transactionId: '',
      paymentScreenshot: ''
    });
    setRegisteredPlayer(null);
    setStatus({ type: null, message: '' });
  };

  const [config, setConfig] = useState({
    upiId: "evenzo@okaxis",
    payeeName: "JCI Premier League",
    regFee: "500"
  });
  const [ads, setAds] = useState([]);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (e) {
        console.error("Error fetching payment config:", e);
      }
    };
    const fetchAds = async () => {
      try {
        const res = await fetch('/api/ads');
        if (res.ok) {
          const data = await res.json();
          setAds(data.filter(a => a.active));
        }
      } catch (e) {
        console.error("Error fetching sponsors:", e);
      }
    };
    fetchConfig();
    fetchAds();
    
    // Detect iOS
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    }
  }, []);

  // UPI payment params string (reused in all intent URLs)
  const currentTxId = registeredPlayer?.refId || formData.transactionId || 'FCL Registration';
  const upiParams = `pa=${config.upiId}&pn=${encodeURIComponent(config.payeeName)}&am=${config.regFee}&cu=INR&tn=${encodeURIComponent(currentTxId)}&tr=${encodeURIComponent(currentTxId)}&mc=0000`;
  const upiUrl = `upi://pay?${upiParams}`;
  const qrCodeApi = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;

  // Android Intent URLs with explicit package names — bypasses WhatsApp interception
  const gpayIntent = `intent://pay?${upiParams}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
  const phonepeIntent = `intent://pay?${upiParams}#Intent;scheme=upi;package=com.phonepe.app;end`;
  const paytmIntent = `intent://pay?${upiParams}#Intent;scheme=upi;package=net.one97.paytm;end`;
  const genericIntent = `intent://pay?${upiParams}#Intent;scheme=upi;end`;

  // iOS standard URI schemes
  const gpayIos = `gpay://upi/pay?${upiParams}`;
  const phonepeIos = `phonepe://pay?${upiParams}`;
  const paytmIos = `paytmmp://pay?${upiParams}`;

  // Select the correct link based on OS
  const gpayLink = isIOS ? gpayIos : gpayIntent;
  const phonepeLink = isIOS ? phonepeIos : phonepeIntent;
  const paytmLink = isIOS ? paytmIos : paytmIntent;
  const genericLink = isIOS ? upiUrl : genericIntent;


  // Build sponsor list for sidebar/spotlight (merge fetched ads with fallback)
  const DEFAULT_SPONSORS = [
    { id: 'default-1', title: 'Decathlon Sports Tumkur', imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80', targetUrl: 'https://www.decathlon.in' },
    { id: 'default-2', title: 'Tumkur Cricket Academy', imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=800&q=80', targetUrl: '#' },
    { id: 'default-3', title: 'JCI Tumkur Metro', imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607be7e72?auto=format&fit=crop&w=800&q=80', targetUrl: '#' },
  ];
  const sponsorList = ads.length > 0 ? ads : DEFAULT_SPONSORS;

  return (
    <div className="register-layout">
      {/* Main form column */}
      <div className="register-main">
        {/* Mobile-only sponsor strip */}
        <div className="register-mobile-sponsors">
          <SponsorMarquee ads={ads} title="Powered By" />
        </div>

        <div className="premium-kk" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <div style={{ textAlign: 'center' }}>
          <h1 className="gold-gradient-text" style={{ fontSize: '28px', fontWeight: '800' }}>🏏 Player Registration</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Franchise Cricket League – Season Draft</p>
        </div>

        {status.type === 'success' && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-primary)' }}>
            <CheckCircle2 color="var(--success)" size={24} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '14px' }}>{status.message}</p>
          </div>
        )}

        {status.type === 'error' && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--text-primary)' }}>
            <AlertCircle color="var(--danger)" size={24} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '14px' }}>{status.message}</p>
          </div>
        )}

        {isSubmitted ? (
          paymentStatus === 'pending' ? (
            /* --- PREMIUM PAYMENT CHECKOUT SCREEN --- */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ textAlign: 'center' }}>
                <h2 className="gold-gradient-text" style={{ fontSize: '24px', fontWeight: '800' }}>Checkout</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>Complete your registration fee to secure your spot</p>
              </div>

              {/* System Generated Payment Reference ID */}
              <div style={{ background: 'rgba(6, 182, 212, 0.05)', border: '1px solid var(--accent-teal)', borderRadius: '10px', padding: '16px', textAlign: 'center', width: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-teal)' }}></div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Your Payment Reference ID
                </span>
                <p style={{ fontFamily: 'monospace', fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', margin: '4px 0 2px', letterSpacing: '1px' }}>
                  {registeredPlayer?.refId}
                </p>
                <span style={{ fontSize: '12px', color: 'var(--accent-teal)', display: 'block', marginTop: '4px' }}>
                  <strong>Important:</strong> This ID is linked to your profile.
                </span>
              </div>

              {/* UPI PAYMENT GATEWAY */}
              <div className="checkout-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', padding: '24px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--card-border)', borderRadius: '12px' }}>
                
                <p style={{ fontSize: '42px', fontWeight: '900', color: 'var(--accent-gold)', textShadow: '0 0 20px rgba(255, 183, 3, 0.2)' }}>
                  ₹{config.regFee}
                </p>

                {/* Option 1: Mobile Deep Links */}
                <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '20px', marginBottom: '4px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', marginBottom: '8px' }}>
                    Option 1: Pay Directly via App
                  </p>
                  
                  {isIOS ? (
                    <>
                      <a
                        href={upiUrl}
                        className="premium-button"
                        style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)', color: '#000', fontSize: '15px' }}
                      >
                        Open UPI App (GPay / PhonePe)
                      </a>
                      <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4px', lineHeight: '1.4' }}>
                        iOS will automatically open your default installed UPI app.
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href={gpayIntent} className="upi-app-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(66,133,244,0.15), rgba(66,133,244,0.05))', border: '1px solid rgba(66,133,244,0.4)', color: '#fff', fontWeight: '700', fontSize: '13px', textDecoration: 'none', flex: '1', justifyContent: 'center', minWidth: '120px' }}>
                          <span style={{ fontSize: '20px' }}>💳</span> GPay
                        </a>
                        <a href={phonepeIntent} className="upi-app-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(95,37,159,0.15), rgba(95,37,159,0.05))', border: '1px solid rgba(95,37,159,0.4)', color: '#fff', fontWeight: '700', fontSize: '13px', textDecoration: 'none', flex: '1', justifyContent: 'center', minWidth: '120px' }}>
                          <span style={{ fontSize: '20px' }}>📱</span> PhonePe
                        </a>
                      </div>
                      <a href={genericIntent} className="premium-button-secondary" style={{ padding: '10px', fontSize: '13px', marginTop: '4px', alignSelf: 'center', display: 'inline-flex', gap: '6px', width: '100%', justifyContent: 'center' }}>
                        <Smartphone size={16} /> Open Other UPI App
                      </a>
                    </>
                  )}
                </div>

                {/* Option 2: QR Code */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                    Option 2: Scan QR Code
                  </p>
                  <div className="upi-qr-frame" style={{ position: 'relative', padding: '16px', background: '#fff', borderRadius: '16px', boxShadow: '0 0 30px rgba(255, 183, 3, 0.15)' }}>
                    <img
                      src={qrCodeApi}
                      alt={`UPI QR`}
                      width={200}
                      height={200}
                      style={{ width: '200px', height: '200px', display: 'block' }}
                    />
                  </div>
                  <a href={qrCodeApi} download="FCL_Payment_QR.png" target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--accent-teal)', textDecoration: 'underline', marginTop: '4px' }}>
                    View & Download QR Code
                  </a>
                </div>

                {/* Option 3: Manual UPI ID */}
                <div style={{ width: '100%', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', marginBottom: '8px' }}>
                    Option 3: Pay via UPI ID
                  </p>
                  <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '12px 16px', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '15px', color: 'var(--accent-gold)' }}>{config.upiId}</span>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s ease' }}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Crucial UX element: The 'I Have Paid' Button */}
              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('completed')}
                  className="premium-button"
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px', background: 'linear-gradient(135deg, var(--success), #059669)', border: '1px solid #10b981', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                >
                  I have completed the payment <CheckCircle2 size={20} style={{ marginLeft: '8px' }} />
                </button>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '12px', lineHeight: '1.5' }}>
                  Click this button <strong>only after</strong> your payment is successful in your UPI app.
                </p>
              </div>
            </div>
          ) : (
            /* --- FINAL SUCCESS CONFIRMATION SCREEN --- */
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '30px 10px', animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              
              <div style={{ position: 'relative' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--success)', boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)' }}>
                  <CheckCircle2 size={56} color="var(--success)" />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)' }}>You're All Set!</h2>
                <p style={{ color: 'var(--success)', fontSize: '16px', fontWeight: '600' }}>
                  Payment logged successfully.
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
                  Thank you, <strong style={{ color: 'var(--text-primary)' }}>{registeredPlayer?.fullName}</strong>. Your player profile and transaction ID (<span style={{ color: 'var(--accent-teal)' }}>{registeredPlayer?.refId}</span>) have been securely saved.
                </p>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '8px' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
                    Our admin team will verify your payment against this ID shortly. You will receive an official confirmation at <strong>{registeredPlayer?.email}</strong> once approved.
                  </p>
                </div>
              </div>

              {/* Sponsor Spotlight on Success */}
              <div className="sponsor-spotlight" style={{ width: '100%', marginTop: '16px' }}>
                <div className="sponsor-spotlight-label">
                  <Award size={14} /> Brought to you by
                </div>
                <div className="sponsor-spotlight-grid">
                  {sponsorList.slice(0, 4).map((s) => (
                    <a key={s.id} href={s.targetUrl || '#'} target="_blank" rel="noopener noreferrer" className="sponsor-spotlight-card">
                      {s.imageUrl && <img src={s.imageUrl} alt={s.title} />}
                      <span>{s.title}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '12px' }}>
                <Link href="/" className="premium-button-secondary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  Back to Home
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="premium-button"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Register Another
                </button>
              </div>
            </div>
          )
        ) : (
          /* FORM FLOW */
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Full Name */}
                <div>
                  <label className="form-label">1. Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="premium-input"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="form-label">2. Mobile Number *</label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter 10-digit mobile number"
                    className="premium-input"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="form-label">3. Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="premium-input"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label className="form-label">4. Organization *</label>
                  <select
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="premium-select"
                  >
                    <option value="JCI Tumkur Metro">JCI Tumkur Metro</option>
                    <option value="JCOM">JCOM</option>
                    <option value="JAC">JAC</option>
                    <option value="Rotary Tumkur Prerana">Rotary Tumkur Prerana</option>
                  </select>
                </div>

                {/* Gender & Age Group in a 2-column layout */}
                <div className="grid-2-col">
                  <div>
                    <label className="form-label">5. Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="premium-select"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">6. Age Group *</label>
                    <select
                      name="ageGroup"
                      value={formData.ageGroup}
                      onChange={handleChange}
                      className="premium-select"
                    >
                      <option value="Below 25 Years">Below 25 Years</option>
                      <option value="25–40 Years">25–40 Years</option>
                      <option value="Above 40 Years">Above 40 Years</option>
                    </select>
                  </div>
                </div>

                {/* Jersey Size & Preferred Playing Role */}
                <div className="grid-2-col">
                  <div>
                    <label className="form-label">7. Jersey Size *</label>
                    <select
                      name="jerseySize"
                      value={formData.jerseySize}
                      onChange={handleChange}
                      className="premium-select"
                    >
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="XXXL">XXXL</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">8. Preferred Playing Role *</label>
                    <select
                      name="preferredRole"
                      value={formData.preferredRole}
                      onChange={handleChange}
                      className="premium-select"
                    >
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="All-Rounder">All-Rounder</option>
                      <option value="Wicketkeeper">Wicketkeeper</option>
                      <option value="Any Role">Any Role</option>
                    </select>
                  </div>
                </div>

                {/* Cricket Playing Experience */}
                <div>
                  <label className="form-label">9. Cricket Playing Experience *</label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="premium-select"
                  >
                    <option value="Beginner">Beginner – Play occasionally</option>
                    <option value="Intermediate">Intermediate – Play fairly regularly</option>
                    <option value="Experienced">Experienced – Have played tournaments</option>
                  </select>
                </div>

                {/* Upload Photo */}
                <div>
                  <label className="form-label">10. Upload Your Photo *</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '4px' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        background: 'rgba(7, 11, 25, 0.8)',
                        border: formData.photoBase64 ? '2px solid var(--success)' : '1px dashed var(--danger)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      {formData.photoBase64 ? (
                        <img src={formData.photoBase64} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Camera size={24} color="var(--text-secondary)" />
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <input
                        type="file"
                        accept="image/*"
                        id="photo-upload"
                        required
                        onChange={(e) => handleFileChange(e, 'photoBase64')}
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="photo-upload"
                        className="premium-button-secondary"
                        style={{ padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}
                      >
                        Choose Image
                      </label>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Required · Max file size: 2MB</span>
                    </div>
                  </div>
                </div>

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="premium-button"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
                >
                  {loading ? 'Submitting...' : 'Submit Profile & Pay'} <ArrowRight size={18} />
                </button>

              </form>
        )}

      </div>
      </div>

      {/* Desktop sponsor sidebar */}
      <aside className="register-sponsor-sidebar">
        <h3><Award size={13} /> Official Sponsors</h3>
        <div className="sponsor-sidebar-divider" />
        {sponsorList.map((s) => (
          <a key={s.id} href={s.targetUrl || '#'} target="_blank" rel="noopener noreferrer" className="sponsor-sidebar-item">
            {s.imageUrl && <img src={s.imageUrl} alt={s.title} />}
            <div>
              <span className="sponsor-name">{s.title}</span>
              <span className="sponsor-label"><ExternalLink size={9} /> Official Sponsor</span>
            </div>
          </a>
        ))}
        <div className="sponsor-sidebar-divider" />
        <p style={{ margin: 0, fontSize: '10px', color: '#708376', textAlign: 'center', lineHeight: '1.5' }}>
          Interested in sponsoring?<br />
          <a href="mailto:jcitumkurmetro@gmail.com" style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: 700 }}>Contact us →</a>
        </p>
      </aside>
    </div>
  );
}
