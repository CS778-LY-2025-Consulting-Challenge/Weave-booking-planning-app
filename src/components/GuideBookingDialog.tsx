"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Calendar as CalendarIcon,
  Clock,
  Check,
  MapPin,
  Video,
  BadgeCheck
} from 'lucide-react';
import { format } from 'date-fns';

interface Guide {
  id: string | number;
  name: string;
  country: string;
  specialties: string[];
  image: string;
  verified?: boolean;
  hourlyRate?: number;
}

interface BookingData {
  date: Date;
  timeSlot: string;
  fullName: string;
  email: string;
  notes: string;
}

interface GuideBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: Guide | null;
  onBookingConfirmed: (booking: BookingData & { guide: Guide }) => void;
}

const TIME_SLOTS = [
  '09:00 - 09:30',
  '10:00 - 10:30',
  '11:00 - 11:30',
  '12:00 - 12:30',
  '14:00 - 14:30',
  '15:00 - 15:30',
  '16:00 - 16:30',
  '17:00 - 17:30',
  '18:00 - 18:30',
  '19:00 - 19:30',
];

export function GuideBookingDialog({
  open,
  onOpenChange,
  guide,
  onBookingConfirmed,
}: GuideBookingDialogProps) {
  const { user } = useUser();
  const [step, setStep] = useState<'select-time' | 'form' | 'confirmed'>('select-time');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    notes: '',
  });

  // Auto-fill email if user is logged in
  useEffect(() => {
    if (user && user.primaryEmailAddress) {
      setFormData(prev => ({
        ...prev,
        email: user.primaryEmailAddress!.emailAddress,
        fullName: prev.fullName || user.fullName || ''
      }));
    }
  }, [user]);
  const [errors, setErrors] = useState({
    fullName: false,
    email: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = () => {
    setStep('select-time');
    setSelectedDate(undefined);
    setSelectedTimeSlot('');
    setFormData({
      fullName: '',
      email: '',
      notes: '',
    });
    setErrors({
      fullName: false,
      email: false,
    });
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTimeSlot(''); // Reset time slot when date changes
  };

  const handleTimeSlotSelect = (slot: string) => {
    setSelectedTimeSlot(slot);
  };

  const handleContinueToForm = () => {
    if (selectedDate && selectedTimeSlot) {
      setStep('form');
    }
  };

  const validateForm = () => {
    const newErrors = {
      fullName: !formData.fullName.trim(),
      email: !formData.email.trim() || !formData.email.includes('@'),
    };
    setErrors(newErrors);
    return !newErrors.fullName && !newErrors.email;
  };

  const handleConfirmBooking = async () => {
    if (!validateForm() || !selectedDate || !guide) return;

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, apiError: undefined })); // Reset api errors

    try {
      const response = await fetch('/api/guides/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guide: {
            id: guide.id,
            name: guide.name,
            email: '', // Backend handles this if missing
          },
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          fullName: formData.fullName,
          email: formData.email,
          notes: formData.notes,
        }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error("API Error (Non-JSON):", text);
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      // Success
      setStep('confirmed');
      setTimeout(() => {
        onBookingConfirmed({
          date: selectedDate,
          timeSlot: selectedTimeSlot,
          fullName: formData.fullName,
          email: formData.email,
          notes: formData.notes,
          guide,
          videoLink: data.videoLink
        } as any);
      }, 2000);

    } catch (error: any) {
      console.error('Booking failed', error);
      // Ideally show error in UI
      alert('Booking failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!guide) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
        {/* Guide Header */}
        <div className="sticky top-0 z-10 border-b bg-white px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-blue-100">
              <AvatarImage src={guide.image} alt={guide.name} />
              <AvatarFallback>{guide.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-2xl">{guide.name}</DialogTitle>
                {guide.verified && (
                  <BadgeCheck className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Local expert in {guide.country}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {guide.specialties.slice(0, 3).map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step: Select Time */}
        {step === 'select-time' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                Select a date
              </h3>
              <p className="text-sm text-gray-600">
                Choose when you'd like to meet with {guide.name}
              </p>
            </div>

            <div className="mb-8 flex justify-center rounded-lg border bg-gray-50 p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md"
              />
            </div>

            {selectedDate && (
              <>
                <div className="mb-4">
                  <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Available times on {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select your preferred time slot
                  </p>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => handleTimeSlotSelect(slot)}
                      className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${selectedTimeSlot === slot
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleContinueToForm}
                  disabled={!selectedTimeSlot}
                  className="w-full"
                  size="lg"
                >
                  Continue to details
                </Button>
              </>
            )}
          </div>
        )}

        {/* Step: Form */}
        {step === 'form' && selectedDate && (
          <div className="p-6">
            <div className="mb-6 rounded-lg border-2 border-blue-100 bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold text-blue-900">
                Booking summary
              </h3>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{selectedTimeSlot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  <span>30-minute video session with {guide.name}</span>
                </div>
              </div>
            </div>

            <h3 className="mb-4 text-lg font-semibold">Your details</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="mb-1.5 block">
                  Full name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className={errors.fullName ? 'border-red-500' : ''}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">
                    Full name is required
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="mb-1.5 block">
                  Email address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={errors.email ? 'border-red-500' : ''}
                  disabled={!!user} // Disable if logged in
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    Valid email is required
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  You'll receive a confirmation and video call link here
                </p>
              </div>

              <div>
                <Label htmlFor="notes" className="mb-1.5 block">
                  Reason for appointment / Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Tell the guide what you'd like to discuss (optional)"
                  rows={4}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                variant="outline"
                onClick={() => setStep('select-time')}
                className="w-full"
                size="lg"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Booking...' : 'Confirm appointment'}
              </Button>
            </div>
          </div>
        )}

        {/* Step: Confirmed */}
        {step === 'confirmed' && selectedDate && (
          <div className="p-6 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <Check className="h-10 w-10 text-green-600" />
              </div>
            </div>

            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              Your appointment is booked!
            </h3>
            <p className="mb-6 text-gray-600">
              We've sent a confirmation to {formData.email}
            </p>

            <div className="mb-6 rounded-lg border-2 border-green-100 bg-green-50 p-6 text-left">
              <h4 className="mb-4 font-semibold text-green-900">
                Appointment details
              </h4>
              <div className="space-y-3 text-sm text-green-800">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-200">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium text-green-900">{selectedDate.toLocaleDateString()}</div>
                    <div className="text-green-700">{selectedTimeSlot}</div>
                  </div>
                </div>

                {/* Video Link Display */}
                <div className="flex items-start gap-3 mt-4 pt-4 border-t border-green-200">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                    <Video className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-blue-900 mb-1">Join via this link:</div>
                    <a
                      href={(guide as any).videoLink || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-xs text-blue-600 underline hover:text-blue-800"
                    >
                      {(guide as any).videoLink || 'Link generating...'}
                    </a>
                    <p className="text-[10px] text-gray-500 mt-1">
                      (Also sent to {formData.email})
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-200">
                    <CalendarIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</div>
                    <div className="text-green-700">at {selectedTimeSlot}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Removed auto-start message since we disabled auto-start */}
            <div className="rounded-lg border bg-blue-50 p-4">
              <p className="text-sm text-blue-900 font-medium">
                Please save the link above.
              </p>
              <p className="mt-1 text-xs text-blue-700">
                You can join the call at the scheduled time using the link.
              </p>
            </div>

            <Button
              onClick={handleClose}
              variant="outline"
              className="mt-6 w-full"
              size="lg"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
