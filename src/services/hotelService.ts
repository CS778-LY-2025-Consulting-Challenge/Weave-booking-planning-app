import { HotelResult } from '@/components/HotelResults';

/**
 * Enhanced mock hotel data used as a graceful fallback if the real API fails.
 * Now includes hotels from multiple global cities.
 */
const mockHotels: HotelResult[] = [
  // New York
  {
    id: '1',
    name: 'Luxury City Hotel',
    location: 'Downtown Manhattan',
    city: 'New York',
    country: 'USA',
    rating: 4.8,
    reviews: 2456,
    pricePerNight: 350,
    image: 'https://images.unsplash.com/photo-1631049307038-da0ec56d8b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb218ZW58MXx8fHwxNzY0NjIyOTgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Experience luxury in the heart of the city with stunning views and world-class service',
    amenities: ['WiFi', 'Gym', 'Pool', 'Spa', 'Restaurant', '24/7 Room Service', 'Concierge'],
  },
  {
    id: '2',
    name: 'Modern Boutique Hotel',
    location: 'Midtown',
    city: 'New York',
    country: 'USA',
    rating: 4.5,
    reviews: 1823,
    pricePerNight: 280,
    image: 'https://images.unsplash.com/photo-1758448511255-ac2a24a135d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NjQ2MjI5ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Stylish and contemporary design with personalized service and modern amenities',
    amenities: ['WiFi', 'Concierge', 'Bar', 'Coffee Shop', 'Business Center', 'Rooftop Lounge'],
  },
  {
    id: '3',
    name: 'Elegant Plaza Hotel',
    location: 'Upper East Side',
    city: 'New York',
    country: 'USA',
    rating: 4.6,
    reviews: 3012,
    pricePerNight: 320,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwaG90ZWwlMjByb29tJTIwdmlldyUyMHN0YXJ8ZW58MXx8fHwxNzY0NjIyOTg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Classic elegance meets modern comfort in a prestigious location with premium service',
    amenities: ['WiFi', 'Fitness Center', 'Spa', 'Fine Dining', 'Valet Parking', 'Business Lounge'],
  },
  // London
  {
    id: '4',
    name: 'Royal Kensington Hotel',
    location: 'Kensington',
    city: 'London',
    country: 'UK',
    rating: 4.7,
    reviews: 2189,
    pricePerNight: 380,
    image: 'https://images.unsplash.com/photo-1702411200201-3061d0eea802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaXZlcnNpZGUlMjByZXNvcnQlMjBob3RlbCUyMHZpZXd8ZW58MXx8fHwxNzY0NjIyOTg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Historic charm with contemporary luxury in the heart of West London',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Concierge', 'Gym', 'Library'],
  },
  {
    id: '5',
    name: 'Thames Riverside Luxury',
    location: 'South Bank',
    city: 'London',
    country: 'UK',
    rating: 4.4,
    reviews: 1756,
    pricePerNight: 260,
    image: 'https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJpdGFnZSUyMGdyYW5kJTIwaG90ZWwlMjByb29tfGVufDF8fHx8MTc2NDYyMjk4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Modern elegance overlooking the Thames with cultural attractions nearby',
    amenities: ['WiFi', 'Business Center', 'Bar', 'Restaurant', '24/7 Room Service', 'Gym'],
  },
  // Paris
  {
    id: '6',
    name: 'Montmartre Palace Hotel',
    location: 'Montmartre',
    city: 'Paris',
    country: 'France',
    rating: 4.5,
    reviews: 2645,
    pricePerNight: 400,
    image: 'https://images.unsplash.com/photo-1631049307038-da0ec56d8b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXRyb3BvbGl0YW4lMjB0b3dlciUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NjQ2MjI5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Charming hotel in the artistic heart of Paris with Sacré-Cœur views',
    amenities: ['WiFi', 'Gym', 'Restaurant', 'Wine Bar', 'Rooftop Terrace', 'Spa'],
  },
  {
    id: '7',
    name: 'Seine Elegance Boutique',
    location: 'Left Bank',
    city: 'Paris',
    country: 'France',
    rating: 4.6,
    reviews: 1924,
    pricePerNight: 420,
    image: 'https://images.unsplash.com/photo-1758448511255-ac2a24a135d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NjQ2MjI5ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Intimate boutique hotel steps from Notre-Dame with authentic Parisian charm',
    amenities: ['WiFi', 'Concierge', 'Café', 'Library', 'Garden Terrace', 'Room Service'],
  },
  // Tokyo
  {
    id: '8',
    name: 'Shinjuku Metropolitan',
    location: 'Shinjuku',
    city: 'Tokyo',
    country: 'Japan',
    rating: 4.7,
    reviews: 3124,
    pricePerNight: 450,
    image: 'https://images.unsplash.com/photo-1631049307038-da0ec56d8b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb218ZW58MXx8fHwxNzY0NjIyOTgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Ultra-modern hotel with panoramic Tokyo views and cutting-edge technology',
    amenities: ['WiFi', 'Multiple Restaurants', 'Spa & Onsen', 'Business Center', 'Gym', 'Concierge'],
  },
  {
    id: '9',
    name: 'Asakusa Traditional Ryokan',
    location: 'Asakusa',
    city: 'Tokyo',
    country: 'Japan',
    rating: 4.4,
    reviews: 892,
    pricePerNight: 320,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwaG90ZWwlMjByb29tJTIwdmlldyUyMHN0YXJ8ZW58MXx8fHwxNzY0NjIyOTg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Traditional Japanese hospitality with modern amenities in historic Asakusa',
    amenities: ['WiFi', 'Traditional Onsen', 'Japanese Restaurant', 'Tea Ceremony', 'Garden'],
  },
  // Dubai
  {
    id: '10',
    name: 'Burj Marina Luxury',
    location: 'Marina',
    city: 'Dubai',
    country: 'UAE',
    rating: 4.8,
    reviews: 2845,
    pricePerNight: 550,
    image: 'https://images.unsplash.com/photo-1702411200201-3061d0eea802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaXZlcnNpZGUlMjByZXNvcnQlMjBob3RlbCUyMHZpZXd8ZW58MXx8fHwxNzY0NjIyOTg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Ultra-luxurious hotel with Arabian Gulf views and world-class facilities',
    amenities: ['WiFi', 'Private Beach', 'Multiple Pools', 'Spa', 'Fine Dining', 'Yacht Club'],
  },
  {
    id: '11',
    name: 'Desert Oasis Resort',
    location: 'Desert',
    city: 'Dubai',
    country: 'UAE',
    rating: 4.5,
    reviews: 1567,
    pricePerNight: 380,
    image: 'https://images.unsplash.com/photo-1758448511255-ac2a24a135d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NjQ2MjI5ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Luxurious desert escape with authentic Arabian experiences',
    amenities: ['WiFi', 'Desert Safari', 'Camel Riding', 'Traditional Hammam', 'Restaurant'],
  },
  // Beijing
  {
    id: '12',
    name: 'Forbidden City Palace Hotel',
    location: 'Dongcheng District',
    city: 'Beijing',
    country: 'China',
    rating: 4.7,
    reviews: 2834,
    pricePerNight: 380,
    image: 'https://images.unsplash.com/photo-1631049307038-da0ec56d8b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb218ZW58MXx8fHwxNzY0NjIyOTgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Luxury hotel near the Forbidden City with traditional Chinese architecture and modern amenities',
    amenities: ['WiFi', 'Spa', 'Restaurant', 'Concierge', 'Business Center', 'Gym', 'Tea House'],
  },
  {
    id: '13',
    name: 'Great Wall Summit Resort',
    location: 'Huairou District',
    city: 'Beijing',
    country: 'China',
    rating: 4.6,
    reviews: 1645,
    pricePerNight: 320,
    image: 'https://images.unsplash.com/photo-1758448511255-ac2a24a135d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NjQ2MjI5ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Mountain resort with breathtaking views of the Great Wall, perfect for nature lovers',
    amenities: ['WiFi', 'Mountain Spa', 'Restaurant', 'Hiking Trails', 'Bonfire Area', 'Library'],
  },
  {
    id: '14',
    name: 'Chaoyang Modern Boutique',
    location: 'Chaoyang District',
    city: 'Beijing',
    country: 'China',
    rating: 4.5,
    reviews: 1923,
    pricePerNight: 290,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwaG90ZWwlMjByb29tJTIwdmlldyUyMHN0YXJ8ZW58MXx8fHwxNzY0NjIyOTg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Contemporary boutique hotel in the vibrant Chaoyang business district',
    amenities: ['WiFi', 'Rooftop Bar', 'Gym', 'Restaurant', 'Business Lounge', 'Concierge'],
  },
  // Fiji
  {
    id: '15',
    name: 'Fiji Coral Resort',
    location: 'Nadi',
    city: 'Fiji',
    country: 'Fiji',
    rating: 4.7,
    reviews: 2156,
    pricePerNight: 380,
    image: 'https://images.unsplash.com/photo-1631049307038-da0ec56d8b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWFjaCUyMHJlc29ydCUyMHJvb218ZW58MXx8fHwxNzY0NjIyOTgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Stunning beachfront resort with crystal-clear waters and tropical paradise vibes',
    amenities: ['WiFi', 'Private Beach', 'Snorkeling', 'Spa', 'Restaurant', 'Water Sports', 'Bar'],
  },
  {
    id: '16',
    name: 'Suva Tropical Escape',
    location: 'Suva',
    city: 'Fiji',
    country: 'Fiji',
    rating: 4.5,
    reviews: 1645,
    pricePerNight: 280,
    image: 'https://images.unsplash.com/photo-1758448511255-ac2a24a135d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3V0aXF1ZSUyMGJlYWNoJTIwaG90ZWwlMjByb29tfGVufDF8fHx8MTc2NDYyMjk4M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Cozy boutique hotel in the heart of Suva with local charm and modern comfort',
    amenities: ['WiFi', 'Restaurant', 'Bar', 'Concierge', 'Garden', 'Room Service'],
  },
  {
    id: '17',
    name: 'Yasawa Islands Paradise',
    location: 'Yasawa Islands',
    city: 'Fiji',
    country: 'Fiji',
    rating: 4.8,
    reviews: 3421,
    pricePerNight: 450,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGlzbGFuZCUyMHJlc29ydCUyMHZpZXd8ZW58MXx8fHwxNzY0NjIyOTg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Exclusive island resort with untouched beaches, pristine reefs, and ultimate relaxation',
    amenities: ['WiFi', 'Private Island', 'Diving', 'Beach Bar', 'Spa', 'Fine Dining', 'Yacht'],
  },
  {
    id: '18',
    name: 'Nadi Beachfront Luxury',
    location: 'Denarau Island',
    city: 'Fiji',
    country: 'Fiji',
    rating: 4.6,
    reviews: 2734,
    pricePerNight: 420,
    image: 'https://images.unsplash.com/photo-1702411200201-3061d0eea802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWFjaCUyMHJlc29ydCUyMHN1bnNldHxlbnwxfHx8fDE3NjQ2MjI5ODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Luxury beachfront hotel on Denarau Island with sunset views and premium amenities',
    amenities: ['WiFi', 'Beach Access', 'Multiple Pools', 'Spa', 'Fine Dining', 'Water Sports'],
  },
];

