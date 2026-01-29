'use client';

import { Image360Viewer } from '@/components/Image360Viewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PanoramaPage() {
    const router = useRouter();

    return (
        <div className="relative h-screen w-full bg-black">
            {/* Back Button */}
            <div className="absolute top-8 left-8 z-50">
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="bg-white/10 text-white hover:bg-white/20 hover:text-white border-white/20 backdrop-blur-md gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            {/* 360 Viewer */}
            <Image360Viewer
                imageUrl="https://cloudflare1.360gigapixels.com/pano/milanrademakers/01906841_DSC-1437-Panorama-jpg/equirect_crop_3_1/6.jpg"
                width="100%"
                height="100vh"
            />

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-white text-sm">
                    Drag to look around • Scroll to zoom
                </div>
            </div>
        </div>
    );
}
