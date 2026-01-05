"use client";

import timePreciousImage from '@/images/2.png';
import heroImage from '@/images/3.jpg';
import circleImage from '@/images/1.webp';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  BadgeCheck,
  ChevronDown,
  Clock,
  Globe,
  MessageCircle,
  Phone,
  Search,
  Send,
  Video,
  Video as VideoIcon,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { GuideBookingDialog } from '@/components/GuideBookingDialog';
import { VideoCallModal } from '@/components/VideoCallModal';

interface Guide {
  id: number;
  name: string;
  country: string;
  rating: number;
  reviews: number;
  languages: string[];
  specialties: string[];
  hourlyRate: number;
  image: string;
  video: string;
  verified: boolean;
  responseTime: string;
  featured?: boolean;
  tagline?: string;
}

interface Message {
  id: number;
  sender: 'user' | 'guide';
  text: string;
  timestamp: Date;
}

export default function Guides() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [freeTimeRemaining, setFreeTimeRemaining] = useState(300);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState(false);
  const [callType, setCallType] = useState<'none' | 'voice' | 'video'>('none');
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Booking state
  const [bookingGuide, setBookingGuide] = useState<Guide | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<{
    guide: Guide;
    date: Date;
    timeSlot: string;
    fullName: string;
    email: string;
    notes: string;
  } | null>(null);

  const popularLocations = [
    'Tokyo',
    'Paris',
    'New York',
    'Barcelona',
    'Dubai',
    'Rome',
  ];

  // Auto-rotate popular locations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLocationIndex((prev) => (prev + 1) % popularLocations.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    if (!carouselRef.current || isCarouselHovered) return;

    const scrollContainer = carouselRef.current;
    let scrollInterval: NodeJS.Timeout;

    scrollInterval = setInterval(() => {
      if (scrollContainer) {
        const maxScroll =
          scrollContainer.scrollWidth - scrollContainer.clientWidth;
        const currentScroll = scrollContainer.scrollLeft;

        if (currentScroll >= maxScroll) {
          // Reset to start for infinite loop
          scrollContainer.scrollLeft = 0;
        } else {
          // Smooth scroll by 1 pixel
          scrollContainer.scrollLeft += 1;
        }
      }
    }, 20);

    return () => clearInterval(scrollInterval);
  }, [isCarouselHovered]);

  const guides: Guide[] = [
    {
      id: 1,
      name: 'Andrea',
      country: 'Italy',
      rating: 4.9,
      reviews: 243,
      languages: ['English', 'German', 'French'],
      specialties: ['History', 'Architecture', 'Nightlife'],
      hourlyRate: 35,
      image: '/images/andrea.jpg',
      video: '/images/andrea-1.mp4',
      verified: true,
      responseTime: '5 min',
      featured: true,
      tagline: 'Discover the hidden gems of Rome.',
    },
    {
      id: 2,
      name: 'Thanh',
      country: 'Vietnam',
      rating: 5.0,
      reviews: 189,
      languages: ['English', 'Japanese'],
      specialties: ['Culture', 'Food', 'Temples'],
      hourlyRate: 40,
      image: '/images/thanh.jpg',
      video: '/images/thanh-1.mp4',
      verified: true,
      responseTime: '10 min',
      featured: true,
      tagline: 'Experience the vibrant culture of Ho Chi Minh City.',
    },
    {
      id: 3,
      name: 'Lucas',
      country: 'Argentina',
      rating: 4.8,
      reviews: 312,
      languages: ['English', 'Italian', 'Spanish'],
      specialties: ['History', 'Art', 'Cuisine'],
      hourlyRate: 38,
      image: '/images/lucas.jpg',
      video: '/images/lucas-1.mp4',
      verified: true,
      featured: true,
      responseTime: '3 min',
      tagline: 'Custom art experiences in Buenos Aires.',
    },
    {
      id: 4,
      name: 'Venese',
      country: 'Japan',
      rating: 4.9,
      reviews: 278,
      languages: ['English', 'French', 'German'],
      specialties: ['Art', 'Fashion', 'Wine'],
      hourlyRate: 42,
      image: '/images/venese.jpg',
      video: '/images/venese-1.mp4',
      verified: true, 
      featured: true,
      responseTime: '8 min',
      tagline: 'Tokyo’s fashion and art insider.',
    },
    {
      id: 5,
      name: 'Tiago',
      country: 'Portugal',
      rating: 4.7,
      reviews: 156,
      languages: ['English', 'Spanish', 'Catalan'],
      specialties: ['Architecture', 'Beaches', 'Tapas'],
      hourlyRate: 30,
      image: '/images/tiago.jpg',
      video: '/images/tiago-1.mp4',
      verified: true,
      featured: true,
      responseTime: '12 min',
      tagline: 'Explore Lisbon’s stunning architecture and coastal beauty.',
    },
    {
      id: 6,
      name: 'June',
      country: 'Thailand',
      rating: 4.8,
      reviews: 201,
      languages: ['English', 'Hindi', 'Marathi'],
      specialties: ['Culture', 'Food', 'Markets'],
      hourlyRate: 25,
      image: '/images/june.jpg',
      video: '/images/june-4.mp4',
      verified: true,
      responseTime: '6 min',
      featured: true,
      tagline: 'Discover the vibrant culture of Bangkok.',
    },
    {
      id: 7,
      name: 'Gunnar',
      country: 'Iceland',
      rating: 4.9,
      reviews: 334,
      languages: ['English', 'Spanish'],
      specialties: ['Museums', 'Food', 'Broadway'],
      hourlyRate: 45,
      image: '/images/gunnar.jpg',
      video: '/images/gunnar-3.mp4',
      verified: true,
      featured: true,
      responseTime: '4 min',
      tagline: "Experience Iceland's natural wonders with a local expert.",
    },
    {
      id: 8,
      name: 'Denise & Rob',
      country: 'Tanzania',
      rating: 5.0,
      reviews: 267,
      languages: ['English', 'French'],
      specialties: ['History', 'Pubs', 'Royal Sites'],
      hourlyRate: 40,
      image: '/images/denis.jpg',
      video: '/images/denise-3.mp4',
      verified: true,
      featured: true,
      responseTime: '7 min',
      tagline: 'Safari adventures with local wildlife experts.',
    },
    {
      id: 9,
      name: 'Cris',
      country: 'Brazil',
      rating: 4.9,
      reviews: 215,
      languages: ['English', 'Portuguese', 'Spanish'],
      specialties: ['Wine', 'Coastal Towns', 'Food'],
      hourlyRate: 32,
      image: '/images/cris.jpg',
      video: '/images/cris-2.mp4',
      verified: true,
      responseTime: '9 min',
      featured: true,
      tagline: "Discover Brazil's hidden gems.",
    },
    {
      id: 10,
      name: 'Zoloo',
      country: 'Mongolia',
      rating: 4.8,
      reviews: 198,
      languages: ['English', 'Thai', 'Mandarin'],
      specialties: ['Temples', 'Street Food', 'Night Markets'],
      hourlyRate: 28,
      image: '/images/zoloo.jpg',
      video: '/images/zoloo-1.mp4',
      verified: true,
      featured: true,
      responseTime: '11 min',
      tagline: 'Explore the wonders of Mongolia with a local guide.',
    },
  ];

  const filteredGuides = guides.filter((guide) => {
    const matchesSearch =
      searchQuery === '' ||
      guide.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const featuredGuides = filteredGuides.filter((g) => g.featured);
  const regularGuides = filteredGuides.filter((g) => !g.featured);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (chatOpen && !isPaid && freeTimeRemaining > 0) {
      timer = setInterval(() => {
        setFreeTimeRemaining((prev) => {
          if (prev <= 1) {
            setShowPaymentPrompt(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [chatOpen, isPaid, freeTimeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && (isPaid || freeTimeRemaining > 0)) {
      const message: Message = {
        id: messages.length + 1,
        sender: 'user',
        text: newMessage,
        timestamp: new Date(),
      };
      setMessages([...messages, message]);
      setNewMessage('');

      setTimeout(() => {
        const response: Message = {
          id: messages.length + 2,
          sender: 'guide',
          text: "Thanks for your message! I'd be happy to help you with that.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, response]);
      }, 1000);
    }
  };

  const handlePayment = () => {
    setIsPaid(true);
    setShowPaymentPrompt(false);
  };

  const openChat = (guide: Guide) => {
    setSelectedGuide(guide);
    setChatOpen(true);
    setMessages([
      {
        id: 1,
        sender: 'guide',
        text: `Hi! I'm ${guide.name}. How can I help you explore ${guide.country}?`,
        timestamp: new Date(),
      },
    ]);
    setFreeTimeRemaining(300);
    setIsPaid(false);
    setCallType('none');
  };

  const closeChat = () => {
    setChatOpen(false);
    setSelectedGuide(null);
    setMessages([]);
    setShowPaymentPrompt(false);
  };

  const startCall = (type: 'voice' | 'video') => {
    if (isPaid || freeTimeRemaining > 0) {
      setCallType(type);
    } else {
      setShowPaymentPrompt(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic handled by filteredGuides
  };

  const handleBookAppointment = (guide: Guide) => {
    setBookingGuide(guide);
    setBookingDialogOpen(true);
  };

  const handleBookingConfirmed = (booking: any) => {
    setCurrentBooking(booking);
    setBookingDialogOpen(false);
    // Open video call modal after a brief delay to ensure dialog closes smoothly
    setTimeout(() => {
      setVideoCallOpen(true);
    }, 500);
  };

  const handleVideoCallClose = () => {
    setVideoCallOpen(false);
    setCurrentBooking(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Centered Container with Full Video Background */}
      <section className="flex min-h-screen items-center justify-center px-4 pt-29 pb-10 sm:px-6 lg:px-12">
        <div className="mx-auto w-full max-w-7xl">
          {/* Premium Hero Container - Clean rounded design */}
          <div className="relative h-[700px] overflow-hidden rounded-3xl sm:h-[750px] lg:h-[800px]">
            {/* YouTube Video Background - Full Container */}
            <div className="absolute inset-0">
              <iframe
                className="absolute top-1/2 left-1/2 h-[56.25vw] min-h-full w-[177.77vh] min-w-full -translate-x-1/2 -translate-y-1/2"
                src="https://www.youtube.com/embed/mUqtC3eNjnI?si=XbpbHYMKivN5JBnz&start=22&autoplay=1&mute=1&loop=1&controls=0&playlist=mUqtC3eNjnI&modestbranding=1&showinfo=0&rel=0"
                title="Travel video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ pointerEvents: 'none' }}
              />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

            {/* Content Overlay */}
            <div className="relative z-10 flex h-full flex-col">
              {/* Header Area with Text */}
              <div className="px-8 pt-24 pb-8 sm:px-12 lg:px-16">
                <div className="mx-auto max-w-3xl text-center">
                  <h1 className="mb-4 text-4xl text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                    Explore with locals.
                  </h1>
                  <p className="text-lg text-white/90 drop-shadow-md sm:text-xl">
                    Connect with verified local guides for authentic experiences
                  </p>
                </div>
              </div>

              {/* Search Bar Area - Centered */}
              <div className="flex flex-1 items-center justify-center px-6 sm:px-12">
                <form onSubmit={handleSearch} className="w-full max-w-2xl">
                  <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/95 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center">
                      <Search className="absolute left-6 z-10 size-6 text-blue-600" />
                      <Input
                        type="text"
                        placeholder="Where do you want to explore?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-2xl border-0 bg-transparent py-7 pr-44 pl-16 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <div className="absolute right-6 flex items-center gap-2">
                        <div className="border-l border-gray-300 pl-4 text-sm text-gray-500">
                          <span className="block text-xs text-gray-400">
                            Popular now
                          </span>
                          <div className="h-6 overflow-hidden text-black transition-all duration-300">
                            <div
                              className="transition-transform duration-500 ease-in-out"
                              style={{
                                transform: `translateY(-${currentLocationIndex * 24}px)`,
                              }}
                            >
                              {popularLocations.map((location) => (
                                <button
                                  key={location}
                                  type="button"
                                  className="block h-6 transition-colors hover:underline"
                                  onClick={() => {
                                    setSearchQuery(location);
                                  }}
                                >
                                  {location}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              {/* Bottom Scroll Hint */}
              <div className="animate-bounce pb-8 text-center text-white">
                <p className="mb-2 text-sm tracking-wider uppercase drop-shadow-lg">
                  Discover
                </p>
                <ChevronDown className="mx-auto size-6 drop-shadow-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Guides - Horizontal Carousel */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl lg:text-5xl">
              No one does it like our local experts
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              These are award-winning trip partners, not tour guides. They know
              the secret spots, the must do adventures, and have the connections
              to make anything happen.
            </p>
          </div>
        </div>

        {/* Horizontal Scrolling Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
        >
          <div
            ref={carouselRef}
            className="scrollbar-hide overflow-x-auto"
            style={{ scrollBehavior: 'auto' }}
          >
            <div className="flex gap-6 px-6 pb-4 lg:px-12">
              {/* Duplicate guides array 3 times for continuous scrolling */}
              {[...guides, ...guides, ...guides].map((guide, index) => {
                const cardId = `${guide.id}-${index}`;
                const isPlayingVideo = playingVideoId === cardId;
                
                return (
                  <div
                    key={cardId}
                    className="group w-[320px] flex-none cursor-pointer sm:w-[380px]"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden rounded-3xl shadow-lg">
                      {!isPlayingVideo ? (
                        <>
                          <ImageWithFallback
                            src={guide.image}
                            alt={guide.name}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />

                          {/* Video Play Button - Show on all cards */}
                          <button
                            onClick={() => setPlayingVideoId(cardId)}
                            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 hover:bg-black/20"
                          >
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl transition-transform duration-300 group-hover:scale-110">
                              <div className="ml-1 h-0 w-0 border-t-[10px] border-b-[10px] border-l-[16px] border-t-transparent border-b-transparent border-l-blue-600"></div>
                            </div>
                          </button>
                        </>
                      ) : (
                        <>
                          <video
                            src={guide.video}
                            className="absolute inset-0 h-full w-full object-cover"
                            autoPlay
                            controls
                            loop
                            muted
                          />
                          <button
                            onClick={() => setPlayingVideoId(null)}
                            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black hover:bg-white"
                          >
                            <X className="size-4" />
                          </button>
                        </>
                      )}

                      {/* Text Overlay */}
                      {!isPlayingVideo && (
                        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
                          <h3 className="mb-1 text-2xl text-white">
                            {guide.name.split(' ')[0]}
                          </h3>
                          <p className="mb-3 text-sm text-white/90">
                            Local expert, {guide.country}
                          </p>

                          {guide.featured && (
                            <div className="space-y-1 mb-3">
                              <p className="text-xs tracking-wide text-white uppercase">
                                Featured Guide
                              </p>
                              <p className="text-xs text-white/80">
                                {guide.tagline}
                              </p>
                            </div>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookAppointment(guide);
                            }}
                            className="pointer-events-auto w-full rounded-lg bg-white py-2.5 px-4 text-sm font-medium text-black transition-all hover:bg-blue-600 hover:text-white shadow-lg"
                          >
                            Book appointment
                          </button>
                        </div>
                      )}

                      {!isPlayingVideo && guide.verified && (
                        <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs text-black shadow-md backdrop-blur-sm">
                          <BadgeCheck className="size-3" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            className="absolute top-1/2 left-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl transition-colors hover:bg-gray-50"
            onClick={() => {
              if (carouselRef.current) {
                carouselRef.current.scrollLeft -= 400;
              }
            }}
          >
            <ChevronDown className="size-6 -rotate-90" />
          </button>
          <button
            className="absolute top-1/2 right-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-xl transition-colors hover:bg-gray-50"
            onClick={() => {
              if (carouselRef.current) {
                carouselRef.current.scrollLeft += 400;
              }
            }}
          >
            <ChevronDown className="size-6 rotate-90" />
          </button>
        </div>
      </section>

      {/* Your Time is Precious */}
      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 px-8 py-16 lg:px-16 lg:py-20"
            style={{
              backgroundImage: `url(${timePreciousImage.src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'bottom center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-50/80 to-amber-50/95" />
            
            {/* Content */}
            <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Left Column */}
              <div className="flex flex-col justify-center space-y-6 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-gray-900 lg:text-4xl xl:text-5xl">
                  Your time is precious.
                </h2>
                <p className="text-xl font-bold text-gray-800 lg:text-2xl">
                  The average international trip takes a minimum of 40 hours of
                  research.
                </p>
              </div>

              {/* Right Column */}
              <div className="flex items-center">
                <p className="text-base leading-relaxed text-gray-700 lg:text-lg">
                  It&apos;s our job to cut through the noise with tailored
                  recommendations based on our boots-on-the-ground knowledge and
                  personal connections. We&apos;ve vetted and tested, so you
                  don&apos;t have to.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destination Thrives Hero */}
      <section
        className="relative flex min-h-[50vh] items-center px-6 py-20 lg:min-h-[65vh] lg:px-12"
        style={{
          backgroundImage: `url(${heroImage.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="max-w-3xl text-left lg:ml-0 lg:mr-auto">
            <h2 className="mb-6 text-4xl font-bold leading-tight text-white lg:text-5xl xl:text-6xl text-left">
              When a destination thrives, so does your experience there.
            </h2>
            <p className="text-lg leading-relaxed text-white/90 lg:text-xl text-left">
              Our local guides are deeply invested in their communities. They know
              the hidden gems, support local businesses, and ensure your travel
              dollars make a positive impact. When you book with us, you&apos;re not
              just visiting, you&apos;re contributing to sustainable tourism that
              benefits everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Trips You Can Feel Good About */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">Trips you can feel good about</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-700">
              We believe that travel should be built on local insight, created and sold directly from the destination itself.
            </p>
          </div>

          <div className="grid grid-cols-1 items-center justify-center gap-10 xl:gap-12 lg:grid-cols-2">
            {/* Left visuals: stacked image with transparent background and labels */}
            <div className="flex justify-center lg:justify-center">
              <div className="relative w-full max-w-[220px] sm:max-w-[240px] lg:max-w-[250px] xl:max-w-[260px]">
                <ImageWithFallback
                  src={circleImage.src}
                  alt="You and your destination"
                  width={600}
                  height={900}
                  className="w-full h-auto object-contain bg-transparent"
                />
                {/* Label 1: YOU — centered in top circle */}
                <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 text-center font-bold uppercase tracking-wide text-white text-sm sm:text-base lg:text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  YOU
                </div>
                {/* Label 2: YOUR DESTINATION — centered in bottom circle */}
                <div className="absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2 text-center font-bold uppercase tracking-wide text-white text-xs sm:text-sm lg:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">
                  YOUR
                  <br />
                  DESTINATION
                </div>
              </div>
            </div>

            {/* Right content blocks */}
            <div className="space-y-10 lg:self-center">
              <div>
                <h3 className="text-2xl font-bold">
                  By traveling with Weave Journeys, we guarantee inside access to extraordinary trips
                </h3>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Our network of trusted local experts opens doors that typical itineraries miss. From private viewings and
                  behind-the-scenes encounters to meaningful cultural exchanges, your journey is crafted with insight from the
                  people who live there.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold">
                  By traveling with Weave Journeys, you are supporting the protection and preservation of your host country
                </h3>
                <p className="mt-4 leading-relaxed text-gray-700">
                  Your trip contributes to community-led initiatives and sustainable practices. We partner directly with local
                  guides and organizations so your experience benefits both you and the destination, today and for the future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="mb-2 text-sm tracking-wider text-gray-500 uppercase">
              How it works
            </p>
            <h2 className="mb-4 text-4xl lg:text-5xl">
              Connect, chat, explore
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Get personalized travel advice from locals who live and breathe
              their destinations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-2xl text-white shadow-lg">
                1
              </div>
              <h3 className="mb-4 text-2xl">Find your guide</h3>
              <p className="leading-relaxed text-gray-600">
                Browse verified local experts with unique specialties and
                authentic insights
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 text-2xl text-white shadow-lg">
                2
              </div>
              <h3 className="mb-4 text-2xl">Start chatting free</h3>
              <p className="leading-relaxed text-gray-600">
                Get 5 minutes free to ask questions and plan your perfect trip
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-600 to-pink-700 text-2xl text-white shadow-lg">
                3
              </div>
              <h3 className="mb-4 text-2xl">Experience the real destination</h3>
              <p className="leading-relaxed text-gray-600">
                Get personalized recommendations and insider tips for an
                authentic journey
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Local Guides */}
      <section className="bg-gradient-to-br from-gray-900 via-black to-gray-900 px-6 py-20 text-white lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-3xl">
            <p className="mb-4 text-sm tracking-wider text-white/60 uppercase">
              Why choose us
            </p>
            <h2 className="mb-6 text-4xl lg:text-6xl">
              Travel with locals who care
            </h2>
            <p className="text-xl text-white/80">
              Every guide is verified and passionate about sharing their home
              with you
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:gap-16">
            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <BadgeCheck className="size-6" />
              </div>
              <h3 className="mb-4 text-2xl">Verified experts</h3>
              <p className="leading-relaxed text-white/70">
                All guides are verified locals with deep knowledge and passion
                for their destinations
              </p>
            </div>

            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <MessageCircle className="size-6" />
              </div>
              <h3 className="mb-4 text-2xl">Direct communication</h3>
              <p className="leading-relaxed text-white/70">
                Chat, call, or video chat directly with your guide before and
                during your trip
              </p>
            </div>

            <div>
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Globe className="size-6" />
              </div>
              <h3 className="mb-4 text-2xl">Authentic experiences</h3>
              <p className="leading-relaxed text-white/70">
                Go beyond tourist traps and discover the real heart of each
                destination
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={closeChat}>
        <DialogContent className="flex h-[85vh] max-w-4xl flex-col p-0">
          {selectedGuide && (
            <>
              <DialogHeader className="border-b p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-14">
                      <AvatarImage src={selectedGuide.image} />
                      <AvatarFallback>{selectedGuide.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <DialogTitle className="flex items-center gap-2 text-xl">
                        {selectedGuide.name}
                        {selectedGuide.verified && (
                          <BadgeCheck className="size-5" />
                        )}
                      </DialogTitle>
                      <p className="text-sm text-gray-500">
                        {selectedGuide.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startCall('voice')}
                      className={callType === 'voice' ? 'bg-gray-100' : ''}
                    >
                      <Phone className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startCall('video')}
                      className={callType === 'video' ? 'bg-gray-100' : ''}
                    >
                      <VideoIcon className="size-4" />
                    </Button>
                  </div>
                </div>

                {!isPaid && (
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="size-4" />
                      <span>
                        Free time:{' '}
                        <span
                          className={
                            freeTimeRemaining < 60
                              ? 'font-medium text-red-600'
                              : 'font-medium'
                          }
                        >
                          {formatTime(freeTimeRemaining)}
                        </span>
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPaymentPrompt(true)}
                    >
                      Continue for $5
                    </Button>
                  </div>
                )}

                {isPaid && (
                  <div className="mt-4 rounded-lg bg-green-50 p-3">
                    <p className="flex items-center gap-2 text-sm text-green-700">
                      <BadgeCheck className="size-4" />
                      Premium session active
                    </p>
                  </div>
                )}
              </DialogHeader>

              {callType !== 'none' && (
                <div className="relative flex flex-1 items-center justify-center bg-gray-900">
                  <div className="text-center text-white">
                    {callType === 'video' ? (
                      <div className="space-y-4">
                        <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-gray-800">
                          <Video className="size-24 text-gray-600" />
                        </div>
                        <p className="text-xl">
                          Video call with {selectedGuide.name}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-gray-800">
                          <Phone className="size-24 text-gray-600" />
                        </div>
                        <p className="text-xl">
                          Voice call with {selectedGuide.name}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    className="absolute bottom-8"
                    onClick={() => setCallType('none')}
                  >
                    <X className="mr-2 size-4" />
                    End Call
                  </Button>
                </div>
              )}

              {callType === 'none' && (
                <>
                  <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs rounded-2xl px-4 py-3 lg:max-w-md ${
                            message.sender === 'user'
                              ? 'bg-black text-white'
                              : 'border border-gray-200 bg-white'
                          }`}
                        >
                          <p>{message.text}</p>
                          <p
                            className={`mt-1 text-xs ${message.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t bg-white p-4">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder={
                          isPaid || freeTimeRemaining > 0
                            ? 'Type your message...'
                            : 'Free time ended. Pay to continue...'
                        }
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="min-h-[60px] flex-1 resize-none"
                        disabled={!isPaid && freeTimeRemaining === 0}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={
                          !newMessage.trim() ||
                          (!isPaid && freeTimeRemaining === 0)
                        }
                        className="bg-black px-6 hover:bg-gray-800"
                      >
                        <Send className="size-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentPrompt} onOpenChange={setShowPaymentPrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Continue your conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="mb-4 text-gray-600">Your free 5 minutes are up</p>
              <p className="mb-2 text-4xl font-medium">$5</p>
              <p className="text-gray-500">
                Unlimited chatting with {selectedGuide?.name}
              </p>
            </div>

            <div className="space-y-3 border-t border-b py-4">
              <div className="flex items-center gap-3">
                <BadgeCheck className="size-5 shrink-0" />
                <span className="text-sm">Unlimited chat time</span>
              </div>
              <div className="flex items-center gap-3">
                <BadgeCheck className="size-5 shrink-0" />
                <span className="text-sm">Voice and video calls</span>
              </div>
              <div className="flex items-center gap-3">
                <BadgeCheck className="size-5 shrink-0" />
                <span className="text-sm">Personalized recommendations</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentPrompt(false)}
              >
                Not now
              </Button>
              <Button
                className="flex-1 bg-black hover:bg-gray-800"
                onClick={handlePayment}
              >
                Continue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <GuideBookingDialog
        open={bookingDialogOpen}
        onOpenChange={setBookingDialogOpen}
        guide={bookingGuide}
        onBookingConfirmed={handleBookingConfirmed}
      />

      {/* Video Call Modal - Embedded in Guides Page */}
      <VideoCallModal
        open={videoCallOpen}
        onClose={handleVideoCallClose}
        roomID={currentBooking?.guide.id.toString()}
      />
    </div>
  );
}