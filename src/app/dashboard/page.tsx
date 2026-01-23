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
  // Saved Journeys (Firebase)
  const [savedTrips, setSavedTrips] = useState<Record<string, any>>({});
  const [savedLoading, setSavedLoading] = useState(true);
  const [newTrip, setNewTrip] = useState({ destination: '', date: '' });
  const [editTripId, setEditTripId] = useState<string | null>(null);
  const [editTrip, setEditTrip] = useState({ destination: '', date: '' });

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


  // Load saved trips from Firebase
  useEffect(() => {
    if (!user?.id) return;
    setSavedLoading(true);
    getSavedTrips(user.id).then((data) => {
      setSavedTrips(data || {});
      setSavedLoading(false);
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
                  <p className="text-3xl">{Object.keys(savedTrips).length}</p>
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
                        {new Date(journey.startDate).toLocaleDateString('en-US')} -{' '}
                        {new Date(journey.endDate).toLocaleDateString('en-US')}
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

                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upcoming">Upcoming Journeys</TabsTrigger>
                    <TabsTrigger value="past">Past Journeys</TabsTrigger>
                    <TabsTrigger value="saved">Saved Journeys</TabsTrigger>
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
                                ).toLocaleDateString('en-US')}{' '}
                                -{' '}
                                {new Date(journey.endDate).toLocaleDateString('en-US')}
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
                                ).toLocaleDateString('en-US')}{' '}
                                -{' '}
                                {new Date(journey.endDate).toLocaleDateString('en-US')}
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


                  <TabsContent value="saved" className="space-y-4">
                    <div className="max-w-2xl mx-auto p-2">
                      <h2 className="text-xl font-bold mb-4 text-center">Saved Journeys</h2>
                      {/* Add Trip Form */}
                      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-center">
                        <input
                          type="text"
                          placeholder="Destination"
                          className="border rounded px-3 py-2 w-48"
                          value={newTrip.destination}
                          onChange={e => setNewTrip({ ...newTrip, destination: e.target.value })}
                        />
                        <input
                          type="date"
                          className="border rounded px-3 py-2 w-40"
                          value={newTrip.date}
                          onChange={e => setNewTrip({ ...newTrip, date: e.target.value })}
                        />
                        <span
                          className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium w-fit whitespace-nowrap shrink-0 bg-black text-white hover:bg-gray-900 transition-colors cursor-pointer"
                          onClick={handleAddTrip}
                          role="button"
                          tabIndex={0}
                        >
                          Add Journey
                        </span>
                      </div>
                      {/* Trips List */}
                      <ul className="space-y-4">
                        {savedLoading && <li className="text-center text-gray-500">Loading...</li>}
                        {!savedLoading && Object.entries(savedTrips).length === 0 && (
                          <li className="text-center text-gray-500">No saved journeys yet.</li>
                        )}
                        {Object.entries(savedTrips).map(([id, trip]) => (
                          <li key={id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 shadow">
                            {editTripId === id ? (
                              <div className="flex flex-col md:flex-row gap-2 md:items-center w-full">
                                <input
                                  type="text"
                                  className="border rounded px-2 py-1 w-40"
                                  value={editTrip.destination}
                                  onChange={e => setEditTrip({ ...editTrip, destination: e.target.value })}
                                />
                                <input
                                  type="date"
                                  className="border rounded px-2 py-1 w-32"
                                  value={editTrip.date}
                                  onChange={e => setEditTrip({ ...editTrip, date: e.target.value })}
                                />
                                <span
                                  className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium w-fit whitespace-nowrap shrink-0 bg-black text-white hover:bg-gray-900 transition-colors cursor-pointer"
                                  onClick={handleUpdateTrip}
                                  role="button"
                                  tabIndex={0}
                                >
                                  Save
                                </span>
                                <span
                                  className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium w-fit whitespace-nowrap shrink-0 bg-black text-white hover:bg-gray-900 transition-colors cursor-pointer"
                                  onClick={() => setEditTripId(null)}
                                  role="button"
                                  tabIndex={0}
                                >
                                  Cancel
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col md:flex-row gap-2 md:items-center w-full justify-between">
                                <span className="font-semibold">{trip.destination}</span>
                                <span className="text-gray-600">{trip.date}</span>
                                <div className="flex gap-2 mt-2 md:mt-0">
                                  <span
                                    className="inline-flex items-center justify-center rounded-full border p-2 text-sm font-medium w-fit whitespace-nowrap shrink-0 bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors cursor-pointer"
                                    onClick={() => handleEditTrip(id, trip)}
                                    role="button"
                                    tabIndex={0}
                                    title="Edit"
                                  >
                                    <Edit className="size-4" />
                                  </span>
                                  <span
                                    className="inline-flex items-center justify-center rounded-full border p-2 text-sm font-medium w-fit whitespace-nowrap shrink-0 hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={() => handleDeleteTrip(id)}
                                    role="button"
                                    tabIndex={0}
                                    title="Delete"
                                  >
                                    <Trash2 className="size-4 text-red-600" />
                                  </span>
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>

                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
