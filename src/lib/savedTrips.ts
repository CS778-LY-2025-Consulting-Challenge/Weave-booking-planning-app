import { db } from "./firebase";
import { ref, set, push, remove, update, get } from "firebase/database";

// Save a new trip
export function saveTrip(userId: string, tripData: any) {
  const tripRef = push(ref(db, `users/${userId}/savedTrips`));
  return set(tripRef, tripData);
}

// Get all saved trips
export async function getSavedTrips(userId: string) {
  const snapshot = await get(ref(db, `users/${userId}/savedTrips`));
  return snapshot.exists() ? snapshot.val() : {};
}

// Update a trip
export function updateTrip(userId: string, tripId: string, tripData: any) {
  return update(ref(db, `users/${userId}/savedTrips/${tripId}`), tripData);
}

// Delete a trip
export function deleteTrip(userId: string, tripId: string) {
  return remove(ref(db, `users/${userId}/savedTrips/${tripId}`));
}