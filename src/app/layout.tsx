import { ClerkProvider } from '@clerk/nextjs';
import Providers from '@/components/Providers';
import { StripeProvider } from '@/components/StripeProvider';
import { AuthProvider } from '@/context/AuthContext';
import { GlobalErrorHandler } from '@/components/GlobalErrorHandler';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
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
      <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
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
