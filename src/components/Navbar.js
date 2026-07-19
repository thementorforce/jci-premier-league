'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/register', label: 'Player Register' },
    { href: '/teams', label: 'Teams' },
    { href: '/auction', label: 'Live Auction' },
    { href: '/admin', label: 'Console' },
  ];

  return (
    <header className="navbar">
      <Link href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '20px' }}>
        <span style={{ color: 'var(--accent-gold)' }}>FCL</span>
        <span style={{ fontSize: '12px', background: 'var(--accent-teal)', color: '#070b19', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tumkur</span>
      </Link>
      <nav>
        <ul className="nav-links">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link 
                  href={link.href} 
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
