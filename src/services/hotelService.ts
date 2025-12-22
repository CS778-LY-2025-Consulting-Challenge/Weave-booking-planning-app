import { HotelResult } from '@/components/HotelResults';

/**
 * Mock hotel data for demonstration
 * In production, this would be replaced with actual API calls
 */
const mockHotels = [
  {
    id: '1',
    name: 'Luxury City Hotel',
    location: 'Downtown',
    city: 'New York',
    country: 'USA',
    rating: 4.8,
    reviews: 2456,
    pricePerNight: 350,
    image:
      'https://images.unsplash.com/photo-1631049307038-da0ec56d8b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob3RlbCUyMHJvb218ZW58MXx8fHwxNzY0NjIyOTgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Experience luxury in the heart of the city with stunning views',
    amenities: ['WiFi', 'Gym', 'Pool', 'Spa', 'Restaurant', '24/7 Room Service'],
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
    image:
      'https://images.unsplash.com/photo-1758448511255-ac2a24a135d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBib3V0aXF1ZSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NjQ2MjI5ODN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Stylish and contemporary design with personalized service',
    amenities: ['WiFi', 'Concierge', 'Bar', 'Coffee Shop', 'Business Center'],
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
    image:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwaG90ZWwlMjByb29tJTIwdmlldyUyMHN0YXJ8ZW58MXx8fHwxNzY0NjIyOTg0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Classic elegance meets modern comfort in a prestigious location',
    amenities: ['WiFi', 'Fitness Center', 'Spa', 'Fine Dining', 'Valet Parking'],
  },
  {
    id: '4',
    name: 'Riverside Resort Hotel',
    location: 'Battery Park',
    city: 'New York',
    country: 'USA',
    rating: 4.7,
    reviews: 2189,
    pricePerNight: 380,
    image:
      'https://images.unsplash.com/photo-1702411200201-3061d0eea802?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyaXZlcnNpZGUlMjByZXNvcnQlMjBob3RlbCUyMHZpZXd8ZW58MXx8fHwxNzY0NjIyOTg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Waterfront luxury with panoramic city and river views',
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Concierge', 'Gym'],
  },
  {
    id: '5',
    name: 'Heritage Grand Hotel',
    location: 'Financial District',
    city: 'New York',
    country: 'USA',
    rating: 4.4,
    reviews: 1756,
    pricePerNight: 260,
    image:
      'https://images.unsplash.com/photo-1759223198981-661cadbbff36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJpdGFnZSUyMGdyYW5kJTIwaG90ZWwlMjByb29tfGVufDF8fHx8MTc2NDYyMjk4Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Historic charm with modern amenities in the heart of business',
    amenities: ['WiFi', 'Business Center', 'Bar', 'Restaurant', '24/7 Room Service'],
  },
  {
    id: '6',
    name: 'Metropolitan Tower Hotel',
    location: 'Times Square',
    city: 'New York',
    country: 'USA',
    rating: 4.5,
    reviews: 2645,
    pricePerNight: 400,
    image:
      'https://images.unsplash.com/photo-1631049307038-da0ec56d8b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXRyb3BvbGl0YW4lMjB0b3dlciUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NjQ2MjI5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Premier hotel in the heart of Times Square with world-class service',
    amenities: ['WiFi', 'Gym', 'Restaurant', 'Bar', 'Rooftop Lounge', 'Spa'],
  },
];

export interface HotelSearchParams {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
}

/**
 * Search for hotels using API
 * Currently uses mock data, but can be replaced with real API integration
 */
export async function searchHotels(
  params: HotelSearchParams
): Promise<HotelResult[]> {
  try {
    // Simulating API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Filter mock hotels based on location
    const searchTerm = params.location.toLowerCase();
    const filteredHotels = mockHotels.filter(
      (hotel) =>
        hotel.city.toLowerCase().includes(searchTerm) ||
        hotel.name.toLowerCase().includes(searchTerm) ||
        hotel.location.toLowerCase().includes(searchTerm)
    );

    // If no exact match, return all hotels as suggestions
    if (filteredHotels.length === 0) {
      // Return shuffled mock hotels based on location
      return mockHotels;
    }

    // Return filtered results
    return filteredHotels;
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw new Error('Failed to search hotels. Please try again.');
  }
}

/**
 * Real API Integration Examples (for future implementation)
 *
 * Option 1: Amadeus Hotel Search API
 * - More comprehensive global coverage
 * - Better rate limiting
 * - Requires: AMADEUS_API_KEY, AMADEUS_API_SECRET
 *
 * Option 2: RapidAPI - Hotels.com API
 * - Easy to implement
 * - Good hotel coverage
 * - Requires: RAPIDAPI_KEY
 *
 * Option 3: Google Hotels API
 * - Integrated with Google Maps
 * - Real-time pricing
 * - Requires: GOOGLE_MAPS_API_KEY
 */

/**
 * Example: Amadeus API Integration
 * Uncomment and configure when ready to use real API
 */
/*
export async function searchHotelsAmadeus(
  params: HotelSearchParams
): Promise<HotelResult[]> {
  const AMADEUS_API_KEY = process.env.NEXT_PUBLIC_AMADEUS_API_KEY;
  const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;

  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    throw new Error('Amadeus API credentials are not configured');
  }

  try {
    // Get access token
    const tokenResponse = await fetch('https://api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET,
      }),
    });

    const { access_token } = await tokenResponse.json();

    // Search hotels
    const hotelResponse = await fetch(
      `https://api.amadeus.com/v2/shopping/hotel-offers?cityCode=${params.location}`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const data = await hotelResponse.json();
    
    // Transform API response to HotelResult format
    return data.data.map((hotel: any) => ({
      id: hotel.id,
      name: hotel.name,
      location: hotel.address?.cityName || params.location,
      city: hotel.address?.cityName || params.location,
      country: hotel.address?.countryCode || 'USA',
      rating: hotel.rating || 4.0,
      reviews: 0,
      pricePerNight: hotel.offers?.[0]?.price?.total || 200,
      image: hotel.image || '/hotel-placeholder.jpg',
      description: hotel.description || '',
      amenities: [],
    }));
  } catch (error) {
    console.error('Amadeus API error:', error);
    throw new Error('Failed to fetch hotels from Amadeus');
  }
}
*/

/**
 * Example: RapidAPI Hotels Integration
 * Uncomment and configure when ready to use
 */
/*
export async function searchHotelsRapidAPI(
  params: HotelSearchParams
): Promise<HotelResult[]> {
  const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY;

  if (!RAPIDAPI_KEY) {
    throw new Error('RapidAPI key is not configured');
  }

  try {
    const response = await fetch(
      `https://hotels-com.p.rapidapi.com/search?query=${params.location}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'hotels-com.p.rapidapi.com',
        },
      }
    );

    const data = await response.json();

    return data.results.map((hotel: any) => ({
      id: hotel.id,
      name: hotel.name,
      location: params.location,
      city: params.location,
      country: hotel.country || 'USA',
      rating: hotel.rating || 4.0,
      reviews: hotel.reviewCount || 0,
      pricePerNight: hotel.price || 200,
      image: hotel.image || '/hotel-placeholder.jpg',
      description: hotel.description || '',
      amenities: hotel.amenities || [],
    }));
  } catch (error) {
    console.error('RapidAPI error:', error);
    throw new Error('Failed to fetch hotels from RapidAPI');
  }
}
*/
