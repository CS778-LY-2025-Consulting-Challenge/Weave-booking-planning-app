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

// Get user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const snapshot = await get(ref(db, `users/${userId}/profile`));
    return snapshot.exists() ? snapshot.val() : null;
}
