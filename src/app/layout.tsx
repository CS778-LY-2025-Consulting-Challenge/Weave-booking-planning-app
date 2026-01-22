import { ClerkProvider } from '@clerk/nextjs';
import Providers from '@/components/Providers';
import { StripeProvider } from '@/components/StripeProvider';
import { AuthProvider } from '@/context/AuthContext';
import { GlobalErrorHandler } from '@/components/GlobalErrorHandler';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter, Butterfly_Kids, Emilys_Candy, Knewave, Mystery_Quest, Charm } from 'next/font/google';
import './index.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const butterflyKids = Butterfly_Kids({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-butterfly-kids',
  display: 'swap',
});

const emilysCandy = Emilys_Candy({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-emilys-candy',
  display: 'swap',
});

const knewave = Knewave({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-knewave',
  display: 'swap',
});

const mysteryQuest = Mystery_Quest({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mystery-quest',
  display: 'swap',
});

const charm = Charm({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-charm',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Weave Travel Booking Prototype',
  description:
    'Your journey begins here. Plan, explore, and experience the world like never before.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${cormorant.variable} ${inter.variable} ${butterflyKids.variable} ${emilysCandy.variable} ${knewave.variable} ${mysteryQuest.variable} ${charm.variable}`}>
        <body suppressHydrationWarning className={inter.className}>
          <GlobalErrorHandler />
          <AuthProvider>
            <Providers>{children}</Providers>
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
