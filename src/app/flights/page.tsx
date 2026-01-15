'use client';

import { DateSelector } from '@/components/DateSelector';
import { PassengerSelector } from '@/components/PassengerSelector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
  ArrowLeftRight,
  ArrowRight,
  CheckCircle,
  ChevronDown,
  Crown,
  Filter,
  Minus,
  Plane,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FlightBookingFlow } from '@/components/FlightBookingFlow';
import { toast } from 'sonner';

interface Flight {
  id: number;
  airline: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: string;
  cabin: string;
  price: number;
  logo: string;
  departureTime: 'morning' | 'afternoon' | 'evening';
}

interface MultiCityFlight {
  id: string;
  from: string;
  to: string;
  date: Date | null;
}

interface City {
  name: string;
  code: string;
  country: string;
}

const CITIES: City[] = [
  { name: 'New York', code: 'JFK', country: 'USA' },
  { name: 'Los Angeles', code: 'LAX', country: 'USA' },
  { name: 'Chicago', code: 'ORD', country: 'USA' },
  { name: 'Miami', code: 'MIA', country: 'USA' },
  { name: 'San Francisco', code: 'SFO', country: 'USA' },
  { name: 'London', code: 'LHR', country: 'UK' },
  { name: 'Paris', code: 'CDG', country: 'France' },
  { name: 'Dubai', code: 'DXB', country: 'UAE' },
  { name: 'Tokyo', code: 'NRT', country: 'Japan' },
  { name: 'Singapore', code: 'SIN', country: 'Singapore' },
  { name: 'Hong Kong', code: 'HKG', country: 'Hong Kong' },
  { name: 'Sydney', code: 'SYD', country: 'Australia' },
  { name: 'Toronto', code: 'YYZ', country: 'Canada' },
  { name: 'Amsterdam', code: 'AMS', country: 'Netherlands' },
  { name: 'Frankfurt', code: 'FRA', country: 'Germany' },
  { name: 'Rome', code: 'FCO', country: 'Italy' },
  { name: 'Barcelona', code: 'BCN', country: 'Spain' },
  { name: 'Istanbul', code: 'IST', country: 'Turkey' },
  { name: 'Bangkok', code: 'BKK', country: 'Thailand' },
  { name: 'Mumbai', code: 'BOM', country: 'India' },
  { name: 'Delhi', code: 'DEL', country: 'India' },
  { name: 'Seoul', code: 'ICN', country: 'South Korea' },
  { name: 'Beijing', code: 'PEK', country: 'China' },
  { name: 'Shanghai', code: 'PVG', country: 'China' },
  { name: 'Moscow', code: 'SVO', country: 'Russia' },
  { name: 'São Paulo', code: 'GRU', country: 'Brazil' },
  { name: 'Mexico City', code: 'MEX', country: 'Mexico' },
  { name: 'Johannesburg', code: 'JNB', country: 'South Africa' },
  { name: 'Cairo', code: 'CAI', country: 'Egypt' },
  { name: 'Athens', code: 'ATH', country: 'Greece' },
  { name: 'Lisbon', code: 'LIS', country: 'Portugal' },
  { name: 'Vienna', code: 'VIE', country: 'Austria' },
  { name: 'Zurich', code: 'ZRH', country: 'Switzerland' },
  { name: 'Copenhagen', code: 'CPH', country: 'Denmark' },
  { name: 'Stockholm', code: 'ARN', country: 'Sweden' },
  { name: 'Oslo', code: 'OSL', country: 'Norway' },
  { name: 'Helsinki', code: 'HEL', country: 'Finland' },
  { name: 'Dublin', code: 'DUB', country: 'Ireland' },
  { name: 'Brussels', code: 'BRU', country: 'Belgium' },
  { name: 'Montreal', code: 'YUL', country: 'Canada' },
  { name: 'Vancouver', code: 'YVR', country: 'Canada' },
  { name: 'Auckland', code: 'AKL', country: 'New Zealand' },
  { name: 'Melbourne', code: 'MEL', country: 'Australia' },
  { name: 'Brisbane', code: 'BNE', country: 'Australia' },
  { name: 'Perth', code: 'PER', country: 'Australia' },
];

