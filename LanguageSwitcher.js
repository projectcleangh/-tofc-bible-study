import { Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata = {
  title: 'TOFC Bible Study',
  description: 'Tower of Faith Christian Centre — His Heart · Our Pursuit · Global Impact',
  manifest: undefined,
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1A0A0A',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cormorant.variable}>
      <body>{children}</body>
    </html>
  );
}
