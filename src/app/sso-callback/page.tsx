"use client";

import { useEffect } from "react";

export default function SSOCallback() {
  useEffect(() => {
    // Redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-background">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
