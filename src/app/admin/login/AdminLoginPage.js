'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, LogIn, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        // Store token in localStorage as fallback for Firebase cookie proxy issues
        if (data.token) {
          localStorage.setItem('fcl_admin_token', data.token);
        }
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container-sm">
      <div className="premium-card login-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="login-icon-wrap">
            <Lock size={28} color="var(--accent-teal)" />
          </div>
          <h1 className="gold-gradient-text page-title">Admin Login</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '6px' }}>
            Sign in to access the tournament console
          </p>
        </div>

        {error && (
          <div className="alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-stack">
          <div>
            <label className="form-label">Username</label>
            <input
              type="text"
              required
              autoComplete="username"
              placeholder="admin"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="premium-input"
            />
          </div>
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="premium-input"
            />
          </div>
          <button type="submit" disabled={loading} className="premium-button" style={{ width: '100%', justifyContent: 'center' }}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In to Console'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <Link href="/" style={{ color: 'var(--accent-teal)' }}>← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
