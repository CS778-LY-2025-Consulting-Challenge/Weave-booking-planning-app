'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateSelector } from '@/components/DateSelector';
import { CitySearchInput } from '@/components/CitySearchInput';
import { Input } from '@/components/ui/input';
import {
  Plane,
  Users,
  Shield,
  Clock,
  Globe,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  Crown,
  ChevronDown,
  Star,
  Mail,
  Send,
  CheckCircle,
} from 'lucide-react';

interface JetOption {
  id: string;
  name: string;
  model: string;
  capacity: number;
  range: string;
  speed: string;
  price: number;
  image: string;
  features: string[];
}

const MOCK_JETS: JetOption[] = [
  {
    id: '1',
    name: 'Citation X',
    model: 'Light Jet',
    capacity: 8,
    range: '3,460 nm',
    speed: '525 mph',
    price: 12500,
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80',
    features: ['WiFi', 'Full Galley', 'Lavatory', 'Entertainment System'],
  },
  {
    id: '2',
    name: 'Gulfstream G650',
    model: 'Large Cabin',
    capacity: 16,
    range: '7,000 nm',
    speed: '610 mph',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800&q=80',
    features: ['Master Suite', 'Conference Room', 'Full Kitchen', 'Shower'],
  },
  {
    id: '3',
    name: 'Bombardier Global 7500',
    model: 'Ultra Long Range',
    capacity: 19,
    range: '7,700 nm',
    speed: '590 mph',
    price: 35000,
    image: '/images/jet1.jpg',
    features: ['4 Living Spaces', 'Private Suite', 'Full Galley', 'Crew Rest'],
  },
  {
    id: '4',
    name: 'Embraer Phenom 300',
    model: 'Light Jet',
    capacity: 6,
    range: '2,010 nm',
    speed: '518 mph',
    price: 8500,
    image: '/images/jet2.jpg',
    features: ['WiFi', 'Refreshment Center', 'Lavatory', 'Leather Seats'],
  },
];

const AIRCRAFT_TYPES = [
  { value: 'any', label: 'Any Aircraft' },
  { value: 'light', label: 'Light Jet (4-8 passengers)' },
  { value: 'midsize', label: 'Midsize Jet (8-10 passengers)' },
  { value: 'super-midsize', label: 'Super Midsize (10-12 passengers)' },
  { value: 'large', label: 'Large Cabin (12-16 passengers)' },
  { value: 'ultra-long', label: 'Ultra Long Range (16+ passengers)' },
];

const BENEFITS = [
  {
    icon: Shield,
    title: 'Ultimate Privacy',
    description: 'Travel in complete confidentiality with exclusive access to private terminals and dedicated security.',
  },
  {
    icon: Clock,
    title: 'Flexible Schedules',
    description: 'Depart on your timeline. No waiting, no delays, no connections. Your schedule, your rules.',
  },
  {
    icon: Sparkles,
    title: 'Luxury Comfort',
    description: 'Experience unparalleled comfort with spacious cabins, gourmet catering, and personalized service.',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description: 'Reach over 5,000 airports worldwide, including exclusive destinations commercial flights cannot access.',
  },
];

