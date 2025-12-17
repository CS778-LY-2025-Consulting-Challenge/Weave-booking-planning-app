'use client';

import { Badge } from '@/components/ui/badge';
import { Plane } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';

interface Destination {
  id: string;
  number: string;
  name: string;
  country: string;
  description: string;
  image: string;
}

export default function TrendingDestinations() {
  const router = useRouter();

  const destinations: Destination[] = [
    {
      id: 'koror',
      number: '01',
      name: 'Koror',
      country: 'Palau',
      description:
        'This tiny Pacific island paradise offers spectacular diving and vibrant culture – perfect for travellers seeking immersive escapes and aquatic adventures.',
      image:
        'https://images.unsplash.com/photo-1690649416378-1335211d5864?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JvciUyMHBhbGF1JTIwdHJvcGljYWwlMjBwYXJhZGlzZXxlbnwxfHx8fDE3NjQ3OTY2NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'kochi',
      number: '02',
      name: 'Kochi',
      country: 'Japan',
      description:
        'Known for cherry blossoms and delicious cuisine, Kochi offers a more relaxed, off-the-beaten-track slice of Japan for travellers looking for less hustle and bustle.',
      image:
        'https://images.unsplash.com/photo-1600592879378-c0bd39cb3646?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb2NoaSUyMGphcGFuJTIwY2hlcnJ5JTIwYmxvc3NvbXxlbnwxfHx8fDE3NjQ3OTY2NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'bilbao',
      number: '03',
      name: 'Bilbao',
      country: 'Spain',
      description:
        "This walkable artistic city, where medieval streets meet modernist architecture, is the perfect base for a culture-rich escapade to Spain's Basque Country.",
      image:
        'https://images.unsplash.com/photo-1654411975155-a8e99de1710a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWxiYW8lMjBzcGFpbiUyMG1vZGVybiUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjQ3OTY2NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'maldives',
      number: '04',
      name: 'Maldives',
      country: 'Maldives',
      description:
        'A tropical paradise featuring pristine beaches, crystal-clear waters, and luxurious overwater bungalows perfect for romantic getaways and diving adventures.',
      image:
        'https://images.unsplash.com/photo-1699019493395-8a1f0c7883a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHRyb3BpY2FsJTIwYmVhY2glMjByZXNvcnR8ZW58MXx8fHwxNzY0NzgxNTY3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'iceland',
      number: '05',
      name: 'Reykjavik',
      country: 'Iceland',
      description:
        'Experience dramatic landscapes, geothermal wonders, and the magical Northern Lights in this land of fire and ice, perfect for adventure seekers.',
      image:
        'https://images.unsplash.com/photo-1630316685886-5c134cb6d9f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VsYW5kJTIwbGFuZHNjYXBlJTIwbmF0dXJlfGVufDF8fHx8MTc2NDY5MzcxOHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 'cusco',
      number: '06',
      name: 'Cusco',
      country: 'Peru',
      description:
        'The gateway to Machu Picchu, this ancient Incan capital combines rich history, stunning mountain scenery, and vibrant local culture.',
      image:
        'https://images.unsplash.com/photo-1565983406260-16ea27f2fff9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJ1JTIwbWFjaHUlMjBwaWNjaHUlMjBtb3VudGFpbnN8ZW58MXx8fHwxNzY0Nzk2NjQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const handleDestinationClick = (id: string) => {
    router.push(`/destinations/${id}`);
  };

  const handleFlightClick = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    router.push(`/flights?destination=${name}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Video Background - Full Screen */}
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* YouTube Video Background */}
        <div className="absolute inset-0">
          <iframe
            className="absolute top-1/2 left-1/2 h-[56.25vw] min-h-full w-[177.77vh] min-w-full -translate-x-1/2 -translate-y-1/2"
            src="https://www.youtube.com/embed/LQuLAbG62vY?si=OINNSloSE4hmXHRy&start=17&autoplay=1&mute=1&loop=1&controls=0&playlist=LQuLAbG62vY&modestbranding=1&showinfo=0&rel=0"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            style={{ pointerEvents: 'none' }}
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />

        {/* Content Overlay */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="mb-4 text-white drop-shadow-lg">
              Trending Destinations
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-white/90 drop-shadow-md">
              Discover the world's most exciting destinations right now. From
              hidden gems to iconic landmarks, explore where travelers are
              heading this season.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => handleDestinationClick(destination.id)}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl">
                {/* Number Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                    <span>{destination.number}</span>
                  </div>
                </div>

                {/* Destination Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-cyan-400 text-black hover:bg-cyan-500">
                    Destination
                  </Badge>
                </div>

                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>

                {/* Content */}
                <div className="bg-white p-6">
                  <h3 className="mb-1 transition-colors group-hover:text-blue-600">
                    {destination.name}
                  </h3>
                  <p className="mb-4 text-gray-600">{destination.country}</p>
                  <p className="mb-6 text-sm leading-relaxed text-gray-700">
                    {destination.description}
                  </p>

                  {/* Flight Link */}
                  <button
                    onClick={(e) => handleFlightClick(e, destination.name)}
                    className="group/link flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-700"
                  >
                    <Plane className="size-4 transition-transform group-hover/link:translate-x-1" />
                    <span className="text-sm">
                      Flights to {destination.name}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}