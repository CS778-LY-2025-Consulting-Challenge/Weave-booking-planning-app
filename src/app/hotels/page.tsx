'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowRight,
  Award,
  Calendar,
  Car,
  ChevronRight,
  Clock,
  Coffee,
  Droplet,
  Dumbbell,
  Heart,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Utensils,
  Wifi,
  Wine,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { HotelSearch, HotelSearchParams } from '@/components/HotelSearch';
import { HotelResults } from '@/components/HotelResults';
import { HotelResult } from '@/types/hotel';
import { searchHotels } from '@/services/hotelService';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function HotelBooking() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [checkOut, setCheckOut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [guests, setGuests] = useState(2);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingCheckIn, setSelectingCheckIn] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Hotel search states
  const [searchResults, setSearchResults] = useState<HotelResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Scroll to results when search completes
  // Scroll to results when search completes
  useEffect(() => {
    if (hasSearched) {
      // Use setTimeout to ensure DOM is ready and ref is attached on first render
      const timer = setTimeout(() => {
        if (resultsRef.current) {
          // Calculate position with offset for sticky navbar (approx 100px)
          const yOffset = -20;
          const element = resultsRef.current;
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasSearched, isSearching, searchResults]);

  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (null | { day: number; date: Date; price: number; isWeekend: boolean })[] = [];
    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month with prices
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = currentDate.getDay();
      // Weekend prices are higher
      const basePrice = dayOfWeek === 5 || dayOfWeek === 6 ? 349 : 299;
      // Add some variation
      const priceVariation = Math.floor(Math.random() * 50) - 25;
      days.push({
        day,
        date: currentDate,
        price: basePrice + priceVariation,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays(currentMonth);

  const handleDateSelect = (dateStr: string) => {
    if (selectingCheckIn) {
      setCheckIn(dateStr);
      setSelectingCheckIn(false);
    } else {
      // Make sure checkout is after checkin
      if (new Date(dateStr) > new Date(checkIn)) {
        setCheckOut(dateStr);
        setShowCalendar(false);
        setSelectingCheckIn(true);
      } else {
        setCheckIn(dateStr);
        setSelectingCheckIn(false);
      }
    }
  };

  const isDateInRange = (dateStr: string) => {
    const date = new Date(dateStr);
    return date >= new Date(checkIn) && date <= new Date(checkOut);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Hotel search handler
  const handleHotelSearch = async (params: HotelSearchParams) => {
    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const results = await searchHotels(params);
      setSearchResults(results);

      if (results.length > 0) {
        toast.success(`Found ${results.length} hotels matching your criteria`);
      } else {
        toast.info('No hotels found for your search criteria');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search hotels';
      setSearchError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle hotel booking
  const handleHotelBooking = (hotel: HotelResult) => {
    toast.success(`Booking request for ${hotel.name} submitted!`);
    // In a real app, you would navigate to a booking confirmation page or open a booking modal
  };

  const experiences = [
    {
      title: 'Rooftop Pool & Bar',
      image:
        'https://images.unsplash.com/photo-1746475611952-1b12c680f3bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb2Z0b3AlMjBwb29sJTIwdmlld3xlbnwxfHx8fDE3NjQ2MjI5Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      description: 'Unwind with panoramic city views',
    },
    {
      title: 'Fine Dining',
      image:
        'https://images.unsplash.com/photo-1741852197045-cc35920a3aa0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJlc3RhdXJhbnQlMjBkaW5pbmd8ZW58MXx8fHwxNzY0NjIyOTc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      description: 'Culinary excellence by award-winning chefs',
    },
    {
      title: 'Luxury Spa',
      image:
        'https://images.unsplash.com/photo-1604161926875-bb58f9a0d81b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHNwYSUyMHdlbGxuZXNzfGVufDF8fHx8MTc2NDU5NjgzNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      description: 'Rejuvenate with world-class wellness treatments',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {/* S3 Video Background */}
        <video
          className="absolute top-1/2 left-1/2 h-full w-full object-cover -translate-x-1/2 -translate-y-1/2"
          src="https://d30mgvfwc9sz4j.cloudfront.net/hero-videos/hotels-hero.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8 text-white"
            >
              <h1 className="mb-4 text-5xl md:text-9xl" style={{ fontFamily: 'var(--font-bonheur-royale)' }} >Book Hotel's</h1>
              <p className="text-xl text-gray-200 md:text-3xl" style={{ fontFamily: 'var(--font-special-elite)' }}>
                Where contemporary design meets timeless elegance in the heart
                of the city.
              </p>
            </motion.div>

            {/* ...existing code... */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <HotelSearch onSearch={handleHotelSearch} isLoading={isSearching} />
              {/* ...existing code... */}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Hotel Search Results */}
      {hasSearched && (
        <motion.div
          ref={resultsRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white px-4 py-20 sm:px-6 lg:px-8 scroll-mt-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <div className="mb-6 flex items-center justify-center gap-2">
                <div className="h-px w-12 bg-black" />
                <p className="text-sm tracking-widest uppercase">
                  Accommodations
                </p>
                <div className="h-px w-12 bg-black" />
              </div>
              <h2 className="mb-6 text-4xl md:text-5xl">Rooms & Suites</h2>
              <p className="mx-auto max-w-3xl text-lg text-gray-600">
                Each room is a sanctuary of style and comfort, designed with
                meticulous attention to detail and premium finishes.
              </p>
            </div>
            <HotelResults
              hotels={searchResults}
              isLoading={isSearching}
              error={searchError}
              onViewDetails={(hotel) => {
                const params = new URLSearchParams({
                  checkIn: checkIn,
                  checkOut: checkOut,
                  guests: guests.toString(),
                  name: hotel.name,
                  location: hotel.city || hotel.location,
                });

                // Add SerpAPI fields if available
                if (hotel.property_token) {
                  params.append('property_token', hotel.property_token);
                }
                if (hotel.serpapi_property_details_link) {
                  params.append('details_link', hotel.serpapi_property_details_link);
                }

                router.push(`/hotels/${encodeURIComponent(hotel.id)}?${params.toString()}`);
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Introduction Section */}
      <div className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 flex items-center gap-2">
                <div className="h-px w-12 bg-black" />
                <p className="text-sm tracking-widest uppercase">Our Story</p>
              </div>
              <h2 className="mb-6 text-4xl md:text-5xl">
                A New Definition of Luxury
              </h2>
              <p className="mb-6 text-lg text-gray-600">
                Weave Hotel redefines contemporary luxury hospitality. Our
                boutique property combines cutting-edge design, personalized
                service, and a vibrant atmosphere to create an unforgettable
                experience for the modern traveler.
              </p>
              <p className="text-lg text-gray-600">
                From our curated art collection to our award-winning restaurant
                and rooftop bar, every detail has been thoughtfully designed to
                inspire and delight.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-125 overflow-hidden rounded-lg shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1761303411707-8be2deb33826?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3RlbCUyMGV4dGVyaW9yJTIwbmlnaHR8ZW58MXx8fHwxNzY0NjIyOTc5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Hotel Exterior"
                className="h-full w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Experiences Section */}
      <div className="bg-black px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-6 flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-white" />
              <p className="text-sm tracking-widest text-amber-400 uppercase">
                Indulge
              </p>
              <div className="h-px w-12 bg-white" />
            </div>
            <h2 className="mb-6 text-4xl md:text-5xl">Signature Experiences</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-300">
              Discover our collection of exceptional amenities and curated
              experiences
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                className="group cursor-pointer"
              >
                <div className="relative mb-4 h-80 overflow-hidden rounded-lg">
                  <img
                    src={exp.image}
                    alt={exp.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute right-0 bottom-0 left-0 p-6">
                    <h3 className="mb-2 text-2xl">{exp.title}</h3>
                    <p className="text-gray-300">{exp.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Amenities Grid */}
      <div className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl md:text-5xl">World-Class Amenities</h2>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { icon: Wifi, label: 'High-Speed WiFi' },
              { icon: Dumbbell, label: 'Fitness Center' },
              { icon: Coffee, label: 'All-Day Dining' },
              { icon: Wine, label: 'Rooftop Bar' },
              { icon: Droplet, label: 'Infinity Pool' },
              { icon: Car, label: 'Valet Parking' },
              { icon: Utensils, label: 'Room Service' },
              { icon: Heart, label: 'Spa & Wellness' },
            ].map((amenity, index) => (
              <motion.div
                key={amenity.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-black">
                  <amenity.icon className="size-8 text-white" />
                </div>
                <p className="text-sm">{amenity.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
