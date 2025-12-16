'use client';

import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AIChat from './AIChat';
import { Toaster } from './ui/sonner';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AIChat />
      <Toaster />
    </div>
  );
}