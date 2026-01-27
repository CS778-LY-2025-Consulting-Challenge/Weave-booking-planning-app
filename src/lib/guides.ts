import { db } from "./firebase";
import { ref, set, get, remove, update, push } from "firebase/database";

export interface GuideProfile {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  languages: string[];
  yearsOfExperience: string;
  certifications?: string;
  bio: string;
  specialties: string;
  whyGuide: string;
  createdAt: string;
  status?: string; // e.g., 'pending', 'approved', etc.
}

// Add a new guide (auto-generates a key)
export function addGuideProfile(profile: GuideProfile) {
  const guidesRef = ref(db, "guides");
  const newGuideRef = push(guidesRef);
  return set(newGuideRef, profile);
}

// Update a guide by id
export function updateGuideProfile(guideId: string, data: Partial<GuideProfile>) {
  const guideRef = ref(db, `guides/${guideId}`);
  return update(guideRef, data);
}

// Remove a guide by id
export function removeGuideProfile(guideId: string) {
  const guideRef = ref(db, `guides/${guideId}`);
  return remove(guideRef);
}

// Get all guides
export async function getAllGuides(): Promise<Record<string, GuideProfile>> {
  const snapshot = await get(ref(db, "guides"));
  return snapshot.exists() ? snapshot.val() : {};
}
