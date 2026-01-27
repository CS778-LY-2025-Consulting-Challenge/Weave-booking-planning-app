'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Calendar, TrendingUp, Star } from 'lucide-react';
import Image from 'next/image';

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

const destinationImages: { [key: string]: string } = {
  'Paris, France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&h=300&fit=crop',
  'Tokyo, Japan': 'https://images.unsplash.com/photo-1540959375944-7049f642e9c1?w=500&h=300&fit=crop',
  'Bali, Indonesia': 'https://images.unsplash.com/photo-1522250925050-faabad1cb485?w=500&h=300&fit=crop',
  'European Grand Tour': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop',
  'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500&h=300&fit=crop',
  'Sydney': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
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

export default function YourJourneys({ journeys }: { journeys: Journey[] }) {
  const [activeTab, setActiveTab] = useState('upcoming');

  // Determine trip status dynamically
  const getTripStatus = (journey: Journey) => {
    const today = new Date();
    const startDate = new Date(journey.startDate);
    const endDate = new Date(journey.endDate);

    if (endDate < today) return 'past';
    if (startDate <= today && today <= endDate) return 'current';
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
      case 'all':
      default:
        return allTrips;
    }
  }, [journeys, activeTab]);

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

  const getImageUrl = (destination: string) => {
    return destinationImages[destination] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop';
  };

  const getActivities = (destination: string) => {
    return activitiesByDestination[destination] || ['Popular Activities', 'Local Culture', 'Dining'];
  };

  const getBudgetInfo = (id: number) => {
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
        <h2 className="text-3xl font-bold text-gray-900">Your Journeys</h2>
        <p className="text-gray-600">Track your past and upcoming adventures</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-4 sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="current">Current</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Journey Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJourneys.length > 0 ? (
          filteredJourneys.map((journey) => {
            const budget = getBudgetInfo(journey.id);
            const activities = getActivities(journey.destination);
            const country = getCountryFromDestination(journey.destination);
            const imageUrl = getImageUrl(journey.destination);
            const isOverBudget = budget.spent > budget.budget;

            return (
              <Card
                key={journey.id}
                className="group overflow-hidden border border-gray-200 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Image Section with Rating */}
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  <Image
                    src={imageUrl}
                    alt={journey.destination}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Rating Badge */}
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white bg-opacity-95 px-3 py-1 shadow-md">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-800">4.8</span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute left-3 top-3">
                    <Badge className={`${getStatusBadgeColor(journey.status)} border`}>
                      {journey.status.charAt(0).toUpperCase() + journey.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                {/* Content Section */}
                <CardContent className="p-5">
                  {/* Destination */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                      {journey.destination}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {country}
                    </p>
                  </div>

                  {/* Date Range */}
                  <div className="mb-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      {formatDate(journey.startDate)} - {formatDate(journey.endDate)}
                    </span>
                  </div>

                  {/* Activities/Places Pills */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {activities.slice(0, 2).map((activity, idx) => (
                      <span
                        key={idx}
                        className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {activity}
                      </span>
                    ))}
                    {activities.length > 2 && (
                      <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        +{activities.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Budget Section */}
                  <div className="space-y-2 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                        <TrendingUp className="h-4 w-4" />
                        Budget Status
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          isOverBudget
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {isOverBudget ? 'Over Budget' : 'Under Budget'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isOverBudget ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>${budget.spent.toLocaleString()}</span>
                        <span>${budget.budget.toLocaleString()}</span>
                      </div>
                    </div>
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
      </div>
    </div>
  );
}
