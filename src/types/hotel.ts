export interface HotelSearchParams {
  location: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  amenities?: string[];
  hotelType?: string;
  radius?: number;
  sortBy?: 'price' | 'rating' | 'distance' | 'popularity';
}

export interface HotelResult {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviews: number;
  pricePerNight: number;
  priceRange?: {
    min: number;
    max: number;
  };
  image: string;
  images?: string[];
  description: string;
  amenities: string[];
  hotelType?: string;
  guests?: number;
  rooms?: Room[];
  policies?: {
    cancellation: string;
    checkInTime: string;
    checkOutTime: string;
  };
  contact?: {
    phone: string;
    email: string;
  };
}

export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  price: number;
  amenities: string[];
  available: number;
}

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentId?: string;
  createdAt: string;
}

export interface BookingRequest {
  userId: string;
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
}