export default function PrivateJetPage() {
  const router = useRouter();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [passengers, setPassengers] = useState('2');
  const [aircraftType, setAircraftType] = useState('any');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Airport search API - same as flights page
  const searchAirports = async (query: string): Promise<{ name: string; code: string; country: string }[]> => {
    try {
      const response = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (err) {
      console.error('Failed to search airports:', err);
      return [];
    }
  };

  const handleRequestQuote = () => {
    if (!email || !departure || !destination || !departureDate) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const scrollToQuote = () => {
    document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-white">
      {/* Hero Section */}
      <section className="relative min-h-[100vh] overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 h-full w-full overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/NwHQcmJf0yQ?autoplay=1&mute=1&loop=1&playlist=NwHQcmJf0yQ&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1"
              title="Private Jet Charter"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[150%] w-[150%] min-h-[100vh] min-w-[100vw] -translate-x-1/2 -translate-y-1/2 scale-125"
              style={{ border: 'none' }}
            />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex min-h-[100vh] flex-col items-center justify-center px-4 pt-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 shadow-sm backdrop-blur-sm"
            >
              <Crown className="size-4 text-amber-400" />
              <span className="text-sm font-medium tracking-wide text-white/90">Exclusive Private Aviation</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-6 font-[family-name:var(--font-bonheur-royale)] text-5xl tracking-tight text-white md:text-7xl"
            >
              Private Jet Charter
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mx-auto mb-10 max-w-2xl text-lg text-white/80 md:text-xl"
              style={{ fontFamily: 'var(--font-special-elite)' }}
            >
              Experience the pinnacle of luxury travel. Seamless journeys, 
              unmatched privacy, and world-class service at your command.
            </motion.p>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-10 flex flex-col items-center gap-3"
          >
            <span className="text-sm font-medium tracking-wide text-white/70">Scroll down for more details</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              onClick={scrollToQuote}
              className="cursor-pointer"
            >
              <ChevronDown className="size-8 text-white/50 transition-colors hover:text-white/80" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quote Request Form Section */}
      <section id="quote-form" className="relative z-10 bg-white px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-5xl"
        >
          <Card className="overflow-hidden border-stone-200 bg-white shadow-2xl shadow-stone-200/50">
            <CardContent className="p-8 md:p-12">
              {/* Panel Header */}
              <div className="mb-10 text-center">
                <h2 className="mb-3 text-3xl font-light text-stone-900">
                  Request Your <span className="font-semibold">Private Charter Quote</span>
                </h2>
                <p className="text-stone-500">
                  Fill in your travel details and we'll get back to you within 2 hours
                </p>
              </div>

              {/* Search Form */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Departure */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-stone-600">
                    <MapPin className="mr-1 inline size-4 text-stone-400" />
                    Departure
                  </Label>
                  <CitySearchInput
                    value={departure}
                    onChange={setDeparture}
                    placeholder="Departure city or airport"
                    onSearch={searchAirports}
                  />
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-stone-600">
                    <MapPin className="mr-1 inline size-4 text-stone-400" />
                    Destination
                  </Label>
                  <CitySearchInput
                    value={destination}
                    onChange={setDestination}
                    placeholder="Destination city or airport"
                    onSearch={searchAirports}
                  />
                </div>

                {/* Departure Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-stone-600">
                    <Calendar className="mr-1 inline size-4 text-stone-400" />
                    Departure Date
                  </Label>
                  <DateSelector
                    label=""
                    selectedDate={departureDate}
                    onDateSelect={(date) => setDepartureDate(date)}
                  />
                </div>

                {/* Return Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-stone-600">
                    <Calendar className="mr-1 inline size-4 text-stone-400" />
                    Return Date (Optional)
                  </Label>
                  <DateSelector
                    label=""
                    selectedDate={returnDate}
                    onDateSelect={(date) => setReturnDate(date)}
                  />
                </div>

                {/* Passengers */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-stone-600">
                    <Users className="mr-1 inline size-4 text-stone-400" />
                    Passengers
                  </Label>
                  <Select value={passengers} onValueChange={setPassengers}>
                    <SelectTrigger className="h-14 border-stone-200 bg-white text-stone-900 hover:border-stone-300">
                      <SelectValue placeholder="Number of passengers" />
                    </SelectTrigger>
                    <SelectContent className="border-stone-200 bg-white">
                      {[...Array(20)].map((_, i) => (
                        <SelectItem
                          key={i + 1}
                          value={String(i + 1)}
                          className="text-stone-700 hover:bg-stone-50"
                        >
                          {i + 1} {i === 0 ? 'Passenger' : 'Passengers'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Aircraft Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-stone-600">
                    <Plane className="mr-1 inline size-4 text-stone-400" />
                    Aircraft Type
                  </Label>
                  <Select value={aircraftType} onValueChange={setAircraftType}>
                    <SelectTrigger className="h-14 border-stone-200 bg-white text-stone-900 hover:border-stone-300">
                      <SelectValue placeholder="Select aircraft type" />
                    </SelectTrigger>
                    <SelectContent className="border-stone-200 bg-white">
                      {AIRCRAFT_TYPES.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                          className="text-stone-700 hover:bg-stone-50"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Address */}
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label className="text-sm font-medium text-stone-600">
                    <Mail className="mr-1 inline size-4 text-stone-400" />
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    placeholder="Your email for quote delivery"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 hover:border-stone-300 focus:border-stone-400 focus:ring-stone-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-10 flex justify-center">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 rounded-full bg-emerald-50 px-8 py-5 text-emerald-700"
                  >
                    <CheckCircle className="size-6" />
                    <span className="text-lg font-medium">Quote request submitted! We'll contact you shortly.</span>
                  </motion.div>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleRequestQuote}
                    disabled={isSubmitting || !departure || !destination || !departureDate || !email}
                    className="group bg-stone-900 px-14 py-7 text-base font-medium tracking-wide text-white shadow-xl transition-all hover:bg-stone-800 hover:shadow-2xl disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="mr-2 size-5 rounded-full border-2 border-white border-t-transparent"
                        />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 size-5" />
                        Request a Quote
                        <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Fleet Section */}
      <section id="fleet" className="relative z-10 px-4 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl"
        >
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-light text-stone-900">
              Our <span className="font-semibold">Fleet</span>
            </h2>
            <p className="text-stone-500">
              Explore our selection of premium private aircraft
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {MOCK_JETS.map((jet, index) => (
              <motion.div
                key={jet.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden border-stone-200 bg-white shadow-lg transition-all hover:shadow-2xl hover:shadow-stone-200/50">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={jet.image}
                      alt={jet.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="rounded-full bg-white/95 px-4 py-1.5 text-xs font-medium tracking-wide text-stone-700 shadow-sm backdrop-blur-sm">
                        {jet.model}
                      </span>
                    </div>
                    <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-amber-600 shadow-sm backdrop-blur-sm">
                      <Star className="size-3 fill-amber-500 text-amber-500" />
                      Premium
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-stone-900">{jet.name}</h3>
                        <p className="text-sm text-stone-500">{jet.model}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium uppercase tracking-wider text-stone-400">From</p>
                        <p className="text-2xl font-semibold text-stone-900">
                          ${jet.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-stone-400">per flight hour</p>
                      </div>
                    </div>

                    <div className="mb-5 grid grid-cols-3 gap-4 rounded-xl border border-stone-100 bg-stone-50 p-4">
                      <div className="text-center">
                        <Users className="mx-auto mb-1 size-5 text-stone-400" />
                        <p className="text-sm font-semibold text-stone-800">{jet.capacity}</p>
                        <p className="text-xs text-stone-500">Passengers</p>
                      </div>
                      <div className="text-center">
                        <Globe className="mx-auto mb-1 size-5 text-stone-400" />
                        <p className="text-sm font-semibold text-stone-800">{jet.range}</p>
                        <p className="text-xs text-stone-500">Range</p>
                      </div>
                      <div className="text-center">
                        <Plane className="mx-auto mb-1 size-5 text-stone-400" />
                        <p className="text-sm font-semibold text-stone-800">{jet.speed}</p>
                        <p className="text-xs text-stone-500">Speed</p>
                      </div>
                    </div>

                    <div className="mb-5 flex flex-wrap gap-2">
                      {jet.features.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <Button 
                      onClick={scrollToQuote}
                      className="w-full bg-stone-900 py-6 font-medium tracking-wide text-white transition-all hover:bg-stone-800"
                    >
                      Request Quote
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 border-y border-stone-100 bg-stone-50/50 px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-light text-stone-900 md:text-4xl">
              The Private Jet <span className="font-semibold">Experience</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-500">
              Discover why discerning travelers choose private aviation for their most important journeys.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-stone-200 bg-white shadow-sm transition-all hover:shadow-lg hover:shadow-stone-200/50">
                  <CardContent className="p-8">
                    <div className="mb-5 inline-flex rounded-2xl bg-stone-100 p-4">
                      <benefit.icon className="size-6 text-stone-700" />
                    </div>
                    <h3 className="mb-3 text-lg font-semibold text-stone-900">
                      {benefit.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-stone-500">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl"
        >
          <Card className="overflow-hidden border-stone-200 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 shadow-2xl">
            <CardContent className="p-12 text-center md:p-16">
              <div className="mb-6 inline-flex rounded-full bg-white/10 p-4">
                <Crown className="size-8 text-amber-400" />
              </div>
              <h2 className="mb-4 text-3xl font-light text-white md:text-4xl">
                Ready to <span className="font-semibold">Elevate</span> Your Travel?
              </h2>
              <p className="mx-auto mb-10 max-w-xl text-stone-400">
                Contact our aviation experts for personalized assistance with your private charter needs. 
                Available 24/7 to ensure seamless travel experiences.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  size="lg"
                  onClick={scrollToQuote}
                  className="bg-white px-10 py-7 text-base font-medium tracking-wide text-stone-900 shadow-xl transition-all hover:bg-stone-100"
                >
                  <Send className="mr-2 size-5" />
                  Request a Quote
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent px-10 py-7 text-base text-white hover:bg-white/10"
                >
                  Contact Concierge
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer Spacer */}
      <div className="h-20" />
    </div>
  );
}