export default function FlightBooking() {
  const router = useRouter();
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [tripType, setTripType] = useState('roundtrip');
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [passengerCounts, setPassengerCounts] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize dates as null to avoid hydration mismatch
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);

  // Set default dates on client side only
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(tomorrow);
    nextWeek.setDate(tomorrow.getDate() + 7);
    
    setDepartureDate(tomorrow);
    setReturnDate(nextWeek);
  }, []);

  // Multi-city flights state
  const [multiCityFlights, setMultiCityFlights] = useState<MultiCityFlight[]>([
    { id: '1', from: 'Auckland', to: '', date: null },
    { id: '2', from: '', to: '', date: null },
  ]);

  const [multiCityPopovers, setMultiCityPopovers] = useState<{
    [key: string]: { fromOpen: boolean; toOpen: boolean };
  }>({
    '1': { fromOpen: false, toOpen: false },
    '2': { fromOpen: false, toOpen: false },
  });

  // Filter states
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('price');

  const totalPassengers =
    passengerCounts.adults + passengerCounts.children + passengerCounts.infants;

  const allFlights: Flight[] = [
    {
      id: 1,
      airline: 'Emirates',
      from: 'New York (JFK)',
      to: 'Dubai (DXB)',
      departure: '10:30 AM',
      arrival: '6:45 PM',
      duration: '13h 15m',
      stops: 'Non-stop',
      cabin: 'Economy',
      price: 899,
      logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwbGFuZSUyMHRyYXZlbHxlbnwxfHx8fDE3NjQ1NTI3NDR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      departureTime: 'morning',
    },
    {
      id: 2,
      airline: 'Singapore Airlines',
      from: 'New York (JFK)',
      to: 'Dubai (DXB)',
      departure: '11:45 AM',
      arrival: '9:30 PM',
      duration: '15h 45m',
      stops: '1 Stop',
      cabin: 'Economy',
      price: 749,
      logo: 'https://images.unsplash.com/photo-1718099439740-bee549d83d83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwYWlyY3JhZnR8ZW58MXx8fHwxNzY0NTUyNzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      departureTime: 'morning',
    },
    {
      id: 3,
      airline: 'Qatar Airways',
      from: 'New York (JFK)',
      to: 'Dubai (DXB)',
      departure: '8:15 AM',
      arrival: '4:20 PM',
      duration: '13h 05m',
      stops: 'Non-stop',
      cabin: 'Business',
      price: 1899,
      logo: 'https://images.unsplash.com/photo-1680015157236-22c554b971a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJsaW5lJTIwbG9nb3xlbnwxfHx8fDE3NjQ1NTI3NDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      departureTime: 'morning',
    },
    {
      id: 4,
      airline: 'Etihad Airways',
      from: 'New York (JFK)',
      to: 'Dubai (DXB)',
      departure: '3:30 PM',
      arrival: '11:45 PM',
      duration: '14h 15m',
      stops: '1 Stop',
      cabin: 'Economy',
      price: 679,
      logo: 'https://images.unsplash.com/photo-1522199873717-bc67b1a5e32b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwb3J0JTIwZGVwYXJ0dXJlfGVufDF8fHx8MTc2NDUwOTgyM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      departureTime: 'afternoon',
    },
    {
      id: 5,
      airline: 'British Airways',
      from: 'New York (JFK)',
      to: 'Dubai (DXB)',
      departure: '7:00 PM',
      arrival: '3:15 AM +1',
      duration: '14h 15m',
      stops: '1 Stop',
      cabin: 'Premium Economy',
      price: 1299,
      logo: 'https://images.unsplash.com/photo-1506033690138-a2f823a05a99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGFuZSUyMHdpbmRvdyUyMHZpZXd8ZW58MXx8fHwxNzY0NTUyNzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      departureTime: 'evening',
    },
  ];

  const fetchFlights = async () => {
    if (!fromInput || !toInput) {
      toast.error('Please select both departure and arrival locations');
      return;
    }

    if (!departureDate) {
      toast.error('Please select a departure date');
      return;
    }

    if (tripType === 'roundtrip' && !returnDate) {
      toast.error('Please select a return date for round trip flights');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Extract airport codes from input string format "City Name (CODE)"
      const fromMatch = fromInput.match(/\(([^)]+)\)$/);
      const toMatch = toInput.match(/\(([^)]+)\)$/);

      const fromCode = fromMatch ? fromMatch[1] : fromInput;
      const toCode = toMatch ? toMatch[1] : toInput;

      // Format date as YYYY-MM-DD
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

      const params = new URLSearchParams({
        departure_id: fromCode,
        arrival_id: toCode,
        outbound_date: formatDate(departureDate),
        type: tripType === 'roundtrip' ? '1' : '2', // 1=Round trip, 2=One-way
        currency: 'USD',
        adults: passengerCounts.adults.toString(),
        children: passengerCounts.children.toString(),
        infants_in_seat: passengerCounts.infants.toString(),
      });

      if (tripType === 'roundtrip' && returnDate) {
        params.append('return_date', formatDate(returnDate));
      }

      const response = await fetch(`/api/serpapi/flights?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to fetch flights';
        console.error('Flight API error:', {
          status: response.status,
          error: errorMsg,
          details: data.details
        });
        throw new Error(errorMsg);
      }

      if (data.flights && data.flights.length > 0) {
        // Map API response to Flight interface
        const mappedFlights: Flight[] = data.flights.map((f: any, index: number) => {
          // Identify departure time of day
          const depHour = parseInt(f.flights?.[0]?.departure_airport?.time?.split(':')[0] || '0');
          let timeOfDay: 'morning' | 'afternoon' | 'evening' = 'morning';
          if (depHour >= 12 && depHour < 17) timeOfDay = 'afternoon';
          if (depHour >= 17) timeOfDay = 'evening';

          // Handle SerpAPI's nested flight structure
          const firstFlight = f.flights?.[0] || f;

          return {
            id: index + 100, // Avoid conflict with mock IDs
            airline: firstFlight.airline || f.airline || 'Unknown Airline',
            from: firstFlight.departure_airport?.name || f.departure_airport?.name,
            to: firstFlight.arrival_airport?.name || f.arrival_airport?.name,
            departure: firstFlight.departure_airport?.time || f.departure_airport?.time,
            arrival: firstFlight.arrival_airport?.time || f.arrival_airport?.time,
            duration: f.total_duration
              ? `${Math.floor(f.total_duration / 60)}h ${f.total_duration % 60}m`
              : `${Math.floor((f.duration || 0) / 60)}h ${(f.duration || 0) % 60}m`,
            stops: f.layovers
              ? (f.layovers.length === 0 ? 'Non-stop' : `${f.layovers.length} Stop${f.layovers.length > 1 ? 's' : ''}`)
              : 'Non-stop',
            cabin: f.travel_class || firstFlight.travel_class || 'Economy',
            price: f.price || 0,
            logo: f.airline_logo || firstFlight.airline_logo || 'https://via.placeholder.com/100x30?text=Airline',
            departureTime: timeOfDay,
          };
        });
        setSearchResults(mappedFlights);
        toast.success(`Found ${mappedFlights.length} flights`);
      } else {
        setSearchResults([]);
        toast.info('No flights found for your search criteria');
      }
    } catch (err) {
      console.error('Search error:', err);

      let errorMessage = 'An error occurred while searching for flights';

      if (err instanceof Error) {
        if (err.name === 'AbortError' || err.name === 'TimeoutError') {
          errorMessage = 'Request timed out. Please check your internet connection and try again.';
        } else if (err.message.includes('fetch failed') || err.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to flight search service. Please check your internet connection.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);

      // Show mock data option
      toast.info('You can still browse sample flights below', { duration: 5000 });

      // Optionally show sample flights for testing
      setSearchResults(allFlights);
    } finally {
      setIsSearching(false);
    }
  };

  // Filter logic
  // Use searchResults if we have searched, otherwise empty or initial mock data
  const flightsToDisplay = hasSearched ? searchResults : []; // Or show popular flights initially?

  const filteredFlights = flightsToDisplay.filter((flight) => {
    // Price filter
    if (flight.price < priceRange[0] || flight.price > priceRange[1]) {
      return false;
    }

    // Stops filter
    if (selectedStops.length > 0) {
      if (selectedStops.includes('nonstop') && flight.stops !== 'Non-stop')
        return false;
      if (selectedStops.includes('1stop') && flight.stops !== '1 Stop')
        return false;
      if (selectedStops.includes('2stops') && !flight.stops.includes('2+'))
        return false;
    }

    // Airlines filter
    if (
      selectedAirlines.length > 0 &&
      !selectedAirlines.includes(flight.airline)
    ) {
      return false;
    }

    // Departure time filter
    if (
      selectedTimes.length > 0 &&
      !selectedTimes.includes(flight.departureTime)
    ) {
      return false;
    }

    return true;
  });

  // Sort logic
  const sortedFlights = [...filteredFlights].sort((a, b) => {
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'duration') {
      const aDuration = parseInt(a.duration);
      const bDuration = parseInt(b.duration);
      return aDuration - bDuration;
    }
    return 0;
  });

  const handleStopsChange = (stop: string, checked: boolean) => {
    if (checked) {
      setSelectedStops([...selectedStops, stop]);
    } else {
      setSelectedStops(selectedStops.filter((s) => s !== stop));
    }
  };

  const handleAirlineChange = (airline: string, checked: boolean) => {
    if (checked) {
      setSelectedAirlines([...selectedAirlines, airline]);
    } else {
      setSelectedAirlines(selectedAirlines.filter((a) => a !== airline));
    }
  };

  const handleTimeChange = (time: string, checked: boolean) => {
    if (checked) {
      setSelectedTimes([...selectedTimes, time]);
    } else {
      setSelectedTimes(selectedTimes.filter((t) => t !== time));
    }
  };

  const handleSearch = () => {
    setHasSearched(true);
    fetchFlights();
  };

  const filterCities = (searchValue: string): City[] => {
    if (!searchValue) return CITIES;
    const search = searchValue.toLowerCase();
    return CITIES.filter(
      (city) =>
        city.name.toLowerCase().includes(search) ||
        city.code.toLowerCase().includes(search) ||
        city.country.toLowerCase().includes(search)
    );
  };

  const resetFilters = () => {
    setPriceRange([0, 2000]);
    setSelectedStops([]);
    setSelectedAirlines([]);
    setSelectedTimes([]);
    setSortBy('price');
    setHasSearched(false);
  };

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    setShowBookingFlow(true);
  };

  const addMultiCityFlight = () => {
    const newId = (multiCityFlights.length + 1).toString();
    setMultiCityFlights([
      ...multiCityFlights,
      { id: newId, from: '', to: '', date: null },
    ]);
    setMultiCityPopovers({
      ...multiCityPopovers,
      [newId]: { fromOpen: false, toOpen: false },
    });
  };

  const removeMultiCityFlight = (id: string) => {
    if (multiCityFlights.length > 2) {
      setMultiCityFlights(
        multiCityFlights.filter((flight) => flight.id !== id)
      );
      const newPopovers = { ...multiCityPopovers };
      delete newPopovers[id];
      setMultiCityPopovers(newPopovers);
    }
  };

  const setMultiCityPopoverOpen = (
    id: string,
    field: 'fromOpen' | 'toOpen',
    value: boolean
  ) => {
    setMultiCityPopovers((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const updateMultiCityFlight = (
    id: string,
    field: keyof MultiCityFlight,
    value: string | Date | null
  ) => {
    setMultiCityFlights(
      multiCityFlights.map((flight) =>
        flight.id === id ? { ...flight, [field]: value } : flight
      )
    );
  };

  const swapMultiCityLocations = (id: string) => {
    setMultiCityFlights(
      multiCityFlights.map((flight) =>
        flight.id === id
          ? { ...flight, from: flight.to, to: flight.from }
          : flight
      )
    );
  };

  const swapFromTo = () => {
    const temp = fromInput;
    setFromInput(toInput);
    setToInput(temp);
  };

  // 🔽 helper: smooth scroll to any section
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };


  return (
    <div className="relative min-h-screen">
      {/* Full-Screen Hero Video Section - Covers entire viewport including navbar area */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        {/* YouTube Video - Full Screen */}
        <div className="pointer-events-none absolute inset-0 h-full w-full">
          <iframe
            className="absolute top-1/2 left-1/2 h-[56.25vw] min-h-[170vh] w-[160vw] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 scale-[1.02]"
            src="https://www.youtube.com/embed/2X4_PQXByoY?autoplay=1&mute=1&loop=1&playlist=2X4_PQXByoY&controls=0&showinfo=0&rel=0&modestbranding=1&start=7&iv_load_policy=3&disablekb=1"
            title="Flight Experience"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none' }}
          />
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Hero Content */}
        <div className="relative z-20 flex h-full flex-col items-center justify-center px-4 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="max-w-4xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-6"
            >
              <Plane className="mx-auto mb-4 size-16 text-white drop-shadow-2xl" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mb-6 text-5xl drop-shadow-2xl md:text-7xl"
            >
              Discover Your Journey
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="mb-8 text-xl text-gray-100 drop-shadow-lg md:text-2xl"
            >
              Book flights to destinations around the world with ease
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="flex justify-center gap-4"
            >
              {/* Hero - Search Flights */}
              <Button
                size="lg"
                className="bg-red-600 px-8 py-6 text-lg text-white shadow-2xl hover:bg-red-700"
                onClick={() => scrollToSection('search-section')}
              >
                <Search className="mr-2 size-5" />
                Search Flights
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 px-8 py-6 text-lg text-white shadow-2xl backdrop-blur-md hover:bg-white/20"
                onClick={() => router.push('/private-jet')}
              >
                <Crown className="mr-2 size-5" />
                Private Jet
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="cursor-pointer"
              onClick={() => scrollToSection('search-section')}
            >
              <ChevronDown className="size-10 text-white drop-shadow-lg" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Cloud Image Background for rest of page */}
      <div className="fixed inset-0 z-0" style={{ top: '100vh' }}>
        <img
          src="https://images.unsplash.com/photo-1755802800504-1e62fc467b7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwbGFuZSUyMGZseWluZyUyMHN1bm55JTIwY2xvdWRzJTIwc2t5fGVufDF8fHx8MTc2NDU1NTM3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Airplane in Clouds Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
      </div>

      {/* Content */}
      <div
        id="search-section"
        className="relative z-10 mx-auto max-w-[1400px] scroll-mt-24 bg-gradient-to-b from-gray-50 to-white px-4 py-8 sm:px-6 lg:px-8"
      >
        {/* Search Section */}
        <Card className="mb-8 bg-white/95 shadow-xl backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2>Search Flights</h2>
              <Tabs
                value={tripType}
                onValueChange={setTripType}
                className="w-auto"
              >
                <TabsList>
                  <TabsTrigger value="roundtrip">Return</TabsTrigger>
                  <TabsTrigger value="oneway">One-way</TabsTrigger>
                  <TabsTrigger value="multicity">Multi-city</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {tripType === 'multicity' ? (
              // Multi-city form
              <div className="space-y-4">
                {multiCityFlights.map((flight, index) => (
                  <div
                    key={flight.id}
                    className="relative rounded-lg border border-gray-200 p-4"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-600">
                        Flight {index + 1}
                      </p>
                      {multiCityFlights.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-auto"
                          onClick={() => removeMultiCityFlight(flight.id)}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr_1fr] md:items-end">
                      <div className="space-y-2">
                        <Label htmlFor={`from-${flight.id}`}>From</Label>
                        <Popover
                          open={multiCityPopovers[flight.id]?.fromOpen || false}
                          onOpenChange={(open) =>
                            setMultiCityPopoverOpen(flight.id, 'fromOpen', open)
                          }
                        >
                          <PopoverTrigger asChild>
                            <Input
                              id={`from-${flight.id}`}
                              placeholder="Airport or City"
                              value={flight.from}
                              onChange={(e) => {
                                updateMultiCityFlight(
                                  flight.id,
                                  'from',
                                  e.target.value
                                );
                                setMultiCityPopoverOpen(
                                  flight.id,
                                  'fromOpen',
                                  true
                                );
                              }}
                              onFocus={() =>
                                setMultiCityPopoverOpen(
                                  flight.id,
                                  'fromOpen',
                                  true
                                )
                              }
                            />
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[300px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandInput
                                placeholder="Search cities..."
                                value={flight.from}
                                onValueChange={(value) =>
                                  updateMultiCityFlight(flight.id, 'from', value)
                                }
                              />
                              <CommandList>
                                <CommandEmpty>No city found.</CommandEmpty>
                                <CommandGroup>
                                  {filterCities(flight.from).map((city) => (
                                    <CommandItem
                                      key={city.code}
                                      value={`${city.name} (${city.code})`}
                                      onSelect={() => {
                                        updateMultiCityFlight(
                                          flight.id,
                                          'from',
                                          `${city.name} (${city.code})`
                                        );
                                        setMultiCityPopoverOpen(
                                          flight.id,
                                          'fromOpen',
                                          false
                                        );
                                      }}
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {city.name} ({city.code})
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {city.country}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Arrow Separator - Perfectly centered using flexbox */}
                      <div className="hidden md:flex items-center justify-center pb-2">
                        <button
                          type="button"
                          onClick={() => swapMultiCityLocations(flight.id)}
                          className="group flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200 transition-all duration-200 hover:bg-blue-100 hover:ring-2 hover:ring-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label="Swap from and to locations"
                          tabIndex={0}
                        >
                          <ArrowLeftRight className="size-5 text-blue-600 transition-transform duration-200 group-hover:scale-110 group-active:rotate-180" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`to-${flight.id}`}>To</Label>
                        <Popover
                          open={multiCityPopovers[flight.id]?.toOpen || false}
                          onOpenChange={(open) =>
                            setMultiCityPopoverOpen(flight.id, 'toOpen', open)
                          }
                        >
                          <PopoverTrigger asChild>
                            <Input
                              id={`to-${flight.id}`}
                              placeholder="Airport or City"
                              value={flight.to}
                              onChange={(e) => {
                                updateMultiCityFlight(
                                  flight.id,
                                  'to',
                                  e.target.value
                                );
                                setMultiCityPopoverOpen(
                                  flight.id,
                                  'toOpen',
                                  true
                                );
                              }}
                              onFocus={() =>
                                setMultiCityPopoverOpen(
                                  flight.id,
                                  'toOpen',
                                  true
                                )
                              }
                            />
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[300px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandInput
                                placeholder="Search cities..."
                                value={flight.to}
                                onValueChange={(value) =>
                                  updateMultiCityFlight(flight.id, 'to', value)
                                }
                              />
                              <CommandList>
                                <CommandEmpty>No city found.</CommandEmpty>
                                <CommandGroup>
                                  {filterCities(flight.to).map((city) => (
                                    <CommandItem
                                      key={city.code}
                                      value={`${city.name} (${city.code})`}
                                      onSelect={() => {
                                        updateMultiCityFlight(
                                          flight.id,
                                          'to',
                                          `${city.name} (${city.code})`
                                        );
                                        setMultiCityPopoverOpen(
                                          flight.id,
                                          'toOpen',
                                          false
                                        );
                                      }}
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {city.name} ({city.code})
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {city.country}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <DateSelector
                          label="Travel date"
                          selectedDate={flight.date}
                          onDateSelect={(date) =>
                            updateMultiCityFlight(flight.id, 'date', date)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={addMultiCityFlight}
                >
                  <Plus className="mr-2 size-4" />
                  Add a flight
                </Button>

                {/* Passengers and Class for Multi-city */}
                <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <Label className="mb-2 block">Passengers</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="mb-1 block text-sm font-medium text-gray-600">
                          Adults
                        </Label>
                        <p className="mb-1 text-xs text-gray-500 h-4">&nbsp;</p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPassengerCounts((prev) => ({
                                ...prev,
                                adults: Math.max(1, prev.adults - 1),
                              }))
                            }
                          >
                            <Minus className="size-4" />
                          </Button>
                          <span className="flex-1 text-center">
                            {passengerCounts.adults}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPassengerCounts((prev) => ({
                                ...prev,
                                adults: prev.adults + 1,
                              }))
                            }
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="mb-1 block text-sm font-medium text-gray-600">
                          Children
                        </Label>
                        <p className="mb-1 text-xs text-gray-500 h-4">
                          2-11 years old
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPassengerCounts((prev) => ({
                                ...prev,
                                children: Math.max(0, prev.children - 1),
                              }))
                            }
                          >
                            <Minus className="size-4" />
                          </Button>
                          <span className="flex-1 text-center">
                            {passengerCounts.children}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPassengerCounts((prev) => ({
                                ...prev,
                                children: prev.children + 1,
                              }))
                            }
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="mb-1 block text-sm font-medium text-gray-600">
                          Infants
                        </Label>
                        <p className="mb-1 text-xs text-gray-500 h-4">
                          0-23 months old
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPassengerCounts((prev) => ({
                                ...prev,
                                infants: Math.max(0, prev.infants - 1),
                              }))
                            }
                          >
                            <Minus className="size-4" />
                          </Button>
                          <span className="flex-1 text-center">
                            {passengerCounts.infants}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setPassengerCounts((prev) => ({
                                ...prev,
                                infants: prev.infants + 1,
                              }))
                            }
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button className="h-14 w-full bg-red-600 hover:bg-red-700" onClick={handleSearch}>
                      <Search className="mr-2 size-4" />
                      Search Flights
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Round trip and One way form
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
                  <div className="space-y-2">
                    <Label htmlFor="from">From</Label>
                    <Popover open={fromOpen} onOpenChange={setFromOpen}>
                      <PopoverTrigger asChild>
                        <Input
                          id="from"
                          placeholder="New York (JFK)"
                          value={fromInput}
                          onChange={(e) => {
                            setFromInput(e.target.value);
                            setFromOpen(true);
                          }}
                          onFocus={() => setFromOpen(true)}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search cities..." value={fromInput} onValueChange={setFromInput} />
                          <CommandList>
                            <CommandEmpty>No city found.</CommandEmpty>
                            <CommandGroup>
                              {filterCities(fromInput).map((city) => (
                                <CommandItem
                                  key={city.code}
                                  value={`${city.name} (${city.code})`}
                                  onSelect={() => {
                                    setFromInput(`${city.name} (${city.code})`);
                                    setFromOpen(false);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{city.name} ({city.code})</span>
                                    <span className="text-xs text-gray-500">{city.country}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Arrow Separator - Perfectly centered using flexbox */}
                  <div className="hidden md:flex items-center justify-center pb-2">
                    <button
                      type="button"
                      onClick={swapFromTo}
                      className="group flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 ring-1 ring-blue-200 transition-all duration-200 hover:bg-blue-100 hover:ring-2 hover:ring-blue-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="Swap from and to locations"
                      tabIndex={0}
                    >
                      <ArrowLeftRight className="size-5 text-blue-600 transition-transform duration-200 group-hover:scale-110 group-active:rotate-180" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to">To</Label>
                    <Popover open={toOpen} onOpenChange={setToOpen}>
                      <PopoverTrigger asChild>
                        <Input
                          id="to"
                          placeholder="Dubai (DXB)"
                          value={toInput}
                          onChange={(e) => {
                            setToInput(e.target.value);
                            setToOpen(true);
                          }}
                          onFocus={() => setToOpen(true)}
                        />
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search cities..." value={toInput} onValueChange={setToInput} />
                          <CommandList>
                            <CommandEmpty>No city found.</CommandEmpty>
                            <CommandGroup>
                              {filterCities(toInput).map((city) => (
                                <CommandItem
                                  key={city.code}
                                  value={`${city.name} (${city.code})`}
                                  onSelect={() => {
                                    setToInput(`${city.name} (${city.code})`);
                                    setToOpen(false);
                                  }}
                                >
                                  <div className="flex flex-col">
                                    <span className="font-medium">{city.name} ({city.code})</span>
                                    <span className="text-xs text-gray-500">{city.country}</span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div
                  className={`mt-4 grid gap-4 ${tripType === 'roundtrip' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}
                >
                  <DateSelector
                    label="Departure Date"
                    selectedDate={departureDate}
                    onDateSelect={setDepartureDate}
                  />
                  {tripType === 'roundtrip' && (
                    <DateSelector
                      label="Return Date"
                      selectedDate={returnDate}
                      onDateSelect={setReturnDate}
                    />
                  )}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <PassengerSelector
                    value={passengerCounts}
                    onChange={setPassengerCounts}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="class">Cabin Class</Label>
                    <Select defaultValue="economy">
                      <SelectTrigger id="class" className="h-14">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="economy">Economy Class</SelectItem>
                        <SelectItem value="premium">Premium Economy</SelectItem>
                        <SelectItem value="business">Business Class</SelectItem>
                        <SelectItem value="first">First Class</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="h-14 w-full bg-red-600 hover:bg-red-700" onClick={handleSearch}>
                      <Search className="mr-2 size-4" />
                      Search Flights
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {hasSearched && (
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className="hidden w-72 flex-shrink-0 lg:block">
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <div className="mb-6 flex items-center gap-2">
                    <Filter className="size-5" />
                    <h3>Filters</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Price Range */}
                    <div>
                      <Label className="mb-3 block">Price Range</Label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={2000}
                        step={50}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>

                    {/* Stops */}
                    <div>
                      <Label className="mb-3 block">Number of Stops</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="nonstop"
                            checked={selectedStops.includes('nonstop')}
                            onCheckedChange={(checked) =>
                              handleStopsChange('nonstop', checked as boolean)
                            }
                          />
                          <Label htmlFor="nonstop" className="cursor-pointer">
                            Non-stop
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="1stop"
                            checked={selectedStops.includes('1stop')}
                            onCheckedChange={(checked) =>
                              handleStopsChange('1stop', checked as boolean)
                            }
                          />
                          <Label htmlFor="1stop" className="cursor-pointer">
                            1 Stop
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="2stops"
                            checked={selectedStops.includes('2stops')}
                            onCheckedChange={(checked) =>
                              handleStopsChange('2stops', checked as boolean)
                            }
                          />
                          <Label htmlFor="2stops" className="cursor-pointer">
                            2+ Stops
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Airlines */}
                    <div>
                      <Label className="mb-3 block">Airlines</Label>
                      <div className="space-y-2">
                        {[
                          'Emirates',
                          'Qatar Airways',
                          'Singapore Airlines',
                          'British Airways',
                          'Etihad Airways',
                        ].map((airline) => (
                          <div
                            key={airline}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={airline}
                              checked={selectedAirlines.includes(airline)}
                              onCheckedChange={(checked) =>
                                handleAirlineChange(airline, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={airline}
                              className="cursor-pointer text-sm"
                            >
                              {airline}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Departure Time */}
                    <div>
                      <Label className="mb-3 block">Departure Time</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="morning"
                            checked={selectedTimes.includes('morning')}
                            onCheckedChange={(checked) =>
                              handleTimeChange('morning', checked as boolean)
                            }
                          />
                          <Label htmlFor="morning" className="cursor-pointer">
                            Morning (6AM - 12PM)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="afternoon"
                            checked={selectedTimes.includes('afternoon')}
                            onCheckedChange={(checked) =>
                              handleTimeChange('afternoon', checked as boolean)
                            }
                          />
                          <Label htmlFor="afternoon" className="cursor-pointer">
                            Afternoon (12PM - 6PM)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="evening"
                            checked={selectedTimes.includes('evening')}
                            onCheckedChange={(checked) =>
                              handleTimeChange('evening', checked as boolean)
                            }
                          />
                          <Label htmlFor="evening" className="cursor-pointer">
                            Evening (6PM - 12AM)
                          </Label>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Flight Results */}
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  {sortedFlights.length} flights found
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Lowest Price</SelectItem>
                    <SelectItem value="duration">Shortest Duration</SelectItem>
                    <SelectItem value="departure">Departure Time</SelectItem>
                    <SelectItem value="arrival">Arrival Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {error && (
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-6 text-center text-red-600">
                      <p>{error}</p>
                    </CardContent>
                  </Card>
                )}

                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
                    <p className="mt-4 text-gray-500">Searching for best flights...</p>
                  </div>
                ) : (
                  <>
                    {sortedFlights.map((flight) => (
                      <Card
                        key={flight.id}
                        className="transition-shadow hover:shadow-lg"
                      >
                        <CardContent className="p-6">
                          <div className="flex flex-col gap-6 lg:flex-row">
                            <div className="flex-1">
                              <div className="mb-4 flex items-center gap-3">
                                <div className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
                                  <img
                                    src={flight.logo}
                                    alt={flight.airline}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="text-lg">{flight.airline}</h3>
                                  <p className="text-sm text-gray-500">
                                    {flight.cabin}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-2xl">{flight.departure}</p>
                                  <p className="text-sm text-gray-600">
                                    {flight.from}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <div className="mb-1 flex items-center justify-center gap-2">
                                    <div className="h-px flex-1 bg-gray-300" />
                                    <Plane className="size-4 text-gray-400" />
                                    <div className="h-px flex-1 bg-gray-300" />
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {flight.duration}
                                  </p>
                                  <Badge variant="outline" className="mt-1">
                                    {flight.stops}
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl">{flight.arrival}</p>
                                  <p className="text-sm text-gray-600">{flight.to}</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end justify-between lg:border-l lg:pl-6">
                              <div className="text-right">
                                <p className="mb-1 text-sm text-gray-500">
                                  Price per person
                                </p>
                                <p className="text-3xl text-blue-600">
                                  ${flight.price}
                                </p>
                              </div>
                              <Button
                                size="lg"
                                className="mt-4 w-full lg:mt-0 lg:w-auto"
                                onClick={() => handleSelectFlight(flight)}
                              >
                                Select Flight
                                <ArrowRight className="ml-2 size-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}

                {!isSearching && !error && sortedFlights.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Plane className="mx-auto mb-4 size-12 text-gray-400" />
                      <h3 className="mb-2">No flights found</h3>
                      <p className="mb-4 text-gray-600">
                        Try adjusting your filters to see more results
                      </p>
                      <Button onClick={resetFilters}>Reset Filters</Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Your Booking</DialogTitle>
            <DialogDescription>
              Review your flight details before proceeding to payment
            </DialogDescription>
          </DialogHeader>

          {selectedFlight && (
            <div className="mt-4 space-y-6">
              {/* Flight Details */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-4 flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={selectedFlight.logo}
                      alt={selectedFlight.airline}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl">{selectedFlight.airline}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedFlight.cabin}
                    </p>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Departure</p>
                    <p>{selectedFlight.departure}</p>
                    <p className="text-sm text-gray-600">
                      {selectedFlight.from}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Arrival</p>
                    <p>{selectedFlight.arrival}</p>
                    <p className="text-sm text-gray-600">{selectedFlight.to}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Duration</p>
                    <p>{selectedFlight.duration}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm text-gray-500">Stops</p>
                    <p>{selectedFlight.stops}</p>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-gray-700">
                    Flight Price ({totalPassengers}{' '}
                    {totalPassengers === 1 ? 'passenger' : 'passengers'})
                  </p>
                  <p>${selectedFlight.price * totalPassengers}</p>
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-gray-700">Taxes & Fees</p>
                  <p>
                    ${Math.round(selectedFlight.price * totalPassengers * 0.15)}
                  </p>
                </div>
                <div className="my-3 h-px bg-blue-200" />
                <div className="flex items-center justify-between">
                  <p className="text-xl">Total Amount</p>
                  <p className="text-2xl text-blue-600">
                    $
                    {selectedFlight.price * totalPassengers +
                      Math.round(selectedFlight.price * totalPassengers * 0.15)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowConfirmation(false);
                    alert('Proceeding to payment...');
                  }}
                >
                  <CheckCircle className="mr-2 size-4" />
                  Confirm & Pay
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Flight Booking Flow Modal */}
      {selectedFlight && showBookingFlow && (
        <FlightBookingFlow
          flight={selectedFlight}
          totalPassengers={totalPassengers}
          onClose={() => setShowBookingFlow(false)}
        />
      )}
    </div>
  );
}
