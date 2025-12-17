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
import { Calendar, Check, MapPin, Sparkles, Stars, Wand2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
  const [addedPackages, setAddedPackages] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('savedPackages');
    if (saved) {
      setAddedPackages(JSON.parse(saved).map((pkg: any) => pkg.id));
    }
  }, []);

  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [numberOfTravelers, setNumberOfTravelers] = useState(1);
  const [bookingStep, setBookingStep] = useState<
    'details' | 'payment' | 'confirmation'
  >('details');

  const packages: Package[] = [
    {
      id: 1,
      name: 'Tropical Paradise Getaway',
      destination: 'Maldives',
      duration: '7 Days / 6 Nights',
      price: 2499,
      image:
        'https://images.unsplash.com/photo-1551727095-10465ee6b17f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzY0NTE3NjA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      includes: [
        'Round-trip flights',
        '6 nights in 5-star resort',
        'All meals included',
        'Water sports activities',
        'Spa treatment',
      ],
      type: 'Luxury',
    },
    {
      id: 2,
      name: 'European Highlights Tour',
      destination: 'Paris, Rome, Barcelona',
      duration: '14 Days / 13 Nights',
      price: 3299,
      image:
        'https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2NDQ3MTg2NHww&ixlib=rb-4.1.0&q=80&w=1080',
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
      image:
        'https://images.unsplash.com/photo-1591194233688-dca69d406068?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGphcGFuJTIwY2l0eXxlbnwxfHx8fDE3NjQ1MjYyNjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
      image:
        'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2V8ZW58MXx8fHwxNzY0NDIxNzYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
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
      image:
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdWJhaSUyMHNreWxpbmV8ZW58MXx8fHwxNzY0NDk3MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
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
      image:
        'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxpJTIwaW5kb25lc2lhfGVufDF8fHx8MTc2NDUzNzMxMXww&ixlib=rb-4.1.0&q=80&w=1080',
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

  const handleAddToJourneys = (pkgId: number) => {
    const updatedPackages = [...addedPackages, pkgId];
    setAddedPackages(updatedPackages);
    localStorage.setItem(
      'savedPackages',
      JSON.stringify(packages.filter((pkg) => updatedPackages.includes(pkg.id)))
    );
    toast.success('Package added to your journeys!');
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h1 className="mb-6 text-5xl text-white drop-shadow-2xl md:text-7xl">
              Travel Packages
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-200 md:text-2xl">
              Explore our curated travel packages with flights, hotels, and
              experiences all included. Book now and let us handle the details!
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:from-blue-700 hover:to-purple-700"
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
      >
        {/* AI Trip Planner - Premium Featured Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Card className="hover:shadow-3xl group relative overflow-hidden border-none bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl transition-all duration-500">
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
                onClick={() => router.push('/ai-planner')}
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
          <Badge
            variant="outline"
            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
          >
            All Packages
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
          >
            Luxury
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
          >
            Culture
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
          >
            Beach & Relaxation
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
          >
            Adventure
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
          >
            Wellness
          </Badge>
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className="group overflow-hidden transition-shadow hover:shadow-xl"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
                      <Check className="mt-0.5 size-4 flex-shrink-0 text-green-600" />
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
                        onClick={() => router.push(`/packages/${pkg.id}`)}
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
                          className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          style={{ left: 0 }}
                        />
                        <span className="relative z-10">View Details</span>
                      </Button>
                    </motion.div>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleAddToJourneys(pkg.id)}
                      disabled={addedPackages.includes(pkg.id)}
                    >
                      {addedPackages.includes(pkg.id)
                        ? 'Added to Journeys'
                        : 'Add to Journeys'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

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
