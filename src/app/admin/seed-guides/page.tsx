'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addGuideProfile } from '@/lib/guides';

export default function SeedGuidesPage() {
    const [status, setStatus] = useState('Idle');

    const guidesToSeed = [
        {
            fullName: 'Yuki Tanaka',
            country: 'Japan',
            city: 'Kyoto',
            specialties: 'History, Tea Ceremonies, Temples',
            image: 'https://images.unsplash.com/photo-1567324393666-j3e1c45d3e23?auto=format&fit=crop&q=80',
            video: 'https://d30mgvfwc9sz4j.cloudfront.net/hero-videos/guides-hero.mp4',
            hourlyRate: 65,
            rating: 4.9,
            reviews: 124,
            bio: 'Kyoto native passionate about sharing the hidden history of our ancient capital.',
            languages: ['English', 'Japanese'],
            verified: true,
            featured: true,
            tagline: 'Experience ancient Kyoto'
        },
        {
            fullName: 'Marco Rossi',
            country: 'Italy',
            city: 'Rome',
            specialties: 'Food tours, Roman History, Hidden Gems',
            image: 'https://images.unsplash.com/photo-1588665796280-97eb3d445300?auto=format&fit=crop&q=80',
            video: 'https://d30mgvfwc9sz4j.cloudfront.net/hero-videos/guides-hero.mp4',
            hourlyRate: 75,
            rating: 5.0,
            reviews: 210,
            bio: 'Chef turned guide. I will show you the Rome that tourists never see.',
            languages: ['English', 'Italian', 'Spanish'],
            verified: true,
            featured: true,
            tagline: 'Taste the real Rome'
        },
        {
            fullName: 'Sofia Martinez',
            country: 'Spain',
            city: 'Barcelona',
            specialties: 'Architecture, Gaudi, Tapas',
            image: 'https://images.unsplash.com/photo-1563236024-e737c3856277?auto=format&fit=crop&q=80',
            video: 'https://d30mgvfwc9sz4j.cloudfront.net/hero-videos/guides-hero.mp4',
            hourlyRate: 60,
            rating: 4.8,
            reviews: 89,
            bio: 'Art historian loving life in Barcelona. Let’s explore beautiful streets together.',
            languages: ['English', 'Spanish', 'Catalan'],
            verified: true,
            featured: true,
            tagline: 'Gaudi & Gastronomy'
        },
        {
            fullName: 'Amara Ndiaye',
            country: 'Senegal',
            city: 'Dakar',
            specialties: 'Music, Culture, History',
            image: 'https://images.unsplash.com/photo-1596482186711-2b1095b9d3e4?auto=format&fit=crop&q=80',
            video: 'https://d30mgvfwc9sz4j.cloudfront.net/hero-videos/guides-hero.mp4',
            hourlyRate: 55,
            rating: 5.0,
            reviews: 42,
            bio: 'Your gateway to the vibrant culture of Dakar. From markets to music scenes.',
            languages: ['English', 'French', 'Wolof'],
            verified: true,
            featured: true,
            tagline: 'Vibrant Dakar Vibes'
        },
        {
            fullName: 'Liam O’Connor',
            country: 'Ireland',
            city: 'Dublin',
            specialties: 'Pubs, Folklore, Literary Tours',
            image: 'https://images.unsplash.com/photo-1541603893373-cffbf9311c62?auto=format&fit=crop&q=80',
            video: 'https://d30mgvfwc9sz4j.cloudfront.net/hero-videos/guides-hero.mp4',
            hourlyRate: 60,
            rating: 4.9,
            reviews: 156,
            bio: 'Storyteller at heart. Explore Dublin’s rich history and even richer pubs.',
            languages: ['English', 'Irish'],
            verified: true,
            featured: true,
            tagline: 'Tales of Dublin'
        }
    ];

    const handleSeed = async () => {
        setStatus('Seeding...');
        try {
            for (const guide of guidesToSeed) {
                await addGuideProfile({
                    ...guide,
                    email: 'guide@example.com',
                    phone: '',
                    yearsOfExperience: '5+',
                    whyGuide: 'Love meeting people',
                    createdAt: new Date().toISOString(),
                    status: 'approved'
                });
            }
            setStatus('Done! Added 5 promoted guides.');
        } catch (e: any) {
            console.error(e);
            setStatus('Error: ' + e.message);
        }
    };

    const handleDeleteSeeded = async () => {
        setStatus('Deleting seeded guides...');
        try {
            const { getAllGuides, removeGuideProfile } = await import('@/lib/guides');
            const guides = await getAllGuides();
            const namesToDelete = [
                'Yuki Tanaka',
                'Marco Rossi',
                'Sofia Martinez',
                'Amara Ndiaye',
                'Liam O’Connor'
            ];

            let count = 0;
            for (const [id, guide] of Object.entries(guides)) {
                if (guide.fullName && namesToDelete.includes(guide.fullName)) {
                    await removeGuideProfile(id);
                    count++;
                }
            }
            setStatus(`Deleted ${count} seeded guides.`);
        } catch (e: any) {
            console.error(e);
            setStatus('Error deleting: ' + e.message);
        }
    };

    return (
        <div className="p-20">
            <h1 className="text-2xl font-bold mb-4">Seed Famous Guides</h1>
            <Button onClick={handleSeed} disabled={status === 'Seeding...'}>
                {status === 'Seeding...' ? 'Adding...' : 'Add Featured Guides'}
            </Button>
            <div className="mt-4">
                <Button variant="destructive" onClick={handleDeleteSeeded} disabled={status.startsWith('Deleting')}>
                    Delete Seeded Guides
                </Button>
            </div>
            <p className="mt-4">{status}</p>
        </div>
    );
}
