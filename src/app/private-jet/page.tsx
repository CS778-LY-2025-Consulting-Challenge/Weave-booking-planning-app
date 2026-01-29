'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivateJetPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the private jet site served from public folder
    window.location.href = '/private-jet/index.html';
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg">Loading Private Jet Experience...</p>
      </div>
    </div>
  );
}
