'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, CheckCircle2, AlertCircle, CreditCard, ArrowRight, ArrowLeft, Copy, Check } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
      if (file.size > 2 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'File size should be less than 2MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, [field]: reader.result });
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
        setStep(1);
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
    setRegisteredPlayer(null);
    setStatus({ type: null, message: '' });
  };

  const [config, setConfig] = useState({
    upiId: "evenzo@okaxis",
    payeeName: "JCI Premier League",
    regFee: "500"
  });

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
    fetchConfig();
  }, []);

  const upiUrl = `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.payeeName)}&am=${config.regFee}&cu=INR&tn=${encodeURIComponent(formData.transactionId || 'FCL Registration')}`;
  const qrCodeApi = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="page-container-sm">
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
          /* SUCCESS SCREEN */
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '10px 0' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--success)', boxShadow: 'var(--glow-success)' }}>
              <CheckCircle2 size={48} color="var(--success)" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h2 className="gold-gradient-text" style={{ fontSize: '24px', fontWeight: '800' }}>Registration Successful!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
                Thank you <strong style={{ color: 'var(--text-primary)' }}>{registeredPlayer?.fullName}</strong>, your player profile and payment details have been submitted successfully.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                A confirmation has been logged for <span style={{ color: 'var(--accent-teal)' }}>{registeredPlayer?.email}</span>. Our admin team will verify your transaction reference ID and approve your profile shortly.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '12px' }}>
              <Link href="/" className="premium-button-secondary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                Go to Home
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
        ) : (
          /* FORM FLOW */
          <>
            {/* Step Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', position: 'relative', marginBottom: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 1 ? 'var(--accent-gold)' : 'var(--bg-tertiary)', color: '#070b19', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>1</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Profile Details</span>
              </div>
              <div style={{ position: 'absolute', top: '16px', left: '10%', right: '10%', height: '2px', background: step === 2 ? 'var(--accent-gold)' : 'var(--bg-tertiary)', zIndex: 0 }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: step === 2 ? 'var(--accent-gold)' : 'var(--bg-tertiary)', color: step === 2 ? '#070b19' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>2</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>UPI Payment</span>
              </div>
            </div>

            {step === 1 ? (
              /* STEP 1: PLAYER PROFILE FORM */
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

                <button
                  type="button"
                  onClick={nextStep}
                  className="premium-button"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
                >
                  Continue to Payment <ArrowRight size={18} />
                </button>

              </div>
            ) : (
              /* STEP 2: UPI PAYMENT GATEWAY */
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div className="checkout-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-teal)' }}>
                    <CreditCard size={20} />
                    <span style={{ fontWeight: '700', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>League Registration Fee</span>
                  </div>
                  <p style={{ fontSize: '36px', fontWeight: '900', color: 'var(--text-primary)' }}>₹{config.regFee}</p>

                  {/* UPI QR Code */}
                  <div className="upi-qr-block">
                    <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Scan UPI QR Code
                    </p>
                    <div className="upi-qr-frame">
                      <img
                        src={qrCodeApi}
                        alt={`UPI QR for ${config.upiId}`}
                        width={200}
                        height={200}
                        style={{ width: '200px', height: '200px', display: 'block' }}
                      />
                    </div>
                    <p style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '16px', color: 'var(--accent-gold)' }}>
                      {config.upiId}
                    </p>
                  </div>

                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Scan QR Code with GPay, PhonePe, or Paytm</span>

                    {/* Copyable UPI Box */}
                    <div style={{ display: 'flex', background: 'rgba(3, 7, 18, 0.6)', border: '1px solid var(--card-border)', borderRadius: '10px', padding: '8px 12px', alignItems: 'center', justifyContent: 'space-between', margin: '4px 0' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '14px', color: 'var(--accent-gold)' }}>{config.upiId}</span>
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--success)' : 'var(--text-secondary)' }}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>

                    {/* Mobile Pay deep link button */}
                    <a
                      href={upiUrl}
                      className="premium-button-secondary mobile-only"
                      style={{ padding: '8px 16px', fontSize: '13px', marginTop: '6px', alignSelf: 'center', display: 'inline-flex', gap: '6px' }}
                    >
                      📱 Pay via UPI App
                    </a>
                  </div>
                </div>

                {/* System Generated Payment Reference ID */}
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-teal)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Your Payment Reference ID
                  </span>
                  <p style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: '800', color: 'var(--accent-teal)', margin: '4px 0 2px' }}>
                    {formData.transactionId}
                  </p>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>
                    This reference ID is automatically saved with your registration profile for payment verification.
                  </span>
                </div>

                {/* Form buttons */}
                <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={prevStep}
                    className="premium-button-secondary"
                    style={{ flex: '1', justifyContent: 'center' }}
                  >
                    <ArrowLeft size={18} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="premium-button"
                    style={{ flex: '2', justifyContent: 'center' }}
                  >
                    {loading ? 'Submitting...' : 'I Have Completed Payment'}
                  </button>
                </div>

              </form>
            )}
          </>
        )}

      </div>
    </div>
  );
}
