'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  User,
  Video,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  guideEmail: string;
  travelerName: string;
  journeyName: string;
  dateTime: string;
  meetingType: 'video call' | 'in-person';
  status: 'confirmed' | 'pending' | 'completed';
}

export default function GuideDashboard() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Protect route - redirect if not authenticated or not a guide
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

      // Redirect to regular dashboard if user is a traveler
      if (userType !== 'guide') {
        router.push('/dashboard');
        return;
      }
    }

    // Load appointments from localStorage
    if (isLoaded && isSignedIn && user) {
      setIsLoading(true);
      const storedAppointments = localStorage.getItem('guideAppointments');
      if (storedAppointments) {
        try {
          const allAppointments = JSON.parse(
            storedAppointments
          ) as Appointment[];
          // Filter appointments for the current guide
          const guideEmail = user.primaryEmailAddress?.emailAddress;
          const guideAppointments = allAppointments.filter(
            (apt) => apt.guideEmail === guideEmail
          );
          // Sort by date (soonest first)
          guideAppointments.sort(
            (a, b) =>
              new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
          );
          setAppointments(guideAppointments);
        } catch (error) {
          console.error('Error parsing appointments:', error);
        }
      }
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, user, router]);

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.dateTime) > new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pt-20">
      {/* Main Content */}
      <main className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="mb-2 text-4xl font-bold text-slate-900 sm:text-5xl">
            Welcome, {user?.firstName || 'Guide'}! 👋
          </h1>
          <p className="text-lg text-slate-600">
            Here are your upcoming appointments with travelers
          </p>
        </div>

        {/* Appointments Section */}
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Upcoming</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {upcomingAppointments.length}
                  </p>
                </div>
                <Calendar className="h-12 w-12 text-blue-500/20" />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Booked</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {appointments.length}
                  </p>
                </div>
                <User className="h-12 w-12 text-green-500/20" />
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">This Week</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {
                      upcomingAppointments.filter((apt) => {
                        const daysUntil =
                          (new Date(apt.dateTime).getTime() -
                            new Date().getTime()) /
                          (1000 * 60 * 60 * 24);
                        return daysUntil <= 7;
                      }).length
                    }
                  </p>
                </div>
                <Clock className="h-12 w-12 text-purple-500/20" />
              </div>
            </div>
          </div>

          {/* Appointments List */}
          {isLoading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
              <p className="mt-4 text-slate-600">
                Loading your appointments...
              </p>
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Upcoming Appointments
              </h2>
              {upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          ) : (
            <EmptyStateCard />
          )}
        </div>
      </main>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const appointmentDate = new Date(appointment.dateTime);
  const isToday =
    format(appointmentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isTomorrow =
    format(appointmentDate, 'yyyy-MM-dd') ===
    format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd');

  const getDateLabel = () => {
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    return format(appointmentDate, 'MMM dd, yyyy');
  };

  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Traveler Info */}
          <div className="mb-3">
            <h3 className="truncate text-lg font-semibold text-slate-900">
              {appointment.travelerName}
            </h3>
            <p className="truncate text-sm text-slate-600">
              {appointment.journeyName}
            </p>
          </div>

          {/* Appointment Details Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Date & Time */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Date</p>
                <p className="text-sm font-medium text-slate-900">
                  {getDateLabel()}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Time</p>
                <p className="text-sm font-medium text-slate-900">
                  {format(appointmentDate, 'h:mm a')}
                </p>
              </div>
            </div>

            {/* Meeting Type */}
            <div className="flex items-center gap-2">
              {appointment.meetingType === 'video call' ? (
                <Video className="h-4 w-4 flex-shrink-0 text-blue-500" />
              ) : (
                <MapPin className="h-4 w-4 flex-shrink-0 text-green-500" />
              )}
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Type</p>
                <p className="text-sm font-medium text-slate-900 capitalize">
                  {appointment.meetingType}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          size="sm"
          className="ml-2 flex-shrink-0 gap-1 group-hover:border-blue-300 group-hover:text-blue-600"
        >
          View Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Status Badge */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            appointment.status === 'confirmed'
              ? 'bg-green-100 text-green-800'
              : appointment.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-slate-100 text-slate-800'
          }`}
        >
          {appointment.status === 'confirmed' ? '✓ ' : ''}
          {appointment.status.charAt(0).toUpperCase() +
            appointment.status.slice(1)}
        </span>
        <p className="text-xs text-slate-500">
          {isToday ? 'Today' : isTomorrow ? 'Tomorrow' : 'Upcoming'}
        </p>
      </div>
    </div>
  );
}

function EmptyStateCard() {
  return (
    <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
      <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-400" />
      <h3 className="mb-2 text-lg font-semibold text-slate-900">
        No upcoming appointments yet
      </h3>
      <p className="mx-auto mb-6 max-w-md text-slate-600">
        You don't have any confirmed appointments at the moment. Appointments
        will appear here once travelers book sessions with you.
      </p>
      <Button variant="outline">View Profile</Button>
    </div>
  );
}
