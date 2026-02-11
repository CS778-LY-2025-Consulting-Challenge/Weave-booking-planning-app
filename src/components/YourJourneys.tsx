'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, TrendingUp, Star, Plane, Edit, Trash2, Plus, Check, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';

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

  packageId?: string; // Added field for package navigation
  bookingType?: string;
  image?: string;
  packageName?: string;
  packageDestination?: string;
  packageDuration?: string;
  packagePrice?: number;
  packageIncludes?: string[];
  packageType?: string;
}

interface SavedTrip {
  destination: string;
  date: string;
}

const destinationImages: { [key: string]: string } = {
  'Paris, France': '/images/paris-dashboard.jpg',
  'Tokyo, Japan': '/images/tokyo-dashboard.jpg',
  'Bali, Indonesia': '/images/bali.jpg',
  'European Grand Tour': '/images/europe-dasboard.jpg',
  'Athens, Greece': '/images/greek.jpg',
  'Dubai, UAE': '/images/dubai.jpg',
  'Queenstown, New Zealand': '/images/new zealand.jpg',
  'New York': '/images/new york.jpg',
  'Sydney': '/images/sydeny.jpg',
};

const activitiesByDestination: { [key: string]: string[] } = {
  'Paris, France': ['Eiffel Tower', 'Louvre', 'Notre-Dame', 'Musée d\'Orsay'],
  'Tokyo, Japan': ['Senso-ji Temple', 'Shibuya Crossing', 'Mount Fuji', 'Akihabara'],
  'Bali, Indonesia': ['Ubud Temple', 'Monkey Forest', 'Rice Terraces', 'Beaches'],
  'European Grand Tour': ['Historic Sites', 'Museums', 'Cathedrals', 'Local Cuisine'],
};

const budgetData: { [key: string]: { spent: number; budget: number } } = {
  '1': { spent: 2400, budget: 3000 },
  '2': { spent: 0, budget: 4000 },
  '3': { spent: 1800, budget: 2000 },
  '4': { spent: 0, budget: 5000 },
};

