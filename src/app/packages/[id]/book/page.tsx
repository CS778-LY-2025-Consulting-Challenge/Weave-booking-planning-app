"use client";

import PackageBookingFlow from '@/components/PackageBookingFlow';
import { getPackageById } from '@/lib/packages';
import { useParams, useRouter } from 'next/navigation';

export default function PackageBookPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const pkg = getPackageById(id);

  if (!pkg) {
    router.push('/packages');
    return null;
  }

  return (
    <div className="pt-20 md:pt-24">
      <PackageBookingFlow pkg={pkg} />
    </div>
  );
}
