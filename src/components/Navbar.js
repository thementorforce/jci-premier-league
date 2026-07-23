'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, Lock } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const cached = sessionStorage.getItem('fcl_admin_session');
    if (cached) {
      try {
        const { isAdmin: cachedAdmin, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setIsAdmin(cachedAdmin);
          return;
        }
      } catch {}
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('fcl_admin_token') : null;
    if (!token) {
      setIsAdmin(false);
      sessionStorage.setItem('fcl_admin_session', JSON.stringify({ isAdmin: false, timestamp: Date.now() }));
      return;
    }
    fetch('/api/auth/session', { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        const adminStatus = data?.authenticated && data?.user?.role === 'ADMIN';
        setIsAdmin(adminStatus);
        sessionStorage.setItem('fcl_admin_session', JSON.stringify({ isAdmin: adminStatus, timestamp: Date.now() }));
      })
      .catch(() => setIsAdmin(false));
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/register-player', label: 'Player Register' },
    { href: '/teams', label: 'Teams' },
    { href: '/auction', label: 'Live Auction' },
  ];

  const adminLink = isAdmin
    ? { href: '/admin', label: 'Console' }
    : { href: '/admin/login', label: 'Admin Login' };

  const renderLink = (link) => {
    const isActive = pathname === link.href || (link.href === '/admin' && pathname.startsWith('/admin') && pathname !== '/admin/login');
    return (
      <li key={link.href}>
        <Link
          href={link.href}
          className={`nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          {link.label}
        </Link>
      </li>
    );
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '20px' }}>
          <span style={{ color: 'var(--accent-gold)' }}>JPL</span>
          <span style={{ fontSize: '12px', background: 'var(--accent-teal)', color: '#070b19', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tumkur</span>
        </Link>

        <button
          type="button"
          className="nav-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav>
          <ul className="nav-links">
            {navLinks.map(renderLink)}
            <li>
              <Link
                href={adminLink.href}
                prefetch={false}
                className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {!isAdmin && <Lock size={12} />}
                {adminLink.label}
              </Link>
            </li>
          </ul>

          <ul className={`nav-links-mobile ${menuOpen ? 'open' : ''}`}>
            {navLinks.map(renderLink)}
            <li>
              <Link
                href={adminLink.href}
                prefetch={false}
                className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {!isAdmin && <Lock size={14} />}
                {adminLink.label}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
