'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Calendar,
  Camera,
  ChevronDown,
  Cloud,
  Compass,
  Filter,
  Heart,
  Map,
  MapPin,
  Sun,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Journeys() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<number[]>([]);

  const journeys = [
    {
      id: 1,
      title: 'Bali Adventure',
      author: 'Sarah M.',
      destination: 'Bali, Indonesia',
      season: 'Summer',
      weather: 'Sunny',
      duration: '10 Days',
      type: 'Adventure',
      image:
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxpJTIwaW5kb25lc2lhfGVufDF8fHx8MTc2NDUzNzMxMXww&ixlib=rb-4.1.0&q=80&w=1080',
      description:
        'An incredible journey through temples, beaches, and rice terraces. Perfect blend of culture and relaxation.',
      likes: 234,
    },
    {
      id: 2,
      title: 'European Grand Tour',
      author: 'Mike R.',
      destination: 'Multiple Cities, Europe',
      season: 'Spring',
      weather: 'Mild',
      duration: '21 Days',
      type: 'Culture',
      image:
        'https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2NDQ3MTg2NHww&ixlib=rb-4.1.0&q=80&w=1080',
      description:
        'Visited 7 countries in 3 weeks. Every moment was magical, from Paris cafes to Roman ruins.',
      likes: 456,
    },
    {
      id: 3,
      title: 'Mountain Trekking Nepal',
      author: 'Emma K.',
      destination: 'Himalayas, Nepal',
      season: 'Autumn',
      weather: 'Clear',
      duration: '14 Days',
      type: 'Adventure',
      image:
        'https://images.unsplash.com/photo-1669986480140-2c90b8edb443?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGFkdmVudHVyZSUyMHRyYXZlbHxlbnwxfHx8fDE3NjQ1MTI0ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description:
        'Challenging but rewarding trek through the Himalayas. Views that will take your breath away.',
      likes: 189,
    },
    {
      id: 4,
      title: 'Tokyo Food Tour',
      author: 'David L.',
      destination: 'Tokyo, Japan',
      season: 'Spring',
      weather: 'Mild',
      duration: '7 Days',
      type: 'Food & Culture',
      image:
        'https://images.unsplash.com/photo-1591194233688-dca69d406068?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGphcGFuJTIwY2l0eXxlbnwxfHx8fDE3NjQ1MjYyNjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description:
        "A culinary adventure through Tokyo's best restaurants, street food, and hidden gems.",
      likes: 312,
    },
    {
      id: 5,
      title: 'Greek Island Hopping',
      author: 'Lisa P.',
      destination: 'Greek Islands',
      season: 'Summer',
      weather: 'Sunny',
      duration: '12 Days',
      type: 'Beach & Relaxation',
      image:
        'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2V8ZW58MXx8fHwxNzY0NDIxNzYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description:
        'Explored 5 beautiful Greek islands. Crystal clear waters, stunning sunsets, amazing food.',
      likes: 278,
    },
    {
      id: 6,
      title: 'New York City Explorer',
      author: 'Tom W.',
      destination: 'New York, USA',
      season: 'Fall',
      weather: 'Cool',
      duration: '5 Days',
      type: 'City Break',
      image:
        'https://images.unsplash.com/photo-1543716091-a840c05249ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5b3JrJTIwY2l0eXxlbnwxfHx8fDE3NjQ1MjUyMTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description:
        'Fast-paced NYC adventure covering all major attractions, Broadway shows, and rooftop bars.',
      likes: 201,
    },
  ];

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const weatherIcons = {
    Sunny: Sun,
    Mild: Cloud,
    Clear: Sun,
    Cool: Cloud,
  };

  const scrollToJourneys = () => {
    document
      .getElementById('journeys-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO COVER SECTION */}
      <section className="relative flex h-screen items-center justify-center overflow-hidden">
        {/* Background Image with Parallax */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-pink-900/80" />
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920"
            alt="Travel background"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-10 text-white/20"
        >
          <Compass className="size-32" />
        </motion.div>

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-10 bottom-20 text-white/20"
        >
          <Camera className="size-24" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-20 mx-auto max-w-5xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="mb-6 inline-block"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-amber-400 opacity-50 blur-2xl" />
                <Map
                  className="relative size-20 text-white"
                  strokeWidth={1.5}
                />
              </div>
            </motion.div>

            <h1
              className="mb-6 text-7xl text-white md:text-8xl"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Community Journeys
            </h1>

            <p className="mx-auto mb-4 max-w-3xl text-2xl leading-relaxed text-white/90 md:text-3xl">
              Discover Real Stories from Real Travelers
            </p>

            <p className="mx-auto mb-12 max-w-2xl text-lg text-white/70 md:text-xl">
              Explore authentic travel experiences, get inspired by incredible
              adventures, and plan your next journey with insights from our
              global community
            </p>

            {/* Stats */}
            <div className="mb-12 flex flex-wrap justify-center gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div
                  className="mb-2 text-4xl text-white md:text-5xl"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  150+
                </div>
                <div className="text-sm tracking-wider text-white/70 uppercase">
                  Journeys
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div
                  className="mb-2 text-4xl text-white md:text-5xl"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  80+
                </div>
                <div className="text-sm tracking-wider text-white/70 uppercase">
                  Countries
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <div
                  className="mb-2 text-4xl text-white md:text-5xl"
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  10k+
                </div>
                <div className="text-sm tracking-wider text-white/70 uppercase">
                  Travelers
                </div>
              </motion.div>
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                size="lg"
                onClick={scrollToJourneys}
                className="rounded-full bg-white px-8 py-6 text-lg text-slate-900 shadow-2xl transition-all hover:scale-105 hover:bg-white/90 hover:shadow-white/20"
              >
                Explore Journeys
                <ChevronDown className="ml-2 size-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 cursor-pointer"
          onClick={scrollToJourneys}
        ></motion.div>

        {/* Decorative gradient overlay at bottom */}
        <div className="absolute right-0 bottom-0 left-0 z-10 h-32 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* JOURNEYS SECTION */}
      <section id="journeys-section" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2
              className="mb-4 text-5xl"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Featured Journeys
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Hand-picked adventures from our community of passionate travelers
            </p>
          </motion.div>

          <div className="flex gap-8">
            {/* Filters Sidebar - Desktop */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="hidden w-64 flex-shrink-0 lg:block"
            >
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Filter className="text-primary size-5" />
                    <h3 className="">Filters</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="mb-3 text-sm">Season</h4>
                      <div className="space-y-2">
                        {['Summer', 'Spring', 'Fall', 'Winter'].map(
                          (season) => (
                            <div
                              key={season}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox id={`season-${season}`} />
                              <Label
                                htmlFor={`season-${season}`}
                                className="cursor-pointer text-sm"
                              >
                                {season}
                              </Label>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 text-sm">Weather</h4>
                      <div className="space-y-2">
                        {['Sunny', 'Rainy', 'Mild', 'Cool'].map((weather) => (
                          <div
                            key={weather}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox id={`weather-${weather}`} />
                            <Label
                              htmlFor={`weather-${weather}`}
                              className="cursor-pointer text-sm"
                            >
                              {weather}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 text-sm">Trip Type</h4>
                      <div className="space-y-2">
                        {[
                          'Adventure',
                          'Beach & Relaxation',
                          'Culture',
                          'Food & Culture',
                          'Family',
                          'City Break',
                        ].map((type) => (
                          <div
                            key={type}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox id={`type-${type}`} />
                            <Label
                              htmlFor={`type-${type}`}
                              className="cursor-pointer text-sm"
                            >
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 text-sm">Duration</h4>
                      <div className="space-y-2">
                        {[
                          '< 1 week',
                          '1-2 weeks',
                          '2-3 weeks',
                          '> 3 weeks',
                        ].map((duration) => (
                          <div
                            key={duration}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox id={`duration-${duration}`} />
                            <Label
                              htmlFor={`duration-${duration}`}
                              className="cursor-pointer text-sm"
                            >
                              {duration}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button className="mt-6 w-full" variant="outline">
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mobile Filter Button */}
            <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="lg" className="shadow-lg">
                    <Filter className="mr-2 size-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <div>
                      <h4 className="mb-3 text-sm">Season</h4>
                      <div className="space-y-2">
                        {['Summer', 'Spring', 'Fall', 'Winter'].map(
                          (season) => (
                            <div
                              key={season}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox id={`mobile-season-${season}`} />
                              <Label
                                htmlFor={`mobile-season-${season}`}
                                className="cursor-pointer text-sm"
                              >
                                {season}
                              </Label>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 text-sm">Trip Type</h4>
                      <div className="space-y-2">
                        {[
                          'Adventure',
                          'Beach & Relaxation',
                          'Culture',
                          'Food & Culture',
                          'Family',
                        ].map((type) => (
                          <div
                            key={type}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox id={`mobile-type-${type}`} />
                            <Label
                              htmlFor={`mobile-type-${type}`}
                              className="cursor-pointer text-sm"
                            >
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Journey Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {journeys.map((journey, index) => {
                  const WeatherIcon =
                    weatherIcons[
                      journey.weather as keyof typeof weatherIcons
                    ] || Sun;
                  return (
                    <motion.div
                      key={journey.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="group h-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl">
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={journey.image}
                            alt={journey.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`absolute top-3 right-3 ${favorites.includes(journey.id) ? 'text-red-500' : 'text-white'} backdrop-blur-sm hover:bg-white/20`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(journey.id);
                            }}
                          >
                            <Heart
                              className={`size-5 ${favorites.includes(journey.id) ? 'fill-current' : ''}`}
                            />
                          </Button>
                          <div className="absolute right-3 bottom-3 left-3">
                            <h3
                              className="mb-1 text-2xl text-white"
                              style={{ fontFamily: 'Playfair Display, serif' }}
                            >
                              {journey.title}
                            </h3>
                            <p className="text-sm text-white/90">
                              by {journey.author}
                            </p>
                          </div>
                        </div>

                        <CardContent className="p-5">
                          <div className="mb-3 flex flex-wrap gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              <MapPin className="mr-1 size-3" />
                              {journey.destination}
                            </Badge>
                            <Badge variant="outline">
                              <Calendar className="mr-1 size-3" />
                              {journey.duration}
                            </Badge>
                            <Badge variant="outline">
                              <WeatherIcon className="mr-1 size-3" />
                              {journey.season}
                            </Badge>
                          </div>

                          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                            {journey.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Heart className="size-4" />
                              {journey.likes} likes
                            </div>
                            <Button
                              size="sm"
                              onClick={() =>
                                router.push(`/journeys/${journey.id}`)
                              }
                              className="transition-transform group-hover:scale-105"
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
