import "./globals.css";
import Link from 'next/link';
import AuctionToast from '@/components/AuctionToast';
import Navbar from '@/components/Navbar';

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
        <Navbar />

        <main style={{ minHeight: 'calc(100vh - 140px)' }}>
          {children}
        </main>

        <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--card-border)', padding: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>© {new Date().getFullYear()} Franchise Cricket League (FCL). All Rights Reserved.</p>
          <p style={{ marginTop: '8px', fontSize: '12px' }}>Created for JCI Tumkur Metro, JCOM, JAC, and Rotary Tumkur Prerana.</p>
        </footer>
        
        <AuctionToast />
      </body>
    </html>
  );
}