export default function YourJourneys({
  journeys,
  savedTripsCount,
  savedTrips,
  savedLoading,
  newTrip,
  setNewTrip,
  editTripId,
  setEditTripId,
  editTrip,
  setEditTrip,
  handleAddTrip,
  handleEditTrip,
  handleUpdateTrip,
  handleDeleteTrip,
  handleDeleteJourney,
  handleCancelBooking
}: {
  journeys: Journey[];
  savedTripsCount: number;
  savedTrips: Record<string, SavedTrip>;
  savedLoading: boolean;
  newTrip: SavedTrip;
  setNewTrip: (trip: SavedTrip) => void;
  editTripId: string | null;
  setEditTripId: (id: string | null) => void;
  editTrip: SavedTrip;
  setEditTrip: (trip: SavedTrip) => void;
  handleAddTrip: () => void;
  handleEditTrip: (id: string, trip: SavedTrip) => void;
  handleUpdateTrip: () => void;
  handleDeleteTrip: (id: string) => void;
  handleDeleteJourney: (id: number | string) => void;
  handleCancelBooking?: (journey: Journey) => void;
}) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showAll, setShowAll] = useState(false);
  const [showAllSaved, setShowAllSaved] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);

  // Determine trip status dynamically
  const getTripStatus = (journey: Journey) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(journey.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(journey.endDate);
    endDate.setHours(0, 0, 0, 0);

    if (endDate < today) return 'past';

    // Only allow 'current' status for PACKAGES
    // Allow packages starting within 3 days to be considered 'current'
    const nearFuture = new Date(today);
    nearFuture.setDate(today.getDate() + 3);

    if (startDate <= nearFuture && endDate >= today) {
      if (journey.bookingType === 'package' || journey.packageId) {
        return 'current';
      }
      // For flights/hotels happening today, keep them as 'upcoming'
      return 'upcoming';
    }

    if (startDate > today) return 'upcoming';
    return journey.type;
  };

  // Filter journeys based on active tab
  const filteredJourneys = useMemo(() => {
    const allTrips = journeys.map(j => ({
      ...j,
      status: getTripStatus(j)
    }));

    switch (activeTab) {
      case 'upcoming':
        return allTrips.filter(j => j.status === 'upcoming');
      case 'current':
        return allTrips.filter(j => j.status === 'current');
      case 'past':
        return allTrips.filter(j => j.status === 'past');
      case 'saved':
        return allTrips.filter(j => j.type === 'copied');
      case 'ai-saved':
        // TODO: Filter AI-saved journeys when integrated
        return [];
      case 'all':
      default:
        return allTrips;
    }
  }, [journeys, activeTab]);

  // Count stats
  const upcomingCount = journeys.filter(j => getTripStatus(j) === 'upcoming').length;
  const pastCount = journeys.filter(j => getTripStatus(j) === 'past').length;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'current':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'past':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getImageUrl = (journey: Journey) => {
    return journey.image || destinationImages[journey.destination] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop';
  };

  const getActivities = (destination: string) => {
    return activitiesByDestination[destination] || ['Popular Activities', 'Local Culture', 'Dining'];
  };

  const getBudgetInfo = (id: number | string) => {
    const data = budgetData[id.toString()];
    if (!data) return { spent: 0, budget: 1000, percentage: 0 };

    return {
      ...data,
      percentage: (data.spent / data.budget) * 100
    };
  };

  const getCountryFromDestination = (destination: string) => {
    const parts = destination.split(',');
    return parts[parts.length - 1]?.trim() || destination;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Section Header */}
      <div className="space-y-2">
        <h2
          className="text-3xl font-bold text-gray-900"
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
        >
          Your Journeys
        </h2>
        <p
          className="text-gray-600"
          style={{ fontFamily: '"Times New Roman", Times, serif' }}
        >
          Track your past and upcoming adventures
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <Tabs
          id="your-journeys-tabs"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="saved">Saved Journeys</TabsTrigger>
            <TabsTrigger value="ai-saved">AI-Saved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Journey Cards Grid OR Saved Journeys List */}
      {activeTab === 'saved' ? (
        <div className="space-y-4">
          {/* Add Trip Form */}
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                  <input
                    type="text"
                    placeholder="Enter destination"
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTrip.destination}
                    onChange={e => setNewTrip({ ...newTrip, destination: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTrip.date}
                    onChange={e => setNewTrip({ ...newTrip, date: e.target.value })}
                  />
                </div>
                <button
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium whitespace-nowrap"
                  onClick={handleAddTrip}
                >
                  Add Journey
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Trips List */}
          {savedLoading && (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          )}
          {!savedLoading && Object.entries(savedTrips).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>No saved journeys yet.</p>
            </div>
          )}

          {/* Display saved trips as package cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(showAllSaved ? Object.entries(savedTrips) : Object.entries(savedTrips).slice(0, 3)).map(([id, trip]: [string, any]) => (
              <Card key={id} className="group overflow-hidden border border-gray-200 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden bg-gray-200">
                  {trip.image ? (
                    <Image
                      src={trip.image}
                      alt={trip.name || trip.destination}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <MapPin className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}

                  {/* Type Badge */}
                  {trip.type && (
                    <div className="absolute left-3 top-3">
                      <Badge className="bg-white text-gray-900 border-0">
                        {trip.type}
                      </Badge>
                    </div>
                  )}

                  {/* Edit/Delete buttons overlay */}
                  <div className="absolute right-3 top-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-2 bg-white/90 text-gray-700 rounded-lg hover:bg-white transition-colors shadow-md"
                      onClick={() => handleEditTrip(id, trip)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                      onClick={() => handleDeleteTrip(id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-5">
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                    {trip.name || trip.destination}
                  </h3>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">{trip.destination}</span>
                  </div>

                  {/* Duration */}
                  {trip.duration && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{trip.duration}</span>
                    </div>
                  )}

                  {/* Package Includes */}
                  {trip.description && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Package Includes:</p>
                      <div className="space-y-1">
                        {trip.description.split(', ').slice(0, 3).map((item: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-600 line-clamp-1">{item}</span>
                          </div>
                        ))}
                        {trip.description.split(', ').length > 3 && (
                          <p className="text-xs text-gray-500 italic ml-6">
                            + {trip.description.split(', ').length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Date saved */}
                  {trip.date && (
                    <div className="mb-4 pt-3 border-t">
                      <p className="text-xs text-gray-500">Saved on</p>
                      <p className="text-sm font-medium text-gray-700">{trip.date}</p>
                    </div>
                  )}

                  {/* Price */}
                  {trip.price && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Starting from</p>
                          <p className="text-2xl font-bold text-blue-600">${trip.price}</p>
                          <p className="text-xs text-gray-500">per person</p>
                        </div>
                      </div>
                      <button
                        className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                        onClick={() => {
                          // Prefer navigating to our new Booking Details page if we have a real booking ID
                          if (trip.id && typeof trip.id === 'string' && (trip.id.startsWith('cs_') || trip.id.length > 10)) {
                            window.location.href = `/bookings/${trip.id}`;
                          } else if (trip.packageId) {
                            // Fallback to package page if no specific booking ID (e.g. legacy/saved)
                            window.location.href = `/packages/${trip.packageId}`;
                          } else {
                            console.log("No navigation target for trip", trip);
                          }
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button for Saved Journeys */}
          {Object.entries(savedTrips).length > 3 && (
            <div className="flex justify-center pt-6">
              <button
                onClick={() => setShowAllSaved(!showAllSaved)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
              >
                {showAllSaved ? (
                  <>
                    View Less
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    View More ({Object.entries(savedTrips).length - 3} more)
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJourneys.length > 0 ? (
              (showAll ? filteredJourneys : filteredJourneys.slice(0, 3)).map((journey) => {
                const budget = getBudgetInfo(journey.id);
                const activities = getActivities(journey.destination);
                const country = getCountryFromDestination(journey.destination);
                const imageUrl = getImageUrl(journey);
                const displayTitle = journey.packageName || journey.destination;
                const displayDestination = journey.packageDestination || journey.destination;
                const isOverBudget = budget.spent > budget.budget;

                // Check if this is a Current Package to use the "Rich Ticket" layout
                const isCurrentPackage = journey.status === 'current' && (journey.bookingType === 'package' || journey.packageId);

                if (isCurrentPackage) {
                  return (
                    <div key={journey.id} className="flex flex-col rounded-2xl overflow-hidden shadow-md bg-white border border-gray-100 h-full hover:shadow-lg transition-shadow">
                      {/* Image Header with Overlay Text */}
                      <div className="h-40 relative shrink-0">
                        <Image
                          src={imageUrl}
                          alt={journey.destination}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-4 left-5 right-5">
                          <Badge className="mb-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md uppercase tracking-wider text-[10px] px-2 py-0.5">
                            PACKAGE
                          </Badge>
                          <h3 className="text-xl font-bold text-white truncate leading-tight shadow-sm filter drop-shadow-md">
                            {journey.destination}
                          </h3>
                          <p className="text-sm text-gray-200 font-medium flex items-center mt-1 truncate">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 shrink-0" />
                            {country}
                          </p>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex-grow flex flex-col justify-between">
                        <div>
                          {/* Dates Box */}
                          <div className="flex items-center justify-between mb-5 bg-purple-50/60 p-3.5 rounded-xl border border-purple-100/60">
                            <div className="text-center min-w-[30%]">
                              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Start</p>
                              <p className="text-sm font-bold text-gray-900">
                                {formatDate(journey.startDate)}
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium">
                                {new Date(journey.startDate).getFullYear()}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-purple-300 transform scale-110" />
                            <div className="text-center min-w-[30%]">
                              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">End</p>
                              <p className="text-sm font-bold text-gray-900">
                                {formatDate(journey.endDate)}
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium">
                                {new Date(journey.endDate).getFullYear()}
                              </p>
                            </div>
                          </div>

                          {/* Duration & Tier */}
                          <div className="flex justify-between items-center text-xs mb-4 px-1">
                            <span className="text-gray-500 font-medium">Duration: <span className="text-gray-900 font-bold text-sm ml-1">
                              {Math.ceil((new Date(journey.endDate).getTime() - new Date(journey.startDate).getTime()) / (1000 * 60 * 60 * 24)) + ' Days'}
                            </span></span>
                            <span className="text-gray-500 font-medium">Tier: <span className="text-gray-900 font-bold text-sm ml-1">Suite</span></span>
                          </div>
                        </div>

                        <div className="mt-2 pt-4 border-t border-gray-100 flex gap-3">
                          <button
                            onClick={() => window.location.href = `/bookings/${journey.id}`}
                            className="flex-1 rounded-lg bg-gray-900 h-9 text-xs font-semibold text-white transition-colors hover:bg-black w-full"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <Card
                    key={journey.id}
                    className="group overflow-hidden border border-gray-200 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col"
                  >
                    {/* Image Section with Rating */}
                    <div className="relative h-48 overflow-hidden bg-gray-200 shrink-0">
                      <Image
                        src={imageUrl}
                        alt={journey.destination}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Badge for Type Debugging/Info */}
                      <div className="absolute right-3 top-3 flex flex-col gap-2 items-end">
                        <div className="flex items-center gap-1 rounded-full bg-white bg-opacity-95 px-3 py-1 shadow-md">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-gray-800">4.8</span>
                        </div>

                        {journey.bookingType && (
                          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-[10px] px-2 py-0.5 border shadow-sm">
                            {journey.bookingType.toUpperCase()}
                          </Badge>
                        )}
                        {journey.packageType && (
                          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-[10px] px-2 py-0.5 border shadow-sm">
                            {journey.packageType}
                          </Badge>
                        )}
                        <Badge
                          className={`pl-2 pr-2 py-0.5 text-xs font-semibold rounded-full border shadow-sm ${getStatusBadgeColor(journey.status)}`}
                          variant="outline"
                        >
                          {journey.status.charAt(0).toUpperCase() + journey.status.slice(1)}
                        </Badge>
                      </div>
                    </div>


                    {/* Content Section */}
                    <CardContent className="p-5 flex flex-col justify-between grow">
                      {/* Destination */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                          {displayTitle}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {displayDestination}
                        </p>
                      </div>
                      {/* Dates & Status */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500">Dates</span>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatDate(journey.startDate)}
                              {' - '}
                              {formatDate(journey.endDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {journey.packageIncludes && journey.packageIncludes.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="size-4" />
                            <span className="text-sm">
                              {journey.packageDuration || `${Math.ceil((new Date(journey.endDate).getTime() - new Date(journey.startDate).getTime()) / (1000 * 60 * 60 * 24))} Days`}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm text-gray-700">Package Includes:</p>
                            {journey.packageIncludes.slice(0, 4).map((item, index) => (
                              <div key={`${journey.id}-include-${index}`} className="flex items-start gap-2">
                                <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                                <span className="text-sm text-gray-600">{item}</span>
                              </div>
                            ))}
                            {journey.packageIncludes.length > 4 && (
                              <p className="text-sm text-gray-500 italic">
                                + {journey.packageIncludes.length - 4} more
                              </p>
                            )}
                          </div>

                          {typeof journey.packagePrice === 'number' && (
                            <div className="border-t pt-3">
                              <p className="text-sm text-gray-500">Starting from</p>
                              <p className="text-2xl text-blue-600">${journey.packagePrice}</p>
                              <p className="text-xs text-gray-500">per person</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-5 flex gap-3">
                        <button
                          onClick={() => {
                            if (journey.id && journey.bookingType === 'package') {
                              window.location.href = `/bookings/${journey.id}`;
                            } else if (journey.packageId) {
                              window.location.href = `/packages/${journey.packageId}`;
                            } else {
                              setSelectedJourney(journey);
                            }
                          }}
                          className="flex-1 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                        >
                          View Details
                        </button>
                        {journey.status === 'past' && (
                          <button
                            onClick={() => handleDeleteJourney(journey.id)}
                            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                            title="Delete journey"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {(journey.status === 'upcoming' || journey.status === 'current') && handleCancelBooking && journey.bookingType && (
                          <button
                            onClick={() => handleCancelBooking(journey)}
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            title="Cancel booking"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No {activeTab} journeys</h3>
                <p className="text-gray-600">
                  {activeTab === 'upcoming'
                    ? 'Plan your next adventure'
                    : activeTab === 'past'
                      ? 'Your memories are waiting for you'
                      : 'Start exploring'}
                </p>
              </div>
            )}
          </div >
        </>
      )
      }

      {/* View More Button - Only for regular journeys */}
      {
        activeTab !== 'saved' && filteredJourneys.length > 3 && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
            >
              {showAll ? (
                <>
                  View Less
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  View More ({filteredJourneys.length - 3} more)
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )
      }
    </div >
  );
}
