'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Check,
  MapPin,
  Sparkles,
  Stars,
  Wand2,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { getSavedTrips, saveTrip } from '@/lib/savedTrips';

interface Package {
  id: number;
  name: string;
  destination: string;
  duration: string;
  price: number;
  image: string;
  includes: string[];
  type: string;
}

export default function Packages() {
  const router = useRouter();
  const { user } = useUser();
  const userId = user?.id;
  const [addedPackages, setAddedPackages] = useState<number[]>([]);
  const [isCursorOnContent, setIsCursorOnContent] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('All Packages');

  useEffect(() => {
    const fetchSaved = async () => {
      if (!userId) return;
      try {
        const trips = await getSavedTrips(userId);
        // trips is an object with keys as trip IDs, values as trip data
        const packageIds = Object.values(trips || {})
          .map((trip: any) => trip.packageId)
          .filter((id) => typeof id === 'number');
        setAddedPackages(packageIds);
      } catch (e) {
        setAddedPackages([]);
      }
    };
    fetchSaved();
  }, [userId]);

  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [numberOfTravelers, setNumberOfTravelers] = useState(1);
  const [bookingStep, setBookingStep] = useState<
    'details' | 'payment' | 'confirmation'
  >('details');

  const packages: Package[] = [
    {
      id: 1,
      name: 'New Zealand Adventure',
      destination: 'Auckland, Rotorua, Queenstown, Milford Sound',
      duration: '10 Days / 9 Nights',
      price: 2899,
      image: '/images/new zealand - package.jpg',
      includes: [
        'Round-trip flights',
        '9 nights accommodation in scenic locations',
        'Milford Sound cruise',
        'Hobbiton movie set tour',
        'Adventure activities (bungee jumping, sky diving)',
        'Thermal pools of Rotorua',
        'Scenic drives and nature hikes',
      ],
      type: 'Adventure',
    },
    {
      id: 2,
      name: 'European Highlights Tour',
      destination: 'Paris, Rome, Barcelona',
      duration: '14 Days / 13 Nights',
      price: 3299,
      image: '/images/europe - package.jpg',
      includes: [
        'International flights',
        '13 nights in 4-star hotels',
        'Daily breakfast',
        'Guided city tours',
        'Museum passes',
      ],
      type: 'Culture',
    },
    {
      id: 3,
      name: 'Tokyo Cultural Experience',
      destination: 'Tokyo, Kyoto, Osaka',
      duration: '10 Days / 9 Nights',
      price: 2799,
      image: '/images/tokyo - package.jpg',
      includes: [
        'Round-trip flights',
        '9 nights accommodation',
        'JR Pass included',
        'Traditional tea ceremony',
        'Sushi making class',
      ],
      type: 'Culture',
    },
    {
      id: 4,
      name: 'Greek Island Adventure',
      destination: 'Athens, Santorini, Mykonos',
      duration: '10 Days / 9 Nights',
      price: 2199,
      image: '/images/greek - package.jpg',
      includes: [
        'International flights',
        'Ferry transfers',
        '9 nights in hotels',
        'Sunset cruise',
        'Archaeological tours',
      ],
      type: 'Beach & Culture',
    },
    {
      id: 5,
      name: 'Dubai Luxury Escape',
      destination: 'Dubai, UAE',
      duration: '5 Days / 4 Nights',
      price: 1899,
      image: '/images/dubai - package.jpg',
      includes: [
        'Round-trip flights',
        '4 nights in 5-star hotel',
        'Desert safari',
        'Burj Khalifa tickets',
        'Dubai Mall tour',
      ],
      type: 'Luxury',
    },
    {
      id: 6,
      name: 'Bali Wellness Retreat',
      destination: 'Ubud & Seminyak, Bali',
      duration: '8 Days / 7 Nights',
      price: 1699,
      image: '/images/bali-package.jpg',
      includes: [
        'Round-trip flights',
        '7 nights accommodation',
        'Daily yoga classes',
        'Spa treatments',
        'Healthy meals',
      ],
      type: 'Wellness',
    },
  ];

  // Get unique filter categories from packages
  const filterCategories = ['All Packages', ...new Set(packages.map(pkg => pkg.type))];

  // Filter packages based on selected filter
  const filteredPackages = selectedFilter === 'All Packages' 
    ? packages 
    : packages.filter(pkg => pkg.type === selectedFilter);

  const handleAddToJourneys = async (pkg: Package) => {
    if (!userId) {
      toast.error('You must be signed in to save journeys.');
      return;
    }
    setAddingId(pkg.id);
    try {
      await saveTrip(userId, {
        destination: pkg.destination,
        date: new Date().toISOString().slice(0, 10),
        packageId: pkg.id,
        name: pkg.name,
        image: pkg.image,
        duration: pkg.duration,
        price: pkg.price,
        type: pkg.type,
        description: pkg.includes?.join(', '),
      });
      setAddedPackages((prev) => [...prev, pkg.id]);
      toast.success('Package added to your journeys!');
    } catch (e) {
      toast.error('Failed to add to journeys.');
    } finally {
      setAddingId(null);
    }
  };

  const handleBookNow = (pkg: Package) => {
    setSelectedPackage(pkg);
    setBookingDialogOpen(true);
    setBookingStep('details');
    setNumberOfTravelers(1);
  };

  const handleNextStep = () => {
    if (bookingStep === 'details') {
      setBookingStep('payment');
    } else if (bookingStep === 'payment') {
      setBookingStep('confirmation');
    }
  };

  const handlePreviousStep = () => {
    if (bookingStep === 'payment') {
      setBookingStep('details');
    } else if (bookingStep === 'confirmation') {
      setBookingStep('payment');
    }
  };

  const handleConfirmBooking = () => {
    toast.success('🎉 Booking confirmed! Check your email for details.');
    setBookingDialogOpen(false);
    setBookingStep('details');
    setNumberOfTravelers(1);
  };

  const handleCloseDialog = () => {
    setBookingDialogOpen(false);
    setBookingStep('details');
    setNumberOfTravelers(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-Screen Video Hero Section */}
      <div className="relative h-screen overflow-hidden">
        {/* YouTube Video Background */}
        <div className="pointer-events-none absolute inset-0 h-full w-full">
          <iframe
            className="absolute top-1/2 left-1/2 h-[200vh] w-[200vw] -translate-x-1/2 -translate-y-1/2 scale-150"
            src="https://www.youtube.com/embed/F02_MVdAqCk?autoplay=1&mute=1&controls=0&showinfo=0&loop=1&playlist=F02_MVdAqCk&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&playsinline=1&vq=hd2160"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h1 className="mb-6 text-5xl text-white drop-shadow-2xl md:text-9xl" style={{ fontFamily: 'var(--font-bonheur-royale)' }}>
              Travel Packages
            </h1>
            <p className="mx-auto mb-8 max-w-5xl text-xl text-gray-200 md:text-3xl" style={{ fontFamily: 'var(--font-special-elite)' }}>
              Explore our curated travel packages with flights, hotels, and
              experiences all included. Book now and let us handle the details!
            </p>
            <Button
              size="lg"
              className="bg-white text-gray-900 shadow-2xl hover:bg-gray-100"
              onClick={() => {
                document
                  .getElementById('packages-grid')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Packages
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Packages Content */}
      <div
        id="packages-grid"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        onMouseEnter={() => setIsCursorOnContent(true)}
        onMouseLeave={() => setIsCursorOnContent(false)}
      >
        {/* AI Trip Planner - Premium Featured Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Card className="hover:shadow-3xl group relative overflow-hidden border-none bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl transition-all duration-500">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 h-32 w-32 animate-pulse rounded-full bg-white blur-3xl" />
              <div
                className="absolute right-10 bottom-10 h-40 w-40 animate-pulse rounded-full bg-white blur-3xl"
                style={{ animationDelay: '1s' }}
              />
              <div
                className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-white blur-3xl"
                style={{ animationDelay: '0.5s' }}
              />
            </div>

            <CardContent className="relative p-10 text-center md:p-12">
              {/* Icon Section */}
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                className="mb-6 flex justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-white/30 blur-xl" />
                  <div className="relative rounded-full border-2 border-white/40 bg-white/20 p-6 backdrop-blur-sm">
                    <Sparkles className="size-12 text-white" />
                  </div>
                  <Stars className="absolute -top-2 -right-2 size-6 animate-pulse text-yellow-300" />
                  <Wand2
                    className="absolute -bottom-1 -left-1 size-6 animate-bounce text-white"
                    style={{ animationDelay: '0.3s' }}
                  />
                </div>
              </motion.div>

              {/* Text Content */}
              <Badge className="mb-4 border-white/30 bg-white/20 px-4 py-1 text-white backdrop-blur-sm">
                ✨ AI-Powered Experience
              </Badge>

              <h2 className="mb-4 text-3xl text-white md:text-4xl">
                Dream It. We'll Plan It.
              </h2>

              <p className="mb-3 text-xl text-white/95 md:text-2xl">
                Let our AI Trip Planner create your perfect journey
              </p>

              <p className="mx-auto mb-8 max-w-2xl text-white/80">
                Tell us your dreams, preferences, and budget. Our intelligent AI
                will craft a personalized itinerary tailored just for you - from
                hidden gems to iconic destinations. Your adventure awaits! 🌍✨
              </p>

              {/* Features */}
              <div className="mx-auto mb-8 grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <Wand2 className="mx-auto mb-2 size-6 text-white" />
                  <p className="text-sm text-white">
                    AI-Powered Recommendations
                  </p>
                </div>
                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <Stars className="mx-auto mb-2 size-6 text-yellow-300" />
                  <p className="text-sm text-white">Personalized Itineraries</p>
                </div>
                <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <Sparkles className="mx-auto mb-2 size-6 text-white" />
                  <p className="text-sm text-white">Instant Planning</p>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                size="lg"
                className="bg-white text-purple-600 shadow-xl transition-all duration-300 group-hover:scale-110 hover:scale-105 hover:bg-gray-100 hover:shadow-2xl"
                onClick={() => router.push('/ai-planner-intro')}
              >
                <Sparkles className="mr-2 size-5" />
                Start AI Trip Planner
                <Wand2 className="ml-2 size-5" />
              </Button>

              <p className="mt-4 text-sm text-white/60">
                No credit card required • Free to explore
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filter Tabs */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {filterCategories.map((filter) => (
            <Badge
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 transition-all ${
                selectedFilter === filter 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-xl"
              onClick={() => router.push(`/packages/${pkg.id}`)}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <Badge className="absolute top-4 right-4 bg-white text-gray-900">
                  {pkg.type}
                </Badge>
                <div className="absolute right-4 bottom-4 left-4">
                  <h3 className="mb-2 text-white">{pkg.name}</h3>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-2 flex items-center gap-2 text-gray-600">
                  <MapPin className="size-4" />
                  <span className="text-sm">{pkg.destination}</span>
                </div>
                <div className="mb-4 flex items-center gap-2 text-gray-600">
                  <Calendar className="size-4" />
                  <span className="text-sm">{pkg.duration}</span>
                </div>

                <div className="mb-6 space-y-2">
                  <p className="text-sm">Package Includes:</p>
                  {pkg.includes.slice(0, 4).map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                  {pkg.includes.length > 4 && (
                    <p className="text-sm text-gray-500 italic">
                      + {pkg.includes.length - 4} more
                    </p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Starting from</p>
                      <p className="text-2xl text-blue-600">${pkg.price}</p>
                      <p className="text-xs text-gray-500">per person</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.div
                      className="flex-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className="group relative w-full overflow-hidden"
                        onClick={(e) => { e.stopPropagation(); router.push(`/packages/${pkg.id}`); }}
                      >
                        <motion.span
                          animate={{
                            x: ['-100%', '200%'],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            repeatDelay: 0.5,
                          }}
                          className="absolute inset-y-0 w-1/2 bg-linear-to-r from-transparent via-white/30 to-transparent"
                          style={{ left: 0 }}
                        />
                        <span className="relative z-10">View Details</span>
                      </Button>
                    </motion.div>
                    <Button
                      variant={addedPackages.includes(pkg.id) ? undefined : 'outline'}
                      className={`flex-1 ${addedPackages.includes(pkg.id) ? 'bg-gray-300 text-gray-600 cursor-not-allowed hover:bg-gray-300' : ''}`}
                      onClick={(e) => { e.stopPropagation(); handleAddToJourneys(pkg); }}
                      disabled={addedPackages.includes(pkg.id) || addingId === pkg.id}
                    >
                      {addedPackages.includes(pkg.id)
                        ? 'Added to Journeys'
                        : addingId === pkg.id
                        ? 'Adding...'
                        : 'Add to Journeys'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* What's Included Section (added before footer) */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-4xl text-gray-900">
            What's Included
          </h2>

          {/* Included */}
          <div className="mb-12 rounded-2xl border border-green-200 bg-green-50 p-8">
            <h3 className="mb-6 text-lg tracking-wide text-green-900">
              INCLUDED IN THE FINAL PRICE
            </h3>

            <ul className="space-y-4">
              {[
                'Roadbook with local tips and expert recommendations',
                '24/7 on-the-ground support',
                'On-trip concierge service',
                'Personalized trip crafting',
                'Entry and exit information and assistance',
                '13 nights of accommodations, with daily breakfast included',
                'All ground transfers, trains, and transport mentioned in the itinerary',
                'All activities mentioned in the itinerary',
                'All guided tours, experiences, and entrance fees mentioned in the itinerary',
                'All classes and workshops mentioned in the itinerary',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="mt-1 size-5 text-green-600" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not Included */}
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <h3 className="mb-6 text-lg tracking-wide text-red-900">
              NOT INCLUDED IN THE FINAL PRICE
            </h3>

            <ul className="space-y-4">
              {[
                'International arrival and departure flights',
                'Travel insurance',
                'Personal expenses and gratuities',
                'Anything else not included or listed as optional in the itinerary',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <X className="mt-1 size-5 text-red-600" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {bookingStep === 'details' && '📋 Booking Details'}
              {bookingStep === 'payment' && '💳 Payment Information'}
              {bookingStep === 'confirmation' && '✅ Confirm Your Booking'}
            </DialogTitle>
            <DialogDescription>
              {bookingStep === 'details' &&
                'Please provide your travel details'}
              {bookingStep === 'payment' && 'Enter your payment information'}
              {bookingStep === 'confirmation' &&
                'Review your booking before confirming'}
            </DialogDescription>
          </DialogHeader>

          {selectedPackage && (
            <div className="mb-4 rounded-lg bg-blue-50 p-4">
              <div className="flex items-start gap-4">
                <img
                  src={selectedPackage.image}
                  alt={selectedPackage.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-lg">{selectedPackage.name}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedPackage.destination}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedPackage.duration}
                  </p>
                  <p className="text-sm text-blue-600">
                    ${selectedPackage.price} per person
                  </p>
                </div>
              </div>
            </div>
          )}

          {bookingStep === 'details' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="travelers">Number of Travelers *</Label>
                <Input
                  id="travelers"
                  type="number"
                  value={numberOfTravelers}
                  onChange={(e) => setNumberOfTravelers(Number(e.target.value))}
                  min={1}
                  max={10}
                  className="mt-2"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Total: ${(selectedPackage?.price || 0) * numberOfTravelers}
                </p>
              </div>

              <div>
                <Label htmlFor="travelDate">Preferred Travel Date *</Label>
                <Input id="travelDate" type="date" className="mt-2" />
              </div>

              <div>
                <Label htmlFor="specialRequests">
                  Special Requests (Optional)
                </Label>
                <Input
                  id="specialRequests"
                  type="text"
                  placeholder="Dietary restrictions, room preferences, etc."
                  className="mt-2"
                />
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Payment →
                </Button>
              </div>
            </div>
          )}

          {bookingStep === 'payment' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="cardName">Cardholder Name *</Label>
                <Input
                  id="cardName"
                  type="text"
                  placeholder="John Doe"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input
                    id="expiryDate"
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    maxLength={3}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="billingAddress">Billing Address *</Label>
                <Input
                  id="billingAddress"
                  type="text"
                  placeholder="123 Main St, City, Country"
                  className="mt-2"
                />
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" onClick={handlePreviousStep}>
                  ← Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Review Booking →
                </Button>
              </div>
            </div>
          )}

          {bookingStep === 'confirmation' && (
            <div className="space-y-6">
              <div className="rounded-lg border border-green-200 bg-green-50 p-6">
                <h3 className="mb-4 text-xl">Booking Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Package:</span>
                    <span>{selectedPackage?.name}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Destination:</span>
                    <span>{selectedPackage?.destination}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span>{selectedPackage?.duration}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Travelers:</span>
                    <span>{numberOfTravelers}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per person:</span>
                    <span>${selectedPackage?.price}</span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-xl">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">
                      ${(selectedPackage?.price || 0) * numberOfTravelers}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> This is a demo booking. No actual
                  payment will be processed. In a real system, you would receive
                  a confirmation email with your booking details.
                </p>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" onClick={handlePreviousStep}>
                  ← Back
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Confirm Booking ✓
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}