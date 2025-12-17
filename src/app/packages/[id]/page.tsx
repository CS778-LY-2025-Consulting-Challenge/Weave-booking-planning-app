'use client';

import MediaViewer from '@/components/MediaViewer';
import Reviews from '@/components/Reviews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  // Package data with comprehensive details
  const packagesData: { [key: string]: PackageData } = {
    '1': {
      id: 1,
      name: 'Tropical Paradise Getaway',
      destination: 'Maldives',
      duration: '7 Days / 6 Nights',
      price: 2499,
      image:
        'https://images.unsplash.com/photo-1551727095-10465ee6b17f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzY0NTE3NjA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      includes: [
        'Round-trip flights',
        '6 nights in 5-star resort',
        'All meals included',
        'Water sports activities',
        'Spa treatment',
      ],
      type: 'Luxury',
      description:
        'Experience the ultimate tropical paradise with pristine beaches, crystal-clear waters, and world-class luxury resorts. This package includes everything you need for an unforgettable Maldivian escape.',
      itinerary: [
        {
          day: 1,
          title: 'Arrival & Resort Check-in',
          image:
            'https://images.unsplash.com/photo-1612856247414-eb30a6cc1d94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHNwZWVkYm9hdCUyMHJlc29ydCUyMGFycml2YWx8ZW58MXx8fHwxNzY1MzE5MzUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '10:00 AM',
              activity: 'Arrival at Malé International Airport',
              description:
                'Meet and greet by our representative at the airport',
              icon: Plane,
            },
            {
              time: '11:30 AM',
              activity: 'Speedboat Transfer to Resort',
              description:
                'Scenic 45-minute speedboat ride to your luxury resort',
              icon: Plane,
            },
            {
              time: '1:00 PM',
              activity: 'Welcome Lunch',
              description:
                'Enjoy a delicious welcome lunch at the resort restaurant',
              icon: Utensils,
            },
            {
              time: '3:00 PM',
              activity: 'Resort Orientation',
              description: 'Tour of resort facilities and water villa check-in',
              icon: Hotel,
            },
            {
              time: '7:00 PM',
              activity: 'Sunset Beach Dinner',
              description: 'Romantic dinner on the beach with ocean views',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1632904103494-b6e083770d2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHJlc29ydCUyMGFycml2YWx8ZW58MXx8fHwxNzY1MzI4NDMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Luxury resort arrival and welcome',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1683964012191-7cd5617e164d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGVlZGJvYXQlMjB0cmFuc2ZlcnxlbnwxfHx8fDE3NjUzMjg0MzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Scenic speedboat transfer to resort',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1698726654908-834d3a5330d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHdhdGVyJTIwdmlsbGF8ZW58MXx8fHwxNzY1MjUzNDY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Your luxurious overwater villa',
            },
            {
              type: 'video',
              url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=165',
              thumbnail:
                'https://images.unsplash.com/photo-1680956987339-38c94dea393f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGRpbm5lciUyMHN1bnNldHxlbnwxfHx8fDE3NjUzMjg0MzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Sunset beach dinner experience',
            },
          ],
        },
        {
          day: 2,
          title: 'Water Sports & Snorkeling',
          image:
            'https://images.unsplash.com/photo-1515931159317-fbb9577f43b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHNub3JrZWxpbmclMjBjb3JhbCUyMHJlZWZ8ZW58MXx8fHwxNzY1MzE5MzUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '8:00 AM',
              activity: 'Breakfast Buffet',
              description: 'International breakfast with ocean views',
              icon: Utensils,
            },
            {
              time: '10:00 AM',
              activity: 'Snorkeling Excursion',
              description:
                'Guided snorkeling tour to explore coral reefs and marine life',
              icon: Camera,
            },
            {
              time: '1:00 PM',
              activity: 'Lunch at Beach Grill',
              description: 'Fresh seafood and grilled specialties',
              icon: Utensils,
            },
            {
              time: '3:00 PM',
              activity: 'Jet Skiing & Kayaking',
              description: 'Complimentary water sports activities',
              icon: Camera,
            },
            {
              time: '7:30 PM',
              activity: 'Dinner at Underwater Restaurant',
              description: 'Unique dining experience surrounded by marine life',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1687708167574-9a9b4eac3a22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bmRlcndhdGVyJTIwc25vcmtlbGluZyUyMGNvcmFsfGVufDF8fHx8MTc2NTMyODQzMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Snorkeling in crystal-clear waters',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1631300692240-8fc67148a4cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGZpc2glMjB1bmRlcndhdGVyfGVufDF8fHx8MTc2NTMyODQzN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Vibrant marine life and coral reefs',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1628432479733-b8b0dcb5df27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXQlMjBza2klMjB3YXRlciUyMHNwb3J0c3xlbnwxfHx8fDE3NjUzMjg0MzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Exciting jet ski adventures',
            },
            {
              type: 'video',
              url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=165',
              thumbnail:
                'https://images.unsplash.com/photo-1762961730096-04ed5efb98f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMGtheWFraW5nJTIwdHJvcGljYWx8ZW58MXx8fHwxNzY1MzI4NDM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Water sports highlights',
            },
          ],
        },
        {
          day: 3,
          title: 'Spa & Relaxation',
          image:
            'https://images.unsplash.com/photo-1633526543913-d30e3c230d1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjBtYXNzYWdlJTIwdHJlYXRtZW50fGVufDF8fHx8MTc2NTMxOTM1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '9:00 AM',
              activity: 'Breakfast in Villa',
              description: 'Private breakfast served in your water villa',
              icon: Utensils,
            },
            {
              time: '11:00 AM',
              activity: 'Couples Spa Treatment',
              description: '90-minute signature massage and facial treatment',
              icon: Hotel,
            },
            {
              time: '2:00 PM',
              activity: 'Poolside Lunch',
              description: 'Light lunch by the infinity pool',
              icon: Utensils,
            },
            {
              time: '4:00 PM',
              activity: 'Free Time',
              description: 'Relax on your private deck or explore the resort',
              icon: Clock,
            },
            {
              time: '7:00 PM',
              activity: 'Asian Fusion Dinner',
              description:
                'Exquisite Asian cuisine at the specialty restaurant',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1633526543913-d30e3c230d1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzcGElMjBtYXNzYWdlfGVufDF8fHx8MTc2NTI4MjUxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Relaxing spa treatments',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1729707690998-1d4c5d755c0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmZpbml0eSUyMHBvb2wlMjByZXNvcnR8ZW58MXx8fHwxNzY1MzI4NDM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Infinity pool with ocean views',
            },
            {
              type: 'video',
              url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=165',
              thumbnail:
                'https://images.unsplash.com/photo-1698726654908-834d3a5330d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHdhdGVyJTIwdmlsbGF8ZW58MXx8fHwxNzY1MjUzNDY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'A day of pure relaxation',
            },
          ],
        },
        {
          day: 4,
          title: 'Island Hopping & Local Culture',
          image:
            'https://images.unsplash.com/photo-1580939758566-aede13d43012?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMGlzbGFuZCUyMGhvcHBpbmclMjBsb2NhbHxlbnwxfHx8fDE3NjUzMTkzNTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '8:30 AM',
              activity: 'Early Breakfast',
              description: 'Quick breakfast before the excursion',
              icon: Utensils,
            },
            {
              time: '9:30 AM',
              activity: 'Island Hopping Tour',
              description:
                'Visit 3 local islands and experience Maldivian culture',
              icon: Camera,
            },
            {
              time: '12:30 PM',
              activity: 'Lunch on Local Island',
              description: 'Authentic Maldivian cuisine at a local restaurant',
              icon: Utensils,
            },
            {
              time: '3:00 PM',
              activity: 'Sandbank Visit',
              description:
                'Relax on a pristine sandbank in the middle of the ocean',
              icon: Camera,
            },
            {
              time: '6:00 PM',
              activity: 'Return to Resort',
              description: 'Speedboat transfer back to your resort',
              icon: Plane,
            },
          ],
          media: [
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1618479357329-14dd10e76f5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGlzbGFuZCUyMGhvcHBpbmd8ZW58MXx8fHwxNzY1MzI4NDMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Exploring local islands',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1759674950524-4dd2aaec63ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW5kYmFuayUyMG1hbGRpdmVzJTIwcHJpc3RpbmV8ZW58MXx8fHwxNzY1MzI4NDM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Pristine sandbank paradise',
            },
            {
              type: 'video',
              url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=165',
              thumbnail:
                'https://images.unsplash.com/photo-1632904103494-b6e083770d2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHJlc29ydCUyMGFycml2YWx8ZW58MXx8fHwxNzY1MzI4NDMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Island hopping adventure',
            },
          ],
        },
        {
          day: 5,
          title: 'Diving & Marine Adventure',
          image:
            'https://images.unsplash.com/photo-1679309075410-2e34cfe133ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY3ViYSUyMGRpdmluZyUyMHVuZGVyd2F0ZXIlMjBvY2VhbnxlbnwxfHx8fDE3NjUyNzMzMjB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '7:30 AM',
              activity: 'Breakfast',
              description: 'Early breakfast at the main restaurant',
              icon: Utensils,
            },
            {
              time: '9:00 AM',
              activity: 'Scuba Diving Experience',
              description:
                'Discover dive for beginners or certified dive for experienced divers',
              icon: Camera,
            },
            {
              time: '12:00 PM',
              activity: 'Lunch Break',
              description: 'Light lunch at the beach bar',
              icon: Utensils,
            },
            {
              time: '2:30 PM',
              activity: 'Dolphin Watching Cruise',
              description: 'Sunset cruise to spot wild dolphins',
              icon: Camera,
            },
            {
              time: '7:00 PM',
              activity: 'BBQ Beach Party',
              description:
                'Grilled seafood and live entertainment on the beach',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1644027621533-633fe3de243a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY3ViYSUyMGRpdmluZyUyMHVuZGVyd2F0ZXJ8ZW58MXx8fHwxNzY1MjcwNTA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Scuba diving adventure',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1520197399711-cb9407f3e551?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2xwaGlucyUyMG9jZWFuJTIwc3dpbW1pbmd8ZW58MXx8fHwxNzY1MzI4NDMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Dolphin watching cruise',
            },
            {
              type: 'video',
              url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=165',
              thumbnail:
                'https://images.unsplash.com/photo-1687708167574-9a9b4eac3a22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bmRlcndhdGVyJTIwc25vcmtlbGluZyUyMGNvcmFsfGVufDF8fHx8MTc2NTMyODQzMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Underwater diving highlights',
            },
          ],
        },
        {
          day: 6,
          title: 'Leisure & Photography',
          image:
            'https://images.unsplash.com/photo-1760669346048-6e6c9db01ca1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHBob3RvZ3JhcGh5JTIwdHJvcGljYWwlMjBjb3VwbGV8ZW58MXx8fHwxNzY1MzE5MzU1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '9:00 AM',
              activity: 'Breakfast',
              description: 'Leisurely breakfast at your preferred venue',
              icon: Utensils,
            },
            {
              time: '11:00 AM',
              activity: 'Professional Photo Session',
              description: 'Complimentary photoshoot at scenic locations',
              icon: Camera,
            },
            {
              time: '1:00 PM',
              activity: 'Farewell Lunch',
              description: 'Special farewell lunch with resort management',
              icon: Utensils,
            },
            {
              time: '3:00 PM',
              activity: 'Free Time & Shopping',
              description: 'Last-minute shopping at resort boutique',
              icon: Clock,
            },
            {
              time: '7:30 PM',
              activity: 'Gala Dinner',
              description: 'Fine dining experience with live music',
              icon: Utensils,
            },
          ],
          media: [
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1617788472008-1e524a74cf25?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMHBob3RvZ3JhcGh5JTIwY291cGxlc3xlbnwxfHx8fDE3NjUzMjg0MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Professional beach photoshoot',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1680956987339-38c94dea393f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGRpbm5lciUyMHN1bnNldHxlbnwxfHx8fDE3NjUzMjg0MzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Romantic gala dinner setup',
            },
            {
              type: 'video',
              url: 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=165',
              thumbnail:
                'https://images.unsplash.com/photo-1729707690998-1d4c5d755c0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmZpbml0eSUyMHBvb2wlMjByZXNvcnR8ZW58MXx8fHwxNzY1MzI4NDM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Leisure day highlights',
            },
          ],
        },
        {
          day: 7,
          title: 'Departure Day',
          image:
            'https://images.unsplash.com/photo-1584535179807-3f4c2c3c738e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwb3J0JTIwZGVwYXJ0dXJlJTIwdHJhdmVsJTIwbHVnZ2FnZXxlbnwxfHx8fDE3NjUzMTkzNTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          activities: [
            {
              time: '8:00 AM',
              activity: 'Breakfast & Check-out',
              description: 'Final breakfast and villa check-out',
              icon: Utensils,
            },
            {
              time: '10:00 AM',
              activity: 'Speedboat Transfer',
              description: 'Transfer to Malé International Airport',
              icon: Plane,
            },
            {
              time: '12:00 PM',
              activity: 'Departure',
              description: 'Flight back home with unforgettable memories',
              icon: Plane,
            },
          ],
          media: [
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1698726654908-834d3a5330d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHdhdGVyJTIwdmlsbGF8ZW58MXx8fHwxNzY1MjUzNDY0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Last morning at the villa',
            },
            {
              type: 'photo',
              url: 'https://images.unsplash.com/photo-1612856247414-eb30a6cc1d94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHNwZWVkYm9hdCUyMHJlc29ydCUyMGFycml2YWx8ZW58MXx8fHwxNzY1MzE5MzUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
              caption: 'Farewell speedboat journey',
            },
          ],
        },
      ],
      accommodation: [
        {
          name: 'Paradise Island Resort & Spa',
          type: 'Overwater Villa',
          location: 'North Malé Atoll',
          rating: 5,
          amenities: [
            'Private infinity pool',
            'Direct ocean access',
            'King-size bed with ocean views',
            'Outdoor bathtub',
            'Personal butler service',
            '24/7 room service',
            'Nespresso machine',
            'Premium toiletries',
            'Free Wi-Fi',
            'Smart TV with Netflix',
          ],
          images: [
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxkaXZlcyUyMHJlc29ydCUyMHZpbGxhfGVufDF8fHx8MTc2NDUzNzMxMXww&ixlib=rb-4.1.0&q=80&w=1080',
            'https://images.unsplash.com/photo-1540541338287-41700207dee6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxtYWxkaXZlcyUyMHJlc29ydCUyMHZpbGxhfGVufDF8fHx8MTc2NDUzNzMxMXww&ixlib=rb-4.1.0&q=80&w=1080',
          ],
        },
      ],
      transportation: [
        {
          type: 'International Flight',
          details: 'Round-trip economy class tickets',
          from: 'Auckland, New Zealand',
          to: 'Malé, Maldives',
          duration: '14 hours (with 1 stop)',
        },
        {
          type: 'Speedboat Transfer',
          details: 'Private speedboat from airport to resort',
          from: 'Malé International Airport',
          to: 'Paradise Island Resort',
          duration: '45 minutes',
        },
        {
          type: 'Island Hopping Boat',
          details: 'Traditional dhoni boat for excursions',
          from: 'Resort',
          to: 'Various local islands',
          duration: 'Full day (8 hours)',
        },
      ],
      activities: [
        {
          name: 'Island Hopping Tour',
          description: 'Visit 3 local islands and experience Maldivian culture',
          duration: 'Full day',
          difficulty: 'Moderate',
          price: 'Included in package',
          image:
            'https://images.unsplash.com/photo-1688263638792-2ede6002db03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGlzbGFuZCUyMGJlYWNofGVufDF8fHx8MTc2NTI4Mjc3M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          category: 'Adventure',
        },
        {
          name: 'Scuba Diving Experience',
          description:
            'Discover dive for beginners or certified dive for experienced divers',
          duration: 'Half day',
          difficulty: 'Advanced',
          price: 'Included in package',
          image:
            'https://images.unsplash.com/photo-1644027621533-633fe3de243a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY3ViYSUyMGRpdmluZyUyMHVuZGVyd2F0ZXJ8ZW58MXx8fHwxNzY1MjcwNTA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          category: 'Adventure',
        },
        {
          name: 'Dolphin Watching Cruise',
          description: 'Sunset cruise to spot wild dolphins',
          duration: 'Half day',
          difficulty: 'Easy',
          price: 'Included in package',
          image:
            'https://images.unsplash.com/photo-1624608708049-53587f652e16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2xwaGluJTIwd2F0Y2hpbmclMjBvY2VhbnxlbnwxfHx8fDE3NjUzMTkwODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
          category: 'Adventure',
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

  const packageData = id ? packagesData[id as string] : null;

  if (!packageData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">Package not found</h2>
          <Button onClick={() => router.push('/packages')}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    toast.success(
      'Booking feature coming soon! Package added to your wishlist.'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Package Image */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={packageData.image}
          alt={packageData.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

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
              <TabsList className="mb-8 grid w-full grid-cols-5">
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                <TabsTrigger value="accommodation">Accommodation</TabsTrigger>
                <TabsTrigger value="transportation">Transportation</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
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
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
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
                                <div className="flex-shrink-0">
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
                                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
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
                          {/* Activity Image */}
                          <div className="relative h-64 md:h-auto">
                            <img
                              src={activity.image}
                              alt={activity.name}
                              className="h-full w-full object-cover"
                            />
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
            </Tabs>
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
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
                          <Check className="mt-0.5 size-4 flex-shrink-0 text-green-600" />
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
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={handleBookNow}
                  >
                    Book This Package
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
              <Card className="mt-6">
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
