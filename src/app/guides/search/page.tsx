"use client";

import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    BadgeCheck,
    ChevronDown,
    Clock,
    Globe,
    MessageCircle,
    Phone,
    Search,
    Send,
    Video,
    Video as VideoIcon,
    X,
    Filter
} from 'lucide-react';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { VideoCall } from '@/components/VideoCall';
import { GuideBookingDialog } from '@/components/GuideBookingDialog';
import { VideoCallModal } from '@/components/VideoCallModal';

// Types
interface Guide {
    id: number;
    name: string;
    country: string;
    city?: string;
    rating: number;
    reviews: number;
    languages: string[];
    specialties: string[];
    hourlyRate: number;
    image: string;
    video: string;
    verified: boolean;
    responseTime: string;
    featured?: boolean;
    tagline?: string;
}

interface Message {
    id: number;
    sender: 'user' | 'guide';
    text: string;
    timestamp: Date;
}

// Guides Data (duplicated for now, ideally moved to a shared data file)
const initialGuides: Guide[] = [
    {
        id: 1,
        name: 'Andrea',
        country: 'Italy',
        city: 'Rome',
        rating: 4.9,
        reviews: 243,
        languages: ['English', 'German', 'French'],
        specialties: ['History', 'Architecture', 'Nightlife'],
        hourlyRate: 35,
        image: '/images/andrea.jpg',
        video: '/images/andrea-1.mp4',
        verified: true,
        responseTime: '5 min',
        featured: true,
        tagline: 'Discover the hidden gems of Rome.',
    },
    {
        id: 2,
        name: 'Thanh',
        country: 'Vietnam',
        city: 'Ho Chi Minh City',
        rating: 5.0,
        reviews: 189,
        languages: ['English', 'Japanese'],
        specialties: ['Culture', 'Food', 'Temples'],
        hourlyRate: 40,
        image: '/images/thanh.jpg',
        video: '/images/thanh-1.mp4',
        verified: true,
        responseTime: '10 min',
        featured: true,
        tagline: 'Experience the vibrant culture of Ho Chi Minh City.',
    },
    {
        id: 3,
        name: 'Lucas',
        country: 'Argentina',
        city: 'Buenos Aires',
        rating: 4.8,
        reviews: 312,
        languages: ['English', 'Italian', 'Spanish'],
        specialties: ['History', 'Art', 'Cuisine'],
        hourlyRate: 38,
        image: '/images/lucas.jpg',
        video: '/images/lucas-1.mp4',
        verified: true,
        featured: true,
        responseTime: '3 min',
        tagline: 'Custom art experiences in Buenos Aires.',
    },
    {
        id: 4,
        name: 'Venese',
        country: 'Japan',
        city: 'Tokyo',
        rating: 4.9,
        reviews: 278,
        languages: ['English', 'French', 'German'],
        specialties: ['Art', 'Fashion', 'Wine'],
        hourlyRate: 42,
        image: '/images/venese.jpg',
        video: '/images/venese-1.mp4',
        verified: true,
        featured: true,
        responseTime: '8 min',
        tagline: 'Tokyo’s fashion and art insider.',
    },
    {
        id: 5,
        name: 'Tiago',
        country: 'Portugal',
        city: 'Lisbon',
        rating: 4.7,
        reviews: 156,
        languages: ['English', 'Spanish', 'Catalan'],
        specialties: ['Architecture', 'Beaches', 'Tapas'],
        hourlyRate: 30,
        image: '/images/tiago.jpg',
        video: '/images/tiago-1.mp4',
        verified: true,
        featured: true,
        responseTime: '12 min',
        tagline: 'Explore Lisbon’s stunning architecture and coastal beauty.',
    },
    {
        id: 6,
        name: 'June',
        country: 'Thailand',
        city: 'Bangkok',
        rating: 4.8,
        reviews: 201,
        languages: ['English', 'Hindi', 'Marathi'],
        specialties: ['Culture', 'Food', 'Markets'],
        hourlyRate: 25,
        image: '/images/june.jpg',
        video: '/images/june-4.mp4',
        verified: true,
        responseTime: '6 min',
        featured: true,
        tagline: 'Discover the vibrant culture of Bangkok.',
    },
    {
        id: 7,
        name: 'Gunnar',
        country: 'Iceland',
        city: 'Reykjavik',
        rating: 4.9,
        reviews: 334,
        languages: ['English', 'Spanish'],
        specialties: ['Museums', 'Food', 'Broadway'],
        hourlyRate: 45,
        image: '/images/gunnar.jpg',
        video: '/images/gunnar-3.mp4',
        verified: true,
        featured: true,
        responseTime: '4 min',
        tagline: "Experience Iceland's natural wonders with a local expert.",
    },
    {
        id: 8,
        name: 'Denise & Rob',
        country: 'Tanzania',
        city: 'Arusha',
        rating: 5.0,
        reviews: 267,
        languages: ['English', 'French'],
        specialties: ['History', 'Pubs', 'Royal Sites'],
        hourlyRate: 40,
        image: '/images/denis.jpg',
        video: '/images/denise-3.mp4',
        verified: true,
        featured: true,
        responseTime: '7 min',
        tagline: 'Safari adventures with local wildlife experts.',
    },
    {
        id: 9,
        name: 'Cris',
        country: 'Brazil',
        city: 'Rio de Janeiro',
        rating: 4.9,
        reviews: 215,
        languages: ['English', 'Portuguese', 'Spanish'],
        specialties: ['Wine', 'Coastal Towns', 'Food'],
        hourlyRate: 32,
        image: '/images/cris.jpg',
        video: '/images/cris-2.mp4',
        verified: true,
        responseTime: '9 min',
        featured: true,
        tagline: "Discover Brazil's hidden gems.",
    },
    {
        id: 10,
        name: 'Zoloo',
        country: 'Mongolia',
        city: 'Ulaanbaatar',
        rating: 4.8,
        reviews: 198,
        languages: ['English', 'Thai', 'Mandarin'],
        specialties: ['Temples', 'Street Food', 'Night Markets'],
        hourlyRate: 28,
        image: '/images/zoloo.jpg',
        video: '/images/zoloo-1.mp4',
        verified: true,
        featured: true,
        responseTime: '11 min',
        tagline: 'Explore the wonders of Mongolia with a local guide.',
    },
    {
        id: 11,
        name: 'Sarah',
        country: 'Australia',
        city: 'Sydney',
        rating: 4.9,
        reviews: 142,
        languages: ['English'],
        specialties: ['Surfing', 'Beaches', 'Coffee'],
        hourlyRate: 45,
        image: '/images/sarah.jpg',
        video: '/images/sarah-1.mp4',
        verified: true,
        featured: true,
        responseTime: '5 min',
        tagline: 'Catch the best waves in Bondi.',
    },
    {
        id: 12,
        name: 'Rahul',
        country: 'India',
        city: 'Rishikesh',
        rating: 4.8,
        reviews: 210,
        languages: ['English', 'Hindi', 'Punjabi'],
        specialties: ['Spirituality', 'Food', 'Yoga'],
        hourlyRate: 25,
        image: '/images/rahul.jpg',
        video: '/images/rahul-1.mp4',
        verified: true,
        featured: true,
        responseTime: '15 min',
        tagline: 'Spiritual journeys in Rishikesh.',
    },
    {
        id: 13,
        name: 'Elena',
        country: 'Spain',
        city: 'Madrid',
        rating: 4.9,
        reviews: 180,
        languages: ['English', 'Spanish', 'French'],
        specialties: ['Art', 'History', 'Tapas'],
        hourlyRate: 35,
        image: '/images/elena.jpg',
        video: '/images/elena-1.mp4',
        verified: true,
        featured: true,
        responseTime: '8 min',
        tagline: 'Art and history in Madrid.',
    },
    {
        id: 25,
        name: 'Hana',
        country: 'New Zealand',
        city: 'Auckland',
        rating: 5.0,
        reviews: 42,
        languages: ['English', 'Maori'],
        specialties: ['Culture', 'Nature', 'Food'],
        hourlyRate: 50,
        image: '/images/users/user-1.jpg',
        video: '/images/new zealand video.mp4',
        verified: true,
        featured: true,
        responseTime: '20 min',
        tagline: 'Experience Auckland like a local.',
    },
    {
        id: 14,
        name: 'James',
        country: 'United Kingdom',
        city: 'London',
        rating: 4.7,
        reviews: 130,
        languages: ['English'],
        specialties: ['History', 'Pubs', 'Literature'],
        hourlyRate: 50,
        image: '/images/james.jpg',
        video: '/images/james-1.mp4',
        verified: true,
        featured: true,
        responseTime: '10 min',
        tagline: 'Literary tours of London.',
    },
    {
        id: 15,
        name: 'Sophie',
        country: 'France',
        city: 'Paris',
        rating: 5.0,
        reviews: 250,
        languages: ['English', 'French'],
        specialties: ['Fashion', 'Food', 'Wine'],
        hourlyRate: 55,
        image: '/images/sophie.jpg',
        video: '/images/sophie-1.mp4',
        verified: true,
        featured: true,
        responseTime: '5 min',
        tagline: 'Parisian chic and gourmet delights.',
    },
    {
        id: 16,
        name: 'Kenji',
        country: 'Japan',
        city: 'Tokyo',
        rating: 4.9,
        reviews: 200,
        languages: ['English', 'Japanese'],
        specialties: ['Anime', 'Tech', 'Food'],
        hourlyRate: 40,
        image: '/images/kenji.jpg',
        video: '/images/kenji-1.mp4',
        verified: true,
        featured: true,
        responseTime: '7 min',
        tagline: 'Akihabara and Tokyo tech tour.',
    },
    {
        id: 17,
        name: 'Maria',
        country: 'Mexico',
        city: 'Mexico City',
        rating: 4.8,
        reviews: 160,
        languages: ['English', 'Spanish'],
        specialties: ['Food', 'History', 'Art'],
        hourlyRate: 30,
        image: '/images/maria.jpg',
        video: '/images/maria-1.mp4',
        verified: true,
        featured: true,
        responseTime: '12 min',
        tagline: 'Authentic tacos and vibrant murals.',
    },
    {
        id: 18,
        name: 'David',
        country: 'Canada',
        city: 'Vancouver',
        rating: 4.9,
        reviews: 110,
        languages: ['English', 'French'],
        specialties: ['Nature', 'Hiking', 'Wildlife'],
        hourlyRate: 45,
        image: '/images/david.jpg',
        video: '/images/david-1.mp4',
        verified: true,
        featured: true,
        responseTime: '9 min',
        tagline: 'Explore the Rockies with a pro.',
    },
    {
        id: 19,
        name: 'Aisha',
        country: 'Egypt',
        city: 'Cairo',
        rating: 4.8,
        reviews: 190,
        languages: ['English', 'Arabic'],
        specialties: ['History', 'Archaeology', 'Culture'],
        hourlyRate: 35,
        image: '/images/aisha.jpg',
        video: '/images/aisha-1.mp4',
        verified: true,
        featured: true,

        responseTime: '6 min',
        tagline: 'Ancient wonders of Cairo.',
    },
    {
        id: 20,
        name: 'Lars',
        country: 'Norway',
        city: 'Oslo',
        rating: 5.0,
        reviews: 140,
        languages: ['English', 'Norwegian'],
        specialties: ['Nature', 'Fjords', 'Photography'],
        hourlyRate: 60,
        image: '/images/lars.jpg',
        video: '/images/lars-1.mp4',
        verified: true,
        featured: true,
        responseTime: '4 min',
        tagline: 'Chasing the Northern Lights.',
    },
    {
        id: 21,
        name: 'Mei',
        country: 'China',
        city: 'Beijing',
        rating: 4.8,
        reviews: 170,
        languages: ['English', 'Mandarin'],
        specialties: ['History', 'Food', 'Culture'],
        hourlyRate: 38,
        image: '/images/mei.jpg',
        video: '/images/mei-1.mp4',
        verified: true,
        featured: true,
        responseTime: '10 min',
        tagline: 'Hidden gems of Beijing.',
    },
    {
        id: 22,
        name: 'Hans',
        country: 'Germany',
        city: 'Munich',
        rating: 4.7,
        reviews: 120,
        languages: ['English', 'German'],
        specialties: ['History', 'Beer', 'Cars'],
        hourlyRate: 42,
        image: '/images/hans.jpg',
        video: '/images/hans-1.mp4',
        verified: true,
        featured: true,
        responseTime: '8 min',
        tagline: 'Oktoberfest and auto history.',
    },
    {
        id: 23,
        name: 'Isabella',
        country: 'Italy',
        city: 'Milan',
        rating: 4.9,
        reviews: 230,
        languages: ['English', 'Italian'],
        specialties: ['Fashion', 'Art', 'Design'],
        hourlyRate: 45,
        image: '/images/isabella.jpg',
        video: '/images/isabella-1.mp4',
        verified: true,
        featured: true,
        responseTime: '5 min',
        tagline: 'Milan fashion week insider.',
    },
    {
        id: 24,
        name: 'Kwame',
        country: 'Ghana',
        city: 'Accra',
        rating: 4.8,
        reviews: 110,
        languages: ['English', 'Twi'],
        specialties: ['History', 'Culture', 'Music'],
        hourlyRate: 30,
        image: '/images/kwame.jpg',
        video: '/images/kwame-1.mp4',
        verified: true,
        featured: true,
        responseTime: '15 min',
        tagline: 'Accra’s vibrant beats and history.',
    }
];

