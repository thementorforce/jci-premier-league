import "./globals.css";
import Link from 'next/link';

export const metadata = {
  title: "Franchise Cricket League (FCL) - Tumkur",
  description: "Register, bid, and track your favorite players in the premium small-town franchise cricket league.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <header className="navbar">
          <Link href="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '20px' }}>
            <span style={{ color: 'var(--accent-gold)' }}>🏏 FCL</span>
            <span style={{ fontSize: '12px', background: 'var(--accent-teal)', color: '#070b19', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tumkur</span>
          </Link>
          <nav>
            <ul className="nav-links">
              <li><Link href="/" className="nav-link">Home</Link></li>
              <li><Link href="/register" className="nav-link">Player Register</Link></li>
              <li><Link href="/teams" className="nav-link">Teams</Link></li>
              <li><Link href="/auction" className="nav-link">Live Auction</Link></li>
              <li><Link href="/admin" className="nav-link">Console</Link></li>
            </ul>
          </nav>
        </header>

        <main style={{ minHeight: 'calc(100vh - 140px)' }}>
          {children}
        </main>

        <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--card-border)', padding: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>© {new Date().getFullYear()} Franchise Cricket League (FCL). All Rights Reserved.</p>
          <p style={{ marginTop: '8px', fontSize: '12px' }}>Created for JCI Tumkur Metro, JCOM, JAC, and Rotary Tumkur Prerana.</p>
        </footer>
      </body>
    </html>
  );
}
