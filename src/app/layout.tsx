import Providers from '@/components/Providers';
import { AuthProvider } from '@/context/AuthContext';
import type { Metadata } from 'next';
import './index.css';

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
    <html lang="en">
      <body>
        <AuthProvider>
          <Providers>{children}</Providers>
        </AuthProvider>
      </body>
    </html>
  );
}