export interface HotelSearchParams {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
}

const DEFAULT_PLACEHOLDER =
  'https://images.unsplash.com/photo-1540541338287-41700207dea3?auto=format&fit=crop&w=1600&q=80&sat=-10';

const placeholderImage = (location?: string, name?: string) => {
  const query = encodeURIComponent((name || location || 'hotel').trim());
  return `${DEFAULT_PLACEHOLDER}&q=${query}`;
};

function normalizeImageUrl(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('https://')) return url;
  if (url.startsWith('http://')) return url.replace('http://', 'https://');
  if (url.startsWith('//')) return `https:${url}`;
  return null;
}

function pickHotelImage(hotel: any, fallbackLocation: string) {
  const media = hotel?.media;
  const images = hotel?.images;

  const candidates = [
    Array.isArray(media) ? media[0]?.uri || media[0]?.url : null,
    Array.isArray(images) ? images[0]?.uri || images[0]?.url : null,
  ].map((c) => normalizeImageUrl(c));

  const firstValid = candidates.find((c) => !!c);
  return firstValid || placeholderImage(fallbackLocation, hotel?.name);
}

// Image pool for varied hotel visuals
const hotelImagePool = [
  'https://images.unsplash.com/photo-1631049307038-da0ec56d8b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80',
  'https://images.unsplash.com/photo-1758448511255-ac2a24a135d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80',
  'https://images.unsplash.com/photo-1702411200201-3061d0eea802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80',
  'https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80',
  'https://images.unsplash.com/photo-1746475611952-1b12c680f3bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80',
  'https://images.unsplash.com/photo-1741852197045-cc35920a3aa0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80',
];

