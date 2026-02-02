import { db } from "./firebase";
import { ref, set, get, update } from "firebase/database";

export interface UserProfile {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    nationality?: string;
    passportNumber?: string;
    passportExpiry?: string;
    preferences?: {
        currency?: string;
        language?: string;
        travelClass?: string;
        seatPreference?: string;
        mealPreference?: string;
        interests?: string[];
        budgetPreference?: string; // Aligning with dashboard requirement
        seasonPreference?: string; // Aligning with dashboard requirement
    };
}

// Save user profile
export function saveUserProfile(userId: string, profileData: UserProfile) {
    const profileRef = ref(db, `users/${userId}/profile`);
    return set(profileRef, profileData);
}

// Update user profile (partial)
export function updateUserProfile(userId: string, data: Partial<UserProfile>) {
    const profileRef = ref(db, `users/${userId}/profile`);
    return update(profileRef, data);
}

// Simple in-memory cache
const profileCache = new Map<string, UserProfile>();

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    // if (profileCache.has(userId)) {
    //     return profileCache.get(userId) || null;
    // }

    const snapshot = await get(ref(db, `users/${userId}/profile`));
    if (snapshot.exists()) {
        const data = snapshot.val();
        profileCache.set(userId, data);
        return data;
    }

    return null;
}
