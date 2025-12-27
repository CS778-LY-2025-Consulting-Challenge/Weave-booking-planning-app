'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Wifi,
  Utensils,
  Dumbbell,
  Coffee,
  Wine,
  Droplet,
  Car,
  Clock,
  MapPin,
  Calendar,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

// Mock hotel details data
const hotelDetailsData: Record<string, any> = {
  'luxury-grand-hotel': {
    id: 'luxury-grand-hotel',
    name: 'Luxury Grand Hotel',
    city: 'New York',
    country: 'USA',
    rating: 4.9,
    reviews: 342,
    description: 'Experience ultimate luxury at our 5-star hotel with world-class amenities and personalized service.',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1595521624512-6dfb63b2ebb9?w=1200&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=600&fit=crop',
    ],
    location: '123 Fifth Avenue, New York, NY 10001',
    checkinTime: '3:00 PM',
    checkoutTime: '11:00 AM',
    cancellationPolicy: 'Free cancellation up to 7 days before arrival',
    rooms: [
      {
        id: 1,
        name: 'Standard Room',
        description: 'Comfortable room with city view, queen bed, and modern amenities',
        price: 299,
        beds: '1 Queen',
        guests: 2,
        size: '350 sq ft',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
        amenities: ['Free WiFi', 'Air Conditioning', 'Flat-screen TV', 'Work Desk'],
      },
      {
        id: 2,
        name: 'Deluxe Room',
        description: 'Spacious room with panoramic city views, premium bedding, and luxury bathroom',
        price: 499,
        beds: '1 King',
        guests: 2,
        size: '500 sq ft',
        image: 'https://images.unsplash.com/photo-1595521624512-6dfb63b2ebb9?w=800&h=600&fit=crop',
        amenities: ['Free WiFi', 'Mini Bar', 'Bathrobe & Slippers', 'Premium Toiletries'],
      },
      {
        id: 3,
        name: 'Presidential Suite',
        description: 'Luxurious multi-room suite with separate living area, spa-like bathroom, and concierge service',
        price: 999,
        beds: '2 King',
        guests: 4,
        size: '1000 sq ft',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
        amenities: ['24/7 Concierge', 'Private Spa', 'Separate Living Room', 'Complimentary Breakfast'],
      },
    ],
    amenities: [
      { icon: Wifi, name: 'Free WiFi', description: 'Throughout the hotel' },
      { icon: Utensils, name: 'Fine Dining', description: '3 restaurants on-site' },
      { icon: Dumbbell, name: 'Fitness Center', description: 'State-of-the-art equipment' },
      { icon: Coffee, name: 'Café & Bar', description: '24/7 service' },
      { icon: Wine, name: 'Wine Cellar', description: 'Curated collection' },
      { icon: Droplet, name: 'Spa & Pool', description: 'Rooftop infinity pool' },
      { icon: Car, name: 'Valet Parking', description: 'Complimentary' },
      { icon: Users, name: 'Concierge', description: '24/7 availability' },
    ],
  },
};

