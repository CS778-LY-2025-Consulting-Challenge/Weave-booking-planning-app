'use client';

import ParallaxHero from '@/components/ParallaxHero';
import TripsSection from '@/components/TripsSection';
import TourPackagesCarousel from '@/components/TourPackagesCarousel';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Hotel,
  LayoutDashboard,
  Map,
  Package,
  Plane,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredDestScroll, setFeaturedDestScroll] = useState(0);
  const [satisfiedTravelers, setSatisfiedTravelers] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSatisfiedTravelers(0);
          const duration = 2000;
          const target = 100000;
          const increment = target / (duration / 16);
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setSatisfiedTravelers(target);
              clearInterval(timer);
            } else {
              setSatisfiedTravelers(Math.floor(current));
            }
          }, 16);

          return () => clearInterval(timer);
        } else {
          setSatisfiedTravelers(0);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);

  const featuredDestinations = [
    {
      id: 1,
      title: "SARDINIA'S SPECTACULAR SERENADE: 10 DAYS ON THE ITALIAN ISLAND",
      days: 14,
      nights: 9,
      price: 4680,
      gradientColor: "210 100% 50%",
      image:
        'https://images.unsplash.com/photo-1557207773-caf19e055e40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYXJkaW5pYSUyMGJlYWNoJTIwaXRhbHl8ZW58MXx8fHwxNzY1MzE3MTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    },
    {
      id: 2,
      title:
        "JAPAN'S GOLDEN ROUTE: TOKYO, KANAZAWA, KYOTO, AND FUJI IN 14 DAYS",
      days: 14,
      nights: 12,
      price: 8820,
      gradientColor: "30 100% 50%",
      image:
        'https://images.unsplash.com/photo-1542640244-7e672d6cef4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudCUyMGZ1amklMjBqYXBhbnxlbnwxfHx8fDE3NjQ1MjYyNjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 3,
      title: 'MEXICO CITY: A WEEK OF CULTURAL AND CULINARY MARVELS',
      days: 7,
      nights: 6,
      price: 2415,
      gradientColor: "25 100% 50%",
      image:
        'https://images.unsplash.com/photo-1518638150340-f706e86654de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwZm9vZCUyMHN0cmVldHxlbnwxfHx8fDE3NjQ1MzU0MzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 4,
      title:
        "THE MIGHTY MEKONG DELTA: VIETNAM'S FLOATING MARKETS AND HISTORIC RIVER VILLAGES",
      days: 8,
      nights: 7,
      price: 2863,
      gradientColor: "180 75% 45%",
      image:
        'https://images.unsplash.com/photo-1528127269322-539801943592?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtJTIwZmxvYXRpbmclMjBtYXJrZXR8ZW58MXx8fHwxNzY0NTM3MzExfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 5,
      title:
        "MÁLAGA, SEVILLE, AND THE COSTA DE LA LUZ: 11 DAYS IN SOUTHERN SPAIN'S ANDALUSIA",
      days: 11,
      nights: 10,
      price: 3880,
      gradientColor: "35 100% 45%",
      image:
        'https://images.unsplash.com/photo-1543783207-ec64e4d95325?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGFpbiUyMGFuZGFsdXNpYXxlbnwxfHx8fDE3NjQ1MzcyODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 6,
      title:
        "ICELAND'S RING ROAD: GLACIERS, WATERFALLS, AND NORTHERN LIGHTS IN 12 DAYS",
      days: 12,
      nights: 11,
      price: 5200,
      gradientColor: "200 80% 45%",
      image:
        'https://images.unsplash.com/photo-1504829857797-ddff29c27927?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VsYW5kJTIwd2F0ZXJmYWxsfGVufDF8fHx8MTc2NDUzNzMxMXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: 7,
      title: "PERU'S ANCIENT WONDERS: MACHU PICCHU, CUSCO, AND THE SACRED VALLEY",
      days: 10,
      nights: 9,
      price: 4250,
      gradientColor: "45 95% 50%",
      image:
        'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1080&q=80',
    },
    {
      id: 8,
      title: "CROATIA'S DALMATIAN COAST: DUBROVNIK, SPLIT, AND THE ISLANDS",
      days: 9,
      nights: 8,
      price: 3650,
      gradientColor: "195 85% 50%",
      image:
        'https://images.unsplash.com/photo-1555990538-c3d6bc49b65e?w=1080&q=80',
    },
    {
      id: 9,
      title: "NEW ZEALAND'S SOUTH ISLAND: ADVENTURE IN THE LAND OF MIDDLE-EARTH",
      days: 15,
      nights: 14,
      price: 6890,
      gradientColor: "150 75% 45%",
      image:
        'https://images.unsplash.com/photo-1469521669194-babb90587d26?w=1080&q=80',
    },
    {
      id: 10,
      title: "MOROCCO'S IMPERIAL CITIES: MARRAKECH, FES, AND THE SAHARA DESERT",
      days: 10,
      nights: 9,
      price: 3120,
      gradientColor: "25 85% 55%",
      image:
        'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1080&q=80',
    },
    {
      id: 11,
      title: "THAILAND'S TROPICAL PARADISE: BANGKOK, CHIANG MAI, AND PHUKET",
      days: 12,
      nights: 11,
      price: 3580,
      gradientColor: "340 80% 50%",
      image:
        'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1080&q=80',
    },
    {
      id: 12,
      title: "AUSTRALIA'S EAST COAST: SYDNEY, GREAT BARRIER REEF, AND WHITSUNDAYS",
      days: 16,
      nights: 15,
      price: 7450,
      gradientColor: "210 90% 50%",
      image:
        'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1080&q=80',
    },
    {
      id: 13,
      title: "NORWAY'S FJORDS: BERGEN, FLAM, AND THE SCENIC RAILWAYS",
      days: 8,
      nights: 7,
      price: 4980,
      gradientColor: "220 70% 50%",
      image:
        'https://images.unsplash.com/photo-1601439678777-b2d6b8c1f3b7?w=1080&q=80',
    },
    {
      id: 14,
      title: "PORTUGAL'S COASTAL CHARM: LISBON, PORTO, AND THE ALGARVE",
      days: 10,
      nights: 9,
      price: 3350,
      gradientColor: "40 85% 50%",
      image:
        'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1080&q=80',
    },
    {
      id: 15,
      title: "GREECE'S ISLAND HOPPING: SANTORINI, MYKONOS, AND CRETE",
      days: 13,
      nights: 12,
      price: 4750,
      gradientColor: "210 100% 60%",
      image:
        'https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?w=1080&q=80',
    },
    {
      id: 16,
      title: "SOUTH AFRICA'S GARDEN ROUTE: CAPE TOWN, SAFARI, AND WINE COUNTRY",
      days: 14,
      nights: 13,
      price: 5680,
      gradientColor: "15 90% 50%",
      image:
        'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=1080&q=80',
    },
    {
      id: 17,
      title: "BALI'S SPIRITUAL JOURNEY: TEMPLES, RICE TERRACES, AND BEACHES",
      days: 11,
      nights: 10,
      price: 3290,
      gradientColor: "150 85% 45%",
      image:
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1080&q=80',
    },
    {
      id: 18,
      title: "SWITZERLAND'S ALPINE ADVENTURE: ZURICH, LUCERNE, AND THE MATTERHORN",
      days: 9,
      nights: 8,
      price: 5890,
      gradientColor: "0 80% 50%",
      image:
        'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1080&q=80',
    },
    {
      id: 19,
      title: "EGYPT'S ANCIENT MYSTERIES: CAIRO, LUXOR, AND NILE CRUISE",
      days: 10,
      nights: 9,
      price: 3980,
      gradientColor: "40 75% 50%",
      image:
        'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=1080&q=80',
    },
    {
      id: 20,
      title: "PATAGONIA'S WILDERNESS: TORRES DEL PAINE AND GLACIERS",
      days: 12,
      nights: 11,
      price: 6250,
      gradientColor: "180 70% 45%",
      image:
        'https://images.unsplash.com/photo-1452827073306-6e6e661baf57?w=1080&q=80',
    },
    {
      id: 21,
      title: "INDIA'S GOLDEN TRIANGLE: DELHI, AGRA, AND JAIPUR",
      days: 8,
      nights: 7,
      price: 2890,
      gradientColor: "30 90% 55%",
      image:
        'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1080&q=80',
    },
    {
      id: 22,
      title: "SCOTLAND'S HIGHLANDS: EDINBURGH, LOCH NESS, AND ISLE OF SKYE",
      days: 9,
      nights: 8,
      price: 4120,
      gradientColor: "140 60% 45%",
      image:
        'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1080&q=80',
    },
    {
      id: 23,
      title: "COSTA RICA'S ECO ADVENTURE: RAINFORESTS, VOLCANOES, AND BEACHES",
      days: 11,
      nights: 10,
      price: 3750,
      gradientColor: "130 80% 45%",
      image:
        'https://images.unsplash.com/photo-1551880568-f3b3c7fc3b4b?w=1080&q=80',
    },
    {
      id: 24,
      title: "TURKEY'S CULTURAL CROSSROADS: ISTANBUL, CAPPADOCIA, AND EPHESUS",
      days: 10,
      nights: 9,
      price: 3450,
      gradientColor: "10 85% 50%",
      image:
        'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1080&q=80',
    },
  ];

  const trendingJourneys = [
    {
      id: 1,
      destination: 'Bali Adventure',
      season: 'Summer',
      duration: '10 Days',
      image:
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxpJTIwaW5kb25lc2lhfGVufDF8fHx8MTc2NDUzNzMxMXww&ixlib=rb-4.1.0&q=80&w=1080',
      review:
        'An incredible journey through temples, beaches, and rice terraces. Perfect blend of culture and relaxation.',
      author: 'Sarah M.',
    },
    {
      id: 2,
      destination: 'European Grand Tour',
      season: 'Spring',
      duration: '21 Days',
      image:
        'https://images.unsplash.com/photo-1745016176874-cd3ed3f5bfc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25kb24lMjBiaWclMjBiZW58ZW58MXx8fHwxNzY0NTIxNDQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
      review:
        'Visited 7 countries in 3 weeks. Every moment was magical, from Paris cafes to Roman ruins.',
      author: 'Mike R.',
    },
    {
      id: 3,
      destination: 'Mountain Trekking Nepal',
      season: 'Autumn',
      duration: '14 Days',
      image:
        'https://images.unsplash.com/photo-1669986480140-2c90b8edb443?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGFkdmVudHVyZSUyMHRyYXZlbHxlbnwxfHx8fDE3NjQ1MTI0ODB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      review:
        'Challenging but rewarding trek through the Himalayas. Views that will take your breath away.',
      author: 'Emma K.',
    },
  ];

  const destinations = [
    {
      id: 1,
      region: 'EUROPE',
      name: 'IRELAND',
      image:
        'https://images.unsplash.com/photo-1730234704977-673af287af21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpcmVsYW5kJTIwaG9yc2ViYWNrJTIwcmlkaW5nfGVufDF8fHx8MTc2NTMxODEyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      hasDiscover: false,
    },
    {
      id: 2,
      region: 'EUROPE',
      name: 'ICELAND',
      image:
        'https://images.unsplash.com/photo-1696198616864-52f644a7fb0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpY2VsYW5kJTIwd2F0ZXJmYWxsJTIwbmF0dXJlfGVufDF8fHx8MTc2NTMxODEyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      hasDiscover: false,
    },
    {
      id: 3,
      region: 'THE_USA',
      name: 'SAN FRANCISCO',
      image:
        'https://images.unsplash.com/photo-1576912656434-b1a36d08fb3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW4lMjBmcmFuY2lzY28lMjBjYWJsZSUyMGNhciUyMHN0cmVldHxlbnwxfHx8fDE3NjUzMTgxMjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      hasDiscover: true,
    },
    {
      id: 4,
      region: 'DENMARK',
      name: 'COPENHAGEN',
      image:
        'https://images.unsplash.com/photo-1634764046520-1dddfb634dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3BlbmhhZ2VuJTIwZGVubWFyayUyMGZvb2R8ZW58MXx8fHwxNzY1MzE4MTIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      hasDiscover: false,
    },
    {
      id: 5,
      region: 'MOROCCO',
      name: 'MARRAKESH',
      image:
        'https://images.unsplash.com/photo-1714576578629-6cf5459bcaf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXJyYWtlc2glMjBtb3JvY2NvJTIwcGFsYWNlJTIwZ2FyZGVufGVufDF8fHx8MTc2NTMxODEyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      hasDiscover: false,
    },
    {
      id: 6,
      region: 'ITALY',
      name: 'PUGLIA',
      image:
        'https://images.unsplash.com/photo-1599668166415-4bed7c012b23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdWdsaWElMjBpdGFseSUyMGNvYXN0YWwlMjBiZWFjaHxlbnwxfHx8fDE3NjUzMTgxMjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      hasDiscover: false,
    },
  ];

  const quickLinks = [
    {
      icon: Plane,
      label: 'Flight Booking',
      path: '/flights',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Hotel,
      label: 'Hotel Booking',
      path: '/hotels',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Package,
      label: 'Packages',
      path: '/packages',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Map,
      label: 'User Journeys',
      path: '/journeys',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
      color: 'from-green-500 to-green-600',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % trendingJourneys.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + trendingJourneys.length) % trendingJourneys.length
    );
  };

  const nextFeaturedDestSlide = () => {
    if (featuredDestScroll < destinations.length - 1) {
      setFeaturedDestScroll(featuredDestScroll + 1);
    }
  };

  const prevFeaturedDestSlide = () => {
    if (featuredDestScroll > 0) {
      setFeaturedDestScroll(featuredDestScroll - 1);
    }
  };

  return (
    <div className="pt-0">
      {/* Trips Section - First Screen */}
      <TripsSection />

      {/* Parallax Hero - Second Screen */}
      <ParallaxHero />

      {/* Your Journey Begins Here Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm tracking-[0.2em] text-gray-700 uppercase">
                YOUR JOURNEY BEGINS HERE.
              </p>
            </div>
            <div className="hidden h-px flex-1 bg-gray-400 md:block" />
            <div className="flex-1 text-right">
              <p className="text-sm tracking-[0.2em] text-gray-700 uppercase">
                CHOOSE YOUR FIRST STEP.
              </p>
            </div>
          </div>

          {/* Three Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1 - Sale */}
            <div
              className="group relative cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all duration-500 hover:shadow-2xl"
              onClick={() => router.push('/packages')}
            >
              <div className="relative aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1587395925079-4bfbb0488fa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBib29rcyUyMG1hZ2F6aW5lc3xlbnwxfHx8fDE3NjQ4MDY1NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Travel books and guides"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <p className="mb-3 text-xs tracking-[0.2em] text-white uppercase opacity-90">
                    TRAVEL WITH US
                  </p>
                  <h2 className="mb-6 text-5xl leading-none font-black tracking-tight text-white drop-shadow-lg md:text-6xl">
                    JOURNEYS
                  </h2>
                  <button className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-gray-900 transition-colors hover:bg-gray-100">
                    <span className="font-mono text-sm tracking-wider uppercase">
                      START PLANNING
                    </span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 - Stories */}
            <div
              className="group relative cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all duration-500 hover:shadow-2xl"
              onClick={() => router.push('/journeys')}
            >
              <div className="relative aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1493508994801-b87b8970d035?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXZlJTIwc3dpbW1pbmclMjBjZW5vdGV8ZW58MXx8fHwxNzY0ODA2NTUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Cave swimming adventure"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <p className="mb-3 text-xs tracking-[0.2em] text-white uppercase opacity-90">
                    READ
                  </p>
                  <h2 className="mb-6 text-5xl leading-none font-black tracking-tight text-white drop-shadow-lg md:text-6xl">
                    STORIES
                  </h2>
                  <button className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-gray-900 transition-colors hover:bg-gray-100">
                    <span className="font-mono text-sm tracking-wider uppercase">
                      FIND INSPIRATION
                    </span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3 - Journeys */}
            <div
              className="group relative cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all duration-500 hover:shadow-2xl"
              onClick={() => router.push('/packages')}
            >
              <div className="relative aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1515623959088-7617915baa1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjB0cmF2ZWwlMjBqb3VybmV5fGVufDF8fHx8MTc2NDc1MjIwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Adventure travel journey"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <p className="mb-3 text-xs tracking-[0.2em] text-white uppercase opacity-90">
                    AI POWERED
                  </p>
                  <h2 className="mb-6 text-5xl leading-none font-black tracking-tight text-white drop-shadow-lg md:text-6xl">
                    PLAN YOUR JOURNEY
                  </h2>
                  <button className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-gray-900 transition-colors hover:bg-gray-100">
                    <span className="font-mono text-sm tracking-wider uppercase">
                      TRY AI PLANNER
                    </span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Packages Carousel */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm tracking-[0.2em] text-gray-700 uppercase">
              FEATURED EXPERIENCES
            </p>
            <h2 className="font-[Abril_Fatface] text-4xl text-gray-900 md:text-5xl">
              Explore Our Best Packages
            </h2>
            <p className="mt-4 text-gray-600">
              Handpicked tour packages designed to showcase the world's most incredible destinations
            </p>
          </div>
        </div>
        <TourPackagesCarousel />
      </section>

      {/* Satisfied Travelers Section */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div ref={counterRef} className="text-center">
            <p className="text-2xl font-medium text-gray-800 md:text-3xl">
              Delivering memorable travel experiences to{' '}
              <span className="font-bold text-blue-600">
                ({satisfiedTravelers.toLocaleString()}+)
              </span>{' '}
              satisfied travelers.
            </p>
          </div>
        </div>
      </section>

      {/* 360° Content Promotion Advertisement */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1">
            <div className="relative overflow-hidden rounded-xl bg-white">
              <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:gap-12 md:p-12">
                {/* Left Content */}
                <div className="space-y-6">
                  <div className="inline-block rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-xs tracking-wider text-white uppercase">
                    Special Offer
                  </div>

                  <h2 className="font-[Abril_Fatface] text-4xl leading-tight md:text-5xl">
                    Share Your Journey,
                    <br />
                    Save on Your Next Trip
                  </h2>

                  <p className="text-lg leading-relaxed text-gray-700">
                    Book a package with us and capture your adventure in
                    stunning 360° photos and videos. Share your immersive travel
                    experiences with our community and unlock exclusive rewards.
                  </p>

                  <div className="flex items-center gap-4 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                      <span className="text-3xl text-white">30%</span>
                    </div>
                    <div>
                      <p className="mb-1 text-sm tracking-wider text-gray-600 uppercase">
                        Get Up To
                      </p>
                      <p
                        className="text-2xl text-gray-900"
                        style={{ fontWeight: '700' }}
                      >
                        Discount on Next Booking
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row">
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-sm tracking-wider text-white uppercase shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => router.push('/packages')}
                    >
                      Browse Packages
                      <ArrowRight className="size-5" />
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-8 py-4 text-sm tracking-wider text-gray-900 uppercase transition-all duration-300 hover:border-gray-400"
                      onClick={() => router.push('/journeys')}
                    >
                      View 360° Examples
                    </button>
                  </div>
                </div>

                {/* Right Visual */}
                <div className="relative">
                  <div className="relative aspect-square overflow-hidden rounded-xl shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                      alt="360 degree camera capturing travel"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Floating Badge */}
                    <div className="absolute right-6 bottom-6 left-6 rounded-lg bg-white/95 p-4 shadow-lg backdrop-blur-sm">
                      <p className="mb-1 text-xs tracking-wider text-gray-600 uppercase">
                        How It Works
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5 text-blue-600">✓</span>
                          <span>Book any package with Weave</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5 text-blue-600">✓</span>
                          <span>Capture 360° content during your trip</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5 text-blue-600">✓</span>
                          <span>Submit to our Community Journeys</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5 text-blue-600">✓</span>
                          <span>Receive 30% off your next booking</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Decorative Element */}
                  <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 opacity-40 blur-3xl" />
                  <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-40 blur-3xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending User Journeys */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-[Abril_Fatface] text-[40px]">
              Featured destinations
            </h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/destinations')}
                className="text-sm tracking-wider uppercase hover:underline"
              >
                VIEW ALL
              </button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-sm"
                  onClick={prevFeaturedDestSlide}
                  disabled={featuredDestScroll === 0}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  className="h-10 w-10 rounded-sm bg-black hover:bg-gray-800"
                  onClick={nextFeaturedDestSlide}
                  disabled={featuredDestScroll >= destinations.length - 5}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Horizontal Scrolling Cards */}
          <div className="overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${featuredDestScroll * (100 / 5)}%)`,
              }}
            >
              {destinations.map((destination) => (
                <div
                  key={destination.id}
                  className="group w-[calc(20%-12.8px)] min-w-[240px] flex-shrink-0 cursor-pointer"
                  onClick={() => router.push('/destinations')}
                >
                  {/* Image */}
                  <div className="relative mb-4 aspect-[3/4] overflow-hidden">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Region */}
                  <p className="mb-1 text-xs tracking-wider text-gray-600 uppercase">
                    {destination.region.replace('_', ' ')}
                  </p>

                  {/* Name */}
                  <h3 className="text-lg" style={{ fontWeight: '700' }}>
                    {destination.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}