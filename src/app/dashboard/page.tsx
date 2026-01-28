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
import { getUserProfile, type UserProfile } from '@/lib/userProfile';
import DashboardMap from '@/components/DashboardMap';
import YourJourneys from '@/components/YourJourneys';
import UpcomingBookingsTickets from '@/components/UpcomingBookingsTickets';

interface Journey {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  flightBooked: boolean;
  hotelBooked: boolean;
  type: 'upcoming' | 'past' | 'copied';
  notes?: string;
  photos?: string[];
  cities?: string[];
  image?: string;
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
  ]);

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

  // Sample map destinations from journeys
  const mapDestinations = [
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Bali', lat: -8.3405, lng: 115.0920 },
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708 },
  ];


  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-4xl" style={{ fontFamily: 'var(--font-bonheur-royale)' }}>
            Welcome back, {user?.firstName || 'Nayak'}!
          </h1>
          <p className="text-gray-600 text-2xl" style={{ fontFamily: 'var(--font-special-elite)' }}>
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
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Your Tickets & Reservations</h3>
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


      </div>
    </div>
  );
}
