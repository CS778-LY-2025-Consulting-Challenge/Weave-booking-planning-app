'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getBookings, type BookingData } from '@/lib/bookings';
import { useUser } from '@clerk/nextjs';
import { Loader2, ArrowLeft, Calendar, User, MapPin, Package, CreditCard, Mail } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function BookingDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const [booking, setBooking] = useState<BookingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const bookingId = params.id as string;

    useEffect(() => {
        const fetchBooking = async () => {
            if (!user?.id || !bookingId) return;

            try {
                // Fetch all bookings and find the matching one
                // Optimisation: ideally we would specific getBookingById but getBookings works for now
                const bookings = await getBookings(user.id);
                // Check against id, bookingId, stripeSessionId, or pkgId as fallback
                const found = bookings.find(b =>
                    b.id === bookingId ||
                    b.stripeSessionId === bookingId ||
                    (b.details?.pkgId === bookingId && b.type === 'package')
                );

                if (found) {
                    setBooking(found);
                } else {
                    setError('Booking not found');
                }
            } catch (err) {
                console.error('Error fetching booking:', err);
                setError('Failed to load booking details');
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [user?.id, bookingId]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                <p className="text-gray-600 mb-6">{error || 'Booking not found'}</p>
                <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
            </div>
        );
    }

    const { details } = booking;
    const isPackage = booking.type === 'package';

    return (
        <div className="min-h-screen bg-gray-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-6 hover:bg-transparent hover:text-blue-600 p-0"
                    onClick={() => router.push('/dashboard')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Image */}
                    <div className="relative h-64 w-full">
                        <Image
                            src={isPackage
                                ? details.bookingImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=3421&auto=format&fit=crop'
                                : details.bookingImage || '/images/placeholder.jpg'
                            }
                            alt="Booking Header"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                            <Badge className="mb-2 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                                {booking.type.toUpperCase()}
                            </Badge>
                            <h1 className="text-3xl font-bold">{details.pkgName || details.hotelName || details.destination || 'Booking Details'}</h1>
                            <div className="flex items-center mt-2 text-gray-200">
                                <MapPin className="h-4 w-4 mr-2" />
                                {details.destination || details.hotelLocation || 'Unknown Location'}
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Booking Info */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Dates</h3>
                                    <div className="flex items-center text-gray-900">
                                        <Calendar className="h-5 w-5 mr-3 text-blue-600" />
                                        <span className="font-medium">
                                            {details.startDate || details.checkInDate} — {details.endDate || details.checkOutDate}
                                        </span>
                                    </div>
                                    {details.duration && (
                                        <p className="text-sm text-gray-500 mt-1 ml-8">{details.duration} Days</p>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Traveler Details</h3>
                                    <div className="flex items-center text-gray-900 mb-2">
                                        <User className="h-5 w-5 mr-3 text-blue-600" />
                                        <span className="font-medium">Booked by {user?.fullName || 'User'}</span>
                                    </div>
                                    {details.userEmail && (
                                        <div className="flex items-center text-gray-600 ml-8 text-sm">
                                            <Mail className="h-4 w-4 mr-2" />
                                            {details.userEmail}
                                        </div>
                                    )}
                                    <div className="mt-2 ml-8">
                                        <Badge variant="outline" className="text-gray-600">
                                            {details.travelers || details.guests || 1} Traveler(s)
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Package Info</h3>
                                    <div className="flex items-center text-gray-900 mb-2">
                                        <Package className="h-5 w-5 mr-3 text-blue-600" />
                                        <span className="font-medium">{details.tier || 'Standard'} Tier</span>
                                    </div>
                                    <p className="text-sm text-gray-500 ml-8">
                                        Reference: {booking.id?.substring(0, 8).toUpperCase()}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment</h3>
                                    <div className="flex items-center text-gray-900">
                                        <CreditCard className="h-5 w-5 mr-3 text-green-600" />
                                        <span className="font-medium text-xl">
                                            ${details.price || details.totalPrice || 0}
                                        </span>
                                    </div>
                                    <Badge variant={'secondary'} className="mt-2 ml-8 bg-green-100 text-green-800">
                                        PAID
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Add-ons Section */}
                        {details.addons && (() => {
                            try {
                                const addons = typeof details.addons === 'string' ? JSON.parse(details.addons) : details.addons;
                                if (Array.isArray(addons) && addons.length > 0) {
                                    return (
                                        <div className="mt-8 pt-8 border-t">
                                            <h3 className="text-lg font-bold mb-4">Selected Add-ons</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {addons.map((addon: any, idx: number) => (
                                                    <Card key={idx} className="bg-gray-50 border-0">
                                                        <CardContent className="p-4 flex justify-between items-center">
                                                            <span className="font-medium text-gray-900">{addon.id}</span>
                                                            <span className="font-bold text-gray-700">${addon.price}</span>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                            } catch (e) {
                                return null;
                            }
                        })()}

                        <div className="mt-8 pt-8 border-t flex gap-4">
                            {/* Action Buttons */}
                            <Button className="flex-1 bg-black text-white" onClick={() => isPackage && details.pkgId ? router.push(`/packages/${details.pkgId}`) : null}>
                                View Original Package
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => window.print()}>
                                Print Confirmation
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
