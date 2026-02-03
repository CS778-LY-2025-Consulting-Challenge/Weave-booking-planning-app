'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plane, Hotel, Calendar, MapPin, Ticket, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getBookings, type BookingData } from '@/lib/bookings';
import { useUser } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { QrCode, Copy, Trash2 } from 'lucide-react';
import { deleteBooking } from '@/lib/bookings';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

function formatDate(dateStr: string) {
    if (!dateStr) return 'TBD';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);
}

interface UpcomingBookingsTicketsProps {
    userId: string;
}

export default function UpcomingBookingsTickets({ userId }: UpcomingBookingsTicketsProps) {
    const router = useRouter();
    const { user } = useUser();
    const [bookings, setBookings] = useState<BookingData[]>([]);
    const [loading, setLoading] = useState(true);

    const handleCancel = async (bookingId: string | undefined, type: 'flight' | 'hotel' | 'package') => {
        if (!bookingId) return;

        try {
            // Delete from Firebase
            if (userId) {
                await deleteBooking(userId, bookingId);
            }

            // Remove from Local Storage (cleanup)
            const storageKey = type === 'flight' ? 'flightBookings' : 'hotelBookings';
            const localBookings = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const updatedLocal = localBookings.filter((b: any) =>
                (b.bookingReference !== bookingId && b.bookingId !== bookingId && b.stripeSessionId !== bookingId)
            );
            localStorage.setItem(storageKey, JSON.stringify(updatedLocal));

            // Update State
            setBookings(prev => prev.filter(b => b.id !== bookingId));

            toast.success('Booking cancelled successfully');
        } catch (error) {
            console.error('Error cancelling booking:', error);
            toast.error('Failed to cancel booking');
        }
    };

    useEffect(() => {
        const fetchBookings = async () => {
            let firebaseBookings: BookingData[] = [];
            if (userId) {
                firebaseBookings = await getBookings(userId);
            }

            // Fetch from localStorage as fallback/supplement
            const localFlightBookings = JSON.parse(localStorage.getItem('flightBookings') || '[]');
            const localHotelBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');

            // Normalize local bookings to match BookingData structure if needed
            // (Assuming local structure is compatible or we map it)
            const localBookings = [...localFlightBookings, ...localHotelBookings].map((b: any) => ({
                id: b.bookingReference || b.bookingId || b.stripeSessionId,
                type: b.flight ? 'flight' : 'hotel',
                status: b.status || 'pending',
                userId: userId,
                stripeSessionId: b.stripeSessionId,
                createdAt: new Date(b.bookingDate || Date.now()).getTime(),
                details: b.flight ? {
                    airline: b.flight.airline,
                    flightNumber: 'FL' + Math.floor(Math.random() * 1000), // Local fallback
                    from: b.flight.from,
                    fromCode: b.flight.fromCode,
                    to: b.flight.to,
                    toCode: b.flight.toCode,
                    departureDate: b.flight.departure,
                    duration: b.flight.duration,
                    arrivalTime: b.flight.arrival
                } : {
                    bookingImage: b.hotelName ? null : null, // Local might not have same image structure, handled by component fallback
                    hotelName: b.hotelName,
                    hotelLocation: b.hotelLocation,
                    checkInDate: b.checkInDate,
                    checkOutDate: b.checkOutDate,
                    bookingName: b.roomName ? `Reservation-${b.roomName}` : 'Hotel Reservation'
                },
                // Keep original object for other fields if needed
                ...b
            }));

            // Merge and Deduplicate based on stripeSessionId
            const allBookings = [...firebaseBookings];
            const sessionIds = new Set(firebaseBookings.map(b => b.stripeSessionId));

            localBookings.forEach((lb: any) => {
                if (lb.stripeSessionId && !sessionIds.has(lb.stripeSessionId)) {
                    allBookings.push(lb as BookingData);
                }
            });

            // Sort by creation time desc
            const sorted = allBookings.sort((a, b) => {
                const timeA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
                const timeB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
                return timeB - timeA;
            });

            setBookings(sorted);
            setLoading(false);
        };

        fetchBookings();
    }, [userId]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter ALL upcoming flights
    const upcomingFlights = bookings.filter(b => {
        if (b.type !== 'flight' || !b.details?.departureDate) return false;
        const depDate = new Date(b.details.departureDate);
        depDate.setHours(0, 0, 0, 0);
        return depDate >= today;
    });

    // Filter ALL upcoming hotels
    const upcomingHotels = bookings.filter(b => {
        if (b.type !== 'hotel') return false;
        const dateStr = b.details?.checkOutDate || b.details?.checkInDate;
        if (!dateStr) return false;
        const endDate = new Date(dateStr);
        endDate.setHours(0, 0, 0, 0);
        return endDate >= today;
    });

    // Filter ALL upcoming packages
    const upcomingPackages = bookings.filter(b => {
        if (b.type !== 'package') return false;
        // Packages usually have startDate/endDate
        const dateStr = b.details?.endDate || b.details?.startDate;
        if (!dateStr) return false;
        const endDate = new Date(dateStr);
        endDate.setHours(0, 0, 0, 0);
        return endDate >= today;
    });

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="h-48 rounded-xl bg-gray-100 animate-pulse"></div>
                <div className="h-48 rounded-xl bg-gray-100 animate-pulse"></div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-start">
            {/* Flight Section */}
            <div className="w-full flex flex-col gap-6">
                {upcomingFlights.length > 0 ? (
                    upcomingFlights.map((flight) => {
                        const fromCode = flight.details?.fromCode || flight.details?.from?.substring(0, 3).toUpperCase() || 'JFK';
                        const toCode = flight.details?.toCode || flight.details?.to?.substring(0, 3).toUpperCase() || 'LHR';
                        const fromCity = flight.details?.from?.split('(')[0]?.trim() || 'New York';
                        const toCity = flight.details?.to?.split('(')[0]?.trim() || 'London';
                        const depTime = flight.details?.departureDate?.includes('T')
                            ? flight.details.departureDate.split('T')[1].substring(0, 5)
                            : flight.details?.departureDate?.split(' ')[1]?.substring(0, 5) || 'TBD';
                        const arrCode = flight.details?.flightNumber?.substring(0, 2) === 'WV' ? 'WV' : 'FL';

                        return (
                            <div key={flight.id} className="group relative flex flex-col rounded-3xl bg-white shadow-sm transition-all hover:shadow-md border border-gray-100 overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                            <Plane className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{flight.details?.airline || 'Weave Airlines'}</p>
                                            <p className="text-[10px] font-medium text-blue-100 uppercase tracking-wide">Economy</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-sm">
                                        {flight.details?.flightNumber || 'FL882'}
                                    </Badge>
                                </div>

                                {/* Route */}
                                <div className="flex items-center justify-between px-6 py-4">
                                    <div className="text-left min-w-[30%]">
                                        <p className="text-4xl font-black text-gray-900 leading-none mb-1">{fromCode}</p>
                                        <p className="text-xs font-medium text-gray-500 truncate max-w-[100px]">{fromCity}</p>
                                        <p className="text-sm font-bold text-gray-900 mt-2">{depTime}</p>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center px-2">
                                        <div className="relative w-full flex items-center justify-center">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                                            </div>
                                            <div className="relative bg-white px-2">
                                                <Plane className="h-5 w-5 text-gray-400 rotate-90" />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-medium text-gray-400 mt-1">{flight.details?.duration || '2h 45m'}</p>
                                    </div>

                                    <div className="text-right min-w-[30%]">
                                        <p className="text-4xl font-black text-gray-900 leading-none mb-1">{toCode}</p>
                                        <p className="text-xs font-medium text-gray-500 truncate max-w-[100px] ml-auto">{toCity}</p>
                                        <p className="text-sm font-bold text-gray-900 mt-2">{flight.details?.arrivalTime || 'TBD'}</p>
                                    </div>
                                </div>

                                {/* Divider with Cutouts */}
                                <div className="relative h-6 w-full my-2">
                                    <div className="absolute inset-0 flex items-center px-6">
                                        <div className="w-full border-t-2 border-dashed border-gray-200"></div>
                                    </div>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-[#f8fafc] border-r border-gray-200"></div>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-6 w-6 rounded-full bg-[#f8fafc] border-l border-gray-200"></div>
                                </div>

                                {/* Footer */}
                                <div className="bg-white px-6 pb-6 pt-2 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-600 font-normal">
                                            <Calendar className="mr-1.5 h-3 w-3" />
                                            {formatDate(flight.details?.departureDate).split(',')[0] + ', ' + formatDate(flight.details?.departureDate).split(',')[1]}
                                        </Badge>
                                        <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-600 font-normal">
                                            <Clock className="mr-1.5 h-3 w-3" />
                                            {flight.details?.duration || 'Duration TBD'}
                                        </Badge>
                                    </div>

                                    <div className="flex gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" className="h-8 rounded-full bg-slate-900 text-xs font-medium text-white hover:bg-slate-800">
                                                    View Ticket
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-md p-0 overflow-hidden sm:rounded-[24px] border-0 shadow-2xl bg-zinc-50">
                                                {/* Digital Ticket Modal Content */}
                                                <div className="flex flex-col h-full bg-white">
                                                    {/* Header Brand */}
                                                    <div className="bg-[#0F172A] text-white p-6 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                                                            <Plane className="w-48 h-48 rotate-[-15deg]" />
                                                        </div>
                                                        <div className="relative z-10 flex justify-between items-start">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-md">
                                                                        <Plane className="w-4 h-4" />
                                                                    </div>
                                                                    <span className="font-bold tracking-widest text-xs opacity-75">WEAVE AIRLINES</span>
                                                                </div>
                                                                <DialogTitle className="text-2xl font-bold tracking-tight">Boarding Pass</DialogTitle>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs opacity-60 mb-1">CLASS</p>
                                                                <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0">
                                                                    ECONOMY
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Route Info */}
                                                    <div className="px-8 py-8 bg-white relative z-10 rounded-t-3xl -mt-4 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
                                                        <div className="flex justify-between items-center mb-8">
                                                            <div className="text-center w-24">
                                                                <p className="text-4xl font-black text-slate-900 mb-1">{fromCode}</p>
                                                                <p className="text-xs text-slate-500 font-medium bg-slate-100 py-1 px-2 rounded-full inline-block truncate max-w-full">{fromCity}</p>
                                                            </div>
                                                            <div className="flex-1 flex flex-col items-center px-4 relative">
                                                                <div className="w-full h-[2px] bg-slate-100 absolute top-1/2 left-0 -translate-y-1/2" />
                                                                <div className="p-2 bg-slate-50 rounded-full border border-slate-100 z-10 relative">
                                                                    <Plane className="w-4 h-4 text-slate-400 rotate-90" />
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 mt-2 font-mono bg-white px-2 z-10">{flight.details?.duration || '02h 45m'}</p>
                                                            </div>
                                                            <div className="text-center w-24">
                                                                <p className="text-4xl font-black text-slate-900 mb-1">{toCode}</p>
                                                                <p className="text-xs text-slate-500 font-medium bg-slate-100 py-1 px-2 rounded-full inline-block truncate max-w-full">{toCity}</p>
                                                            </div>
                                                        </div>

                                                        {/* Flight Details Grid */}
                                                        <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Date</p>
                                                                <p className="text-sm font-bold text-slate-900">{flight.details?.departureDate?.split('T')[0] || 'TBD'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Time</p>
                                                                <p className="text-sm font-bold text-slate-900">{depTime}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Flight</p>
                                                                <p className="text-sm font-bold text-slate-900">{flight.details?.flightNumber || 'FL882'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Gate</p>
                                                                <p className="text-sm font-bold text-slate-900">A12</p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-6 flex items-center justify-between">
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Passenger</p>
                                                                <p className="text-base font-bold text-slate-900">{flight.details?.passengerName || user?.fullName || 'Guest'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 text-right">Seat</p>
                                                                <p className="text-base font-bold text-slate-900 text-right">14F</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Barcode Section */}
                                                    <div className="bg-slate-900 p-6 text-white pb-8 relative">
                                                        {/* Perforation Top */}
                                                        <div className="absolute top-0 left-0 right-0 h-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white from-0% to-transparent to-50% bg-[length:24px_24px] bg-repeat-x -mt-2"></div>

                                                        <div className="flex gap-4 items-center justify-center pt-2">
                                                            <div className="p-2 bg-white rounded-lg">
                                                                <QrCode className="w-20 h-20 text-slate-900" />
                                                            </div>
                                                            <div className="flex-1 space-y-1">
                                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Booking Reference</p>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-2xl font-mono font-bold tracking-widest text-white">{(flight.id || 'REF123').substring(0, 6).toUpperCase()}</p>
                                                                    <button className="p-1 hover:bg-white/10 rounded-md transition-colors">
                                                                        <Copy className="w-3 h-3 text-slate-400" />
                                                                    </button>
                                                                </div>
                                                                <p className="text-[10px] text-slate-500">Scan this code at the kiosk or gate</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Actions */}
                                                <div className="bg-slate-900 px-6 pb-6 text-center">
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-white/10 text-xs w-full h-8">
                                                                <Trash2 className="w-3 h-3 mr-2" />
                                                                Cancel Flight
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Cancel Flight?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to cancel this flight? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Keep Flight</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleCancel(flight.id, 'flight')} className="bg-red-600 hover:bg-red-700">Yes, Cancel</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="h-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 flex flex-col items-center justify-center text-center transition-all hover:bg-gray-50">
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                            <Plane className="h-5 w-5 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">No Upcoming Flights</h3>
                        <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">Book your next adventure and see your flight here!</p>
                        <Button onClick={() => router.push('/flights')} size="sm" className="mt-2 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 shadow-sm">
                            <Plus className="h-3 w-3 mr-1.5" /> Book Flight
                        </Button>
                    </div>
                )}
            </div>

            {/* Hotel Section */}
            <div className="w-full flex flex-col gap-6">
                {upcomingHotels.length > 0 ? (
                    upcomingHotels.map((hotel) => (
                        <div key={hotel.id} className="flex flex-col rounded-2xl overflow-hidden shadow-md bg-white border border-gray-100 h-full hover:shadow-lg transition-shadow">
                            {/* Image Header */}
                            <div className="h-28 relative shrink-0">
                                <Image
                                    src={hotel.details?.bookingImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                                    alt="Hotel"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <div className="absolute bottom-3 left-4 right-4">
                                    <h3 className="text-lg font-bold text-white truncate leading-tight shadow-sm">{hotel.details?.hotelName || 'Luxury Hotel'}</h3>
                                    <p className="text-xs text-gray-200 font-medium flex items-center mt-0.5 truncate">
                                        <MapPin className="h-3 w-3 mr-1 shrink-0" />
                                        {hotel.details?.hotelLocation || 'Unknown Location'}
                                    </p>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className="bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-gray-900 uppercase tracking-wide shadow-sm">
                                        Confirmed
                                    </span>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-5 flex-grow flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4 bg-orange-50/50 p-3 rounded-lg border border-orange-100/50">
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Check-in</p>
                                            <p className="text-sm font-bold text-gray-900">{hotel.details?.checkInDate || 'TBD'}</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-orange-300" />
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Check-out</p>
                                            <p className="text-sm font-bold text-gray-900">{hotel.details?.checkOutDate || 'TBD'}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">Room: <span className="text-gray-900 font-medium">{hotel.details?.bookingName?.replace('Reservation-', '') || 'Standard'}</span></span>
                                        <span className="text-gray-500">Guests: <span className="text-gray-900 font-medium">2</span></span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                                    <Button className="flex-1 h-8 text-xs bg-gray-900 hover:bg-black text-white" size="sm">Manage</Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className="flex-1 h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" size="sm">Cancel</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Cancel Reservation?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently cancel your hotel reservation.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleCancel(hotel.id, 'hotel')} className="bg-red-600 hover:bg-red-700">Yes, Cancel</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="hidden"></div>
                )}

                {upcomingHotels.length === 0 && (
                    <div className="h-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 flex flex-col items-center justify-center text-center transition-all hover:bg-gray-50">
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                            <Hotel className="h-5 w-5 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">No Upcoming Stays</h3>
                        <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">Find your perfect stay and it will appear here!</p>
                        <Button onClick={() => router.push('/hotels')} size="sm" className="mt-3 bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 shadow-sm">
                            <Plus className="h-3 w-3 mr-1.5" /> Book Hotel
                        </Button>
                    </div>
                )}
            </div>
        </div >
    );
}

function Plus(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
