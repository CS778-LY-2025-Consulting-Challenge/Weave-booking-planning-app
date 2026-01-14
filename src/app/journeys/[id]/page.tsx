'use client';

import { Image360Viewer } from '@/components/Image360Viewer';
import {
  BookFlip,
  BookFlipRef,
} from '@/components/BookFlip';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Compass,
  Copy,
  Download,
  Eye,
  Heart,
  MapPin,
  Play,
  Star,
  X,
  BookOpen,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import JourneyBookingFlow from '@/components/JourneyBookingFlow';

export default function JourneyDetails() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentDay, setCurrentDay] = useState(0);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>(
    'forward'
  );
  const [selectedMedia, setSelectedMedia] = useState<{
    type: '360' | 'video';
    url: string;
    title: string;
  } | null>(null);
  const pageFlipRef = useRef<BookFlipRef>(null);
  const autoOpenHandled = useRef(false);

  // Per-journey data keyed by URL id
  const journeysData: Record<string, any> = {
    '1': {
      id: 1,
      title: 'New Zealand Explorer',
      author: 'James T.',
      destination: 'New Zealand',
      season: 'Spring',
      duration: '18 Days',
      coverImage:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080',
      days: [
        {
          day: 1,
          date: 'Sep 15',
          year: '2024',
          title: 'Arrival in Aotearoa',
          mood: '✨ Inspired',
          weather: '☀️ 18°C',
          entry:
            'Landed in Auckland and immediately felt the Southern Hemisphere magic. Drove south towards the Waitomo Caves and stayed in a luxury lodge overlooking pastoral farmland. First glimpse of the incredible landscapes that define New Zealand.',
          highlights: [
            '✈️ Auckland arrival',
            '🏨 Luxury lodge check-in',
            '🌄 Pastoral landscapes',
            '🌅 Southern sunset',
          ],
          images: [
            { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Mount Cook vista' },
            { url: '/images/new-zealand-1.jpg', caption: 'Aotearoa landscapes' },
            { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', caption: 'Pastoral farmland' },
          ],
          videos: [
            { url: '/images/new zealand video.mp4', caption: 'New Zealand intro', thumbnail: '/images/new zealand.jpg' },
          ],
          video360Url: 'https://cloudflare1.360gigapixels.com/pano/milanrademakers/01906841_DSC-1437-Panorama-jpg/equirect_crop_3_1/6.jpg',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
        {
          day: 2,
          date: 'Sep 18',
          year: '2024',
          title: 'Milford Sound Magnificence',
          mood: '🌊 Awed',
          weather: '⛅ 16°C',
          entry:
            'Cruised through Milford Sound where waterfalls cascade directly into the fjord and rainforests meet the sea. Watched dolphins and seals from the ship. Pure sublime beauty.',
          highlights: [
            '🚢 Milford Sound cruise',
            '🐬 Dolphin & seal encounters',
            '💧 Towering waterfalls',
            '🌲 Rainforest scenery',
          ],
          images: [
            { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Milford Sound' },
            { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', caption: 'Fjord waterfalls' },
            { url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800', caption: 'Sea wildlife' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/T-CKuPM94CU', caption: 'Milford Sound journey', thumbnail: 'https://img.youtube.com/vi/T-CKuPM94CU/hqdefault.jpg' },
          ],
          video360Url: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Soissons_Cathedral_Interior_360x180%2C_Picardy%2C_France_-_Diliff.jpg',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
        {
          day: 3,
          date: 'Sep 21',
          year: '2024',
          title: 'Queenstown Adventure',
          mood: '🎯 Exhilarated',
          weather: '🌤️ 17°C',
          entry:
            'Adventure capital of the world. Did a thrilling jetboat ride through narrow canyons, then took the Skyline gondola for panoramic alpine views of Lake Wakatipu.',
          highlights: ['🚤 Jetboat adventure', '🚡 Skyline gondola', '🏔️ Alpine vistas'],
          images: [
            { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Queenstown heights' },
            { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800', caption: 'Lake Wakatipu' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/JJFVM7A_fAk', caption: 'Queenstown thrills', thumbnail: 'https://img.youtube.com/vi/JJFVM7A_fAk/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/KudedLV0tP0',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
      ],
    },
    '2': {
      id: 2,
      title: 'Bali Adventure',
      author: 'Sarah M.',
      destination: 'Bali, Indonesia',
      season: 'Summer',
      duration: '10 Days',
      coverImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1080',
      days: [
        {
          day: 1,
          date: 'Jun 5',
          year: '2024',
          title: 'Arrival in Paradise',
          mood: '🌴 Serene',
          weather: '☀️ 28°C',
          entry: 'Landed in Ubud, where rice paddies stretch endlessly and the air smells of incense and frangipani. Checked into a traditional villa with infinity pool overlooking the jungle.',
          highlights: ['✈️ Ubud arrival', '🏘️ Traditional villa', '🌾 Rice paddies', '🌸 Jungle retreat'],
          images: [
            { url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800', caption: 'Bali landscape' },
            { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Rice terraces' },
            { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', caption: 'Villa view' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/8A7E7mFd7Q8', caption: 'Bali intro', thumbnail: 'https://img.youtube.com/vi/8A7E7mFd7Q8/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/F8qYHT-LhLQ',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
        {
          day: 2,
          date: 'Jun 8',
          year: '2024',
          title: 'Temple Rituals & Spiritual Awakening',
          mood: '🙏 Transcendent',
          weather: '☀️ 26°C',
          entry: 'Joined a dawn ceremony at Pura Tanah Lot, perched on dramatic sea cliffs. Watched monks chant while incense curled into the morning light. The spiritual energy here is undeniable.',
          highlights: ['⛩️ Pura Tanah Lot', '🙏 Sacred ceremony', '🌅 Sunrise ritual', '🕯️ Incense blessing'],
          images: [
            { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', caption: 'Temple at sunrise' },
            { url: 'https://images.unsplash.com/photo-1516026122158-f21d14e0c06b?w=800', caption: 'Spiritual ceremony' },
            { url: 'https://images.unsplash.com/photo-1520763185298-1b434c919abe?w=800', caption: 'Bali coastline' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/MJq3Jz8FBzQ', caption: 'Temple ceremony', thumbnail: 'https://img.youtube.com/vi/MJq3Jz8FBzQ/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/tCPO7k8MR_8',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
        {
          day: 3,
          date: 'Jun 11',
          year: '2024',
          title: 'Cenote Diving & Underwater Wonder',
          mood: '🤿 Enchanted',
          weather: '☀️ 29°C',
          entry: 'Dove into pristine cenotes where visibility stretched forever. Schools of tropical fish glided past ancient rock formations. Pure magic beneath the surface.',
          highlights: ['🤿 Cenote diving', '🐠 Tropical fish', '💎 Crystal waters', '🌊 Underwater paradise'],
          images: [
            { url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800', caption: 'Cenote waters' },
            { url: 'https://images.unsplash.com/photo-1583080001130-d0e4e6bac54d?w=800', caption: 'Diving adventure' },
            { url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800', caption: 'Reef life' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/OXEVfGbvFss', caption: 'Cenote dive', thumbnail: 'https://img.youtube.com/vi/OXEVfGbvFss/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/E7HjQRQqX84',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
      ],
    },
    '3': {
      id: 3,
      title: 'European Grand Tour',
      author: 'Mike R.',
      destination: 'Paris, Rome, Barcelona',
      season: 'Spring',
      duration: '21 Days',
      coverImage: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?w=1080',
      days: [
        {
          day: 1,
          date: 'Apr 10',
          year: '2024',
          title: 'Paris Beginnings',
          mood: '🎨 Inspired',
          weather: '🌤️ 16°C',
          entry: 'Croissants, Louvre highlights, and sunset under the Eiffel Tower.',
          highlights: ['🖼️ Louvre', '🗼 Eiffel at dusk'],
          images: [
            { url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', caption: 'Eiffel Tower' },
            { url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800', caption: 'Paris by night' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/1xpNQWvA8bY', caption: 'Paris day one', thumbnail: 'https://img.youtube.com/vi/1xpNQWvA8bY/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/NMSVQWJv5v8',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
        {
          day: 2,
          date: 'Apr 14',
          year: '2024',
          title: 'Rome Classics',
          mood: '🏛️ Awe',
          weather: '☀️ 19°C',
          entry: 'Colosseum tour and gelato near Trevi Fountain.',
          highlights: ['🏟️ Colosseum', '🍨 Gelato'],
          images: [
            { url: 'https://images.unsplash.com/photo-1526481280698-9971f61ea6df?w=800', caption: 'Colosseum' },
            { url: 'https://images.unsplash.com/photo-1526158830729-3e97553d61a1?w=800', caption: 'Trevi Fountain' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/aqUz5UeTz6U', caption: 'Rome tour', thumbnail: 'https://img.youtube.com/vi/aqUz5UeTz6U/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/qXlhFJXqYcQ',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
        {
          day: 3,
          date: 'Apr 18',
          year: '2024',
          title: 'Barcelona Vibes',
          mood: '🎶 Joyful',
          weather: '🌤️ 18°C',
          entry: 'La Sagrada Família and tapas crawl in El Born.',
          highlights: ['⛪ Sagrada Família', '🍤 Tapas'],
          images: [
            { url: 'https://images.unsplash.com/photo-1583422095309-55daabc9cc78?w=800', caption: 'Barcelona streets' },
            { url: 'https://images.unsplash.com/photo-1495596871513-3d9d7770e26f?w=800', caption: 'Tapas plates' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/39n0W5mE9Uo', caption: 'Barcelona walk', thumbnail: 'https://img.youtube.com/vi/39n0W5mE9Uo/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/3q6rZbKQy0Q',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
      ],
    },
    '4': {
      id: 4,
      title: 'Mountain Trekking Nepal',
      author: 'Emma K.',
      destination: 'Himalayas, Nepal',
      season: 'Autumn',
      duration: '14 Days',
      coverImage: 'https://images.unsplash.com/photo-1669986480140-2c90b8edb443?w=1080',
      days: [
        {
          day: 1,
          date: 'Oct 3',
          year: '2024',
          title: 'Kathmandu Prep',
          mood: '🎒 Ready',
          weather: '☁️ 22°C',
          entry: 'Gear check and permits in Thamel. Dal bhat fuel!',
          highlights: ['📝 Permits', '🍛 Dal bhat'],
          images: [
            { url: 'https://images.unsplash.com/photo-1543269865-0a740d43b87c?w=800', caption: 'Thamel' },
            { url: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800', caption: 'Gear prep' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/3nQNiWdeH2Q', caption: 'Kathmandu streets', thumbnail: 'https://img.youtube.com/vi/3nQNiWdeH2Q/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/6qT4gFhyxKg',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
        {
          day: 2,
          date: 'Oct 6',
          year: '2024',
          title: 'Trail to Namche',
          mood: '🥾 Determined',
          weather: '☀️ 12°C',
          entry: 'Crossed suspension bridges with epic river views.',
          highlights: ['🌉 Bridges', '🏔️ First snow peaks'],
          images: [
            { url: 'https://images.unsplash.com/photo-1518684079-a6b6f8b4a1b5?w=800', caption: 'Trail' },
            { url: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800', caption: 'Suspension bridge' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/5qap5aO4i9A', caption: 'On the trail', thumbnail: 'https://img.youtube.com/vi/5qap5aO4i9A/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/8Z1eMy1kYfQ',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
        {
          day: 3,
          date: 'Oct 10',
          year: '2024',
          title: 'Namche Acclimatization',
          mood: '🧘 Calm',
          weather: '☀️ 8°C',
          entry: 'Short hike to viewpoint; tea with mountain vistas.',
          highlights: ['🍵 Tea house', '🔭 Viewpoint'],
          images: [
            { url: 'https://images.unsplash.com/photo-1509644851169-2accbc0fef29?w=800', caption: 'Vistas' },
            { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', caption: 'Tea house' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/ylACwZ9h6tE', caption: 'Mountain views', thumbnail: 'https://img.youtube.com/vi/ylACwZ9h6tE/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/Q8kqQf2rFhA',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
      ],
    },
    '5': {
      id: 5,
      title: 'Tokyo Food Tour',
      author: 'David L.',
      destination: 'Tokyo, Japan',
      season: 'Spring',
      duration: '7 Days',
      coverImage: 'https://images.unsplash.com/photo-1591194233688-dca69d406068?w=1080',
      days: [
        {
          day: 1,
          date: 'Mar 21',
          year: '2024',
          title: 'Tsukiji Morning',
          mood: '🍣 Hungry',
          weather: '⛅ 14°C',
          entry: 'Fresh sushi breakfast and wagyu skewers.',
          highlights: ['🍣 Sushi', '🥩 Wagyu skewers'],
          images: [
            { url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800', caption: 'Sushi counter' },
            { url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800', caption: 'Tokyo food' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/HIcSWuKMwOw', caption: 'Market walk', thumbnail: 'https://img.youtube.com/vi/HIcSWuKMwOw/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/8k-7lFZrKf8',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
        {
          day: 2,
          date: 'Mar 23',
          year: '2024',
          title: 'Shibuya & Ramen',
          mood: '🍜 Cozy',
          weather: '🌧️ 12°C',
          entry: 'Ramen tasting and a stroll through Shibuya Crossing.',
          highlights: ['🍜 Ramen', '🚦 Shibuya'],
          images: [
            { url: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=800', caption: 'Ramen bowl' },
            { url: 'https://images.unsplash.com/photo-1533055640609-24b498cdf77a?w=800', caption: 'Shibuya lights' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/2Vv-BfVoq4g', caption: 'Shibuya time-lapse', thumbnail: 'https://img.youtube.com/vi/2Vv-BfVoq4g/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/6IYwWoWZ3xI',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
      ],
    },
    '6': {
      id: 6,
      title: 'Greek Island Hopping',
      author: 'Lisa P.',
      destination: 'Greek Islands',
      season: 'Summer',
      duration: '12 Days',
      coverImage: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=1080',
      days: [
        {
          day: 1,
          date: 'Jul 8',
          year: '2024',
          title: 'Santorini Blue',
          mood: '💙 Calm',
          weather: '☀️ 28°C',
          entry: 'Whitewashed alleys and caldera views.',
          highlights: ['🏛️ Oia', '🌅 Caldera sunset'],
          images: [
            { url: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800', caption: 'Santorini' },
            { url: 'https://images.unsplash.com/photo-1526481280698-9971f61ea6df?w=800', caption: 'Island streets' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/8ZcmTl_1ER8', caption: 'Santorini drone', thumbnail: 'https://img.youtube.com/vi/8ZcmTl_1ER8/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/gDbAq4R0t1s',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
        {
          day: 2,
          date: 'Jul 11',
          year: '2024',
          title: 'Mykonos Wind',
          mood: '🎉 Lively',
          weather: '☀️ 30°C',
          entry: 'Windmills, beach clubs, and sundowners.',
          highlights: ['🌬️ Windmills', '🏖️ Beach time'],
          images: [
            { url: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800', caption: 'Beach' },
            { url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800', caption: 'Sunset' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/W4N-7cP8LQw', caption: 'Mykonos highlights', thumbnail: 'https://img.youtube.com/vi/W4N-7cP8LQw/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/Tm1wG2JkK8o',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
      ],
    },
    '7': {
      id: 7,
      title: 'New York City Explorer',
      author: 'Tom W.',
      destination: 'New York, USA',
      season: 'Fall',
      duration: '5 Days',
      coverImage: 'https://images.unsplash.com/photo-1543716091-a840c05249ec?w=1080',
      days: [
        {
          day: 1,
          date: 'Oct 2',
          year: '2024',
          title: 'Midtown Marvels',
          mood: '🗽 Ecstatic',
          weather: '🍂 15°C',
          entry: 'Times Square lights and a Broadway show.',
          highlights: ['🎭 Broadway', '🏙️ Times Square'],
          images: [
            { url: 'https://images.unsplash.com/photo-1543716091-a840c05249ec?w=800', caption: 'Times Square' },
            { url: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=800', caption: 'City lights' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/EXeTwQWrcwY', caption: 'Broadway night', thumbnail: 'https://img.youtube.com/vi/EXeTwQWrcwY/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/ibdO1EoBsCk',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
        {
          day: 2,
          date: 'Oct 3',
          year: '2024',
          title: 'Central Park & Museums',
          mood: '🍁 Serene',
          weather: '☀️ 17°C',
          entry: 'Rowboats, fall colors, and Met masterpieces.',
          highlights: ['🚣 Rowboats', '🎨 The Met'],
          images: [
            { url: 'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?w=800', caption: 'Central Park' },
            { url: 'https://images.unsplash.com/photo-1526158830729-3e97553d61a1?w=800', caption: 'Museum steps' },
          ],
          videos: [
            { url: 'https://www.youtube.com/embed/hTWKbfoikeg', caption: 'Park walk', thumbnail: 'https://img.youtube.com/vi/hTWKbfoikeg/hqdefault.jpg' },
          ],
          video360Url: 'https://www.youtube.com/embed/lXpgw9nZpy8',
          has360: true,
          isAirPano: true,
          airPanoUrl: 'https://www.airpano.com/embed.php?3D=fiordland-new-zealand',
        },
      ],
    },
  };

  const journey = useMemo(
    () => journeysData[(id as string) || '1'] ?? journeysData['1'],
    [id]
  );

  useEffect(() => {
    if (!journey || autoOpenHandled.current) return;

    const mediaType = searchParams.get('media');
    const requestedDay = Math.max(
      0,
      Math.min(
        (Number(searchParams.get('day')) || 1) - 1,
        journey.days.length - 1
      )
    );

    if (mediaType === '360') {
      autoOpenHandled.current = true;
      setIsBookOpen(true);
      setCurrentDay(requestedDay);
      pageFlipRef.current?.turnToPage(requestedDay * 2);

      const targetDay = journey.days[requestedDay];
      if (targetDay?.has360 && targetDay.video360Url) {
        setSelectedMedia({
          type: '360',
          url: targetDay.video360Url,
          title: targetDay.title,
        });
      }
    }
  }, [journey, searchParams]);

  const handleCopyJourney = () => {
    alert('Journey copied to your dashboard! You can now customize it.');
    router.push('/dashboard');
  };

  const handleDownloadPDF = () => {
    alert('PDF download started! Your itinerary will be downloaded shortly.');
  };

  const handleNextDay = () => {
    const totalPages = journey.days.length * 2;
    if (currentDay < totalPages - 2 && !isFlipping) {
      pageFlipRef.current?.flipNext();
    }
  };

  const handlePrevDay = () => {
    if (currentDay > 0 && !isFlipping) {
      pageFlipRef.current?.flipPrev();
    }
  };

  const handleFlip = (e: unknown) => {
    const event = e as { data: number };
    setCurrentDay(event.data);
  };

  const handleOpenMedia = (
    type: '360' | 'video',
    url: string,
    title: string
  ) => {
    setSelectedMedia({ type, url, title });
  };

  const currentDayData = journey.days[currentDay];

  if (!isBookOpen) {
    // Closed Book Cover - 3D Perspective
    return (
      <div className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 p-8 pt-24">
        <Button
          variant="ghost"
          className="absolute top-6 left-6 z-50 text-white hover:bg-white/10"
          onClick={() => router.push('/journeys')}
        >
          <ChevronLeft className="mr-2 size-4" />
          Back to Journeys
        </Button>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          className="perspective-1000 relative"
          style={{ perspective: '1000px' }}
        >
          {/* 3D Book */}
          <motion.div
            whileHover={{ scale: 1.05, rotateY: 5 }}
            onClick={() => setIsBookOpen(true)}
            className="relative cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Book Container */}
            <div
              className="relative h-[700px] w-[500px]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Book Spine (3D side) */}
              <div
                className="absolute top-0 left-0 h-full w-16 rounded-l-xl bg-gradient-to-r from-amber-900 to-amber-800"
                style={{
                  transform: 'rotateY(-15deg)',
                  transformOrigin: 'right',
                  boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.5)',
                }}
              />

              {/* Book Front Cover */}
              <div
                className="absolute top-0 left-0 h-full w-full overflow-hidden rounded-r-2xl shadow-2xl"
                style={{
                  background:
                    'linear-gradient(135deg, #1a1410 0%, #3d2817 50%, #2d1f12 100%)',
                  boxShadow:
                    '20px 20px 60px rgba(0,0,0,0.8), -10px 0 30px rgba(0,0,0,0.5)',
                }}
              >
                {/* Leather Texture */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
                  }}
                />

                {/* Decorative Border */}
                <div className="absolute inset-8 rounded-lg border-2 border-amber-500/30" />
                <div className="absolute inset-10 border border-amber-500/20" />

                {/* Content */}
                <div className="relative flex h-full flex-col items-center justify-center p-12 text-center">
                  <motion.div
                    animate={{
                      textShadow: [
                        '0 0 20px rgba(251, 191, 36, 0.3)',
                        '0 0 40px rgba(251, 191, 36, 0.5)',
                        '0 0 20px rgba(251, 191, 36, 0.3)',
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <MapPin
                      className="mx-auto mb-8 size-20 text-amber-400"
                      strokeWidth={1.5}
                    />

                    <h1
                      className="mb-6 text-6xl text-amber-400"
                      style={{
                        fontFamily: 'Playfair Display, serif',
                        textShadow:
                          '3px 3px 6px rgba(0,0,0,0.8), 0 0 30px rgba(251, 191, 36, 0.4)',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {journey.title}
                    </h1>

                    <div className="mx-auto mb-6 h-0.5 w-40 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

                    <p
                      className="mb-4 text-2xl text-amber-400/90"
                      style={{
                        fontFamily: 'Playfair Display, serif',
                        letterSpacing: '0.1em',
                      }}
                    >
                      {journey.destination}
                    </p>

                    <p className="mb-2 text-sm tracking-[0.3em] text-amber-400/70 uppercase">
                      {journey.duration}
                    </p>
                    <p className="text-xs tracking-[0.3em] text-amber-400/60 uppercase">
                      by {journey.author}
                    </p>
                  </motion.div>

                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-12 flex items-center gap-2 text-sm tracking-widest text-amber-400/70"
                  >
                    <span>Click to Open</span>
                    <ChevronRight className="size-4" />
                  </motion.div>
                </div>

                {/* Gold Corner Decorations */}
                <div className="absolute top-6 left-6 h-12 w-12 border-t-2 border-l-2 border-amber-500/50" />
                <div className="absolute top-6 right-6 h-12 w-12 border-t-2 border-r-2 border-amber-500/50" />
                <div className="absolute bottom-6 left-6 h-12 w-12 border-b-2 border-l-2 border-amber-500/50" />
                <div className="absolute right-6 bottom-6 h-12 w-12 border-r-2 border-b-2 border-amber-500/50" />
              </div>

              {/* Page edges (3D effect) */}
              <div
                className="absolute top-2 right-3 h-full w-full rounded-r-xl bg-yellow-50 opacity-80"
                style={{
                  transform: 'translateX(-6px) translateZ(-2px)',
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
                }}
              />
              <div
                className="absolute top-1 right-2 h-full w-full rounded-r-xl bg-yellow-50 opacity-60"
                style={{
                  transform: 'translateX(-3px) translateZ(-1px)',
                  boxShadow: '1px 1px 3px rgba(0,0,0,0.2)',
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Open Book View - Diary Style
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-32 pt-40"
      style={{
        background:
          'radial-gradient(ellipse at center, #E5DCC8 0%, #D4C5B0 50%, #B8AA96 100%)',
      }}
    >
      {/* Ambient light effects */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-amber-200/20 blur-3xl" />
      <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-blue-200/20 blur-3xl" />

      {/* Header Controls - Fixed at top, non-overlapping */}
      <div className="fixed top-20 right-0 left-0 z-[60] flex items-center justify-center px-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/journeys')}
          className="absolute left-8 border border-slate-200/50 text-slate-800 backdrop-blur-sm hover:bg-white/50"
        >
          <X className="mr-2 size-5" />
          Close
        </Button>
      </div>

      {/* Page Navigation Buttons - Large & Visible */}
      <Button
        variant="ghost"
        onClick={handlePrevDay}
        disabled={currentDay === 0 || isFlipping}
        className="fixed top-1/2 left-8 z-50 h-16 w-16 -translate-y-1/2 rounded-full bg-white/90 shadow-xl backdrop-blur-sm transition-all hover:scale-110 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft className="size-8 text-slate-700" />
      </Button>

      <Button
        variant="ghost"
        onClick={handleNextDay}
        disabled={currentDay === journey.days.length - 1 || isFlipping}
        className="fixed top-1/2 right-8 z-50 h-16 w-16 -translate-y-1/2 rounded-full bg-white/90 shadow-xl backdrop-blur-sm transition-all hover:scale-110 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight className="size-8 text-slate-700" />
      </Button>

      {/* Book Container */}
      <div className="w-full max-w-7xl" style={{ perspective: '3000px' }}>
        <motion.div
          className="relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Open Book Pages */}
          <div
            className="relative mx-auto overflow-hidden rounded-2xl bg-white"
            style={{
              width: '1400px',
              maxWidth: '90vw',
              height: '800px',
              boxShadow:
                '0 50px 100px -20px rgba(0,0,0,0.5), 0 30px 60px -30px rgba(0,0,0,0.4)',
            }}
          >
            {/* Page Content with SMOOTH Flip Animation */}
            <div
              className="relative h-full w-full"
              style={{ perspective: '3000px' }}
            >
              <BookFlip
                ref={pageFlipRef}
                width={700}
                height={800}
                size="stretch"
                minWidth={300}
                maxWidth={700}
                minHeight={400}
                maxHeight={900}
                showCover={false}
                usePortrait={false}
                mobileScrollSupport={true}
                drawShadow={true}
                flippingTime={800}
                maxShadowOpacity={0.5}
                onFlip={handleFlip}
                className="h-full w-full"
                style={{ background: '#FFFEF9' }}
              >
                {journey.days.flatMap((dayData) => [
                  /* LEFT PAGE - Diary Entry */
                  <div
                    key={`diary-${dayData.day}`}
                    data-density="soft"
                    className="relative h-full overflow-y-auto overscroll-contain bg-[#FFFEF9]"
                    style={{
                      backgroundColor: '#FFFEF9',
                    }}
                  >
                    {/* Notebook lines texture */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.08]"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(0deg, transparent, transparent 31px, #94a3b8 31px, #94a3b8 32px)',
                      }}
                    />

                    {/* Red margin line */}
                    <div className="absolute top-0 bottom-0 left-16 w-[2px] bg-red-300/40" />

                    {/* Scrollable content */}
                    <div className="relative p-12 pr-8 pl-20">
                      {/* Date header - handwritten style */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                      >
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p
                              className="mb-1 text-3xl text-slate-800"
                              style={{ fontFamily: 'Caveat, cursive' }}
                            >
                              {dayData.date}, {dayData.year}
                            </p>
                            <p className="text-sm text-slate-500">
                              Day {dayData.day} of {journey.days.length}
                            </p>
                          </div>

                          {/* Mood & Weather stamps */}
                          <div className="flex gap-2">
                            <div className="rotate-2 rounded-lg border-2 border-yellow-300 bg-yellow-100 px-3 py-1 shadow-sm">
                              <p className="text-sm">{dayData.mood}</p>
                            </div>
                            <div className="-rotate-2 rounded-lg border-2 border-blue-300 bg-blue-100 px-3 py-1 shadow-sm">
                              <p className="text-sm">{dayData.weather}</p>
                            </div>
                          </div>
                        </div>

                        {/* Title - handwritten */}
                        <h1
                          className="mb-4 text-5xl text-slate-900"
                          style={{ fontFamily: 'Caveat, cursive' }}
                        >
                          {dayData.title}
                        </h1>

                        {/* Decorative doodle line */}
                        <div className="mb-6 flex items-center gap-2">
                          <Heart className="size-4 fill-red-400 text-red-400" />
                          <div className="h-px flex-1 bg-gradient-to-r from-slate-300 via-slate-200 to-transparent" />
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                        </div>
                      </motion.div>

                      {/* Diary Entry - handwritten style */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-8"
                      >
                        <p
                          className="text-xl leading-relaxed whitespace-pre-line text-slate-700"
                          style={{ fontFamily: 'Caveat, cursive' }}
                        >
                          {dayData.entry}
                        </p>
                      </motion.div>

                      {/* Highlights List - Bullet Journal Style */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="mb-8"
                      >
                        <h3
                          className="mb-4 flex items-center gap-2 text-2xl text-slate-800"
                          style={{ fontFamily: 'Caveat, cursive' }}
                        >
                          <Star className="size-5 fill-amber-500 text-amber-500" />
                          Today&apos;s Highlights
                        </h3>
                        <div className="space-y-2">
                          {dayData.highlights.map((highlight, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.7 + index * 0.1 }}
                              className="flex items-start gap-3"
                            >
                              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
                              <p
                                className="text-lg text-slate-600"
                                style={{ fontFamily: 'Caveat, cursive' }}
                              >
                                {highlight}
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>

                      {/* 360 View Button */}
                      {dayData.has360 && (
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 }}
                          onClick={() =>
                            handleOpenMedia(
                              '360',
                              dayData.video360Url,
                              dayData.title
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                        >
                          <Eye className="size-5" />
                          <span className="text-sm tracking-wide">
                            View 360° Experience
                          </span>
                        </motion.button>
                      )}

                      {/* Decorative coffee stain */}
                      <div className="absolute right-12 bottom-20 h-16 w-16 rounded-full bg-amber-900/10 blur-sm" />
                    </div>
                  </div>,

                  /* RIGHT PAGE - Photo Gallery */
                  <div
                    key={`photo-${dayData.day}`}
                    data-density="soft"
                    className="relative h-full overflow-y-auto overscroll-contain bg-[#FBF8F1]"
                    style={{
                      backgroundColor: '#FBF8F1',
                    }}
                  >
                    {/* Notebook lines texture */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.08]"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(0deg, transparent, transparent 31px, #94a3b8 31px, #94a3b8 32px)',
                      }}
                    />

                    {/* Scrollable photo content */}
                    <div className="relative p-12">
                      {/* Polaroid-style photo grid */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-6"
                      >
                        {dayData.images.map((image, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, rotate: 0, y: 20 }}
                            animate={{
                              opacity: 1,
                              rotate: index % 2 === 0 ? 2 : -2,
                              y: 0,
                            }}
                            transition={{ delay: 0.5 + index * 0.2 }}
                            whileHover={{
                              rotate: 0,
                              scale: 1.02,
                              zIndex: 10,
                            }}
                            className={`relative cursor-pointer bg-white p-3 shadow-xl ${
                              index % 2 === 0 ? 'mr-12' : 'ml-12'
                            }`}
                            style={{
                              boxShadow:
                                '0 10px 30px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1)',
                            }}
                          >
                            {/* Polaroid photo */}
                            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                              <img
                                src={image.url}
                                alt={image.caption}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            {/* Polaroid caption - handwritten */}
                            <p
                              className="mt-3 text-center text-lg text-slate-600"
                              style={{ fontFamily: 'Caveat, cursive' }}
                            >
                              {image.caption}
                            </p>

                            {/* Tape effect */}
                            <div
                              className="absolute -top-2 left-1/2 h-6 w-16 -translate-x-1/2 rotate-0 border border-amber-200/50 bg-amber-100/60"
                              style={{
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                              }}
                            />

                            {/* Random decorative elements */}
                            {index === 0 && (
                              <Heart className="absolute -top-3 -right-3 size-6 rotate-12 fill-red-400 text-red-400" />
                            )}
                            {index === 2 && (
                              <Star className="absolute -bottom-2 -left-2 size-5 -rotate-12 fill-amber-400 text-amber-400" />
                            )}
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Video Clips */}
                      {dayData.videos && dayData.videos.length > 0 && (
                        <div className="mt-10">
                          <h3
                            className="mb-4 text-center text-3xl text-slate-800"
                            style={{ fontFamily: 'Caveat, cursive' }}
                          >
                            Video Clips
                          </h3>
                          <div className="space-y-6">
                            {dayData.videos.map((video, vIndex) => (
                              <motion.div
                                key={vIndex}
                                initial={{ opacity: 0, rotate: 0, y: 20 }}
                                animate={{
                                  opacity: 1,
                                  rotate: vIndex % 2 === 0 ? -1.5 : 1.5,
                                  y: 0,
                                }}
                                transition={{ delay: 0.3 + vIndex * 0.2 }}
                                whileHover={{ rotate: 0, scale: 1.02, zIndex: 10 }}
                                className={`relative cursor-pointer bg-white p-3 shadow-xl ${
                                  vIndex % 2 === 0 ? 'mr-12' : 'ml-12'
                                }`}
                                style={{
                                  boxShadow:
                                    '0 10px 30px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1)',
                                }}
                                onClick={() => handleOpenMedia('video', video.url, video.caption)}
                              >
                                <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                                  <img
                                    src={video.thumbnail || 'https://weave-travel-media.s3.ap-southeast-2.amazonaws.com/travels/placeholder-video.jpg'}
                                    alt={video.caption}
                                    className="h-full w-full object-cover opacity-90"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-xl">
                                      <Play className="ml-0.5 size-7 text-red-500" />
                                    </div>
                                  </div>
                                </div>
                                <p
                                  className="mt-3 text-center text-lg text-slate-600"
                                  style={{ fontFamily: 'Caveat, cursive' }}
                                >
                                  {video.caption}
                                </p>
                                <div
                                  className="absolute -top-2 left-1/2 h-6 w-16 -translate-x-1/2 rotate-0 border border-amber-200/50 bg-amber-100/60"
                                  style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}
                                />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Doodles and decorations */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="mt-8 flex items-center justify-center gap-4"
                      >
                        <Compass className="size-6 rotate-12 text-slate-400" />
                        <p
                          className="text-2xl text-slate-400"
                          style={{ fontFamily: 'Caveat, cursive' }}
                        >
                          Memories captured...
                        </p>
                        <Coffee className="size-6 -rotate-12 text-slate-400" />
                      </motion.div>
                    </div>
                  </div>,
                ])}
              </BookFlip>
            </div>
          </div>

          {/* Action Buttons Below Diary */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={handleCopyJourney}
              className="border-slate-300 bg-white/90 shadow-lg backdrop-blur-sm hover:border-amber-500 hover:bg-white"
            >
              <Copy className="mr-2 size-4" />
              Copy Journey
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              className="border-slate-300 bg-white/90 shadow-lg backdrop-blur-sm hover:border-amber-500 hover:bg-white"
            >
              <Download className="mr-2 size-4" />
              Download PDF
            </Button>
            <Button
              onClick={() => setShowBookingFlow(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-lg"
            >
              <BookOpen className="mr-2 size-4" />
              Book This Journey
            </Button>
          </div>

          {/* Page Number Indicator Below */}
          <div className="mt-6 flex items-center justify-center gap-3">
            {journey.days.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isFlipping) {
                    pageFlipRef.current?.turnToPage(index * 2);
                  }
                }}
                disabled={isFlipping}
                className="group relative"
              >
                <div
                  className={`transition-all duration-300 ${
                    Math.floor(currentDay / 2) === index
                      ? 'h-3 w-12 rounded-full bg-gradient-to-r from-amber-600 to-orange-600'
                      : 'h-3 w-3 rounded-full bg-slate-400/50 group-hover:scale-125 group-hover:bg-slate-500'
                  }`}
                />
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Media Viewer Dialog */}
      {selectedMedia?.type === '360' ? (
        // Full-screen 360° Viewer - Standalone Implementation
        <div className={selectedMedia !== null ? 'block' : 'hidden'}>
          <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedMedia(null)}
          />
          <div className="fixed inset-0 z-[101] h-screen w-screen bg-black">
            <div className="relative h-full w-full">
              {currentDayData?.isAirPano ? (
                // AirPano Embed View - Full Screen
                <div className="relative w-full h-full bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={currentDayData?.airPanoUrl}
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    scrolling="no"
                    // framespacing="0"
                    allowFullScreen
                    style={{ display: 'block' }}
                  />
                </div>
              ) : (
                // Regular Image 360 Viewer
                <Image360Viewer
                  imageUrl={selectedMedia.url}
                  width="100%"
                  height="100%"
                />
              )}

              {/* Close button - Top Right */}
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-6 right-6 z-[110] flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-slate-900/80 text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:bg-slate-900"
              >
                <X className="size-5" />
              </button>

              {/* EXIT Button - Bottom Center */}
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute bottom-8 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-slate-900/80 px-6 py-3 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-105 hover:bg-slate-900"
              >
                <X className="size-4" />
                <span className="text-sm tracking-wider uppercase">EXIT</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Regular Video Dialog
        <Dialog
          open={selectedMedia !== null && selectedMedia?.type === 'video'}
          onOpenChange={() => setSelectedMedia(null)}
        >
          <DialogContent className="max-w-4xl border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="flex items-center gap-3 text-2xl text-white">
                <Play className="size-6 text-red-400" /> Video Experience:{' '}
                {selectedMedia?.title}
              </DialogTitle>
              <DialogDescription className="mt-2 text-base text-slate-300">
                Immersive video journey from this location
              </DialogDescription>
            </DialogHeader>

            <div
              className="relative overflow-hidden rounded-lg bg-black"
              style={{ height: '500px' }}
            >
              <div className="h-full w-full">
                <iframe
                  src={selectedMedia?.url}
                  className="h-full w-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Booking Flow Modal */}
      <Dialog open={showBookingFlow} onOpenChange={setShowBookingFlow}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0">
          <JourneyBookingFlow 
            journey={journey} 
            onClose={() => setShowBookingFlow(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}