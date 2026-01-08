'use client';

import { ReactNode, useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AIChat from './AIChat';
import { Toaster } from './ui/sonner';

export default function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {mounted && <Navbar />}
      <main className="flex-1">{children}</main>
      <Footer />
      <AIChat />
      <Toaster />
    </div>
  );
}