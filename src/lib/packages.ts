export interface LuxuryPackage {
  id: number;
  name: string;
  destination: string;
  duration: string; // e.g. "10 Days / 9 Nights"
  price: number; // per person
  heroImage: string;
  gallery: string[];
  highlights: string[];
  itinerary: Array<{ day: number; title: string; description: string }>;
  includes: string[];
  excludes: string[];
  type: 'Luxury' | 'Culture' | 'Adventure' | 'Wellness' | 'Beach & Relaxation';
  meta: {
    bestTime: string;
    comfortLevel: 'Premium' | 'Ultra Luxury' | 'Luxury' | 'Boutique';
    style: string; // e.g. "Private, curated experiences"
  };
}

export const PACKAGES: LuxuryPackage[] = [
  {
    id: 1,
    name: 'New Zealand Adventure',
    destination: 'Auckland, Rotorua, Queenstown, Milford Sound',
    duration: '10 Days / 9 Nights',
    price: 2899,
    heroImage:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1469521669194-babb90587d26?q=80&w=1200',
      'https://images.unsplash.com/photo-1493244040629-496f6d136cc3?q=80&w=1200',
      'https://images.unsplash.com/photo-1476610182048-bf72fd6c6a37?q=80&w=1200',
    ],
    highlights: [
      'Milford Sound private cruise',
      'Hobbiton movie set VIP experience',
      'Boutique lodges with panoramic views',
    ],
    itinerary: [
      { day: 1, title: 'Arrive Auckland', description: 'Private transfer, boutique check-in, welcome dinner.' },
      { day: 2, title: 'Auckland City & Coast', description: 'Harbor cruise, curated urban exploration.' },
      { day: 3, title: 'Rotorua Thermal Wonders', description: 'Geothermal fields, Maori cultural experience.' },
      { day: 4, title: 'Hobbiton VIP', description: 'Exclusive tour and gourmet lunch on set.' },
      { day: 5, title: 'Queenstown Arrival', description: 'Scenic flight, lakeside lodge welcome.' },
      { day: 6, title: 'Adventure Day', description: 'Optional bungee, jet boat, or vineyard tour.' },
      { day: 7, title: 'Milford Sound', description: 'Private cruise with canapés and sommelier.' },
      { day: 8, title: 'Alpine Relaxation', description: 'Spa day, chef’s tasting menu.' },
      { day: 9, title: 'Queenstown Leisure', description: 'Personal concierge day; bespoke experiences.' },
      { day: 10, title: 'Departure', description: 'Private transfer to airport.' },
    ],
    includes: [
      'Round-trip flights',
      '9 nights luxury accommodation',
      'Private ground transfers',
      'Curated experiences & guided tours',
      'Daily breakfast and select dinners',
    ],
    excludes: [
      'Travel insurance',
      'Personal expenses & gratuities',
      'Unlisted optional activities',
    ],
    type: 'Adventure',
    meta: {
      bestTime: 'Nov–Mar',
      comfortLevel: 'Luxury',
      style: 'Private, curated adventure travel',
    },
  },
  {
    id: 5,
    name: 'Dubai Luxury Escape',
    destination: 'Dubai, UAE',
    duration: '5 Days / 4 Nights',
    price: 1899,
    heroImage:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600',
    gallery: [
      'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1200',
      'https://images.unsplash.com/photo-1509223197845-458d87318791?q=80&w=1200',
      'https://images.unsplash.com/photo-1504805572947-34fad45aed93?q=80&w=1200',
    ],
    highlights: [
      'Skyline suite with city views',
      'Desert safari with private campsite',
      'Burj Khalifa VIP access',
    ],
    itinerary: [
      { day: 1, title: 'Arrival & Skyline', description: 'Private chauffeured transfer, suite check-in.' },
      { day: 2, title: 'Old Dubai & Creek', description: 'Gold souk, abra ride, heritage district.' },
      { day: 3, title: 'Desert Private Safari', description: 'Dune bashing, private dinner under stars.' },
      { day: 4, title: 'Modern Dubai', description: 'Burj Khalifa VIP, Dubai Mall couture experience.' },
      { day: 5, title: 'Departure', description: 'Morning spa, transfer to airport.' },
    ],
    includes: [
      '5-star hotel stay',
      'Private transfers',
      'Curated dining reservations',
    ],
    excludes: [
      'International flights',
      'Spa treatments not listed',
    ],
    type: 'Luxury',
    meta: {
      bestTime: 'Oct–Apr',
      comfortLevel: 'Ultra Luxury',
      style: 'Urban luxury & bespoke experiences',
    },
  },
];

export function getPackageById(id: number) {
  return PACKAGES.find((p) => p.id === id) || null;
}
