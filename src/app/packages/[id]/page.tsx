'use client';

import MediaViewer from '@/components/MediaViewer';
import Reviews from '@/components/Reviews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RouteMapWidget, {
  Coordinates,
  RouteStop,
} from '@/components/RouteMapWidget';
import {
  Activity,
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  Clock,
  DollarSign,
  Hotel,
  MapPin,
  Plane,
  Play,
  Users,
  Utensils,
} from 'lucide-react';
import { motion } from 'motion/react';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import { saveTrip } from '@/lib/savedTrips';

interface DayActivity {
  time: string;
  activity: string;
  description: string;
  icon: any;
}

interface DayMedia {
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  caption: string;
}

interface DestinationActivity {
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  price: string;
  image: string;
  category: string;
}

interface PackageData {
  id: number;
  name: string;
  destination: string;
  duration: string;
  price: number;
  image: string;
  includes: string[];
  type: string;
  description: string;
  itinerary: {
    day: number;
    title: string;
    image?: string;
    activities: DayActivity[];
    media?: DayMedia[];
  }[];
  accommodation: {
    name: string;
    type: string;
    location: string;
    amenities: string[];
    images: string[];
    rating: number;
  }[];
  transportation: {
    type: string;
    details: string;
    from: string;
    to: string;
    duration: string;
  }[];
  activities: DestinationActivity[];
}


