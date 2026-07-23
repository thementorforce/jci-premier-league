import "./globals.css";
import { Outfit } from 'next/font/google';
import AuctionToast from '@/components/AuctionToast';
import Navbar from '@/components/Navbar';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata = {
  title: "Franchise Cricket League (FCL) - Tumkur",
  description: "Register, bid, and track your favorite players in the premium small-town franchise cricket league.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <Navbar />
        <main style={{ minHeight: 'calc(100vh - 100px)' }}>
          {children}
        </main>
        <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--card-border)', padding: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <p>© {new Date().getFullYear()} Franchise Cricket League (FCL). All Rights Reserved.</p>
          <p style={{ marginTop: '8px', fontSize: '12px' }}>This website is powered by <strong style={{ fontSize: '14px' }}> The Mentor Force and Evenzo</strong>.</p>
        </footer>
        <AuctionToast />
      </body>
    </html>
  );
}
