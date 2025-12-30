import { NextResponse } from 'next/server';

// Mock TripState V1 response
export async function POST() {
  const mock = {
    destination: 'Tokyo',
    dates: {
      start: '2025-12-08',
      end: '2025-12-22',
      durationDays: 14,
    },
    travellers: 2,
    purpose: 'Foodie adventure with light culture',
    preferences: ['food', 'culture', 'nightlife', 'photography'],
    dayPlans: [
      {
        day: 1,
        date: '2025-12-08',
        title: 'Arrival & Rest Day',
        summary: 'Arrive in Tokyo, get settled near Asakusa.',
        weather: { text: '18°C, cloudy' },
        activities: [
          {
            time: 'PM',
            title: 'Check-in & neighborhood stroll',
            desc: 'Explore Senso-ji surroundings and street food.',
            location: 'Asakusa',
            coords: { lat: 35.7148, lng: 139.7967 },
          },
        ],
      },
      {
        day: 2,
        date: '2025-12-09',
        title: 'Tsukiji Market & Seafood',
        summary: 'Breakfast at Tsukiji, sushi and market walk.',
        weather: { text: '12°C, light clouds' },
        activities: [
          {
            time: 'Morning',
            title: 'Tsukiji Outer Market',
            desc: 'Fresh sushi breakfast and snacks.',
            location: 'Tsukiji',
            coords: { lat: 35.6655, lng: 139.7708 },
          },
          {
            time: 'Afternoon',
            title: 'Ginza stroll',
            desc: 'Department stores, coffee, dessert.',
            location: 'Ginza',
            coords: { lat: 35.6717, lng: 139.7640 },
          },
        ],
      },
      {
        day: 3,
        date: '2025-12-10',
        title: 'Asakusa & Sumo',
        summary: 'Culture day around Asakusa and Ryogoku.',
        weather: { text: '11°C, cloudy' },
        activities: [
          {
            time: 'Morning',
            title: 'Senso-ji & Nakamise',
            desc: 'Temple visit and shopping street.',
            location: 'Asakusa',
            coords: { lat: 35.7148, lng: 139.7967 },
          },
          {
            time: 'Afternoon',
            title: 'Sumo district walk',
            desc: 'Ryogoku, sumo history, chanko hotpot.',
            location: 'Ryogoku',
            coords: { lat: 35.6965, lng: 139.7930 },
          },
        ],
      },
    ],
    transportation: [
      {
        mode: 'flight',
        from: 'AKL',
        to: 'HND',
        time: '16h • 1 stop',
        priceEstimate: 'NZ$2,676 for 2',
        coords: [
          { lat: -36.8485, lng: 174.7633 },
          { lat: 35.5494, lng: 139.7798 },
        ],
      },
      {
        mode: 'train',
        from: 'HND',
        to: 'Asakusa',
        time: '45m',
        priceEstimate: '¥800 pp',
      },
    ],
    accommodation: [
      {
        name: 'Asakusa Riverside Hotel',
        location: 'Asakusa, Tokyo',
        pricePerNight: 180,
        nights: 5,
        coords: { lat: 35.709, lng: 139.797 },
      },
    ],
    media: {
      photos: [
        'https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=800',
        'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800',
      ],
      videos: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    },
    mapRoute: {
      points: [
        { name: 'Auckland', coords: { lat: -36.8485, lng: 174.7633 } },
        { name: 'Tokyo', coords: { lat: 35.6764, lng: 139.6500 } },
      ],
    },
  };

  return NextResponse.json({ data: mock });
}


