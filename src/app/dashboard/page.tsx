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
import { Trip } from '@/types/expense';

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
  const [savedPackages, setSavedPackages] = useState<SavedPackage[]>([]);
  const [budgetTrips, setBudgetTrips] = useState<Trip[]>([]);
  const [budgetTripsLoading, setBudgetTripsLoading] = useState(true);

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

  // Load saved packages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedPackages');
    if (saved) {
      setSavedPackages(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadBudgetTrips = async () => {
      setBudgetTripsLoading(true);
      try {
        const response = await fetch('/api/trips');
        if (!response.ok) {
          throw new Error('Failed to load trips');
        }
        const data = await response.json();
        if (isMounted) {
          setBudgetTrips(data.trips ?? []);
        }
      } catch (error) {
        if (isMounted) {
          setBudgetTrips([]);
        }
        toast.error('Failed to load budget trips');
      } finally {
        if (isMounted) {
          setBudgetTripsLoading(false);
        }
      }
    };

    loadBudgetTrips();

    return () => {
      isMounted = false;
    };
  }, []);

  const [journeys, setJourneys] = useState<Journey[]>([
    {
      id: 1,
      destination: 'Paris, France',
      startDate: '2025-12-15',
      endDate: '2025-12-22',
      flightBooked: true,
      hotelBooked: true,
      type: 'upcoming',
    },
    {
      id: 2,
      destination: 'Tokyo, Japan',
      startDate: '2026-02-10',
      endDate: '2026-02-20',
      flightBooked: false,
      hotelBooked: false,
      type: 'upcoming',
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

  const upcomingJourneys = journeys.filter((j) => j.type === 'upcoming');
  const pastJourneys = journeys.filter((j) => j.type === 'past');
  const copiedJourneys = journeys.filter((j) => j.type === 'copied');

  const savedJourneys = copiedJourneys.length;

  const handleRemovePackage = (packageId: number) => {
    const updated = savedPackages.filter((pkg) => pkg.id !== packageId);
    setSavedPackages(updated);
    localStorage.setItem('savedPackages', JSON.stringify(updated));
    toast.success('Package removed from journeys');
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="mb-2">
            Welcome back, {user?.firstName || 'Traveler'}!
          </h1>
          <p className="text-gray-600">
            Manage your journeys and plan your next adventure
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Upcoming Trips</p>
                  <p className="text-3xl">{upcomingJourneys.length}</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <Plane className="size-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Past Journeys</p>
                  <p className="text-3xl">{pastJourneys.length}</p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <MapPin className="size-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Saved Journeys</p>
                  <p className="text-3xl">{savedJourneys}</p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                  <Calendar className="size-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Travel Calendar</CardTitle>
                <CardDescription>
                  View your upcoming trips at a glance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
                <div className="mt-4 space-y-2">
                  {upcomingJourneys.map((journey) => (
                    <div
                      key={journey.id}
                      className="flex items-center gap-2 rounded-lg bg-blue-50 p-2"
                    >
                      <Calendar className="size-4 text-blue-600" />
                      <span className="text-sm">{journey.destination}</span>
                      <span className="ml-auto text-sm text-gray-500">
                        {new Date(journey.startDate).toLocaleDateString()} -{' '}
                        {new Date(journey.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Journey Management */}
            <Card>
              <CardHeader>
                <CardTitle>My Journeys</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upcoming">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                    <TabsTrigger value="copied">Copied</TabsTrigger>
                    <TabsTrigger value="packages">
                      Packages
                      {savedPackages.length > 0 && (
                        <Badge className="ml-2 bg-blue-600 text-white">
                          {savedPackages.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming" className="space-y-4">
                    {upcomingJourneys.map((journey) => (
                      <Card key={journey.id}>
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <div>
                              <h3 className="text-lg">{journey.destination}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  journey.startDate
                                ).toLocaleDateString()}{' '}
                                -{' '}
                                {new Date(journey.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="size-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge
                              variant={
                                journey.flightBooked ? 'default' : 'secondary'
                              }
                            >
                              {journey.flightBooked ? (
                                <Check className="mr-1 size-3" />
                              ) : (
                                <X className="mr-1 size-3" />
                              )}
                              Flight
                            </Badge>
                            <Badge
                              variant={
                                journey.hotelBooked ? 'default' : 'secondary'
                              }
                            >
                              {journey.hotelBooked ? (
                                <Check className="mr-1 size-3" />
                              ) : (
                                <X className="mr-1 size-3" />
                              )}
                              Hotel
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="past" className="space-y-4">
                    {pastJourneys.map((journey) => (
                      <Card key={journey.id}>
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <div>
                              <h3 className="text-lg">{journey.destination}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  journey.startDate
                                ).toLocaleDateString()}{' '}
                                -{' '}
                                {new Date(journey.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Edit className="size-4" />
                            </Button>
                          </div>
                          {journey.notes && (
                            <div className="mt-3 rounded-lg bg-gray-50 p-3">
                              <p className="text-sm text-gray-600 italic">
                                "{journey.notes}"
                              </p>
                            </div>
                          )}
                          <Button variant="outline" size="sm" className="mt-3">
                            <Plus className="mr-2 size-4" />
                            Add Photos & Notes
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="copied" className="space-y-4">
                    {copiedJourneys.map((journey) => (
                      <Card key={journey.id}>
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <div>
                              <h3 className="text-lg">{journey.destination}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  journey.startDate
                                ).toLocaleDateString()}{' '}
                                -{' '}
                                {new Date(journey.endDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="size-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                          {journey.cities && (
                            <div className="space-y-2">
                              <p className="text-sm">
                                Cities: {journey.cities.join(' → ')}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Button variant="outline" size="sm">
                                  Change Dates
                                </Button>
                                <Button variant="outline" size="sm">
                                  Edit Destinations
                                </Button>
                                <Button variant="outline" size="sm">
                                  Modify Activities
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="packages" className="space-y-4">
                    {savedPackages.map((pkg) => (
                      <Card key={pkg.id}>
                        <CardContent className="p-4">
                          <div className="mb-3 flex items-start justify-between">
                            <div>
                              <h3 className="text-lg">{pkg.name}</h3>
                              <p className="text-sm text-gray-500">
                                {pkg.destination} - {pkg.duration}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePackage(pkg.id)}
                              >
                                <Trash2 className="size-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="default">{pkg.price} USD</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trip Budgets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {budgetTripsLoading ? (
                  <p className="text-sm text-gray-500">Loading trips...</p>
                ) : budgetTrips.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">
                      No trips yet. Create one to start tracking budgets.
                    </p>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => router.push('/trips/new')}
                    >
                      <Plus className="mr-2 size-4" />
                      Create Trip
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {budgetTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{trip.name}</p>
                          {trip.destination && (
                            <p className="text-xs text-gray-500">
                              {trip.destination}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/trips/${trip.id}/budget`)}
                        >
                          Budget
                        </Button>
                      </div>
                    ))}
                    <Button
                      className="w-full"
                      variant="ghost"
                      onClick={() => router.push('/trips/new')}
                    >
                      <Plus className="mr-2 size-4" />
                      New Trip
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-500">Name</Label>
                  <p>John Traveler</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Email</Label>
                  <p>john@example.com</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Country</Label>
                  <p>United States</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">
                    Budget Preference
                  </Label>
                  <Badge>Mid-Range</Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">
                    Season Preference
                  </Label>
                  <Badge variant="outline">Spring/Fall</Badge>
                </div>
                <Button className="w-full" variant="outline">
                  <Edit className="mr-2 size-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  <Plane className="mr-2 size-4" />
                  Book a Flight
                </Button>
                <Button className="w-full" variant="outline">
                  <Hotel className="mr-2 size-4" />
                  Book a Hotel
                </Button>
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 size-4" />
                  Plan New Trip
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
