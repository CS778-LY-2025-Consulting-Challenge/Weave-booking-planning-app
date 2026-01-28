import { db } from "./firebase";
import { ref, set, push, get, child, serverTimestamp, remove } from "firebase/database";

export interface BookingData {
  id?: string;
  type: 'flight' | 'hotel';
  userId: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  stripeSessionId: string;
  createdAt: any; // Firebase timestamp
  details: any; // Flexible to store flight or hotel specific details
}

/**
 * Save a new booking to Firebase under users/{userId}/bookings/{bookingId}
 */
export async function saveBooking(userId: string, bookingData: Omit<BookingData, 'id' | 'createdAt'>, bookingId?: string) {
  try {
    const bookingsRef = ref(db, `users/${userId}/bookings`);
    let newBookingRef;

    if (bookingId) {
      newBookingRef = child(bookingsRef, bookingId);
    } else {
      newBookingRef = push(bookingsRef);
    }

    const bookingToSave = {
      ...bookingData,
      id: bookingId || newBookingRef.key,
      createdAt: serverTimestamp(),
    };

    await set(newBookingRef, bookingToSave);
    console.log(`Booking saved for user ${userId}:`, bookingToSave.id);
    return bookingToSave.id;
  } catch (error) {
    console.error("Error saving booking:", error);
    throw error;
  }
}

/**
 * Get all bookings for a specific user
 */
export async function getBookings(userId: string): Promise<BookingData[]> {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `users/${userId}/bookings`));

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert object to array
      return Object.values(data);
    } else {
      console.log("No bookings found for user", userId);
      return [];
    }
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

/**
 * Delete a booking for a specific user
 */
export async function deleteBooking(userId: string, bookingId: string) {
  try {
    const bookingRef = ref(db, `users/${userId}/bookings/${bookingId}`);
    await remove(bookingRef);
    console.log(`Booking deleted for user ${userId}:`, bookingId);
    return true;
  } catch (error) {
    console.error("Error deleting booking:", error);
    throw error;
  }
}