export default function PackageDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('itinerary');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedMediaArray, setSelectedMediaArray] = useState<DayMedia[]>([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const { user } = useUser();
  const userId = user?.id;
  const [adding, setAdding] = useState(false);

  // Package data with comprehensive details
  const packagesData: { [key: string]: PackageData } = {
    '1': {
      id: 1,
      name: 'New Zealand Adventure',
      destination: 'Auckland, Rotorua, Queenstown, Milford Sound',
      duration: '10 Days / 9 Nights',
      price: 2899,
      image: '/images/new zealand.jpg',
      includes: [
        'Round-trip international flights',
        '9 nights accommodation in scenic locations',
        'Milford Sound cruise experience',
        'Hobbiton Movie Set guided tour',
        'Adventure activities (bungee jumping, sky diving, jet boating)',
        'Thermal pools and geysers of Rotorua',
        'Scenic drives and nature hikes',
        'Travel insurance included',
      ],
      type: 'Adventure',
      description:
        'Discover the breathtaking landscapes of New Zealand! Experience stunning fjords, adventure sports, Māori culture, and famous movie locations. From the vibrant city of Auckland to the natural wonders of Milford Sound, this package offers an unforgettable journey through Middle Earth and beyond.',

      itinerary: [
        {
          day: 1,
          title: 'Arrival in Auckland - Gateway to New Zealand',
          image:
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWNrbGFuZCUyMGNpdHklMjBuZXclMjB6ZWFsYW5kfGVufDF8fHx8fDA&ixlib=rb-4.1.0&q=80&w=1080',
          activities: [
            {
              time: '11:00 AM',
              activity: 'Arrival at Auckland International Airport',
              description:
                'Meet and greet by our representative at the airport',
              icon: Plane,
            },
            {
              time: '12:30 PM',
              activity: 'Scenic Drive to Hotel',
              description: 'Drive through Auckland city with tour guide commentary',
              icon: Plane,
            },
            {
              time: '2:00 PM',
              activity: 'Hotel Check-in',
              description: 'Check into your hotel in central Auckland',
              icon: Hotel,
            },
            {
              time: '4:00 PM',
              activity: 'Sky Tower Visit',
              description: 'Experience panoramic views from the Sky Tower (328m)',
              icon: Camera,
            },
            {
              time: '7:00 PM',
              activity: 'Welcome Dinner',
              description: 'New Zealand specialty cuisine at a local restaurant',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'photo',
              url: '/images/day-1.jpg',
              caption: 'Auckland skyline with Sky Tower',
            },
            {
              type: 'photo',
              url: '/images/day-1,1.jpg',
              caption: 'Auckland harbourfront',
            },
          ],
        },
        {
          day: 2,
          title: 'Hobbiton Movie Set & Rotorua',
          image:
            'https://images.unsplash.com/photo-1577707627826-a9ce4901f264?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2JiaXRvbiUyMG1vdmllJTIwc2V0fGVufDB8fHx8fDA&ixlib=rb-4.1.0&q=80&w=1080',
          activities: [
            {
              time: '8:00 AM',
              activity: 'Breakfast at Hotel',
              description: 'Full breakfast before departure',
              icon: Utensils,
            },
            {
              time: '9:00 AM',
              activity: 'Drive to Hobbiton Movie Set',
              description:
                '2-hour scenic drive through Waikato region',
              icon: Plane,
            },
            {
              time: '11:30 AM',
              activity: 'Hobbiton Tour',
              description:
                'Guided tour of the famous Lord of the Rings movie set with Green Dragon Inn experience',
              icon: Camera,
            },
            {
              time: '2:00 PM',
              activity: 'Lunch Break',
              description: 'Local cuisine in Matamata',
              icon: Utensils,
            },
            {
              time: '4:00 PM',
              activity: 'Travel to Rotorua',
              description: 'Scenic 1.5-hour drive through geothermal region',
              icon: Plane,
            },
            {
              time: '7:00 PM',
              activity: 'Rotorua Thermal Pools & Dinner',
              description: 'Traditional Māori cultural performance and hangi dinner',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'photo',
              url: '/images/day-2.jpg',
              caption: 'Hobbiton Movie Set',
            },
            {
              type: 'photo',
              url: '/images/day-2,2.jpg',
              caption: 'Hobbiton Movie Set - Green Dragon Inn',
            },
            {
              type: 'photo',
              url: '/images/day-2-3.jpg',
              caption: 'Lake Tikitapu (Blue Lake)',
            },
            {
              type: 'photo',
              url: '/images/day-2-4.jpg',
              caption: 'Lake Tarawera',
            },
          ],
        },
        {
          day: 3,
          title: 'Rotorua Adventure & Thermal Wonders',
          image:
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb3RvcnVhJTIwdGhlcm1hbHxlbnx8fHx8MA&ixlib=rb-4.1.0&q=80&w=1080',
          activities: [
            {
              time: '9:00 AM',
              activity: 'Breakfast at Hotel',
              description: 'Energizing breakfast before adventure',
              icon: Utensils,
            },
            {
              time: '10:00 AM',
              activity: 'Te Puia Geothermal Area',
              description:
                'Visit Pohutu Geyser and Māori Arts & Crafts Institute',
              icon: Camera,
            },
            {
              time: '12:30 PM',
              activity: 'Lunch Break',
              description: 'Local Rotorua cuisine',
              icon: Utensils,
            },
            {
              time: '2:00 PM',
              activity: 'Skyline Rotorua & Luge Ride',
              description: 'Gondola ride with thrilling luge track experience',
              icon: Activity,
            },
            {
              time: '5:00 PM',
              activity: 'Spa & Thermal Pools',
              description: 'Relax in natural hot springs and mud pools',
              icon: Hotel,
            },
            {
              time: '7:30 PM',
              activity: 'Dinner',
              description: 'Traditional New Zealand dinner',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'photo',
              url: '/images/day-3.webp',
              caption: 'Wai-O-Tapu Thermal Wonderland',
            },
            {
              type: 'photo',
              url: '/images/day-3-1.webp',
              caption: 'Skyline Rotorua Gondola',
            },
            {
              type: 'photo',
              url: '/images/day-3-2.webp',
              caption: 'Skyline Rotorua Friends on Luge',
            },
          ],
        },
        {
          day: 4,
          title: 'Travel to Queenstown - Adventure Capital',
          image:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxxdWVlbnN0b3duJTIwbmV3JTIwemVhbGFuZHxlbnx8fHx8MA&ixlib=rb-4.1.0&q=80&w=1080',
          activities: [
            {
              time: '8:30 AM',
              activity: 'Breakfast & Checkout',
              description: 'Early breakfast before departure',
              icon: Utensils,
            },
            {
              time: '10:00 AM',
              activity: 'Flight to Queenstown',
              description:
                '1-hour scenic flight over central North Island to Queenstown',
              icon: Plane,
            },
            {
              time: '12:00 PM',
              activity: 'Hotel Check-in',
              description: 'Check into luxury hotel in Queenstown',
              icon: Hotel,
            },
            {
              time: '2:00 PM',
              activity: 'City Walking Tour',
              description:
                'Explore Lake Wakatipu and downtown Queenstown with local guide',
              icon: Camera,
            },
            {
              time: '5:00 PM',
              activity: 'Jet Boat Adventure',
              description: 'Thrilling jet boat ride on Lake Wakatipu',
              icon: Activity,
            },
            {
              time: '7:30 PM',
              activity: 'Welcome Dinner',
              description: 'Fine dining with lake views',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'photo',
              url: '/images/day-4.jpg',
              caption: 'Queenstown',
            },
            {
              type: 'photo',
              url: '/images/day-4-1.webp',
              caption: 'Jet Boat Adventure',
            },
            {
              type: 'photo',
              url: '/images/day-4-2.webp',
              caption: 'Jet Boat Adventure',
            },
          ],
        },
        {
          day: 5,
          title: 'Milford Sound - World Wonder',
          image:
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaWxmb3JkJTIwc291bmQlMjBuZXclMjB6ZWFsYW5kfGVufDB8fHx8fDA&ixlib=rb-4.1.0&q=80&w=1080',
          activities: [
            {
              time: '7:30 AM',
              activity: 'Breakfast',
              description: 'Early breakfast at the hotel',
              icon: Utensils,
            },
            {
              time: '9:00 AM',
              activity: 'Scenic Drive to Milford Sound',
              description:
                '4-hour drive through Fiordland National Park - one of the world\'s most beautiful scenic drives',
              icon: Plane,
            },
            {
              time: '1:00 PM',
              activity: 'Lunch Break',
              description: 'Lunch at Milford Sound lodge',
              icon: Utensils,
            },
            {
              time: '2:00 PM',
              activity: 'Milford Sound Cruise',
              description: '2-hour cruise through dramatic fjords, waterfalls, and pristine nature',
              icon: Camera,
            },
            {
              time: '5:00 PM',
              activity: 'Return Drive to Queenstown',
              description: 'Scenic return journey with photo stops',
              icon: Plane,
            },
            {
              time: '9:00 PM',
              activity: 'Dinner',
              description: 'Dinner after returning to Queenstown',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'photo',
              url: '/images/day-5.webp',
              caption: 'Scenic Drive to Milford Sound',
            },
            {
              type: 'photo',
              url: '/images/day-5-1.webp',
              caption: 'Milford Sound Cruise',
            },
            {
              type: 'photo',
              url: '/images/day-5-2.jpg',
              caption: 'Milford Sound Cruise',
            },
          ],
        },
        {
          day: 6,
          title: 'Adventure Sports & Thrill Activities',
          image:
            'https://images.unsplash.com/photo-1611632736579-6b16e2b50449?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidW5nZWUlMjBqdW1waW5nJTIwcXVlZW5zdG93bnxlbnwxfHx8fDA&ixlib=rb-4.1.0&q=80&w=1080',
          activities: [
            {
              time: '9:00 AM',
              activity: 'Breakfast',
              description: 'Full breakfast at hotel',
              icon: Utensils,
            },
            {
              time: '10:00 AM',
              activity: 'Bungee Jumping Experience',
              description: 'Thrilling 141m bungee jump from the historic Kawarau Bridge',
              icon: Activity,
            },
            {
              time: '12:30 PM',
              activity: 'Lunch Break',
              description: 'Adventurous lunch celebration',
              icon: Utensils,
            },
            {
              time: '2:00 PM',
              activity: 'Skydiving (Optional)',
              description: 'Experience the ultimate adrenaline rush - 12,000-15,000ft skydive',
              icon: Activity,
            },
            {
              time: '5:00 PM',
              activity: 'Relax at Spa',
              description: 'Unwind with massage after adventure activities',
              icon: Hotel,
            },
            {
              time: '7:30 PM',
              activity: 'Celebration Dinner',
              description: 'Special dinner to celebrate your adventures',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'video',
              url: '/images/day-6.mp4',
              thumbnail:
                '/images/day-6-1.webp',
              caption: 'Adventure sports highlights',
            },
            {
              type: 'photo',
              url: '/images/day-6-2.jpg',
              caption: 'Skydiving adventure',
            },
            {
              type: 'photo',
              url: '/images/day-6-3.jpg',
              caption: 'Spa Relax',
            },

          ],
        },
        {
          day: 7,
          title: 'Arrowtown & Wine Country',
          image:
            'https://images.unsplash.com/photo-1521763185298-1b434c919eba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnJvd3N0b3duJTIwbmV3JTIwemVhbGFuZHxlbnwwfHx8fHww&ixlib=rb-4.1.0&q=80&w=1080',
          activities: [
            {
              time: '8:00 AM',
              activity: 'Breakfast at Hotel',
              description: 'Hearty breakfast before the day trip',
              icon: Utensils,
            },
            {
              time: '9:30 AM',
              activity: 'Drive to Arrowtown',
              description: '1-hour scenic drive to historic Arrowtown',
              icon: Plane,
            },
            {
              time: '11:00 AM',
              activity: 'Arrowtown Exploration',
              description: 'Walk through picturesque streets lined with autumn trees',
              icon: Camera,
            },
            {
              time: '1:00 PM',
              activity: 'Wine Tasting Tour',
              description: 'Visit local wineries in Central Otago wine region',
              icon: Utensils,
            },
            {
              time: '4:00 PM',
              activity: 'Lunch with Wine Pairing',
              description: 'Enjoy local cuisine with wine selection',
              icon: Utensils,
            },
            {
              time: '6:00 PM',
              activity: 'Return to Queenstown',
              description: 'Scenic drive back with photo opportunities',
              icon: Plane,
            },
          ],
          media: [
            {
              type: 'photo',
              url: '/images/day-7.jpg',
              caption: 'Autumn colors in Arrowtown',
            },
            {
              type: 'photo',
              url: '/images/day-7-1.jpg',
              caption: 'Autumn colors in Arrowtown',
            },
            {
              type: 'photo',
              url: '/images/day-7-2.avif',
              caption: 'Wine tasting experience',
            },
          ],
        },
        {
          day: 8,
          title: 'Glenorchy & Paradise Valley',
          image:
            'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnbGVub3JjaHklMjBxdWVlbnN0b3duJTIwbmV3JTIwemVhbGFuZHxlbnwwfHx8fHww&ixlib=rb-4.1.0&q=80&w=1080',
          activities: [
            {
              time: '8:30 AM',
              activity: 'Breakfast at Hotel',
              description: 'Early breakfast before scenic journey',
              icon: Utensils,
            },
            {
              time: '10:00 AM',
              activity: 'Drive to Glenorchy',
              description: '1-hour scenic drive to the historic coach station',
              icon: Plane,
            },
            {
              time: '11:30 AM',
              activity: 'TSS Earnslaw Vintage Steamer Cruise',
              description: 'Historic 100-year-old steamship journey on Lake Wakatipu',
              icon: Activity,
            },
            {
              time: '1:00 PM',
              activity: 'Lunch on the Lake',
              description: 'Enjoy New Zealand cuisine aboard the steamer',
              icon: Utensils,
            },
            {
              time: '3:00 PM',
              activity: 'Sheep Station Visit',
              description: 'Experience working sheep farm with shearing demonstration',
              icon: Camera,
            },
          ],
          media: [
            {
              type: 'photo',
              url: '/images/day-8.avif',
              caption: 'Glenorchy scenic landscape',
            },
            {
              type: 'photo',
              url: '/images/day-8-1.jpg',
              caption: 'TSS Earnslaw Vintage Steamer Cruise',
            },
            {
              type: 'photo',
              url: '/images/day-8-2.jpg',
              caption: 'Lunch on the Lake',
            },
          ],
        },
        {
          day: 9,
          title: 'Wellness & Reflection Day',
          image:
            'https://images.unsplash.com/photo-1544161515-81e4e4e34f3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjByZWxheGF0aW9uJTIwbGFrZXxlbnwwfHx8fHww&ixlib=rb-4.1.0&q=80&w=1080',
          activities: [
            {
              time: '9:00 AM',
              activity: 'Breakfast & Yoga',
              description: 'Morning yoga session overlooking Lake Wakatipu',
              icon: Utensils,
            },
            {
              time: '10:30 AM',
              activity: 'Spa & Wellness Treatment',
              description: 'Relaxing massage and spa experience',
              icon: Hotel,
            },
            {
              time: '12:30 PM',
              activity: 'Light Lunch',
              description: 'Healthy, fresh cuisine at hotel restaurant',
              icon: Utensils,
            },
            {
              time: '2:00 PM',
              activity: 'Scenic Nature Walk',
              description: 'Easy nature walk through stunning Queenstown surroundings',
              icon: Camera,
            },
            {
              time: '5:00 PM',
              activity: 'Free Time & Shopping',
              description: 'Explore local shops and galleries',
              icon: Clock,
            },
            {
              time: '7:30 PM',
              activity: 'Farewell Dinner',
              description: 'Gourmet dining experience at premium restaurant',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'photo',
              url: '/images/day-9.avif',
              caption: 'Morning yoga with lake views',
            },
            {
              type: 'photo',
              url: '/images/day-9-1.avif',
              caption: 'Spa wellness treatment',
            },
            {
              type: 'photo',
              url: '/images/day-9-2.webp',
              caption: 'Scenic nature walk',
            },
          ],
        },
        {
          day: 10,
          title: 'Departure Day - Return Home',
          image:
            'https://images.unsplash.com/photo-1584535179807-3f4c2c3c738e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwb3J0JTIwZGVwYXJ0dXJlJTIwdHJhdmVsJTIwbHVnZ2FnZXxlbnwxfHx8fDE3NjUzMTkzNTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
          activities: [
            {
              time: '8:00 AM',
              activity: 'Breakfast & Hotel Check-out',
              description: 'Final breakfast with scenic views',
              icon: Utensils,
            },
            {
              time: '10:00 AM',
              activity: 'Scenic Flight to Auckland',
              description: '1-hour scenic flight back to Auckland with stunning aerial views',
              icon: Plane,
            },
            {
              time: '12:00 PM',
              activity: 'Lunch at Auckland',
              description: 'Final New Zealand meal before departure',
              icon: Utensils,
            },
            {
              time: '3:00 PM',
              activity: 'International Departure',
              description: 'Flight back home with unforgettable memories of Middle Earth',
              icon: Plane,
            },
          ],
          media: [
            {
              type: 'photo',
              url: '/images/day-10.webp',
              caption: 'Auckland airport farewell',
            },
          ],
        },
      ],
      accommodation: [
        {
          name: 'Millennium Hotel - Auckland',
          type: 'Luxury 5-Star Hotel',
          location: 'Downtown Auckland',
          rating: 5,
          amenities: [
            'Waterfront location',
            'Spa with thermal pools',
            'Fine dining restaurants',
            'High-speed WiFi',
            'Concierge service',
            'City views',
            'Fitness center',
            'Room service 24/7',
            'Premium bedding',
          ],
          images: ['/images/millenium.jpg'],
        },
        {
          name: 'Rotorua Lakeland Resort',
          type: 'Premium Resort Hotel',
          location: 'Rotorua, Bay of Plenty',
          rating: 4,
          amenities: [
            'Direct lakeside access',
            'Thermal hot pools',
            'Spa treatments',
            'Adventure activity bookings',
            'Restaurant with lake views',
            'WiFi throughout',
            'Geothermal heating',
            'Multi-cuisine dining',
          ],
          images: ['/images/Rotorua Lakeland Resort.jpg'],
        },
        {
          name: 'The Ritz-Carlton Queenstown',
          type: 'Ultra-Luxury Resort',
          location: 'Queenstown, Otago',
          rating: 5,
          amenities: [
            'Mountain views',
            'Lake Wakatipu access',
            'Luxury spa facility',
            'Multiple fine dining restaurants',
            'Adventure concierge',
            'Private balconies',
            'Premium toiletries',
            'In-room dining',
            '24-hour butler service',
            'Heated outdoor pools',
          ],
          images: ['/images/The Ritz-Carlton Queenstown.avif'],
        },
      ],
      transportation: [
        {
          type: 'International Flight',
          details: 'Round-trip business class tickets with stopovers',
          from: 'Your Home Country',
          to: 'Auckland International Airport',
          duration: 'Varies by origin (typically 20-30 hours with connections)',
        },
        {
          type: 'Domestic Flight',
          details: 'Flight from Auckland to Rotorua',
          from: 'Auckland Airport',
          to: 'Rotorua Regional Airport',
          duration: '1 hour',
        },
        {
          type: 'Domestic Flight',
          details: 'Flight from Rotorua to Queenstown',
          from: 'Rotorua Airport',
          to: 'Queenstown Airport',
          duration: '1 hour',
        },
        {
          type: 'Scenic Coach',
          details: 'Private coach transportation for Milford Sound journey',
          from: 'Queenstown',
          to: 'Milford Sound',
          duration: '4 hours scenic drive',
        },
        {
          type: 'Cruise Ship',
          details: 'Milford Sound cruise vessel - Fiordland experience',
          from: 'Milford Sound',
          to: 'Fjord exploration',
          duration: '2 hours',
        },
        {
          type: 'Scenic Flight',
          details: 'Flight from Queenstown back to Auckland',
          from: 'Queenstown Airport',
          to: 'Auckland Airport',
          duration: '1 hour',
        },
      ],
      activities: [
        {
          name: 'Bungee Jumping',
          description:
            'Thrilling 141m jump from the iconic Kawarau Bridge in Queenstown',
          duration: '3 hours',
          difficulty: 'Advanced',
          price: 'Included in package',
          image: '/images/day-6.mp4',
          category: 'Adventure',
        },
        {
          name: 'Milford Sound Cruise',
          description:
            '2-hour cruise through one of the world\'s most beautiful fjords with dramatic waterfalls and pristine nature',
          duration: '2 hours',
          difficulty: 'Easy',
          price: 'Included in package',
          image: '/images/1080.jpg',
          category: 'Nature',
        },
        {
          name: 'Hobbiton Movie Set Tour',
          description:
            'Guided tour of the famous Lord of the Rings and Hobbit filming location with Green Dragon Inn visit',
          duration: '4 hours',
          difficulty: 'Easy',
          price: 'Included in package',
          image: '/images/day-2.jpg',
          category: 'Cultural',
        },
        {
          name: 'Rotorua Thermal Pools & Geysers',
          description:
            'Explore natural hot springs, Pohutu Geyser, and traditional Māori thermal experiences',
          duration: 'Full day',
          difficulty: 'Easy',
          price: 'Included in package',
          image: '/images/day-3.webp',
          category: 'Nature',
        },
        {
          name: 'Skydiving Experience',
          description:
            'Optional extreme adventure - 12,000-15,000ft skydive with stunning aerial views of New Zealand',
          duration: '4 hours',
          difficulty: 'Advanced',
          price: 'Additional cost - Optional',
          image: '/images/skydive.mp4',
          category: 'Adventure',
        },
        {
          name: 'Jet Boat Rides',
          description:
            'Thrilling jet boat adventure on Lake Wakatipu with expert operators',
          duration: '1-2 hours',
          difficulty: 'Moderate',
          price: 'Included in package',
          image: '/images/day-4-1.webp',
          category: 'Adventure',
        },
        {
          name: 'Wine Tasting Tour',
          description:
            'Visit renowned Central Otago wine region wineries and enjoy wine pairing with local cuisine',
          duration: '4 hours',
          difficulty: 'Easy',
          price: 'Included in package',
          image: '/images/day-7-2.avif',
          category: 'Culinary',
        },
      ],
    },
    '2': {
      id: 2,
      name: 'European Highlights Tour',
      destination: 'Paris, Rome, Barcelona',
      duration: '14 Days / 13 Nights',
      price: 3299,
      image:
        'https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc2NDQ3MTg2NHww&ixlib=rb-4.1.0&q=80&w=1080',
      includes: [
        'International flights',
        '13 nights in 4-star hotels',
        'Daily breakfast',
        'Guided city tours',
        'Museum passes',
      ],
      type: 'Culture',
      description:
        'Discover the magic of Europe&apos;s most iconic cities. From the romantic streets of Paris to the ancient ruins of Rome and the vibrant culture of Barcelona, this tour offers the perfect blend of history, art, and cuisine.',
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Paris',
          image:
            'https://images.unsplash.com/photo-1618911319813-fa0abc3338e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGNpdHklMjBldmVuaW5nJTIwbGlnaHRzfGVufDF8fHx8MTc2NTMxOTM1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '2:00 PM',
              activity: 'Arrive at Charles de Gaulle Airport',
              description: 'Private transfer to hotel in central Paris',
              icon: Plane,
            },
            {
              time: '4:00 PM',
              activity: 'Hotel Check-in',
              description:
                'Settle into your 4-star hotel near the Latin Quarter',
              icon: Hotel,
            },
            {
              time: '7:00 PM',
              activity: 'Welcome Dinner',
              description: 'Traditional French bistro dinner with wine',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGNpdHklMjBldmVuaW5nfGVufDF8fHx8MTc2NTMzODY4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Paris evening cityscape',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1550340499-a6c60fc8287c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBiaXN0cm8lMjBkaW5uZXJ8ZW58MXx8fHwxNzY1MzM4Njg2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Traditional French bistro',
            },
            {
              type: 'video',
              url: 'https://player.vimeo.com/external/397071460.sd.mp4?s=fc3e16756c96b26e2d7a8cbbb7c61c57e20fb6ee&profile_id=165',
              thumbnail:
                'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMG5pZ2h0JTIwc3RyZWV0c3xlbnwxfHx8fDE3NjUzMzg2ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Paris by night',
            },
          ],
        },
        {
          day: 2,
          title: 'Paris City Tour',
          image:
            'https://images.unsplash.com/photo-1642947392578-b37fbd9a4d45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzJTIwZnJhbmNlfGVufDF8fHx8MTc2NTMxOTM1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '9:00 AM',
              activity: 'Eiffel Tower Visit',
              description: 'Skip-the-line access to the 2nd floor with guide',
              icon: Camera,
            },
            {
              time: '12:00 PM',
              activity: 'Lunch at Café',
              description: 'Classic French lunch in Champ de Mars area',
              icon: Utensils,
            },
            {
              time: '2:30 PM',
              activity: 'Seine River Cruise',
              description: '1-hour sightseeing cruise with audio guide',
              icon: Camera,
            },
            {
              time: '5:00 PM',
              activity: 'Louvre Museum',
              description:
                'Guided tour of museum highlights including Mona Lisa',
              icon: Camera,
            },
          ],
          media: [
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlcnxlbnwxfHx8fDE3NjUzMzg2ODd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Iconic Eiffel Tower',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMHNlaW5lJTIwcml2ZXJ8ZW58MXx8fHwxNzY1MzM4Njg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Seine River cruise views',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3V2cmUlMjBtdXNldW0lMjBwYXJpc3xlbnwxfHx8fDE3NjUzMzg2ODh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'The Louvre Museum',
            },
            {
              type: 'video',
              url: 'https://player.vimeo.com/external/397071460.sd.mp4?s=fc3e16756c96b26e2d7a8cbbb7c61c57e20fb6ee&profile_id=165',
              thumbnail:
                'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGNpdHklMjBldmVuaW5nfGVufDF8fHx8MTc2NTMzODY4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Paris city tour highlights',
            },
          ],
        },
        {
          day: 3,
          title: 'Versailles Day Trip',
          image:
            'https://images.unsplash.com/photo-1722718136570-b0ad04a9ad12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXJzYWlsbGVzJTIwcGFsYWNlJTIwZ2FyZGVucyUyMGZyYW5jZXxlbnwxfHx8fDE3NjUzMTkzNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '8:30 AM',
              activity: 'Depart for Versailles',
              description: 'Coach transfer to Palace of Versailles',
              icon: Plane,
            },
            {
              time: '10:00 AM',
              activity: 'Palace Tour',
              description: 'Guided tour of the palace and Hall of Mirrors',
              icon: Camera,
            },
            {
              time: '1:00 PM',
              activity: 'Lunch in Versailles',
              description: 'Lunch at a local restaurant',
              icon: Utensils,
            },
            {
              time: '3:00 PM',
              activity: 'Gardens Exploration',
              description: 'Stroll through the magnificent palace gardens',
              icon: Camera,
            },
          ],
          media: [
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1588778696920-0a2f6c6c1724?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXJzYWlsbGVzJTIwcGFsYWNlfGVufDF8fHx8MTc2NTMzODY4OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Palace of Versailles',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1568150797507-02b84b2a36c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXJzYWlsbGVzJTIwZ2FyZGVuc3xlbnwxfHx8fDE3NjUzMzg2OTB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Versailles gardens',
            },
            {
              type: 'video',
              url: 'https://player.vimeo.com/external/397071460.sd.mp4?s=fc3e16756c96b26e2d7a8cbbb7c61c57e20fb6ee&profile_id=165',
              thumbnail:
                'https://images.unsplash.com/photo-1722718136570-b0ad04a9ad12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXJzYWlsbGVzJTIwcGFsYWNlJTIwZ2FyZGVucyUyMGZyYW5jZXxlbnwxfHx8fDE3NjUzMTkzNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Versailles tour highlights',
            },
          ],
        },
        {
          day: 4,
          title: 'Travel to Rome',
          image:
            'https://images.unsplash.com/photo-1583422095309-55daabc9cc78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmV2aSUyMGZvdW50YWluJTIwcm9tZSUyMGl0YWx5fGVufDF8fHx8MTc2NTMxOTM1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '10:00 AM',
              activity: 'Flight to Rome',
              description: '2-hour flight from Paris to Rome',
              icon: Plane,
            },
            {
              time: '2:00 PM',
              activity: 'Hotel Check-in',
              description: 'Check into hotel near Piazza Navona',
              icon: Hotel,
            },
            {
              time: '5:00 PM',
              activity: 'Evening Walking Tour',
              description: 'Explore Trevi Fountain and Spanish Steps',
              icon: Camera,
            },
            {
              time: '8:00 PM',
              activity: 'Italian Dinner',
              description: 'Authentic Roman cuisine in Trastevere',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmV2aSUyMGZvdW50YWlufGVufDF8fHx8MTc2NTMzODY5MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Trevi Fountain at sunset',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21lJTIwc3BhbmlzaCUyMHN0ZXBzfGVufDF8fHx8MTc2NTMzODY5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Spanish Steps',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwZm9vZCUyMHBpenphJTIwcGFzdGF8ZW58MXx8fHwxNzY1MzM4NjkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Authentic Italian dinner',
            },
            {
              type: 'video',
              url: 'https://player.vimeo.com/external/397071460.sd.mp4?s=fc3e16756c96b26e2d7a8cbbb7c61c57e20fb6ee&profile_id=165',
              thumbnail:
                'https://images.unsplash.com/photo-1583422095309-55daabc9cc78?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmV2aSUyMGZvdW50YWluJTIwcm9tZSUyMGl0YWx5fGVufDF8fHx8MTc2NTMxOTM1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Evening in Rome',
            },
          ],
        },
        {
          day: 5,
          title: 'Ancient Rome',
          image:
            'https://images.unsplash.com/photo-1662898290891-a6c7f022e851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvc3NldW0lMjBhbmNpZW50JTIwcm9tZSUyMGl0YWx5fGVufDF8fHx8MTc2NTMxOTM1N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '9:00 AM',
              activity: 'Colosseum Tour',
              description: 'Skip-the-line guided tour of the Colosseum',
              icon: Camera,
            },
            {
              time: '11:30 AM',
              activity: 'Roman Forum & Palatine Hill',
              description: 'Explore ancient Roman ruins with expert guide',
              icon: Camera,
            },
            {
              time: '2:00 PM',
              activity: 'Lunch Break',
              description: 'Pizza and pasta near the Colosseum',
              icon: Utensils,
            },
            {
              time: '4:00 PM',
              activity: 'Pantheon Visit',
              description: 'Visit the best-preserved Roman building',
              icon: Camera,
            },
          ],
        },
        {
          day: 6,
          title: 'Vatican City',
          image:
            'https://images.unsplash.com/photo-1730724435082-304defcba25e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXRpY2FuJTIwc2lzdGluZSUyMGNoYXBlbCUyMHJvbWV8ZW58MXx8fHwxNzY1MzE5MzU4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '8:00 AM',
              activity: 'Vatican Museums',
              description: 'Early access tour including Sistine Chapel',
              icon: Camera,
            },
            {
              time: '11:00 AM',
              activity: 'St. Peter&apos;s Basilica',
              description: 'Guided tour of the world&apos;s largest church',
              icon: Camera,
            },
            {
              time: '1:00 PM',
              activity: 'Lunch in Vatican Area',
              description: 'Traditional Italian lunch',
              icon: Utensils,
            },
            {
              time: '3:00 PM',
              activity: 'Free Afternoon',
              description: 'Shopping or visit Castel Sant&apos;Angelo',
              icon: Clock,
            },
          ],
        },
        {
          day: 7,
          title: 'Travel to Barcelona',
          image:
            'https://images.unsplash.com/photo-1534713570913-ae674f0fc2af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXMlMjByYW1ibGFzJTIwYmFyY2Vsb25hJTIwc3RyZWV0fGVufDF8fHx8MTc2NTMxOTM1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '11:00 AM',
              activity: 'Flight to Barcelona',
              description: '2-hour flight from Rome to Barcelona',
              icon: Plane,
            },
            {
              time: '3:00 PM',
              activity: 'Hotel Check-in',
              description: 'Check into hotel in Gothic Quarter',
              icon: Hotel,
            },
            {
              time: '6:00 PM',
              activity: 'Las Ramblas Walk',
              description: 'Explore Barcelona&apos;s famous boulevard',
              icon: Camera,
            },
            {
              time: '8:30 PM',
              activity: 'Tapas Dinner',
              description: 'Traditional Spanish tapas and sangria',
              icon: Utensils,
            },
          ],
        },
        {
          day: 8,
          title: "Gaudí's Barcelona",
          image:
            'https://images.unsplash.com/photo-1659075759239-9f20955ca8c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWdyYWRhJTIwZmFtaWxpYSUyMGJhcmNlbG9uYSUyMGdhdWRpfGVufDF8fHx8MTc2NTMxOTM1OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '9:00 AM',
              activity: 'Sagrada Familia',
              description: 'Skip-the-line tour of Gaudí&apos;s masterpiece',
              icon: Camera,
            },
            {
              time: '12:00 PM',
              activity: 'Lunch in Eixample',
              description: 'Modern Catalan cuisine',
              icon: Utensils,
            },
            {
              time: '2:30 PM',
              activity: 'Park Güell',
              description: 'Visit Gaudí&apos;s colorful park with city views',
              icon: Camera,
            },
            {
              time: '5:00 PM',
              activity: 'Casa Batlló',
              description: 'Audio-guided tour of modernist house',
              icon: Camera,
            },
          ],
        },
        {
          day: 9,
          title: 'Beach & Montjuïc',
          image:
            'https://images.unsplash.com/photo-1696941586183-84526dd38c29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJjZWxvbmV0YSUyMGJlYWNoJTIwYmFyY2Vsb25hJTIwc3BhaW58ZW58MXx8fHwxNzY1MzE5MzU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '10:00 AM',
              activity: 'Barceloneta Beach',
              description: 'Relax on Barcelona&apos;s famous beach',
              icon: Camera,
            },
            {
              time: '1:00 PM',
              activity: 'Seafood Lunch',
              description: 'Fresh paella by the beach',
              icon: Utensils,
            },
            {
              time: '3:30 PM',
              activity: 'Montjuïc Castle',
              description: 'Cable car ride and castle visit',
              icon: Camera,
            },
            {
              time: '7:00 PM',
              activity: 'Magic Fountain Show',
              description: 'Evening light and water show',
              icon: Camera,
            },
          ],
        },
        {
          day: 10,
          title: 'Day Trip to Montserrat',
          activities: [
            {
              time: '8:00 AM',
              activity: 'Depart for Montserrat',
              description: 'Scenic train ride to mountain monastery',
              icon: Plane,
            },
            {
              time: '10:30 AM',
              activity: 'Monastery Tour',
              description: 'Visit the Black Madonna and basilica',
              icon: Camera,
            },
            {
              time: '1:00 PM',
              activity: 'Mountain Lunch',
              description: 'Lunch at mountain restaurant',
              icon: Utensils,
            },
            {
              time: '3:00 PM',
              activity: 'Hiking or Cable Car',
              description: 'Enjoy panoramic mountain views',
              icon: Camera,
            },
          ],
        },
        {
          day: 11,
          title: 'Return to Paris',
          activities: [
            {
              time: '10:00 AM',
              activity: 'Flight to Paris',
              description: '2-hour flight back to Paris',
              icon: Plane,
            },
            {
              time: '3:00 PM',
              activity: 'Montmartre District',
              description: 'Explore artistic neighborhood and Sacré-Cœur',
              icon: Camera,
            },
            {
              time: '7:00 PM',
              activity: 'Farewell Dinner',
              description: 'Gourmet French dinner in Montmartre',
              icon: Utensils,
            },
          ],
        },
        {
          day: 12,
          title: 'Paris Shopping & Culture',
          activities: [
            {
              time: '10:00 AM',
              activity: 'Champs-Élysées Shopping',
              description: 'Free time for shopping on famous avenue',
              icon: Camera,
            },
            {
              time: '2:00 PM',
              activity: 'Musée d&apos;Orsay',
              description: 'Impressionist art museum visit',
              icon: Camera,
            },
            {
              time: '6:00 PM',
              activity: 'Optional Cabaret Show',
              description: 'Moulin Rouge or Lido show (additional cost)',
              icon: Camera,
            },
          ],
        },
        {
          day: 13,
          title: 'Free Day in Paris',
          activities: [
            {
              time: 'All Day',
              activity: 'Free Exploration',
              description:
                'Explore Paris at your own pace or take optional tours',
              icon: Clock,
            },
            {
              time: '7:30 PM',
              activity: 'Group Farewell Dinner',
              description: 'Final dinner with all tour members',
              icon: Utensils,
            },
          ],
        },
        {
          day: 14,
          title: 'Departure',
          activities: [
            {
              time: '10:00 AM',
              activity: 'Hotel Check-out',
              description: 'Check out and airport transfer',
              icon: Hotel,
            },
            {
              time: '1:00 PM',
              activity: 'Departure Flight',
              description: 'Return flight to Auckland',
              icon: Plane,
            },
          ],
        },
      ],
      accommodation: [
        {
          name: 'Hotel Le Marais',
          type: '4-Star Boutique Hotel',
          location: 'Latin Quarter, Paris',
          rating: 4,
          amenities: [
            'Free Wi-Fi',
            'Daily breakfast buffet',
            'Concierge service',
            'Air conditioning',
            'Flat-screen TV',
            'Mini bar',
            'Safe',
            'Elevator',
          ],
          images: [
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NjQ1MzczMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
          ],
        },
        {
          name: 'Hotel Roma Centro',
          type: '4-Star City Hotel',
          location: 'Piazza Navona, Rome',
          rating: 4,
          amenities: [
            'Rooftop terrace',
            'Free Wi-Fi',
            'Breakfast included',
            'Bar & restaurant',
            'Air conditioning',
            'Room service',
          ],
          images: [
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21lJTIwaG90ZWwlMjByb29tfGVufDF8fHx8MTc2NDUzNzMxMXww&ixlib=rb-4.1.0&q=80&w=1080',
          ],
        },
        {
          name: 'Hotel Barcelona Gothic',
          type: '4-Star Urban Hotel',
          location: 'Gothic Quarter, Barcelona',
          rating: 4,
          amenities: [
            'Swimming pool',
            'Free Wi-Fi',
            'Breakfast buffet',
            'Fitness center',
            'Spa services',
            'Airport shuttle',
          ],
          images: [
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJjZWxvbmElMjBob3RlbCUyMHJvb218ZW58MXx8fHwxNzY0NTM3MzExfDA&ixlib=rb-4.1.0&q=80&w=1080',
          ],
        },
      ],
      transportation: [
        {
          type: 'International Flight',
          details: 'Round-trip economy class',
          from: 'Auckland, New Zealand',
          to: 'Paris, France',
          duration: '24 hours (with stops)',
        },
        {
          type: 'European Flights',
          details: 'Economy class between cities',
          from: 'Paris',
          to: 'Rome, Barcelona',
          duration: '2 hours each',
        },
        {
          type: 'Private Coach',
          details: 'Air-conditioned coach for day trips',
          from: 'Hotels',
          to: 'Versailles, Montserrat',
          duration: 'Full day excursions',
        },
        {
          type: 'Airport Transfers',
          details: 'Private transfers included',
          from: 'Airports',
          to: 'Hotels in each city',
          duration: '30-60 minutes',
        },
      ],
      activities: [
        {
          name: 'Versailles Day Trip',
          description: 'Guided tour of the palace and Hall of Mirrors',
          duration: 'Full day',
          difficulty: 'Moderate',
          price: 'Included in package',
          image:
            'https://images.unsplash.com/photo-1615107312926-95bd45b53d38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXJzYWlsbGVzJTIwcGFsYWNlJTIwZnJhbmNlfGVufDF8fHx8MTc2NTMxMTE2MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          category: 'Culture',
        },
        {
          name: 'Colosseum Tour',
          description: 'Skip-the-line guided tour of the Colosseum',
          duration: 'Half day',
          difficulty: 'Easy',
          price: 'Included in package',
          image:
            'https://images.unsplash.com/photo-1668882565110-317edcfa0ee0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvc3NldW0lMjByb21lJTIwaXRhbHl8ZW58MXx8fHwxNzY1MjkwMjc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          category: 'History',
        },
        {
          name: 'Sagrada Familia Tour',
          description: 'Skip-the-line tour of Gaudí&apos;s masterpiece',
          duration: 'Half day',
          difficulty: 'Easy',
          price: 'Included in package',
          image:
            'https://images.unsplash.com/photo-1728249960363-13079cc2c6f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWdyYWRhJTIwZmFtaWxpYSUyMGJhcmNlbG9uYXxlbnwxfHx8fDE3NjUzMTkwODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          category: 'Architecture',
        },
      ],
    },
    '3': {
      id: 3,
      name: 'Tokyo Cultural Experience',
      destination: 'Tokyo, Kyoto, Osaka',
      duration: '10 Days / 9 Nights',
      price: 2799,
      image:
        'https://images.unsplash.com/photo-1591194233688-dca69d406068?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGphcGFuJTIwY2l0eXxlbnwxfHx8fDE3NjQ1MjYyNjR8MA&ixlib=rb-4.1.0&q=80&w=1080',
      includes: [
        'Round-trip flights',
        '9 nights accommodation',
        'JR Pass included',
        'Traditional tea ceremony',
        'Sushi making class',
      ],
      type: 'Culture',
      description:
        'Immerse yourself in Japanese culture with this comprehensive tour of Tokyo, Kyoto, and Osaka. Experience ancient traditions, modern technology, delicious cuisine, and breathtaking temples.',
      itinerary: [
        {
          day: 1,
          title: 'Arrival in Tokyo',
          activities: [
            {
              time: '3:00 PM',
              activity: 'Arrive at Narita Airport',
              description:
                'Meet guide and transfer to hotel via Narita Express',
              icon: Plane,
            },
            {
              time: '6:00 PM',
              activity: 'Hotel Check-in',
              description: 'Check into modern hotel in Shinjuku',
              icon: Hotel,
            },
            {
              time: '8:00 PM',
              activity: 'Welcome Dinner',
              description: 'Traditional izakaya dinner with group',
              icon: Utensils,
            },
          ],
        },
        {
          day: 2,
          title: 'Tokyo Highlights',
          activities: [
            {
              time: '9:00 AM',
              activity: 'Senso-ji Temple',
              description: 'Visit Tokyo&apos;s oldest temple in Asakusa',
              icon: Camera,
            },
            {
              time: '12:00 PM',
              activity: 'Lunch in Asakusa',
              description: 'Traditional tempura meal',
              icon: Utensils,
            },
            {
              time: '2:00 PM',
              activity: 'Shibuya Crossing',
              description: 'Experience the world&apos;s busiest intersection',
              icon: Camera,
            },
            {
              time: '4:00 PM',
              activity: 'Meiji Shrine',
              description: 'Peaceful shrine in the heart of Tokyo',
              icon: Camera,
            },
            {
              time: '7:00 PM',
              activity: 'Dinner in Harajuku',
              description: 'Trendy neighborhood dining',
              icon: Utensils,
            },
          ],
        },
        {
          day: 3,
          title: 'Modern Tokyo & Sushi Making',
          activities: [
            {
              time: '10:00 AM',
              activity: 'Tsukiji Outer Market',
              description: 'Fresh seafood and street food tasting',
              icon: Camera,
            },
            {
              time: '1:00 PM',
              activity: 'Sushi Making Class',
              description: 'Learn from a sushi master chef',
              icon: Utensils,
            },
            {
              time: '4:00 PM',
              activity: 'TeamLab Borderless',
              description: 'Digital art museum experience',
              icon: Camera,
            },
            {
              time: '7:00 PM',
              activity: 'Dinner in Ginza',
              description: 'Upscale dining district',
              icon: Utensils,
            },
          ],
        },
        {
          day: 4,
          title: 'Travel to Kyoto',
          activities: [
            {
              time: '9:00 AM',
              activity: 'Shinkansen to Kyoto',
              description: 'Bullet train journey (JR Pass included)',
              icon: Plane,
            },
            {
              time: '12:00 PM',
              activity: 'Arrive in Kyoto',
              description: 'Check into traditional ryokan',
              icon: Hotel,
            },
            {
              time: '3:00 PM',
              activity: 'Fushimi Inari Shrine',
              description: 'Famous thousands of red torii gates',
              icon: Camera,
            },
            {
              time: '7:00 PM',
              activity: 'Kaiseki Dinner',
              description: 'Multi-course traditional Japanese dinner',
              icon: Utensils,
            },
          ],
        },
        {
          day: 5,
          title: 'Kyoto Temples & Tea Ceremony',
          activities: [
            {
              time: '9:00 AM',
              activity: 'Kinkaku-ji (Golden Pavilion)',
              description: 'Iconic golden temple visit',
              icon: Camera,
            },
            {
              time: '11:30 AM',
              activity: 'Traditional Tea Ceremony',
              description: 'Participate in authentic tea ceremony',
              icon: Utensils,
            },
            {
              time: '2:00 PM',
              activity: 'Arashiyama Bamboo Grove',
              description: 'Walk through enchanting bamboo forest',
              icon: Camera,
            },
            {
              time: '4:00 PM',
              activity: 'Tenryu-ji Temple',
              description: 'UNESCO World Heritage zen temple',
              icon: Camera,
            },
          ],
        },
        {
          day: 6,
          title: 'Nara Day Trip',
          activities: [
            {
              time: '9:00 AM',
              activity: 'Train to Nara',
              description: 'Short train ride to ancient capital',
              icon: Plane,
            },
            {
              time: '10:30 AM',
              activity: 'Nara Park & Deer',
              description: 'Feed friendly wild deer',
              icon: Camera,
            },
            {
              time: '12:00 PM',
              activity: 'Lunch in Nara',
              description: 'Local Nara cuisine',
              icon: Utensils,
            },
            {
              time: '2:00 PM',
              activity: 'Todai-ji Temple',
              description: 'Huge bronze Buddha statue',
              icon: Camera,
            },
            {
              time: '5:00 PM',
              activity: 'Return to Kyoto',
              description: 'Evening free for exploration',
              icon: Plane,
            },
          ],
        },
        {
          day: 7,
          title: 'Travel to Osaka',
          activities: [
            {
              time: '10:00 AM',
              activity: 'Train to Osaka',
              description: 'Short journey to Osaka',
              icon: Plane,
            },
            {
              time: '12:00 PM',
              activity: 'Hotel Check-in',
              description: 'Modern hotel in Namba district',
              icon: Hotel,
            },
            {
              time: '2:00 PM',
              activity: 'Osaka Castle',
              description: 'Historic castle and museum',
              icon: Camera,
            },
            {
              time: '6:00 PM',
              activity: 'Dotonbori District',
              description: 'Vibrant entertainment and food district',
              icon: Camera,
            },
            {
              time: '8:00 PM',
              activity: 'Street Food Dinner',
              description: 'Takoyaki and okonomiyaki tasting',
              icon: Utensils,
            },
          ],
        },
        {
          day: 8,
          title: 'Osaka Food & Culture',
          activities: [
            {
              time: '10:00 AM',
              activity: 'Kuromon Market',
              description: 'Osaka&apos;s kitchen - food market tour',
              icon: Camera,
            },
            {
              time: '1:00 PM',
              activity: 'Cooking Class',
              description: 'Learn to make okonomiyaki',
              icon: Utensils,
            },
            {
              time: '4:00 PM',
              activity: 'Umeda Sky Building',
              description: 'Panoramic city views from observation deck',
              icon: Camera,
            },
            {
              time: '7:00 PM',
              activity: 'Farewell Dinner',
              description: 'Kobe beef teppanyaki experience',
              icon: Utensils,
            },
          ],
        },
        {
          day: 9,
          title: 'Return to Tokyo',
          activities: [
            {
              time: '10:00 AM',
              activity: 'Shinkansen to Tokyo',
              description: 'Bullet train back to Tokyo',
              icon: Plane,
            },
            {
              time: '1:00 PM',
              activity: 'Akihabara Shopping',
              description: 'Electronics and anime district',
              icon: Camera,
            },
            {
              time: '4:00 PM',
              activity: 'Tokyo Skytree',
              description: 'Visit observation deck',
              icon: Camera,
            },
            {
              time: '7:00 PM',
              activity: 'Final Night Dinner',
              description: 'Celebratory dinner in Roppongi',
              icon: Utensils,
            },
          ],
        },
        {
          day: 10,
          title: 'Departure',
          activities: [
            {
              time: '11:00 AM',
              activity: 'Hotel Check-out',
              description: 'Check out and airport transfer',
              icon: Hotel,
            },
            {
              time: '2:00 PM',
              activity: 'Departure Flight',
              description: 'Return flight to Auckland',
              icon: Plane,
            },
          ],
        },
      ],
      accommodation: [
        {
          name: 'Shinjuku Urban Hotel',
          type: 'Modern City Hotel',
          location: 'Shinjuku, Tokyo',
          rating: 4,
          amenities: [
            'Free Wi-Fi',
            'Breakfast included',
            'Vending machines',
            'Laundry service',
            'English-speaking staff',
          ],
          images: [
            'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NjQ1MzczMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
          ],
        },
        {
          name: 'Kyoto Traditional Ryokan',
          type: 'Japanese Inn',
          location: 'Gion, Kyoto',
          rating: 5,
          amenities: [
            'Tatami rooms',
            'Futon bedding',
            'Onsen (hot spring bath)',
            'Kaiseki meals',
            'Yukata robes',
            'Tea ceremony room',
          ],
          images: [
            'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXBhbmVzZSUyMHJ5b2thbnxlbnwxfHx8fDE3NjQ1MzczMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
          ],
        },
        {
          name: 'Osaka Business Hotel',
          type: 'Modern Hotel',
          location: 'Namba, Osaka',
          rating: 4,
          amenities: [
            'Free Wi-Fi',
            'Breakfast buffet',
            'Convenience store',
            'Coin laundry',
            'Airport shuttle',
          ],
          images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvc2FrYSUyMGhvdGVsJTIwcm9vbXxlbnwxfHx8fDE3NjQ1MzczMTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
          ],
        },
      ],
      transportation: [
        {
          type: 'International Flight',
          details: 'Round-trip economy class',
          from: 'Auckland, New Zealand',
          to: 'Tokyo, Japan',
          duration: '11 hours direct',
        },
        {
          type: 'JR Pass (7-Day)',
          details: 'Unlimited train travel on JR lines',
          from: 'Tokyo',
          to: 'Kyoto, Osaka, Nara',
          duration: 'Valid for 7 days',
        },
        {
          type: 'Shinkansen Bullet Train',
          details: 'High-speed rail between cities',
          from: 'Tokyo',
          to: 'Kyoto',
          duration: '2.5 hours',
        },
        {
          type: 'Local Trains & Subway',
          details: 'Metro passes for city exploration',
          from: 'Various',
          to: 'City attractions',
          duration: 'Daily use',
        },
      ],
      activities: [
        {
          name: 'Fushimi Inari Shrine Tour',
          description: 'Visit the famous thousands of red torii gates',
          duration: 'Half day',
          difficulty: 'Easy',
          price: 'Included in package',
          image:
            'https://images.unsplash.com/photo-1698618404520-448e68ca083a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXNoaW1pJTIwaW5hcmklMjBzaHJpbmUlMjBreW90b3xlbnwxfHx8fDE3NjUyMjk1OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          category: 'Culture',
        },
        {
          name: 'Kinkaku-ji (Golden Pavilion) Visit',
          description: 'Iconic golden temple visit',
          duration: 'Half day',
          difficulty: 'Easy',
          price: 'Included in package',
          image:
            'https://images.unsplash.com/photo-1607871740538-8253889972e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjBwYXZpbGlvbiUyMGt5b3RvfGVufDF8fHx8MTc2NTMxOTA4NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          category: 'Architecture',
        },
        {
          name: 'Osaka Castle Tour',
          description: 'Historic castle and museum',
          duration: 'Half day',
          difficulty: 'Easy',
          price: 'Included in package',
          image:
            'https://images.unsplash.com/photo-1729848421108-961e90261b60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvc2FrYSUyMGNhc3RsZSUyMGphcGFufGVufDF8fHx8MTc2NTIyOTU5Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          category: 'History',
        },
      ],
    },
  };

  const routeConfigs: Record<
    string,
    {
      title: string;
      stops: RouteStop[];
      mainPath: Coordinates[];
      secondaryPath?: Coordinates[];
      center?: Coordinates;
      zoom?: number;
    }
  > = {
    '1': {
      title: 'New Zealand Adventure Route',
      center: [174.5, -37.8],
      zoom: 5.5,
      stops: [
        {
          name: 'Auckland',
          coords: [174.884, -37.787],
          note: 'Arrival and city exploration',
        },
        {
          name: 'Matamata (Hobbiton)',
          coords: [175.766, -37.819],
          note: 'Movie set tour & Lord of the Rings',
        },
        {
          name: 'Rotorua',
          coords: [176.249, -38.136],
          note: 'Thermal geysers & Māori culture',
        },
        {
          name: 'Queenstown',
          coords: [168.740, -44.942],
          note: 'Adventure sports capital',
        },
        {
          name: 'Milford Sound',
          coords: [167.925, -44.671],
          note: 'Epic fjords & waterfalls',
          isSecondary: true,
        },
        {
          name: 'Arrowtown',
          coords: [168.838, -44.934],
          note: 'Wine country & scenic beauty',
          isSecondary: true,
        },
        {
          name: 'Glenorchy',
          coords: [168.542, -44.733],
          note: 'TSS Earnslaw steamer cruise',
          isSecondary: true,
        },
      ],
      mainPath: [
        [174.884, -37.787],
        [175.766, -37.819],
        [176.249, -38.136],
        [168.740, -44.942],
      ],
      secondaryPath: [
        [168.740, -44.942],
        [167.925, -44.671],
        [168.838, -44.934],
        [168.542, -44.733],
      ],
    },
    '2': {
      title: 'Continental Hop',
      center: [7, 44],
      zoom: 4.2,
      stops: [
        {
          name: 'Paris',
          coords: [2.3522, 48.8566],
          note: 'City tours & museums',
        },
        {
          name: 'Versailles',
          coords: [2.1204, 48.8049],
          note: 'Palace gardens day trip',
          isSecondary: true,
        },
        {
          name: 'Rome',
          coords: [12.4964, 41.9028],
          note: 'Colosseum & Vatican',
        },
        {
          name: 'Barcelona',
          coords: [2.1734, 41.3851],
          note: 'Gaudí architecture finale',
        },
      ],
      mainPath: [
        [2.3522, 48.8566],
        [12.4964, 41.9028],
        [2.1734, 41.3851],
      ],
      secondaryPath: [
        [2.3522, 48.8566],
        [2.1204, 48.8049],
      ],
    },
    '3': {
      title: 'Golden Route',
      center: [136.0, 35.4],
      zoom: 4.8,
      stops: [
        {
          name: 'Tokyo',
          coords: [139.6917, 35.6895],
          note: 'Arrival & neon nights',
        },
        {
          name: 'Hakone',
          coords: [139.0024, 35.2324],
          note: 'Onsen with Mt. Fuji views',
          isSecondary: true,
        },
        {
          name: 'Kyoto',
          coords: [135.7681, 35.0116],
          note: 'Shrines & tea houses',
        },
        {
          name: 'Osaka',
          coords: [135.5022, 34.6937],
          note: 'Street food & nightlife',
        },
        {
          name: 'Nara',
          coords: [135.8049, 34.6851],
          note: 'Deer park day trip',
          isSecondary: true,
        },
      ],
      mainPath: [
        [139.6917, 35.6895],
        [135.7681, 35.0116],
        [135.5022, 34.6937],
      ],
      secondaryPath: [
        [139.6917, 35.6895],
        [139.0024, 35.2324],
        [135.7681, 35.0116],
        [135.8049, 34.6851],
      ],
    },
  };

  const packageData = id ? packagesData[id as string] : null;
  const routeConfig = id ? routeConfigs[id as string] : undefined;

  if (!packageData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="container mx-auto px-4 py-10">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-[80px] font-bold text-gray-800">404</h1>
            <div
              className="mx-auto mb-8 h-100 bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)',
                backgroundSize: 'cover'
              }}
            />

            <div className="-mt-12">
              <h3 className="mb-4 text-5xl font-semibold text-gray-800">
                Look like you&apos;re lost
              </h3>

              <p className="mb-6 text-lg text-gray-600">
                The package you are looking for is not available!
              </p>

              <Button
                onClick={() => router.push('/packages')}
                className="bg-[#39ac31] px-6 py-3 text-white hover:bg-[#2d8c26]"
              >
                Go to Packages
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    toast.success(
      'Booking feature coming soon! Package added to your wishlist.'
    );
  };

  const handleAddToJourneys = async () => {
    if (!userId) {
      toast.error('You must be signed in to save journeys.');
      return;
    }
    setAdding(true);
    try {
      // Save only essential package info for the trip
      await saveTrip(userId, {
        destination: packageData.destination,
        date: new Date().toISOString().slice(0, 10),
        packageId: packageData.id,
        name: packageData.name,
        image: packageData.image,
        duration: packageData.duration,
        price: packageData.price,
        type: packageData.type,
        description: packageData.description,
      });
      toast.success('Package added to your journeys!');
    } catch (err) {
      toast.error('Failed to add to journeys.');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Hero Section with Package Image */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={packageData.image}
          alt={packageData.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

        {/* Back Button */}
        <Button
          variant="outline"
          className="absolute top-24 left-8 border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
          onClick={() => router.push('/packages')}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Packages
        </Button>

        {/* Package Info Overlay */}
        <div className="absolute right-0 bottom-0 left-0 p-8 text-white">
          <div className="mx-auto max-w-7xl">
            <Badge className="mb-4 border-white/30 bg-white/20 backdrop-blur-md">
              {packageData.type}
            </Badge>
            <h1 className="mb-4 text-white">{packageData.name}</h1>
            <div className="mb-4 flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <MapPin className="size-5" />
                <span>{packageData.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-5" />
                <span>{packageData.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="size-5" />
                <span className="text-2xl">${packageData.price}</span>
                <span className="text-sm opacity-80">per person</span>
              </div>
            </div>
            <p className="max-w-3xl text-lg opacity-90">
              {packageData.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Tabs Content */}
          <div className="lg:col-span-2">
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full"
            >
              <TabsList className="mb-8 grid w-full grid-cols-6">
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
                <TabsTrigger value="transportation">Transportation</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>

              {/* Itinerary Tab */}
              <TabsContent value="itinerary" className="space-y-6">
                {packageData.itinerary.map((day, index) => (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                            {day.day}
                          </div>
                          <div>
                            <h3 className="mb-0">{day.title}</h3>
                            <p className="text-sm text-gray-500">
                              Day {day.day}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {day.activities.map((activity, actIndex) => {
                            const Icon = activity.icon;
                            return (
                              <div
                                key={actIndex}
                                className="flex gap-4 border-b pb-4 last:border-b-0 last:pb-0"
                              >
                                <div className="shrink-0">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <Icon className="size-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="mb-1 flex items-center gap-2">
                                    <Clock className="size-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                      {activity.time}
                                    </span>
                                  </div>
                                  <p className="mb-1">{activity.activity}</p>
                                  <p className="text-sm text-gray-600">
                                    {activity.description}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Day Media Gallery */}
                        {day.media && day.media.length > 0 && (
                          <div className="mt-6 border-t pt-6">
                            <div className="mb-4 flex items-center gap-2">
                              <Camera className="size-5 text-blue-600" />
                              <h4 className="mb-0">
                                Photos & Videos of the Day
                              </h4>
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                              {day.media.map((media, mediaIndex) => (
                                <motion.div
                                  key={mediaIndex}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: mediaIndex * 0.1 }}
                                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg"
                                  onClick={() => {
                                    setSelectedMediaArray(day.media || []);
                                    setSelectedMediaIndex(mediaIndex);
                                    setIsViewerOpen(true);
                                  }}
                                >
                                  <img
                                    src={
                                      media.type === 'video'
                                        ? media.thumbnail
                                        : media.url
                                    }
                                    alt={media.caption}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                  {media.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                                        <Play className="ml-1 size-6 text-blue-600" />
                                      </div>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <p className="p-3 text-xs text-white">
                                      {media.caption}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              {/* Accommodation Tab */}
              <TabsContent value="accommodation" className="space-y-6">
                {packageData.accommodation.map((hotel, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-0">
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Hotel Images */}
                          <div className="relative h-64 md:h-auto">
                            <img
                              src={hotel.images[0]}
                              alt={hotel.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Hotel Details */}
                          <div className="p-6">
                            <div className="mb-4 flex items-start justify-between">
                              <div>
                                <h3 className="mb-2">{hotel.name}</h3>
                                <div className="mb-2 flex items-center gap-2 text-gray-600">
                                  <MapPin className="size-4" />
                                  <span className="text-sm">
                                    {hotel.location}
                                  </span>
                                </div>
                                <Badge variant="secondary">{hotel.type}</Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                {[...Array(hotel.rating)].map((_, i) => (
                                  <Check
                                    className="size-4 text-yellow-500"
                                    key={i}
                                  />
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="mb-3">Amenities:</p>
                              <div className="grid grid-cols-2 gap-2">
                                {hotel.amenities.map((amenity, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2 text-sm text-gray-600"
                                  >
                                    <Check className="size-4 text-green-600" />
                                    <span>{amenity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              {/* Transportation Tab */}
              <TabsContent value="transportation" className="space-y-6">
                {packageData.transportation.map((transport, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-black">
                            <Plane className="size-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="mb-2">{transport.type}</h3>
                            <p className="mb-4 text-gray-600">
                              {transport.details}
                            </p>

                            <div className="grid gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3">
                              <div>
                                <p className="mb-1 text-xs text-gray-500">
                                  From
                                </p>
                                <p className="text-sm">{transport.from}</p>
                              </div>
                              <div>
                                <p className="mb-1 text-xs text-gray-500">To</p>
                                <p className="text-sm">{transport.to}</p>
                              </div>
                              <div>
                                <p className="mb-1 text-xs text-gray-500">
                                  Duration
                                </p>
                                <p className="text-sm">{transport.duration}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              {/* Activities Tab */}
              <TabsContent value="activities" className="space-y-6">
                {packageData.activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-0">
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Activity Image or Video */}
                          <div className="relative h-64 md:h-auto">
                            {activity.image.endsWith('.mp4') ? (
                              <video
                                src={activity.image}
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="auto"
                                className="h-full w-full object-cover"
                                onError={(e) => console.error('Video failed to load:', activity.image)}
                              >
                                <source src={activity.image} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <img
                                src={activity.image}
                                alt={activity.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-blue-600 text-white">
                                {activity.category}
                              </Badge>
                            </div>
                          </div>

                          {/* Activity Details */}
                          <div className="p-6">
                            <h3 className="mb-3">{activity.name}</h3>
                            <p className="mb-4 text-gray-600">
                              {activity.description}
                            </p>

                            <div className="mb-4 grid grid-cols-2 gap-4">
                              <div>
                                <div className="mb-1 flex items-center gap-2">
                                  <Clock className="size-4 text-gray-400" />
                                  <p className="text-xs text-gray-500">
                                    Duration
                                  </p>
                                </div>
                                <p className="text-sm">{activity.duration}</p>
                              </div>
                              <div>
                                <div className="mb-1 flex items-center gap-2">
                                  <Activity className="size-4 text-gray-400" />
                                  <p className="text-xs text-gray-500">
                                    Difficulty
                                  </p>
                                </div>
                                <p className="text-sm">{activity.difficulty}</p>
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="mb-1 text-xs text-gray-500">
                                    Price
                                  </p>
                                  <p className="text-sm">{activity.price}</p>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-700"
                                >
                                  Available
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Reviews itemName={packageData.name} />
              </TabsContent>

              {/* Map View Tab */}
              <TabsContent value="map">
                {routeConfig ? (
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="p-6">
                        <RouteMapWidget
                          title={routeConfig.title}
                          stops={routeConfig.stops}
                          mainPath={routeConfig.mainPath}
                          secondaryPath={routeConfig.secondaryPath}
                          center={routeConfig.center}
                          zoom={routeConfig.zoom}
                          height={560}
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <h3 className="mb-4">Places on this route</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {routeConfig.stops.map((s, i) => (
                            <div key={i} className="rounded-lg border bg-white p-4">
                              <p className="font-medium text-gray-900">{s.name}</p>
                              {s.note && (
                                <p className="mt-2 text-sm text-gray-600">{s.note}</p>
                              )}
                              <p className="mt-2 text-xs text-gray-500">Lng/Lat: {s.coords[0].toFixed(4)}, {s.coords[1].toFixed(4)}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-600">No route data available for this package.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto pb-10 scrollbar-hide">
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4">Package Summary</h3>

                  <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span>{packageData.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Destination</span>
                      <span className="text-right text-sm">
                        {packageData.destination}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Package Type</span>
                      <Badge>{packageData.type}</Badge>
                    </div>
                  </div>

                  <div className="mb-6 border-t pt-4">
                    <p className="mb-3 text-sm">What&apos;s Included:</p>
                    <div className="space-y-2">
                      {packageData.includes.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                          <span className="text-sm text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 border-t pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-gray-600">Price per person</span>
                      <span className="text-2xl text-blue-600">
                        ${packageData.price}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      *Prices may vary based on season and availability
                    </p>
                  </div>

                  <Button
                    className="w-full bg-black hover:bg-gray-800"
                    onClick={() => { localStorage.setItem('selectedPackageId', String(packageData.id)); router.push(`/packages/${packageData.id}/book`); }}
                  >
                    Book This Package
                  </Button>

                  <Button
                    variant="secondary"
                    className="mt-3 w-full"
                    onClick={handleAddToJourneys}
                    disabled={adding}
                  >
                    {adding ? 'Adding...' : 'Add to Journeys'}
                  </Button>

                  <Button
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => router.push('/contact')}
                  >
                    Contact Us for Details
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Info Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4">Need Help?</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>
                      Our travel experts are here to help you plan your perfect
                      journey.
                    </p>
                    <div className="flex items-center gap-2">
                      <Users className="size-4" />
                      <span>24/7 Customer Support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="size-4" />
                      <span>Best Price Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="size-4" />
                      <span>Flexible Payment Options</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Media Viewer */}
      <MediaViewer
        media={selectedMediaArray}
        initialIndex={selectedMediaIndex}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
}