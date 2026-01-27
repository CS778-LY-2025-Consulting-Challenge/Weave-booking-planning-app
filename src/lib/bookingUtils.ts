/**
 * Utility functions for managing user bookings across the application
 * Bookings are persisted in localStorage for real-time dashboard updates
 */

export interface FlightBookingData {
  id: string;
  from: string;
  to: string;
  departureDate: string;
  airline: string;
  flightNumber: string;
  cabinClass: string;
  price: number;
}

export interface HotelBookingData {
  id: string;
  hotelName: string;
  city: string;
  checkInDate: string;
  checkOutDate: string;
  roomType: string;
  price: number;
}

/**
 * Save a flight booking to localStorage
 * This will appear on the dashboard in real-time
 */
export const saveFlightBooking = (booking: FlightBookingData) => {
  try {
    console.log('Saving flight booking:', booking);
    localStorage.setItem('upcomingFlightBooking', JSON.stringify(booking));
    
    // Trigger a storage event to notify other tabs/components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'upcomingFlightBooking',
      newValue: JSON.stringify(booking),
    }));

    // Also dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('bookingUpdated', {
      detail: { type: 'flight', booking }
    }));
    
    console.log('Flight booking saved successfully');
  } catch (error) {
    console.error('Failed to save flight booking:', error);
  }
};

/**
 * Save a hotel booking to localStorage
 * This will appear on the dashboard in real-time
 */
export const saveHotelBooking = (booking: HotelBookingData) => {
  try {
    console.log('Saving hotel booking:', booking);
    localStorage.setItem('upcomingHotelBooking', JSON.stringify(booking));
    // Trigger a storage event to notify other tabs/components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'upcomingHotelBooking',
      newValue: JSON.stringify(booking),
    }));

    // Also dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('bookingUpdated', {
      detail: { type: 'hotel', booking }
    }));
    
    console.log('Hotel booking saved successfully');
  } catch (error) {
    console.error('Failed to save hotel booking:', error);
  }
};

/**
 * Get the current flight booking
 */
export const getFlightBooking = (): FlightBookingData | null => {
  try {
    const booking = localStorage.getItem('upcomingFlightBooking');
    return booking ? JSON.parse(booking) : null;
  } catch (error) {
    console.error('Failed to retrieve flight booking:', error);
    return null;
  }
};

/**
 * Get the current hotel booking
 */
export const getHotelBooking = (): HotelBookingData | null => {
  try {
    const booking = localStorage.getItem('upcomingHotelBooking');
    return booking ? JSON.parse(booking) : null;
  } catch (error) {
    console.error('Failed to retrieve hotel booking:', error);
    return null;
  }
};

/**
 * Clear a flight booking
 */
export const clearFlightBooking = () => {
  try {
    localStorage.removeItem('upcomingFlightBooking');
  } catch (error) {
    console.error('Failed to clear flight booking:', error);
  }
};

/**
 * Clear a hotel booking
 */
export const clearHotelBooking = () => {
  try {
    localStorage.removeItem('upcomingHotelBooking');
  } catch (error) {
    console.error('Failed to clear hotel booking:', error);
  }
};

/**
 * Clear all bookings
 */
export const clearAllBookings = () => {
  clearFlightBooking();
  clearHotelBooking();
};