function getImageForHotel(hotelId: string, fallback?: string): string {
  // Use hotel ID as seed for consistent image assignment
  const index = Math.abs(hotelId.charCodeAt(0)) % hotelImagePool.length;
  return fallback || hotelImagePool[index];
}

function mapAmadeusHotelToResult(
  item: any,
  fallbackLocation: string,
  guests: number,
  nights: number
): HotelResult {
  // Handle v2 and v3 API response structure
  const hotel = item?.hotel || item || {};
  const offers = Array.isArray(item?.offers) ? item.offers : [];
  const offer = offers[0];
  const address = hotel.address || {};
  
  // Extract city and country with better fallbacks
  let city = address.cityName || hotel.cityName || fallbackLocation || 'Unknown';
  let country = address.countryName || hotel.countryName || address.countryCode || hotel.countryCode || 'Unknown';
  
  // Map country codes to full names if we have a code
  const COUNTRY_CODE_MAP: Record<string, string> = {
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'NZ': 'New Zealand',
    'IN': 'India',
    'JP': 'Japan',
    'CN': 'China',
    'FR': 'France',
    'DE': 'Germany',
    'IT': 'Italy',
    'ES': 'Spain',
    'MX': 'Mexico',
    'BR': 'Brazil',
    'SG': 'Singapore',
    'TH': 'Thailand',
    'AE': 'United Arab Emirates',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'BE': 'Belgium',
    'CZ': 'Czech Republic',
    'DK': 'Denmark',
    'GR': 'Greece',
    'HU': 'Hungary',
    'IE': 'Ireland',
    'PT': 'Portugal',
    'PL': 'Poland',
    'RU': 'Russia',
    'KR': 'South Korea',
    'TW': 'Taiwan',
    'MY': 'Malaysia',
    'PH': 'Philippines',
    'VN': 'Vietnam',
    'ID': 'Indonesia',
    'TR': 'Turkey',
    'SA': 'Saudi Arabia',
    'ZA': 'South Africa',
    'NG': 'Nigeria',
    'EG': 'Egypt',
  };
  
  // If country is a 2-letter code, convert to full name
  if (country && country.length === 2) {
    const fullName = COUNTRY_CODE_MAP[country.toUpperCase()];
    if (fullName) {
      country = fullName;
    }
  }

  const hotelId = offer?.id || hotel.hotelId || hotel.id || Math.random().toString(36);
  const imageFromApi = pickHotelImage(hotel, fallbackLocation);
  const finalImage = imageFromApi || getImageForHotel(hotelId, placeholderImage(fallbackLocation, hotel?.name));

  // Extract price - handle both v2 and v3 formats
  // Ensure nights is a valid positive number
  const safeNights = Number.isFinite(nights) && nights > 0 ? nights : 1;

  // Calculate actual stay nights from offer dates if available
  const stayNights =
    (offer?.checkInDate && offer?.checkOutDate
      ? Math.max(
          1,
          Math.ceil(
            (new Date(offer.checkOutDate).getTime() - new Date(offer.checkInDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : safeNights) || safeNights;

  // Extract raw price - try multiple fields
  const rawPrice =
    offer?.price?.total ??
    offer?.price?.base ??
    offer?.price?.grandTotal ??
    offer?.price;

  let pricePerNight = 0;
  
  // Parse the price value
  if (typeof rawPrice === 'string') {
    pricePerNight = parseFloat(rawPrice);
  } else if (typeof rawPrice === 'number') {
    pricePerNight = rawPrice;
  }

  // If we got a valid total price, divide by nights to get per-night rate
  if (Number.isFinite(pricePerNight) && pricePerNight > 0) {
    // The API returns total price for the stay, so divide by nights
    pricePerNight = pricePerNight / stayNights;
  } else {
    // Fallback default price
    pricePerNight = 180;
  }

  // Keep display prices in a reasonable range (per night)
  pricePerNight = Math.min(Math.max(pricePerNight, 50), 1200);

  return {
    id: hotelId,
    name: hotel.name || 'Hotel',
    location:
      (Array.isArray(address.lines) && address.lines.join(', ')) ||
      address.cityName ||
      fallbackLocation ||
      hotel.name ||
      'Unknown',
    city: city,
    country: country,
    rating: hotel.rating ? parseFloat(hotel.rating) : 4,
    reviews: hotel.reviews || 0,
    pricePerNight: Math.round(pricePerNight),
    image: finalImage,
    description: hotel.description || '',
    amenities: hotel.amenities || [],
    guests: offer?.guests?.adults || guests,
  };
}

function mapSerpApiResultToHotel(
  item: any,
  fallbackLocation: string,
  guests: number,
  nights: number
): HotelResult {
  // Map SerpAPI Google Hotels response structure to HotelResult
  // SerpAPI returns: { name, images: [{original_image}], overall_rating, reviews, rate_per_night, amenities, etc. }
  const hotelId = item?.property_token || item?.name?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36);
  
  // SerpAPI images are in images array with original_image field
  const imageFromApi = item?.images?.[0]?.original_image || item?.images?.[0]?.thumbnail || item?.thumbnail || null;
  
  if (imageFromApi) {
    console.log(`[SerpAPI Mapping] Hotel "${item?.name}": image URL = ${imageFromApi.substring(0, 100)}...`);
  }
  
  const normalizedImage = normalizeImageUrl(imageFromApi || undefined);
  const finalImage = normalizedImage || getImageForHotel(hotelId, placeholderImage(fallbackLocation, item?.name));
  
  // Extract location from GPS coordinates or use fallback
  // SerpAPI doesn't always provide city/country directly, so we'll use the query location
  const city = fallbackLocation || 'Unknown';
  const country = 'Unknown'; // Could be enhanced with reverse geocoding if needed
  
  // Extract price from rate_per_night
  let pricePerNight = 200; // default
  if (item?.rate_per_night?.extracted_lowest) {
    pricePerNight = item.rate_per_night.extracted_lowest;
  } else if (item?.rate_per_night?.lowest) {
    // Try to extract number from string like "$123"
    const priceMatch = item.rate_per_night.lowest.match(/[\d.]+/);
    if (priceMatch) {
      pricePerNight = parseFloat(priceMatch[0]);
    }
  } else if (item?.rate_per_night?.before_taxes_fees) {
    const priceMatch = item.rate_per_night.before_taxes_fees.match(/[\d.]+/);
    if (priceMatch) {
      pricePerNight = parseFloat(priceMatch[0]);
    }
  }
  pricePerNight = Math.min(Math.max(pricePerNight, 40), 800); // Keep in reasonable range
  
  // Extract rating and reviews
  const rating = item?.overall_rating || item?.rating || 4.0;
  const reviews = item?.reviews || 0;
  
  // Combine amenities (exclude excluded_amenities)
  const amenities = (item?.amenities || []).filter((a: string) => 
    !(item?.excluded_amenities || []).some((ex: string) => ex.toLowerCase().includes(a.toLowerCase()))
  );

  return {
    id: hotelId,
    name: item?.name || 'Hotel',
    location: fallbackLocation || city || 'Unknown',
    city: city,
    country: country,
    rating: typeof rating === 'string' ? parseFloat(rating) : (typeof rating === 'number' ? rating : 4.0),
    reviews: typeof reviews === 'string' ? parseInt(reviews) : (typeof reviews === 'number' ? reviews : 0),
    pricePerNight: Math.round(pricePerNight),
    image: finalImage,
    description: item?.description || '',
    amenities: amenities,
    guests: guests,
  };
}

function mapXoteloResultToHotel(
  item: any,
  fallbackLocation: string,
  guests: number,
  nights: number
): HotelResult {
  // Map Xotelo API response structure to HotelResult
  // Xotelo returns: { key, name, image, review_summary: { rating, count }, short_place_name, price_ranges, etc. }
  const hotelId = item?.key || item?.hotel_key || item?.id || Math.random().toString(36);
  
  // Xotelo image is directly on the item object
  // Try multiple possible image fields
  const imageFromApi = item?.image || item?.photo || item?.photo_url || null;
  
  // Log image URL for debugging
  if (imageFromApi) {
    console.log(`[Hotel Mapping] Hotel "${item?.name}": image URL = ${imageFromApi.substring(0, 100)}...`);
  }
  
  const normalizedImage = normalizeImageUrl(imageFromApi);
  const finalImage = normalizedImage || getImageForHotel(hotelId, placeholderImage(fallbackLocation, item?.name));
  
  if (!normalizedImage && imageFromApi) {
    console.warn(`[Hotel Mapping] Image URL rejected for "${item?.name}": ${imageFromApi.substring(0, 100)}`);
  }

  // Extract location from short_place_name (e.g., "Tokyo, Japan")
  const placeName = item?.short_place_name || '';
  const placeParts = placeName.split(',').map((p: string) => p.trim()).filter(Boolean);
  const city = placeParts[0] || fallbackLocation || 'Unknown';
  const country = placeParts[placeParts.length - 1] || 'Unknown';
  
  // Extract price from price_ranges or lowestRate
  let pricePerNight = 200; // default
  if (item?.lowestRate && typeof item.lowestRate === 'number') {
    pricePerNight = item.lowestRate / Math.max(1, nights);
  } else if (item?.price_ranges?.minimum) {
    pricePerNight = item.price_ranges.minimum / Math.max(1, nights);
  } else if (item?.price_ranges?.maximum) {
    pricePerNight = item.price_ranges.maximum / Math.max(1, nights);
  }
  pricePerNight = Math.min(Math.max(pricePerNight, 40), 800); // Keep in reasonable range
  
  // Extract rating and reviews from review_summary
  const rating = item?.review_summary?.rating || item?.rating || 4.0;
  const reviews = item?.review_summary?.count || item?.reviews_count || item?.reviews || 0;

  return {
    id: hotelId,
    name: item?.name || 'Hotel',
    location: placeName || city || 'Unknown',
    city: city,
    country: country,
    rating: typeof rating === 'string' ? parseFloat(rating) : (typeof rating === 'number' ? rating : 4.0),
    reviews: typeof reviews === 'string' ? parseInt(reviews) : (typeof reviews === 'number' ? reviews : 0),
    pricePerNight: Math.round(pricePerNight),
    image: finalImage,
    description: item?.accommodation_type || item?.description || '',
    amenities: item?.mentions || item?.amenities || [],
    guests: guests,
  };
}

function mapSerpApiGoogleHotelToResult(
  property: any,
  fallbackLocation: string,
  guests: number,
  nights: number
): HotelResult {
  // Map SerpAPI Google Hotels response structure to HotelResult
  const hotelId = property?.property_token || property?.hotel_id || Math.random().toString(36).substring(7);
  
  // SerpAPI Google Hotels images - prioritize high quality
  let imageFromApi: string | null = null;
  
  // Try multiple image sources in priority order
  if (property?.images && Array.isArray(property.images) && property.images.length > 0) {
    // Get the first high-quality image
    imageFromApi = property.images[0]?.thumbnail || property.images[0]?.original_image || property.images[0];
  } else if (property?.thumbnail) {
    imageFromApi = property.thumbnail;
  } else if (property?.image) {
    imageFromApi = property.image;
  }
  
  // Log for debugging
  if (imageFromApi && typeof imageFromApi === 'string') {
    console.log(`[SerpAPI Google Hotels] Hotel "${property?.name}": image = ${imageFromApi.substring(0, 80)}...`);
  } else {
    console.warn(`[SerpAPI Google Hotels] No image found for hotel "${property?.name}"`);
  }
  
  const normalizedImage = imageFromApi ? normalizeImageUrl(imageFromApi) : null;
  const finalImage = normalizedImage || getImageForHotel(hotelId, placeholderImage(fallbackLocation, property?.name));
  
  // Extract location from GPS coordinates or use fallback
  const city = property?.city || fallbackLocation || 'Unknown';
  const country = property?.country || 'Unknown';
  
  // Extract price from rate_per_night - Google Hotels shows per night prices
  let pricePerNight = 200; // default
  
  if (property?.rate_per_night) {
    if (typeof property.rate_per_night === 'object') {
      // Handle object format: { extracted_lowest: 150, lowest: "$150" }
      if (property.rate_per_night.extracted_lowest) {
        pricePerNight = property.rate_per_night.extracted_lowest;
      } else if (property.rate_per_night.lowest) {
        const priceMatch = String(property.rate_per_night.lowest).match(/[\d.]+/);
        if (priceMatch) {
          pricePerNight = parseFloat(priceMatch[0]);
        }
      }
    } else if (typeof property.rate_per_night === 'number') {
      pricePerNight = property.rate_per_night;
    } else if (typeof property.rate_per_night === 'string') {
      const priceMatch = property.rate_per_night.match(/[\d.]+/);
      if (priceMatch) {
        pricePerNight = parseFloat(priceMatch[0]);
      }
    }
  } else if (property?.total_rate) {
    // If total rate is provided, divide by nights
    const totalRate = typeof property.total_rate === 'object' 
      ? property.total_rate.extracted_lowest || property.total_rate.lowest
      : property.total_rate;
    
    if (typeof totalRate === 'number') {
      pricePerNight = totalRate / Math.max(1, nights);
    } else if (typeof totalRate === 'string') {
      const priceMatch = totalRate.match(/[\d.]+/);
      if (priceMatch) {
        pricePerNight = parseFloat(priceMatch[0]) / Math.max(1, nights);
      }
    }
  }
  
  // Keep display prices in a reasonable range (per night)
  pricePerNight = Math.min(Math.max(pricePerNight, 40), 1500);
  
  // Extract rating and reviews
  const rating = property?.overall_rating || property?.rating || 4.0;
  const reviews = property?.reviews || property?.total_reviews || 0;
  
  // Combine amenities
  const amenities = property?.amenities || property?.essential_info || [];

  return {
    id: hotelId,
    name: property?.name || 'Hotel',
    location: property?.description || property?.neighborhood || city || 'Unknown',
    city: city,
    country: country,
    rating: typeof rating === 'string' ? parseFloat(rating) : (typeof rating === 'number' ? rating : 4.0),
    reviews: typeof reviews === 'string' ? parseInt(reviews) : (typeof reviews === 'number' ? reviews : 0),
    pricePerNight: Math.round(pricePerNight),
    image: finalImage,
    description: property?.description || property?.type || '',
    amenities: Array.isArray(amenities) ? amenities : [],
    guests: guests,
    // Capture SerpAPI fields for direct details link
    property_token: property?.property_token,
    serpapi_property_details_link: property?.serpapi_property_details_link,
  };
}

/**
 * Search for hotels using SerpAPI Google Hotels
 * Falls back to mock data if API fails
 */
export async function searchHotels(
  params: HotelSearchParams
): Promise<HotelResult[]> {
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(params.checkOutDate).getTime() - new Date(params.checkInDate).getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  console.log(`[Hotel Service] Searching for hotels in ${params.location}...`);

  // Try SerpAPI Google Hotels
  try {
    console.log(`[Hotel Service] Attempting SerpAPI Google Hotels search...`);
    
    const serpQuery = new URLSearchParams({
      location: params.location,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      guests: params.guests.toString(),
    });

    const serpResponse = await fetch(`/api/hotels/search?${serpQuery.toString()}`);
    
    if (serpResponse.ok) {
      const serpData = await serpResponse.json();
      
      // Google Hotels API returns properties array
      const properties = serpData?.properties || [];
      
      if (properties.length > 0) {
        console.log(`[Hotel Service] Successfully fetched ${properties.length} hotels from SerpAPI Google Hotels`);
        
        const mappedHotels = properties.map((property: any) =>
          mapSerpApiGoogleHotelToResult(property, params.location, params.guests, nights)
        );
        
        return mappedHotels;
      }
    }
    
    console.log(`[Hotel Service] SerpAPI Google Hotels returned no results, using mock data...`);
  } catch (error) {
    console.warn('[Hotel Service] SerpAPI Google Hotels failed:', error);
  }

  // Fall back to mock data
  console.log(`[Hotel Service] Falling back to mock data for ${params.location}`);
  return getFallbackHotels(params.location);
}

function getFallbackHotels(location: string): HotelResult[] {
  const locationLower = location.toLowerCase();
  
  console.log(`[Hotel Service] Filtering mock hotels for location: "${location}"`);
  
  // Try to match exact city or return hotels that contain the location keyword
  const filtered = mockHotels.filter(
    hotel => 
      hotel.city.toLowerCase().includes(locationLower) ||
      hotel.name.toLowerCase().includes(locationLower) ||
      hotel.location.toLowerCase().includes(locationLower) ||
      hotel.country.toLowerCase().includes(locationLower)
  );
  
  // If exact match found, return it
  if (filtered.length > 0) {
    console.log(`[Hotel Service] Found ${filtered.length} matching mock hotels for "${location}"`);
    return filtered;
  }
  
  // If no match, return a mix of hotels from different cities as a catch-all
  console.log(`[Hotel Service] No exact match for "${location}", returning sample hotels from multiple cities`);
  return mockHotels.slice(0, 6);
}
