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
import { useState } from 'react';

interface Room {
  id: number;
  name: string;
  description: string;
  size: string;
  beds: string;
  guests: number;
  price: number;
  image: string;
  amenities: string[];
  featured?: boolean;
}

export default function HotelBooking() {
  const [checkIn, setCheckIn] = useState('2025-12-15');
  const [checkOut, setCheckOut] = useState('2025-12-22');
  const [guests, setGuests] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectingCheckIn, setSelectingCheckIn] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11, 1)); // December 2025

  // Generate calendar days with prices
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

  const rooms: Room[] = [
    {
      id: 1,
      name: 'Deluxe Room',
      description:
        'Contemporary comfort with city views and modern amenities for the discerning traveler',
      size: '35 m²',
      beds: '1 King Bed',
      guests: 2,
      price: 299,
      image:
        'https://images.unsplash.com/flagged/photo-1582108074095-1730ef6caec9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBkZWx1eGUlMjByb29tJTIwaG90ZWx8ZW58MXx8fHwxNzY0NjIyOTgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      amenities: ['City View', 'King Bed', 'WiFi', 'Smart TV', 'Minibar'],
    },
    {
      id: 2,
      name: 'Executive Suite',
      description:
        'Spacious elegance with separate living area, perfect for extended stays and business travelers',
      size: '55 m²',
      beds: '1 King Bed + Sofa Bed',
      guests: 3,
      price: 449,
      image:
        'https://images.unsplash.com/photo-1758448511255-ac2a24a135d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGVjdXRpdmUlMjBzdWl0ZSUyMGhvdGVsfGVufDF8fHx8MTc2NDYyMjk4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      amenities: [
        'Separate Living',
        'Work Desk',
        'WiFi',
        'Nespresso',
        'City View',
      ],
      featured: true,
    },
    {
      id: 3,
      name: 'Penthouse Suite',
      description:
        'The pinnacle of luxury with panoramic views, private terrace, and bespoke services',
      size: '85 m²',
      beds: '1 King Bed + Guest Room',
      guests: 4,
      price: 799,
      image:
        'https://images.unsplash.com/photo-1702411200201-3061d0eea802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW50aG91c2UlMjBzdWl0ZSUyMGx1eHVyeXxlbnwxfHx8fDE3NjQ2MjI5ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      amenities: [
        'Private Terrace',
        'Butler Service',
        'Jacuzzi',
        'Panoramic Views',
        'Premium Bar',
      ],
      featured: true,
    },
    {
      id: 4,
      name: 'Boutique Room',
      description:
        'Artistic design meets comfort in our signature boutique-style accommodation',
      size: '32 m²',
      beds: '1 Queen Bed',
      guests: 2,
      price: 249,
      image:
        'https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGhvdGVsJTIwYmVkcm9vbSUyMHN1aXRlfGVufDF8fHx8MTc2NDYyMjk3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      amenities: [
        'Designer Interiors',
        'Queen Bed',
        'WiFi',
        'Rain Shower',
        'Artwork',
      ],
    },
  ];

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
        {/* YouTube Video Background */}
        <div className="pointer-events-none absolute inset-0 h-full w-full">
          <iframe
            className="absolute top-1/2 left-1/2 h-[100vh] min-h-[56.25vw] w-[100vw] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2"
            src="https://www.youtube.com/embed/WGqBzbVUTCA?autoplay=1&mute=1&controls=0&showinfo=0&loop=1&playlist=WGqBzbVUTCA&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8 text-white"
            >
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="size-6 text-amber-400" />
                <p className="text-sm tracking-widest text-amber-400 uppercase">
                  Boutique Luxury
                </p>
              </div>
              <h1 className="mb-4 text-5xl md:text-7xl">Weave Hotel</h1>
              <p className="max-w-2xl text-xl text-gray-200 md:text-2xl">
                Where contemporary design meets timeless elegance in the heart
                of the city
              </p>
            </motion.div>

            {/* Search Bar - Floating */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div>
                      <Label className="mb-2 block text-xs tracking-wider text-gray-600 uppercase">
                        Check-in
                      </Label>
                      <button
                        onClick={() => {
                          setShowCalendar(true);
                          setSelectingCheckIn(true);
                        }}
                        className="flex h-12 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 transition-colors hover:border-gray-400"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-gray-500" />
                          <span>{formatDate(checkIn)}</span>
                        </div>
                      </button>
                    </div>
                    <div>
                      <Label className="mb-2 block text-xs tracking-wider text-gray-600 uppercase">
                        Check-out
                      </Label>
                      <button
                        onClick={() => {
                          setShowCalendar(true);
                          setSelectingCheckIn(false);
                        }}
                        className="flex h-12 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 transition-colors hover:border-gray-400"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4 text-gray-500" />
                          <span>{formatDate(checkOut)}</span>
                        </div>
                      </button>
                    </div>
                    <div>
                      <Label
                        htmlFor="guests"
                        className="mb-2 block text-xs tracking-wider text-gray-600 uppercase"
                      >
                        Guests
                      </Label>
                      <Select
                        value={guests.toString()}
                        onValueChange={(val) => setGuests(parseInt(val))}
                      >
                        <SelectTrigger id="guests" className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Guest</SelectItem>
                          <SelectItem value="2">2 Guests</SelectItem>
                          <SelectItem value="3">3 Guests</SelectItem>
                          <SelectItem value="4">4 Guests</SelectItem>
                          <SelectItem value="5">5+ Guests</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button className="h-12 w-full bg-black text-white hover:bg-gray-800">
                        <Search className="mr-2 size-4" />
                        Check Availability
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Calendar Popup */}
              <AnimatePresence>
                {showCalendar && (
                  <>
                    {/* Overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
                      onClick={() => setShowCalendar(false)}
                    />

                    {/* Calendar Modal */}
                    <motion.div
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="fixed top-1/2 left-1/2 z-[101] mx-4 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2"
                    >
                      <Card className="max-h-[90vh] overflow-hidden overflow-y-auto border-0 bg-white shadow-2xl backdrop-blur-xl">
                        <CardContent className="p-8">
                          {/* Calendar Header */}
                          <div className="mb-6 flex items-center justify-between">
                            <button
                              onClick={() => {
                                const newMonth = new Date(currentMonth);
                                newMonth.setMonth(newMonth.getMonth() - 1);
                                setCurrentMonth(newMonth);
                              }}
                              className="rounded-full p-2 transition-colors hover:bg-gray-100"
                            >
                              <ChevronRight className="size-5 rotate-180" />
                            </button>
                            <h3 className="text-xl">
                              {currentMonth.toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric',
                              })}
                            </h3>
                            <button
                              onClick={() => {
                                const newMonth = new Date(currentMonth);
                                newMonth.setMonth(newMonth.getMonth() + 1);
                                setCurrentMonth(newMonth);
                              }}
                              className="rounded-full p-2 transition-colors hover:bg-gray-100"
                            >
                              <ChevronRight className="size-5" />
                            </button>
                          </div>

                          {/* Selection Info */}
                          <div className="mb-6 rounded-lg bg-amber-50 p-4">
                            <p className="mb-2 text-sm text-gray-600">
                              {selectingCheckIn
                                ? 'Select check-in date'
                                : 'Select check-out date'}
                            </p>
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-xs text-gray-500">
                                  Check-in
                                </p>
                                <p className="font-medium">
                                  {formatDate(checkIn)}
                                </p>
                              </div>
                              <ArrowRight className="size-4 text-gray-400" />
                              <div>
                                <p className="text-xs text-gray-500">
                                  Check-out
                                </p>
                                <p className="font-medium">
                                  {formatDate(checkOut)}
                                </p>
                              </div>
                              <div className="ml-auto text-right">
                                <p className="text-xs text-gray-500">
                                  {calculateNights()} nights
                                </p>
                                <p className="text-xl">
                                  ${calculateNights() * 299}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Day Headers */}
                          <div className="mb-4 grid grid-cols-7 gap-2">
                            {[
                              'Sun',
                              'Mon',
                              'Tue',
                              'Wed',
                              'Thu',
                              'Fri',
                              'Sat',
                            ].map((day) => (
                              <div
                                key={day}
                                className="py-2 text-center text-sm text-gray-500"
                              >
                                {day}
                              </div>
                            ))}
                          </div>

                          {/* Calendar Days */}
                          <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((dayInfo, index) => {
                              if (!dayInfo) {
                                return (
                                  <div
                                    key={`empty-${index}`}
                                    className="aspect-square"
                                  />
                                );
                              }

                              const dateStr = dayInfo.date
                                .toISOString()
                                .split('T')[0];
                              const isSelected =
                                dateStr === checkIn || dateStr === checkOut;
                              const inRange = isDateInRange(dateStr);
                              const isPast =
                                dayInfo.date <
                                new Date(new Date().setHours(0, 0, 0, 0));

                              return (
                                <motion.button
                                  key={dateStr}
                                  onClick={() =>
                                    !isPast && handleDateSelect(dateStr)
                                  }
                                  disabled={isPast}
                                  whileHover={!isPast ? { scale: 1.05 } : {}}
                                  whileTap={!isPast ? { scale: 0.95 } : {}}
                                  className={`relative aspect-square rounded-lg p-2 transition-all ${isPast ? 'cursor-not-allowed opacity-30' : 'cursor-pointer'} ${isSelected ? 'bg-black text-white' : ''} ${inRange && !isSelected ? 'bg-amber-100' : ''} ${!isSelected && !inRange && !isPast ? 'hover:bg-gray-100' : ''} ${dayInfo.isWeekend && !isSelected && !inRange ? 'bg-blue-50' : ''} `}
                                >
                                  <div className="mb-1 text-sm">
                                    {dayInfo.day}
                                  </div>
                                  <div
                                    className={`text-xs ${
                                      isSelected
                                        ? 'text-amber-200'
                                        : inRange
                                          ? 'text-amber-600'
                                          : 'text-gray-500'
                                    }`}
                                  >
                                    ${dayInfo.price}
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>

                          {/* Legend */}
                          <div className="mt-6 flex items-center justify-between border-t pt-6 text-sm">
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded bg-blue-50" />
                                <span className="text-gray-600">Weekend</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded bg-amber-100" />
                                <span className="text-gray-600">
                                  Selected Range
                                </span>
                              </div>
                            </div>
                            <Button
                              onClick={() => setShowCalendar(false)}
                              variant="outline"
                            >
                              Close
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

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
              className="relative h-[500px] overflow-hidden rounded-lg shadow-2xl"
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

      {/* Rooms & Suites */}
      <div className="bg-white px-4 py-20 sm:px-6 lg:px-8">
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
              meticulous attention to detail
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
              >
                <Card className="group overflow-hidden border-0 transition-all duration-500 hover:shadow-2xl">
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {room.featured && (
                      <Badge className="absolute top-4 right-4 border-0 bg-amber-500 text-white">
                        <Award className="mr-1 size-3" />
                        Featured
                      </Badge>
                    )}
                    <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
                      <h3 className="mb-2 text-2xl">{room.name}</h3>
                      <p className="text-sm text-gray-200">
                        {room.description}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-4 grid grid-cols-3 gap-4 border-b pb-4">
                      <div>
                        <p className="mb-1 text-xs text-gray-500">Size</p>
                        <p className="text-sm">{room.size}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-gray-500">Beds</p>
                        <p className="text-sm">{room.beds}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-gray-500">Guests</p>
                        <p className="text-sm">{room.guests} max</p>
                      </div>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2">
                      {room.amenities.map((amenity) => (
                        <Badge
                          key={amenity}
                          variant="outline"
                          className="border-gray-300"
                        >
                          {amenity}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="mb-1 text-xs text-gray-500">From</p>
                        <p className="text-3xl">
                          ${room.price}
                          <span className="text-sm text-gray-500">/night</span>
                        </p>
                      </div>
                      <Button
                        className="bg-black hover:bg-gray-800"
                        onClick={() => setSelectedRoom(room)}
                      >
                        Book Now
                        <ChevronRight className="ml-2 size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
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

      {/* Contact & Location */}
      <div className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h2 className="mb-8 text-4xl">Get In Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black">
                    <MapPin className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Address</p>
                    <p className="text-lg">
                      123 Heritage Boulevard
                      <br />
                      Downtown District, Auckland
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black">
                    <Phone className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Phone</p>
                    <p className="text-lg">+64 9 123 4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black">
                    <Mail className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Email</p>
                    <p className="text-lg">reservations@weavehotel.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black">
                    <Clock className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-500">
                      Check-in / Check-out
                    </p>
                    <p className="text-lg">3:00 PM / 11:00 AM</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Card className="border-0 bg-gray-50 p-8">
                <h3 className="mb-6 text-2xl">Special Offers</h3>
                <p className="mb-6 text-gray-600">
                  Subscribe to receive exclusive offers, event invitations, and
                  the latest news from Weave Hotel.
                </p>
                <div className="space-y-4">
                  <Input placeholder="Your email address" className="h-12" />
                  <Button className="h-12 w-full bg-black hover:bg-gray-800">
                    Subscribe
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Dialog would go here */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setSelectedRoom(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white"
            >
              <div className="relative h-64">
                <img
                  src={selectedRoom.image}
                  alt={selectedRoom.name}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white"
                >
                  ✕
                </button>
              </div>
              <div className="p-8">
                <h3 className="mb-4 text-3xl">{selectedRoom.name}</h3>
                <p className="mb-6 text-gray-600">{selectedRoom.description}</p>

                <div className="mb-6 grid grid-cols-3 gap-4 border-b pb-6">
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Size</p>
                    <p>{selectedRoom.size}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Beds</p>
                    <p>{selectedRoom.beds}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Guests</p>
                    <p>{selectedRoom.guests} max</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="mb-3 text-sm text-gray-500">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total for your stay</p>
                    <p className="text-3xl">${selectedRoom.price * 7}</p>
                    <p className="text-sm text-gray-500">7 nights</p>
                  </div>
                </div>

                <Button className="h-14 w-full bg-black text-lg hover:bg-gray-800">
                  Confirm Booking
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
