'use client';

import { motion } from 'motion/react';
import { DestinationCard } from '@/components/DestinationCard';

export default function TrendingDestinations() {
  const destinations = [
    {
      id: 'koror',
      location: 'Koror, Palau',
      flag: '🇵🇼',
      stats: 'Rock Islands, lagoon kayaking, world-class diving',
      themeColor: '195 75% 40%',
      imageUrl: '/images/koror.jpg',
      price: 4890,
      days: 8,
      nights: 7,
    },
    {
      id: 'kochi',
      location: 'Kochi, Japan.',
      flag: '🇯🇵',
      stats: 'Cherry blossoms, coastal towns, slow travel',
      themeColor: '330 70% 45%',
      imageUrl: '/images/kochi.jpg',
      price: 3720,
      days: 7,
      nights: 6,
    },
    {
      id: 'bilbao',
      location: 'Bilbao, Spain',
      flag: '🇪🇸',
      stats: 'Guggenheim, Basque cuisine, art + design',
      themeColor: '20 85% 45%',
      imageUrl: '/images/Bilbao.jpg',
      price: 3290,
      days: 6,
      nights: 5,
    },
    {
      id: 'maldives',
      location: 'Maldives',
      flag: '🇲🇻',
      stats: 'Overwater villas, coral reefs, sunset cruises',
      themeColor: '180 70% 35%',
      imageUrl: '/images/Maldives.jpg',
      price: 6990,
      days: 7,
      nights: 6,
    },
    {
      id: 'iceland',
      location: 'Reykjavik, Iceland',
      flag: '🇮🇸',
      stats: 'Northern lights, geothermal lagoons, glaciers',
      themeColor: '210 70% 40%',
      imageUrl: '/images/Reykjavik.jpg',
      price: 5480,
      days: 9,
      nights: 8,
    },
    {
      id: 'cusco',
      location: 'Cusco, Peru',
      flag: '🇵🇪',
      stats: 'Machu Picchu gateway, Incan heritage, Andes',
      themeColor: '35 85% 45%',
      imageUrl: '/images/Cusco.jpg',
      price: 4120,
      days: 8,
      nights: 7,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with S3 Video Background - Full Screen */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* S3 Video Background */}
        <video
          className="absolute top-1/2 left-1/2 h-full w-full object-cover -translate-x-1/2 -translate-y-1/2"
          src="https://d30mgvfwc9sz4j.cloudfront.net/hero-videos/destinations-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        {/* Content Overlay */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-4 text-white drop-shadow-lg md:text-9xl" style={{ fontFamily: 'var(--font-bonheur-royale)' }} >Trending Destinations</h1>
            <p className="mx-auto max-w-3x3 text-xl md:text-3xl text-white/90 drop-shadow-md" style={{ fontFamily: 'var(--font-special-elite)' }}>
              Discover the world's most exciting destinations right now.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Curated Destinations Grid */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#a20000]">
              Curated for 2026
            </p>
            <h2
              className="font-bold text-4xl text-[#a20000] md:text-5xl"
              style={{ fontFamily: 'var(--font-charm)' }}
            >
              Our Trending Destinations
            </h2>
            <p
              className="mt-4 font-bold text-2xl text-[#a20000]"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              Handpicked journeys with immersive culture, standout scenery, and signature experiences.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 justify-items-center">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                imageUrl={destination.imageUrl}
                location={destination.location}
                flag={destination.flag}
                stats={destination.stats}
                href={`/destinations/${destination.id}`}
                themeColor={destination.themeColor}
                price={destination.price}
                days={destination.days}
                nights={destination.nights}
              />
            ))}
          </div>
        </div>
      </section>
      {/* Footer is provided globally via Providers in layout */}
    </div>
  );
}