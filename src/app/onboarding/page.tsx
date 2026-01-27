'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MapPin, Plane, Loader2 } from 'lucide-react';

export default function Onboarding() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedType, setSelectedType] = useState<'traveler' | 'guide' | null>(
    null
  );

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/auth');
    }

    // If user already has a role set, redirect to appropriate dashboard
    if (isLoaded && isSignedIn && user?.publicMetadata?.userType) {
      const userType = user.publicMetadata.userType as string;
      if (userType === 'guide') {
        router.push('/apply-guide');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  const handleSelection = async (userType: 'traveler' | 'guide') => {
    setSelectedType(userType);
    setIsUpdating(true);

    try {
      // Call API route to update user metadata
      const response = await fetch('/api/update-user-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`Failed to update user type: ${errorData.error}`);
      }

      // Redirect based on user type
      if (userType === 'guide') {
        router.push('/apply-guide');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error updating user type:', error);
      setIsUpdating(false);
      setSelectedType(null);
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Don't show onboarding if user already has a type
  if (user?.publicMetadata?.userType) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">
            Welcome to Weave!
          </h1>
          <p className="text-lg text-gray-300">
            Tell us about yourself to get started
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Traveler Option */}
          <Card
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedType === 'traveler'
                ? 'border-primary border-2 shadow-xl'
                : 'border border-gray-700 hover:border-gray-500'
            } bg-white/10 backdrop-blur-sm`}
            onClick={() => !isUpdating && handleSelection('traveler')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                <Plane className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">
                I'm a Traveler
              </CardTitle>
              <CardDescription className="text-gray-300">
                Explore destinations, book flights and hotels, and discover
                amazing journeys
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isUpdating}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelection('traveler');
                }}
              >
                {isUpdating && selectedType === 'traveler' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Continue as Traveler'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Local Guide Option */}
          <Card
            className={`cursor-pointer transition-all hover:scale-105 ${
              selectedType === 'guide'
                ? 'border-primary border-2 shadow-xl'
                : 'border border-gray-700 hover:border-gray-500'
            } bg-white/10 backdrop-blur-sm`}
            onClick={() => !isUpdating && handleSelection('guide')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-teal-600">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">
                I'm a Local Guide
              </CardTitle>
              <CardDescription className="text-gray-300">
                Share your local expertise, offer guided experiences, and
                connect with travelers
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                disabled={isUpdating}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelection('guide');
                }}
              >
                {isUpdating && selectedType === 'guide' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Continue as Local Guide'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
