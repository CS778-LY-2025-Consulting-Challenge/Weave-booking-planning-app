'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Check,
  Edit,
  Hotel,
  LogOut,
  MapPin,
  Plane,
  Plus,
  Trash2,
  X,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { getSavedTrips, saveTrip, updateTrip, deleteTrip } from '@/lib/savedTrips';
import { getBookings, deleteBooking } from '@/lib/bookings';
import { getUserProfile, type UserProfile } from '@/lib/userProfile';
import DashboardMap from '@/components/DashboardMap';
import YourJourneys from '@/components/YourJourneys';
import UpcomingBookingsTickets from '@/components/UpcomingBookingsTickets';

interface Journey {
  id: number | string;
  destination: string;
  startDate: string;
  endDate: string;
  flightBooked: boolean;
  hotelBooked: boolean;
  type: 'upcoming' | 'past' | 'copied' | 'current';
  notes?: string;
  photos?: string[];
  cities?: string[];
  bookingType?: string;
  image?: string;
  packageId?: string;
  packageName?: string;
  packageDestination?: string;
  packageDuration?: string;
  packagePrice?: number;
  packageIncludes?: string[];
  packageType?: string;
}

interface SavedPackage {
  id: number;
  name: string;
  destination: string;
  duration: string;
  price: number;
  image: string;
  includes: string[];
  type: string;
}

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  // Saved Journeys (Firebase)
  const [savedTrips, setSavedTrips] = useState<Record<string, any>>({});
  const [savedLoading, setSavedLoading] = useState(true);
  const [newTrip, setNewTrip] = useState({ destination: '', date: '' });
  const [editTripId, setEditTripId] = useState<string | null>(null);
  const [editTrip, setEditTrip] = useState({ destination: '', date: '' });

  // Calendar Interactivity State
  const [selectedCalendarJourney, setSelectedCalendarJourney] = useState<Journey | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setDate(date);

    const clickedJourney = upcomingJourneys.find(journey => {
      const start = new Date(journey.startDate);
      const end = new Date(journey.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate >= start && checkDate <= end;
    });

    if (clickedJourney) {
      setSelectedCalendarJourney(clickedJourney);
      setIsDialogOpen(true);
    }
  };

  const handleCancelBooking = async () => {
    if (!user?.id || !selectedCalendarJourney) return;

    // Only allow cancelling if it's a real booking (starts with BK- or has a specific ID format we know comes from DB)
    // In our case, we map `id` to `b.id` from firebase.
    const bookingId = selectedCalendarJourney.id.toString();

    if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        await deleteBooking(user.id, bookingId);

        // Update local state to remove the cancelled journey
        setJourneys(prev => prev.filter(j => j.id !== selectedCalendarJourney.id));

        // Close dialog
        setIsDialogOpen(false);
        setSelectedCalendarJourney(null);
        toast.success('Booking cancelled successfully');
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        toast.error('Failed to cancel booking');
      }
    }
  };

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Authentication check - redirect to auth if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth');
      return;
    }

    if (isLoaded && isSignedIn) {
      const userType = user?.publicMetadata?.userType as string;

      // Redirect to onboarding if no user type is set
      if (!userType) {
        router.push('/onboarding');
        return;
      }

      // Redirect to guide dashboard if user is a guide
      if (userType === 'guide') {
        router.push('/guide-dashboard');
        return;
      }
    }
  }, [isLoaded, isSignedIn, user, router]);


  // Load saved trips and profile from Firebase
  useEffect(() => {
    if (!user?.id) return;
    setSavedLoading(true);
    setProfileLoading(true);

    // Fetch Trips
    getSavedTrips(user.id).then((data) => {
      setSavedTrips(data || {});
      setSavedLoading(false);
    });

    // Fetch Profile
    getUserProfile(user.id).then((data) => {
      setUserProfile(data);
      setProfileLoading(false);
    });
  }, [user?.id]);

  // CRUD Handlers for Saved Journeys
  const handleAddTrip = async () => {
    if (!user?.id || !newTrip.destination || !newTrip.date) return;
    await saveTrip(user.id, newTrip);
    setNewTrip({ destination: '', date: '' });
    const data = await getSavedTrips(user.id);
    setSavedTrips(data || {});
  };

  const handleEditTrip = (id: string, trip: any) => {
    setEditTripId(id);
    setEditTrip({ ...trip });
  };

  const handleUpdateTrip = async () => {
    if (!user?.id || !editTripId) return;
    await updateTrip(user.id, editTripId, editTrip);
    setEditTripId(null);
    setEditTrip({ destination: '', date: '' });
    const data = await getSavedTrips(user.id);
    setSavedTrips(data || {});
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!user?.id) return;
    await deleteTrip(user.id, tripId);
    const data = await getSavedTrips(user.id);
    setSavedTrips(data || {});
  };

  const handleDeleteJourney = (journeyId: number | string) => {
    setJourneys((prev) => prev.filter((journey) => journey.id !== journeyId));
  };



  const [journeys, setJourneys] = useState<Journey[]>([
    {
      id: 1,
      destination: 'Tokyo, Japan',
      startDate: '2026-02-10',
      endDate: '2026-02-20',
      flightBooked: true,
      hotelBooked: true,
      type: 'upcoming',
      image: '/images/tokyo-dashboard.jpg',
    },
    {
      id: 2,
      destination: 'Paris, France',
      startDate: '2026-03-15',
      endDate: '2026-03-22',
      flightBooked: false,
      hotelBooked: true,
      type: 'upcoming',
      image: '/images/paris-dashboard.jpg',
    },
    {
      id: 3,
      destination: 'Bali, Indonesia',
      startDate: '2025-06-01',
      endDate: '2025-06-10',
      flightBooked: true,
      hotelBooked: true,
      type: 'past',
      notes: 'Amazing trip! The temples were breathtaking.',
      image: '/images/bali-package.jpg',
      bookingType: 'package',
      packageId: '6',
      packageName: 'Bali Wellness Retreat',
      packageDestination: 'Ubud & Seminyak, Bali',
      packageDuration: '8 Days / 7 Nights',
      packagePrice: 1699,
      packageIncludes: [
        'Round-trip flights',
        '7 nights accommodation',
        'Daily yoga classes',
        'Spa treatments',
        'Healthy meals',
      ],
      packageType: 'Wellness',
    },
    {
      id: 4,
      destination: 'European Grand Tour',
      startDate: '2026-04-01',
      endDate: '2026-04-21',
      flightBooked: false,
      hotelBooked: false,
      type: 'copied',
      image: '/images/europe-dasboard.jpg',
      cities: [
        'Paris',
        'Amsterdam',
        'Berlin',
        'Prague',
        'Vienna',
        'Venice',
        'Rome',
      ],
    },
    {
      id: 5,
      destination: 'Athens, Greece',
      startDate: '2025-08-15',
      endDate: '2025-08-24',
      flightBooked: true,
      hotelBooked: true,
      type: 'past',
      notes: 'Greek Island Adventure - stunning sunsets in Santorini!',
      image: '/images/greek - package.jpg',
      bookingType: 'package',
      packageId: '4',
      packageName: 'Greek Island Adventure',
      packageDestination: 'Athens, Santorini, Mykonos',
      packageDuration: '10 Days / 9 Nights',
      packagePrice: 2199,
      packageIncludes: [
        'International flights',
        'Ferry transfers',
        '9 nights in hotels',
        'Sunset cruise',
        'Archaeological tours',
      ],
      packageType: 'Beach & Culture',
      cities: ['Athens', 'Santorini', 'Mykonos'],
    },
    {
      id: 6,
      destination: 'Dubai, UAE',
      startDate: '2025-11-10',
      endDate: '2025-11-14',
      flightBooked: true,
      hotelBooked: true,
      type: 'past',
      notes: 'Luxury escape - Burj Khalifa was incredible!',
      image: '/images/dubai - package.jpg',
      bookingType: 'package',
      packageId: '5',
      packageName: 'Dubai Luxury Escape',
      packageDestination: 'Dubai, UAE',
      packageDuration: '5 Days / 4 Nights',
      packagePrice: 1899,
      packageIncludes: [
        'Round-trip flights',
        '4 nights in 5-star hotel',
        'Desert safari',
        'Burj Khalifa tickets',
        'Dubai Mall tour',
      ],
      packageType: 'Luxury',
    },
    {
      id: 7,
      destination: 'Paris, France',
      startDate: '2025-04-20',
      endDate: '2025-05-03',
      flightBooked: true,
      hotelBooked: true,
      type: 'past',
      notes: 'European Highlights Tour - visited Paris, Rome, and Barcelona!',
      image: '/images/europe - package.jpg',
      bookingType: 'package',
      packageId: '2',
      packageName: 'European Highlights Tour',
      packageDestination: 'Paris, Rome, Barcelona',
      packageDuration: '14 Days / 13 Nights',
      packagePrice: 3299,
      packageIncludes: [
        'International flights',
        '13 nights in 4-star hotels',
        'Daily breakfast',
        'Guided city tours',
        'Museum passes',
      ],
      packageType: 'Culture',
      cities: ['Paris', 'Rome', 'Barcelona'],
    },
    {
      id: 8,
      destination: 'Queenstown, New Zealand',
      startDate: '2025-02-01',
      endDate: '2025-02-10',
      flightBooked: true,
      hotelBooked: true,
      type: 'past',
      notes: 'New Zealand Adventure - Milford Sound was breathtaking!',
      image: '/images/new zealand - package.jpg',
      bookingType: 'package',
      packageId: '1',
      packageName: 'New Zealand Adventure',
      packageDestination: 'Auckland, Rotorua, Queenstown, Milford Sound',
      packageDuration: '10 Days / 9 Nights',
      packagePrice: 2899,
      packageIncludes: [
        'Round-trip flights',
        '9 nights accommodation in scenic locations',
        'Milford Sound cruise',
        'Hobbiton movie set tour',
        'Adventure activities (bungee jumping, sky diving)',
        'Thermal pools of Rotorua',
        'Scenic drives and nature hikes',
      ],
      packageType: 'Adventure',
      cities: ['Auckland', 'Rotorua', 'Queenstown'],
    },
  ]);

  // Fetch real bookings and merge into journeys
  useEffect(() => {
    if (!user?.id) return;

    import('@/lib/bookings').then(async ({ getBookings }) => {
      try {
        const bookings = await getBookings(user.id);
        // Filter out flights since they have their own "Tickets & Reservations" section
        const nonFlightBookings = bookings.filter(b => b.type !== 'flight');
        const newJourneys: Journey[] = nonFlightBookings.map(b => {
          const isFlight = b.type === 'flight';
          const isHotel = b.type === 'hotel';
          const isPackage = b.type === 'package';

          let destination = 'Unknown Destination';
          let startDate = new Date().toISOString().split('T')[0];
          let endDate = new Date().toISOString().split('T')[0];
          let image: string | undefined = undefined;
          let cities: string[] | undefined = undefined;
          let packageId: string | undefined = undefined;

          if (isPackage) {
            // Display Package Name as the main "Destination" (Title)
            destination = b.details?.pkgName || b.details?.destination || 'Travel Package';
            // Show the actual location in the subtitle (cities)
            if (b.details?.destination) {
              cities = [b.details.destination];
            }
            startDate = b.details?.startDate || startDate;
            endDate = b.details?.endDate || endDate;
            // Generic package image or from details
            image = b.details?.bookingImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=3421&auto=format&fit=crop';
            // Use metadata packageId if available, or fallback to parsing from somewhere if possible
            packageId = b.details?.packageId || b.details?.pkgId;
          } else if (isHotel) {
            destination = b.details?.hotelLocation || b.details?.hotelName || 'Hotel Stay';
            startDate = b.details?.checkInDate || startDate;
            endDate = b.details?.checkOutDate || endDate;
            image = b.details?.bookingImage;
          } else if (isFlight) {
            destination = `${b.details?.toCode} - ${b.details?.to?.split(',')[0]}`;
            startDate = b.details?.departureDate?.split('T')[0] || startDate;
            endDate = startDate; // Flights are single day usually for this view
          }
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(0, 0, 0, 0);



          // Allow packages starting within 3 days to show as 'current' (Active/Starting Soon)
          const nearFuture = new Date(today);
          nearFuture.setDate(today.getDate() + 3);

          let type: 'upcoming' | 'past' | 'current' = 'past';

          if (isPackage && start <= nearFuture && end >= today) {
            type = 'current';
          } else if (start >= today || (start <= today && end >= today)) {
            // If it's today (but not a package) or future, it's upcoming
            type = 'upcoming';
          } else {
            type = 'past';
          }

          // If the item specifically has a 'type' from db that isn't date based (like copied), we might want to respect it?
          // But for bookings 'upcoming'/'past' is dynamic based on dates.

          return {
            id: b.id || b.stripeSessionId || Math.random().toString(),
            destination,
            startDate,
            endDate,
            flightBooked: isFlight || isPackage,
            hotelBooked: isHotel || isPackage,
            type,
            image,
            packageId,
            cities,
            bookingType: b.type // Pass the actual booking type for debugging/display
          };
        });

        // Avoid duplicates if possible (simple id check against hardcoded)
        setJourneys(prev => {
          const hardcodedIds = new Set([1, 2, 3, 4, 5, 6, 7, 8]);
          // Filter out any previous dynamic additions if we re-fetch (optional, but good practice)
          const baseJourneys = prev.filter(j => hardcodedIds.has(j.id as any));
          return [...baseJourneys, ...newJourneys];
        });

      } catch (error) {
        console.error("Failed to fetch bookings for dashboard:", error);
      }
    });
  }, [user?.id]);

  const upcomingJourneys = journeys.filter((j) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(j.startDate);
    startDate.setHours(0, 0, 0, 0);
    return startDate >= today;
  });
  const pastJourneys = journeys.filter((j) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(j.endDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate < today;
  });
  const copiedJourneys = journeys.filter((j) => j.type === 'copied');

  // Coordinates mapping for common destinations
  const destinationCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'Bali': { lat: -8.3405, lng: 115.0920 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Sydney': { lat: -33.8688, lng: 151.2093 },
    'Dubai': { lat: 25.2048, lng: 55.2708 },
    'London': { lat: 51.5074, lng: -0.1278 },
    'Rome': { lat: 41.9028, lng: 12.4964 },
    'Barcelona': { lat: 41.3851, lng: 2.1734 },
    'Amsterdam': { lat: 52.3676, lng: 4.9041 },
    'Berlin': { lat: 52.5200, lng: 13.4050 },
    'Prague': { lat: 50.0755, lng: 14.4378 },
    'Vienna': { lat: 48.2082, lng: 16.3738 },
    'Venice': { lat: 45.4408, lng: 12.3155 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'Thailand': { lat: 13.7563, lng: 100.5018 },
    'Indonesia': { lat: -8.3405, lng: 115.0920 },
    'Japan': { lat: 35.6762, lng: 139.6503 },
    'France': { lat: 48.8566, lng: 2.3522 },
    'Athens': { lat: 37.9838, lng: 23.7275 },
    'Greece': { lat: 37.9838, lng: 23.7275 },
    'Queenstown': { lat: -45.0312, lng: 168.6626 },
    'New Zealand': { lat: -41.2865, lng: 174.7762 },
    'UAE': { lat: 25.2048, lng: 55.2708 },
  };

  // Extract map destinations from past journeys only
  const mapDestinations = pastJourneys.map(journey => {
    // Parse destination (format can be "City, Country" or just "City")
    const destinationParts = journey.destination.split(',');
    const cityName = destinationParts[0].trim();

    // Try to find coordinates
    let coords = destinationCoordinates[cityName];

    // If not found, try the full destination string
    if (!coords && destinationParts.length > 1) {
      const countryName = destinationParts[1].trim();
      coords = destinationCoordinates[countryName];
    }

    // If still not found, try to match partial strings
    if (!coords) {
      const matchingKey = Object.keys(destinationCoordinates).find(key =>
        journey.destination.toLowerCase().includes(key.toLowerCase())
      );
      if (matchingKey) {
        coords = destinationCoordinates[matchingKey];
      }
    }

    // Default fallback coordinates (center of world map) if not found
    const finalCoords = coords || { lat: 0, lng: 0 };

    return {
      name: cityName,
      lat: finalCoords.lat,
      lng: finalCoords.lng,
    };
  }).filter(dest => dest.lat !== 0 || dest.lng !== 0); // Filter out fallback coordinates


  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-4xl" style={{ fontFamily: 'var(--font-bonheur-royale)' }}>
            Welcome back, {user?.firstName || 'Nayak'}!
          </h1>
          <p
            className="text-gray-600 text-2xl"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            Manage your journeys and plan your next adventure.
          </p>
        </div>




        {/* World Map Section - Full Width */}
        <Card className="mb-8 overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <DashboardMap destinations={mapDestinations} height={500} />
          </CardContent>
        </Card>

        {/* Upcoming Bookings Tickets */}
        {user?.id && (
          <div className="mb-12">
            <h3
              className="text-2xl font-bold mb-6 text-gray-800"
              style={{ fontFamily: '"Times New Roman", Times, serif' }}
            >
              Your Tickets & Reservations
            </h3>
            <UpcomingBookingsTickets userId={user.id} />
          </div>
        )}

        {/* Your Journeys Section */}
        <YourJourneys
          journeys={journeys}
          savedTripsCount={Object.keys(savedTrips).length}
          savedTrips={savedTrips}
          savedLoading={savedLoading}
          newTrip={newTrip}
          setNewTrip={setNewTrip}
          editTripId={editTripId}
          setEditTripId={setEditTripId}
          editTrip={editTrip}
          setEditTrip={setEditTrip}
          handleAddTrip={handleAddTrip}
          handleEditTrip={handleEditTrip}
          handleUpdateTrip={handleUpdateTrip}
          handleDeleteTrip={handleDeleteTrip}
          handleDeleteJourney={handleDeleteJourney}
          handleCancelBooking={async (journey) => {
            if (!user?.id) return;

            if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
              try {
                // Optimistically remove from UI immediately
                setJourneys(prev => prev.filter(j => j.id !== journey.id));

                // Delete from Firebase in background
                await deleteBooking(user.id, journey.id.toString());

                toast.success('Booking cancelled successfully');
              } catch (error) {
                console.error('Failed to cancel booking:', error);
                toast.error('Failed to cancel booking');
                // Refresh journeys on error to restore state
                window.location.reload();
              }
            }
          }}
        />

        {/* Profile and Calendar Section */}
        <div className="flex gap-6 mb-8">
          {/* Profile */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-sm text-gray-500">Name</Label>
                    <p className="font-medium">
                      {userProfile?.firstName && userProfile?.lastName
                        ? `${userProfile.firstName} ${userProfile.lastName}`
                        : user?.fullName || 'Traveler'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Email</Label>
                    <p className="break-all">
                      {userProfile?.email || user?.emailAddresses?.[0]?.emailAddress || 'No email'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Country</Label>
                    <p>{userProfile?.nationality || 'Not Set'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">
                      Budget Preference
                    </Label>
                    <Badge variant={userProfile?.preferences?.budgetPreference ? 'default' : 'secondary'}>
                      {userProfile?.preferences?.budgetPreference || 'Not Set'}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">
                      Season Preference
                    </Label>
                    <Badge variant="outline">
                      {userProfile?.preferences?.seasonPreference || 'Not Set'}
                    </Badge>
                  </div>
                  <div className="pt-3 border-t">
                    <Label className="text-sm text-gray-500">Travel Stats</Label>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-blue-50 p-3 text-center">
                        <p className="text-2xl font-bold text-blue-600">{Object.keys(savedTrips).length}</p>
                        <p className="text-xs text-gray-600">Saved Trips</p>
                      </div>
                      <div className="rounded-lg bg-green-50 p-3 text-center">
                        <p className="text-2xl font-bold text-green-600">{upcomingJourneys.length}</p>
                        <p className="text-xs text-gray-600">Upcoming</p>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-3 text-center">
                        <p className="text-2xl font-bold text-purple-600">{pastJourneys.length}</p>
                        <p className="text-xs text-gray-600">Completed</p>
                      </div>
                      <div className="rounded-lg bg-orange-50 p-3 text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {new Set(journeys.map(j => j.destination)).size}
                        </p>
                        <p className="text-xs text-gray-600">Destinations</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              <Button
                className="w-full"
                variant="outline"
                onClick={() => router.push('/profile')}
              >
                <Edit className="mr-2 size-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="flex-1">
            <CardHeader>
              <div className="space-y-1">
                <CardTitle>
                  {(() => {
                    if (upcomingJourneys.length === 0) {
                      return 'Travel Calendar';
                    }

                    if (upcomingJourneys.length === 1) {
                      const journey = upcomingJourneys[0];
                      const startDate = new Date(journey.startDate);
                      const endDate = new Date(journey.endDate);
                      const startMonth = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      const endMonth = endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

                      if (startMonth === endMonth) {
                        return `Travel Calendar — ${startMonth}`;
                      } else {
                        const startShort = startDate.toLocaleDateString('en-US', { month: 'short' });
                        const endShort = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                        return `Travel Calendar — ${startShort}–${endShort}`;
                      }
                    }

                    // Multiple trips - collect all unique months
                    const monthsSet = new Set<string>();
                    let year = '';

                    upcomingJourneys.forEach(journey => {
                      const start = new Date(journey.startDate);
                      const end = new Date(journey.endDate);

                      // Add all months between start and end
                      const current = new Date(start);
                      while (current <= end) {
                        monthsSet.add(current.toLocaleDateString('en-US', { month: 'short' }));
                        year = current.getFullYear().toString();
                        current.setMonth(current.getMonth() + 1);
                      }
                    });

                    const months = Array.from(monthsSet).join(', ');
                    return `Travel Calendar - ${months} ${year}`;
                  })()}
                </CardTitle>
                <p className="text-sm text-gray-500">Your next adventure starts here</p>
              </div>
            </CardHeader>
            <CardContent>
              <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeInTrip {
                  from {
                    opacity: 0;
                    transform: translateY(-2px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                
                .trip-date-0 {
                  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
                  color: #1e40af !important;
                  font-weight: 600;
                  position: relative;
                  animation: fadeInTrip 0.4s ease-out;
                }
                .trip-date-0:hover {
                  background: linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%) !important;
                  transform: scale(1.05);
                  transition: all 0.2s ease;
                }
                
                .trip-date-1 {
                  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%) !important;
                  color: #be185d !important;
                  font-weight: 600;
                  position: relative;
                  animation: fadeInTrip 0.4s ease-out;
                }
                .trip-date-1:hover {
                  background: linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 100%) !important;
                  transform: scale(1.05);
                  transition: all 0.2s ease;
                }
                
                .trip-date-2 {
                  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%) !important;
                  color: #15803d !important;
                  font-weight: 600;
                  position: relative;
                  animation: fadeInTrip 0.4s ease-out;
                }
                .trip-date-2:hover {
                  background: linear-gradient(135deg, #bbf7d0 0%, #86efac 100%) !important;
                  transform: scale(1.05);
                  transition: all 0.2s ease;
                }
                
                .trip-tooltip {
                  position: absolute;
                  bottom: 100%;
                  left: 50%;
                  transform: translateX(-50%) translateY(-4px);
                  background: rgba(17, 24, 39, 0.95);
                  color: white;
                  padding: 8px 12px;
                  border-radius: 8px;
                  font-size: 11px;
                  white-space: nowrap;
                  pointer-events: none;
                  opacity: 0;
                  transition: opacity 0.2s, transform 0.2s;
                  z-index: 50;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                
                .trip-tooltip::after {
                  content: '';
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 0;
                  height: 0;
                  border-left: 6px solid transparent;
                  border-right: 6px solid transparent;
                  border-top: 6px solid rgba(17, 24, 39, 0.95);
                }
                
                .trip-date-0:hover .trip-tooltip,
                .trip-date-1:hover .trip-tooltip,
                .trip-date-2:hover .trip-tooltip {
                  opacity: 1;
                  transform: translateX(-50%) translateY(-8px);
                }
                
                .trip-label {
                  font-size: 9px;
                  font-weight: 700;
                  letter-spacing: 0.3px;
                  margin-top: 2px;
                  line-height: 1;
                  opacity: 0.9;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  max-width: 100%;
                }
                
                .trip-start-badge {
                  position: absolute;
                  top: -2px;
                  right: -2px;
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  background: currentColor;
                  box-shadow: 0 0 0 2px white;
                  animation: pulse 2s ease-in-out infinite;
                }
                
                @keyframes pulse {
                  0%, 100% {
                    opacity: 1;
                    transform: scale(1);
                  }
                  50% {
                    opacity: 0.7;
                    transform: scale(1.2);
                  }
                }
                
                .calendar-with-trips [data-trip] {
                  border-radius: 8px;
                  transition: all 0.2s ease;
                }
              `}} />
              <div className="calendar-with-trips">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border w-full"
                  formatters={{
                    formatDay: (date) => {
                      const tripData = upcomingJourneys.map((journey, index) => {
                        const start = new Date(journey.startDate);
                        const end = new Date(journey.endDate);
                        start.setHours(0, 0, 0, 0);
                        end.setHours(0, 0, 0, 0);
                        const checkDate = new Date(date);
                        checkDate.setHours(0, 0, 0, 0);

                        if (checkDate >= start && checkDate <= end) {
                          const isStart = checkDate.getTime() === start.getTime();
                          const destination = journey.destination.split(',')[0];
                          const country = journey.destination.split(',')[1]?.trim() || '';
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const status = checkDate >= today ? 'Upcoming' : 'Past';

                          // Get flag emoji based on country
                          const flagMap: { [key: string]: string } = {
                            'Japan': '🇯🇵',
                            'France': '🇫🇷',
                            'Indonesia': '🇮🇩',
                            'USA': '🇺🇸',
                            'UK': '🇬🇧',
                            'Italy': '🇮🇹',
                            'Spain': '🇪🇸',
                            'Germany': '🇩🇪',
                          };
                          const flag = flagMap[country] || '🌍';

                          return {
                            index,
                            destination,
                            country,
                            flag,
                            isStart,
                            status,
                            startDate: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            endDate: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          };
                        }
                        return null;
                      }).filter(Boolean)[0];

                      if (tripData) {
                        return `
                          <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 4px;">
                            ${tripData.isStart ? '<div class="trip-start-badge"></div>' : ''}
                            <div style="font-size: 14px; font-weight: 700;">${date.getDate()}</div>
                            <div class="trip-label">${tripData.destination.substring(0, 5)}</div>
                            <div class="trip-tooltip">
                              <div style="font-weight: 700; margin-bottom: 4px;">${tripData.flag} ${tripData.destination}, ${tripData.country}</div>
                              <div style="font-size: 10px; opacity: 0.9;">${tripData.startDate} → ${tripData.endDate}</div>
                              <div style="margin-top: 4px; padding: 2px 6px; background: rgba(255,255,255,0.2); border-radius: 4px; font-size: 9px; font-weight: 600; display: inline-block;">${tripData.status}</div>
                            </div>
                          </div>
                        `;
                      }
                      return `<div style="font-size: 14px;">${date.getDate()}</div>`;
                    }
                  }}
                  components={{
                    DayButton: ({ day, modifiers, children, ...props }: any) => {
                      const tripIndex = upcomingJourneys.findIndex(journey => {
                        const start = new Date(journey.startDate);
                        const end = new Date(journey.endDate);
                        start.setHours(0, 0, 0, 0);
                        end.setHours(0, 0, 0, 0);
                        const checkDate = new Date(day.date);
                        checkDate.setHours(0, 0, 0, 0);
                        return checkDate >= start && checkDate <= end;
                      });

                      return (
                        <button
                          {...props}
                          className={`${props.className} ${tripIndex !== -1 ? `trip-date-${tripIndex % 3}` : ''}`}
                          data-trip={tripIndex !== -1 ? 'true' : undefined}
                          dangerouslySetInnerHTML={{
                            __html: typeof children === 'string' ? children : children?.props?.children || ''
                          }}
                        />
                      );
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedCalendarJourney?.destination}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <img
                  src={selectedCalendarJourney?.image || '/images/placeholder.jpg'}
                  alt={selectedCalendarJourney?.destination}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Dates</Label>
                  <p className="font-medium">
                    {selectedCalendarJourney && new Date(selectedCalendarJourney.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' - '}
                    {selectedCalendarJourney && new Date(selectedCalendarJourney.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <Badge variant={selectedCalendarJourney?.type === 'past' ? 'secondary' : 'default'} className="mt-1">
                    {selectedCalendarJourney?.type === 'past' ? 'Completed' : 'Upcoming'}
                  </Badge>
                </div>
              </div>
              {selectedCalendarJourney?.notes && (
                <div>
                  <Label className="text-gray-500">Notes</Label>
                  <p className="text-sm text-gray-700">{selectedCalendarJourney.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter className="flex-col sm:justify-between sm:flex-row gap-2">
              <div className="flex w-full sm:w-auto">
                {(selectedCalendarJourney?.type === 'upcoming' || selectedCalendarJourney?.type === 'current') && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full sm:w-auto"
                    onClick={handleCancelBooking}
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="default"
                className="w-full sm:w-auto"
                onClick={() => {
                  if (selectedCalendarJourney?.packageId) {
                    router.push(`/packages/${selectedCalendarJourney.packageId}`);
                  } else if (selectedCalendarJourney?.bookingType === 'flight' || selectedCalendarJourney?.bookingType === 'hotel') {
                    if (selectedCalendarJourney.id && typeof selectedCalendarJourney.id === 'string' && selectedCalendarJourney.id.startsWith('BK-')) {
                      router.push(`/dashboard?tab=tickets`);
                    }
                  }
                  setIsDialogOpen(false);
                }}
              >
                View Full Details
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


      </div>
    </div>
  );
}