export default function HotelDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = params.id as string;
  const hotel = hotelDetailsData[hotelId] || hotelDetailsData['luxury-grand-hotel'];

  // Booking form states
  const [bookingStep, setBookingStep] = useState(1);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [rooms, setRooms] = useState('1');
  const [selectedRoom, setSelectedRoom] = useState(hotel.rooms[0]);
  const [guestDetails, setGuestDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();
  const totalPrice = selectedRoom.price * nights * parseInt(rooms);

  const handleBooking = () => {
    if (!checkIn || !checkOut || !guestDetails.firstName || !guestDetails.lastName || !guestDetails.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Booking confirmed! Check your email for confirmation.');
    router.push('/hotels');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="border-b bg-white pt-20">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-black"
          >
            <ChevronLeft className="size-5" />
            Back to Search
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{hotel.name}</h1>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="size-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{hotel.rating}</span>
                  <span className="text-gray-600">({hotel.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="size-5" />
                  <span>{hotel.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Images Gallery */}
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="md:col-span-2"
            >
              <img
                src={hotel.images[0]}
                alt="Hotel main"
                className="h-96 w-full rounded-lg object-cover shadow-lg"
              />
            </motion.div>
            {hotel.images.slice(1).map((img: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i + 1) * 0.1 }}
              >
                <img
                  src={img}
                  alt={`Hotel ${i + 2}`}
                  className="h-96 w-full rounded-lg object-cover shadow-lg"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="border-b px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-lg text-gray-700">{hotel.description}</p>
        </div>
      </div>

      {/* Amenities */}
      <div className="border-b px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-3xl font-bold">Hotel Amenities</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {hotel.amenities.map((amenity: any, idx: number) => {
              const Icon = amenity.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-lg bg-gray-50 p-6"
                >
                  <Icon className="mb-3 size-8 text-gray-900" />
                  <h3 className="mb-1 font-semibold text-gray-900">{amenity.name}</h3>
                  <p className="text-sm text-gray-600">{amenity.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Room Types */}
      <div className="border-b px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-3xl font-bold">Room Types</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {hotel.rooms.map((room: any, idx: number) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedRoom(room)}
                className={`cursor-pointer rounded-lg border-2 transition-all ${
                  selectedRoom.id === room.id
                    ? 'border-black bg-black/5'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <img
                  src={room.image}
                  alt={room.name}
                  className="h-64 w-full rounded-t-lg object-cover"
                />
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-bold">{room.name}</h3>
                  <p className="mb-4 text-sm text-gray-600">{room.description}</p>
                  <div className="mb-4 space-y-2 border-b pb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size</span>
                      <span className="font-semibold">{room.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Beds</span>
                      <span className="font-semibold">{room.beds}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests</span>
                      <span className="font-semibold">{room.guests} max</span>
                    </div>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {room.amenities.map((amenity: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-2xl font-bold">
                    ${room.price}
                    <span className="text-sm text-gray-600">/night</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Policies */}
      <div className="border-b px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-3xl font-bold">Hotel Policies</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="size-5 text-gray-900" />
                  <h3 className="font-bold">Check-in / Check-out</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Check-in: {hotel.checkinTime} | Check-out: {hotel.checkoutTime}
                </p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <h3 className="mb-2 font-bold">Cancellation Policy</h3>
                <p className="text-sm text-gray-600">{hotel.cancellationPolicy}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-3xl font-bold">Complete Your Booking</h2>

          <div className="mb-8 flex gap-4">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                onClick={() => setBookingStep(step)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  bookingStep >= step
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                Step {step}
              </button>
            ))}
          </div>

          <Card className="border-gray-200">
            <CardContent className="p-8">
              {/* Step 1: Dates & Guests */}
              {bookingStep === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="checkin" className="mb-2 block font-semibold">
                        Check-in Date
                      </Label>
                      <Input
                        id="checkin"
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkout" className="mb-2 block font-semibold">
                        Check-out Date
                      </Label>
                      <Input
                        id="checkout"
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label htmlFor="guests" className="mb-2 block font-semibold">
                        Number of Guests
                      </Label>
                      <Select value={guests} onValueChange={setGuests}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} {n === 1 ? 'Guest' : 'Guests'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rooms" className="mb-2 block font-semibold">
                        Number of Rooms
                      </Label>
                      <Select value={rooms} onValueChange={setRooms}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n} {n === 1 ? 'Room' : 'Rooms'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm text-gray-600">
                      {nights} nights × {rooms} room(s) × ${selectedRoom.price}/night
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      Total: ${totalPrice}
                    </p>
                  </div>

                  <Button
                    onClick={() => setBookingStep(2)}
                    disabled={!checkIn || !checkOut}
                    className="w-full bg-black py-6 text-lg hover:bg-gray-800"
                  >
                    Continue to Guest Details
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Guest Details */}
              {bookingStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label className="mb-2 block font-semibold">First Name *</Label>
                      <Input
                        value={guestDetails.firstName}
                        onChange={(e) =>
                          setGuestDetails({
                            ...guestDetails,
                            firstName: e.target.value,
                          })
                        }
                        className="border-gray-300"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block font-semibold">Last Name *</Label>
                      <Input
                        value={guestDetails.lastName}
                        onChange={(e) =>
                          setGuestDetails({
                            ...guestDetails,
                            lastName: e.target.value,
                          })
                        }
                        className="border-gray-300"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block font-semibold">Email Address *</Label>
                    <Input
                      type="email"
                      value={guestDetails.email}
                      onChange={(e) =>
                        setGuestDetails({
                          ...guestDetails,
                          email: e.target.value,
                        })
                      }
                      className="border-gray-300"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block font-semibold">Phone Number</Label>
                    <Input
                      value={guestDetails.phone}
                      onChange={(e) =>
                        setGuestDetails({
                          ...guestDetails,
                          phone: e.target.value,
                        })
                      }
                      className="border-gray-300"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setBookingStep(1)}
                      variant="outline"
                      className="flex-1 py-6"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setBookingStep(3)}
                      className="flex-1 bg-black py-6 hover:bg-gray-800"
                    >
                      Continue to Review
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review & Confirm */}
              {bookingStep === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="space-y-4 rounded-lg bg-gray-50 p-6">
                    <h3 className="text-lg font-bold">Booking Summary</h3>
                    <div className="space-y-2 border-b pb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in</span>
                        <span className="font-semibold">{checkIn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out</span>
                        <span className="font-semibold">{checkOut}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room Type</span>
                        <span className="font-semibold">{selectedRoom.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Number of Rooms</span>
                        <span className="font-semibold">{rooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guests</span>
                        <span className="font-semibold">{guests}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{nights} nights × ${selectedRoom.price}</span>
                        <span className="font-semibold">${selectedRoom.price * nights * parseInt(rooms)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-4 text-lg">
                        <span className="font-bold">Total Price</span>
                        <span className="font-bold">${totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-lg bg-gray-50 p-6">
                    <h3 className="text-lg font-bold">Guest Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name</span>
                        <span className="font-semibold">
                          {guestDetails.firstName} {guestDetails.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email</span>
                        <span className="font-semibold">{guestDetails.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone</span>
                        <span className="font-semibold">{guestDetails.phone || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setBookingStep(2)}
                      variant="outline"
                      className="flex-1 py-6"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleBooking}
                      className="flex-1 bg-black py-6 text-lg hover:bg-gray-800"
                    >
                      Confirm Booking
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Get In Touch / Contact Section */}
      <div className="border-t bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h2 className="mb-8 text-3xl font-bold">Get In Touch</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black">
                    <MapPin className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Address</p>
                    <p className="text-lg">{hotel.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black">
                    <Phone className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Phone</p>
                    <p className="text-lg">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black">
                    <Mail className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Email</p>
                    <p className="text-lg">reservations@{hotel.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-black">
                    <Clock className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Check-in / Check-out</p>
                    <p className="text-lg">{hotel.checkinTime} / {hotel.checkoutTime}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="p-8">
                  <h3 className="mb-6 text-2xl font-bold">Special Offers</h3>
                  <p className="mb-6 text-gray-600">
                    Subscribe to receive exclusive offers, event invitations, and the latest news from {hotel.name}.
                  </p>
                  <div className="space-y-4">
                    <Input placeholder="Your email address" className="h-12 border-gray-300" />
                    <Button className="h-12 w-full bg-black hover:bg-gray-800">
                      Subscribe
                      <ChevronRight className="ml-2 size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
