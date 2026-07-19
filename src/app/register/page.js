'use client';

import { useState, useEffect } from 'react';
import { Camera, CheckCircle2, AlertCircle, CreditCard, ArrowRight, ArrowLeft, Copy, Check } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
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

  const nextStep = () => {
    if (!formData.fullName || !formData.mobileNumber) {
      setStatus({ type: 'error', message: 'Please enter your Full Name and Mobile Number first.' });
      return;
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
    if (!formData.transactionId || formData.transactionId.length !== 12) {
      setStatus({ type: 'error', message: 'UPI UTR / Transaction Reference ID must be exactly 12 numeric digits.' });
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

      if (response.ok) {
        setStatus({ type: 'success', message: '🎉 Registration & payment submitted! Your profile is pending verification by the admin.' });
        setFormData({
          fullName: '',
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

  const upiUrl = `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.payeeName)}&am=${config.regFee}&cu=INR&tn=FCL%20Registration`;
  const qrCodeApi = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUrl)}`;

  const isUtrValid = formData.transactionId.length === 12 && /^\d+$/.test(formData.transactionId);

  return (
    <div style={{ maxWidth: '750px', margin: '40px auto', padding: '0 20px' }}>
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

            {/* Organization */}
            <div>
              <label className="form-label">3. Organization *</label>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">4. Gender *</label>
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
                <label className="form-label">5. Age Group *</label>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">6. Jersey Size *</label>
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
                <label className="form-label">7. Preferred Playing Role *</label>
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
              <label className="form-label">8. Cricket Playing Experience *</label>
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
              <label className="form-label">9. Upload Your Photo (Optional)</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '4px' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    background: 'rgba(7, 11, 25, 0.8)',
                    border: '1px dashed var(--card-border)',
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
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Max file size: 2MB</span>
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

              {/* QR Code */}
              <div style={{ background: 'white', padding: '12px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--accent-gold)' }}>
                <img src={qrCodeApi} alt="UPI QR Code" style={{ width: '150px', height: '150px' }} />
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
                  className="premium-button-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px', marginTop: '6px', alignSelf: 'center', display: 'inline-flex', gap: '6px' }}
                >
                  📱 Pay via UPI App
                </a>
              </div>
            </div>

            {/* UPI Reference ID */}
            <div>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>UPI Transaction Reference ID (UTR) *</span>
                {isUtrValid && <span style={{ color: 'var(--success)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Valid Format</span>}
              </label>
              <input
                type="text"
                name="transactionId"
                required
                maxLength="12"
                placeholder="Enter 12-digit transaction number"
                value={formData.transactionId}
                onChange={handleChange}
                className="premium-input"
                style={{ border: isUtrValid ? '1.5px solid var(--success)' : '1px solid rgba(0, 245, 212, 0.15)' }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>Please double-check and input the exact 12-digit UTR/Ref number from your payment receipt.</span>
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="form-label">Upload Payment Screenshot (Optional)</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '4px' }}>
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    background: 'rgba(7, 11, 25, 0.8)',
                    border: '1px dashed var(--card-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {formData.paymentScreenshot ? (
                    <img src={formData.paymentScreenshot} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Camera size={24} color="var(--text-secondary)" />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="screenshot-upload"
                    onChange={(e) => handleFileChange(e, 'paymentScreenshot')}
                    style={{ display: 'none' }}
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="premium-button-secondary"
                    style={{ padding: '8px 16px', fontSize: '14px', cursor: 'pointer' }}
                  >
                    Choose Image
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Max file size: 2MB</span>
                </div>
              </div>
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
                disabled={loading || !isUtrValid}
                className="premium-button"
                style={{ flex: '2', justifyContent: 'center', opacity: (!isUtrValid || loading) ? 0.7 : 1 }}
              >
                {loading ? 'Submitting...' : 'Complete Registration'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