function GuideSearchResults() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('search') || '';

    // Search State
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [filteredGuides, setFilteredGuides] = useState<Guide[]>([]);

    // Filter States

    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

    // Component States
    const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
    const [bookingGuide, setBookingGuide] = useState<Guide | null>(null);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [videoCallOpen, setVideoCallOpen] = useState(false);
    const [currentBooking, setCurrentBooking] = useState<any>(null);

    // Filter Options
    const allLanguages = Array.from(new Set(initialGuides.flatMap(g => g.languages)));
    const allSpecialties = Array.from(new Set(initialGuides.flatMap(g => g.specialties)));

    useEffect(() => {
        const query = searchParams.get('search');
        if (query !== null) {
            setSearchQuery(query);
        }
    }, [searchParams]);

    // Main Filtering Logic
    useEffect(() => {
        let result = initialGuides;

        // 1. Text Search (Name or Country or City)
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(g =>
                g.country.toLowerCase().includes(lowerQ) ||
                g.name.toLowerCase().includes(lowerQ) ||
                (g.city && g.city.toLowerCase().includes(lowerQ))
            );
        }

        // 3. Language Filter
        if (selectedLanguages.length > 0) {
            result = result.filter(g => selectedLanguages.some(lang => g.languages.includes(lang)));
        }

        // 4. Specialty Filter
        if (selectedSpecialties.length > 0) {
            result = result.filter(g => selectedSpecialties.some(spec => g.specialties.includes(spec)));
        }

        setFilteredGuides(result);
    }, [searchQuery, selectedLanguages, selectedSpecialties]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/guides/search?search=${encodeURIComponent(searchQuery)}`);
    };

    const handleBookAppointment = (guide: Guide) => {
        setBookingGuide(guide);
        setBookingDialogOpen(true);
    };

    const handleBookingConfirmed = (booking: any) => {
        setCurrentBooking(booking);
        setBookingDialogOpen(false);
        setTimeout(() => {
            setVideoCallOpen(true);
        }, 500);
    };

    // Helper to toggle checkbox values
    const toggleFilter = (item: string, currentList: string[], setter: (val: string[]) => void) => {
        if (currentList.includes(item)) {
            setter(currentList.filter(i => i !== item));
        } else {
            setter([...currentList, item]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Dynamic Hero Header */}
            <div className="relative h-[300px] w-full overflow-hidden bg-black">
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10" />
                <img
                    src="/images/3.jpg"
                    alt="Travel"
                    className="h-full w-full object-cover opacity-60"
                />
                <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 lg:px-12 max-w-7xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                        {searchQuery ? `Exploring ${searchQuery}` : 'Find your local expert'}
                    </h1>
                    <p className="text-xl text-white/90 max-w-2xl">
                        Connect with verified locals in {searchQuery || 'top destinations'} who can show you the real side of the city.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                <div className="flex flex-col lg:flex-row gap-12">

                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-[300px] flex-shrink-0 space-y-8">
                        {/* Search Input in Sidebar */}
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search country or guide..."
                                className="pl-10"
                            />
                        </form>



                        <div>
                            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Languages</h3>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                {allLanguages.map(lang => (
                                    <div key={lang} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`lang-${lang}`}
                                            checked={selectedLanguages.includes(lang)}
                                            onCheckedChange={() => toggleFilter(lang, selectedLanguages, setSelectedLanguages)}
                                        />
                                        <Label htmlFor={`lang-${lang}`}>{lang}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Interests</h3>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                {allSpecialties.map(spec => (
                                    <div key={spec} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`spec-${spec}`}
                                            checked={selectedSpecialties.includes(spec)}
                                            onCheckedChange={() => toggleFilter(spec, selectedSpecialties, setSelectedSpecialties)}
                                        />
                                        <Label htmlFor={`spec-${spec}`}>{spec}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold">
                                {filteredGuides.length} {filteredGuides.length === 1 ? 'guide' : 'guides'} available
                            </h2>
                            {/* Option for sort order could go here */}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredGuides.map((guide) => (
                                <div key={guide.id} className="group relative w-full cursor-pointer overflow-hidden rounded-3xl shadow-lg transition-all hover:shadow-xl bg-white">
                                    <div className="relative aspect-[3/4]">
                                        <ImageWithFallback
                                            src={guide.image}
                                            alt={guide.name}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />

                                        {/* Video Play Button */}
                                        <button
                                            onClick={() => setPlayingVideoId(guide.id.toString())}
                                            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 hover:bg-black/20"
                                        >
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-xl transition-transform duration-300 group-hover:scale-110">
                                                <div className="ml-1 h-0 w-0 border-t-[10px] border-b-[10px] border-l-[16px] border-t-transparent border-b-transparent border-l-blue-600"></div>
                                            </div>
                                        </button>

                                        {/* Info Overlay */}
                                        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
                                            <div className="flex justify-between items-end mb-1">
                                                <h3 className="text-2xl text-white font-medium">{guide.name.split(' ')[0]}</h3>

                                            </div>

                                            <p className="mb-3 text-sm text-white/90">
                                                Local expert, {guide.country}
                                            </p>

                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {guide.specialties.slice(0, 2).map(s => (
                                                    <span key={s} className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] text-white">
                                                        {s}
                                                    </span>
                                                ))}
                                                {guide.specialties.length > 2 && (
                                                    <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] text-white">
                                                        +{guide.specialties.length - 2}
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBookAppointment(guide);
                                                }}
                                                className="pointer-events-auto w-full rounded-lg bg-white py-3 px-4 text-sm font-medium text-black transition-all hover:bg-blue-600 hover:text-white shadow-lg"
                                            >
                                                Book appointment
                                            </button>

                                        </div>

                                        {guide.verified && (
                                            <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs text-black shadow-md backdrop-blur-sm">
                                                <BadgeCheck className="size-3" />
                                                <span>Verified</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredGuides.length === 0 && (
                            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                                <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No guides found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery('');
                                        // setPriceRange([100]);
                                        setSelectedLanguages([]);
                                        setSelectedSpecialties([]);
                                        router.push('/guides/search');
                                    }}
                                    className="mt-6"
                                >
                                    Reset all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <GuideBookingDialog
                open={bookingDialogOpen}
                onOpenChange={setBookingDialogOpen}
                guide={bookingGuide as any}
                onBookingConfirmed={handleBookingConfirmed}
            />

            <VideoCallModal
                open={videoCallOpen}
                onClose={() => {
                    setVideoCallOpen(false);
                    setCurrentBooking(null);
                }}
                roomID={currentBooking && currentBooking.guide && currentBooking.guide.id ? currentBooking.guide.id.toString() : undefined}
            />

            {/* Full Screen Video Overlay when playing */}
            {playingVideoId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
                    <button
                        onClick={() => setPlayingVideoId(null)}
                        className="absolute top-8 right-8 z-50 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                    >
                        <X className="size-6" />
                    </button>
                    {(() => {
                        const guide = initialGuides.find(g => g.id.toString() === playingVideoId);
                        return guide ? (
                            <div className="aspect-[9/16] h-[80vh] w-auto max-w-full overflow-hidden rounded-2xl">
                                <video
                                    src={guide.video}
                                    className="h-full w-full object-cover"
                                    autoPlay
                                    controls
                                    loop
                                    playsInline
                                />
                            </div>
                        ) : null;
                    })()}
                </div>
            )}
        </div>
    );
}

export default function GuidesSearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
            <GuideSearchResults />
        </Suspense>
    );
}
