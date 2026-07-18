'use client';

import { useState } from 'react';
import { Camera, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    organization: 'JCI Tumkur Metro',
    gender: 'Male',
    ageGroup: '25–40 Years',
    jerseySize: 'L',
    preferredRole: 'All-Rounder',
    experience: 'Intermediate',
    photoBase64: ''
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatus({ type: 'error', message: 'Photo size should be less than 2MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoBase64: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setStatus({ type: 'success', message: 'Registration successful! You are now added to the auction draft.' });
        // Reset form
        setFormData({
          fullName: '',
          mobileNumber: '',
          organization: 'JCI Tumkur Metro',
          gender: 'Male',
          ageGroup: '25–40 Years',
          jerseySize: 'L',
          preferredRole: 'All-Rounder',
          experience: 'Intermediate',
          photoBase64: ''
        });
      } else {
        setStatus({ type: 'error', message: data.error || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to connect to the server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', padding: '0 20px' }}>
      <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
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
                  onChange={handleFileChange}
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
            type="submit" 
            disabled={loading} 
            className="premium-button" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
          >
            {loading ? 'Submitting...' : 'Register Player'}
          </button>

        </form>
      </div>
    </div>
  );
}
