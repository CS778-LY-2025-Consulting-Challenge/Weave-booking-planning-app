'use client';

import { Image360Viewer } from '@/components/Image360Viewer';
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
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function JourneyDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [currentDay, setCurrentDay] = useState(0);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>(
    'forward'
  );
  const [selectedMedia, setSelectedMedia] = useState<{
    type: '360' | 'video';
    url: string;
    title: string;
  } | null>(null);

  // Mock journey data with multiple images per day
  const journey = {
    id: 1,
    title: 'Bali Adventure',
    author: 'Sarah M.',
    destination: 'Bali, Indonesia',
    season: 'Summer',
    duration: '10 Days',
    coverImage:
      'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxpJTIwaW5kb25lc2lhfGVufDF8fHx8MTc2NDUzNzMxMXww&ixlib=rb-4.1.0&q=80&w=1080',
    days: [
      {
        day: 1,
        date: 'June 15',
        year: '2024',
        title: 'First Day in Paradise',
        mood: '😊 Excited',
        weather: '☀️ 28°C',
        entry:
          'Finally arrived in Bali! The moment I stepped off the plane, I could feel the warm tropical air embrace me. The scent of frangipani flowers filled the air. This is going to be an incredible journey! Checked into the most beautiful beachfront hotel - the sound of waves is my new alarm clock. Watched the most stunning sunset at Seminyak Beach. The sky turned into shades of orange, pink, and purple. Absolutely magical! 🌅',
        highlights: [
          '🛬 Arrived at Ngurah Rai Airport',
          '🏨 Checked into The Legian Seminyak',
          '🌊 Sunset walk on the beach',
          '🍽️ Dinner at La Plancha - fresh seafood!',
          '📸 Took 100+ sunset photos',
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
            caption: 'Seminyak Beach Sunset',
          },
          {
            url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
            caption: 'Beach vibes',
          },
          {
            url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            caption: 'Hotel room view',
          },
          {
            url: 'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=800',
            caption: 'Evening stroll',
          },
        ],
        video360Url:
          'https://cloudflare1.360gigapixels.com/pano/milanrademakers/01906841_DSC-1437-Panorama-jpg/equirect_crop_3_1/6.jpg',
        has360: true,
      },
      {
        day: 2,
        date: 'June 16',
        year: '2024',
        title: 'Ubud Cultural Journey',
        mood: '🤩 Amazed',
        weather: '⛅ 26°C',
        entry:
          'Woke up early to explore Ubud! The rice terraces at Tegalalang are even more beautiful in person. The emerald green fields cascading down the hillside... I could stare at them forever. Met some local farmers who showed me how they maintain the paddies - such hard work but they do it with so much pride. The Monkey Forest was hilarious - one cheeky monkey tried to steal my sunglasses! 🐒 Ended the day with a traditional Balinese massage that melted away all the travel fatigue.',
        highlights: [
          '🌾 Tegalalang Rice Terraces at sunrise',
          '🐵 Monkey Forest adventure',
          '💆 Traditional spa treatment',
          '🥾 Campuhan Ridge sunset walk',
          '☕ Coffee tasting at local plantation',
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
            caption: 'Arc de Triomphe',
          },
          {
            url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800',
            caption: 'Eiffel Tower at night',
          },
          {
            url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            caption: 'Hotel room view',
          },
          {
            url: 'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=800',
            caption: 'Evening stroll',
          },
        ],
        video360Url:
          'https://upload.wikimedia.org/wikipedia/commons/d/d8/Soissons_Cathedral_Interior_360x180%2C_Picardy%2C_France_-_Diliff.jpg',
        has360: true,
      },
      {
        day: 3,
        date: 'June 17',
        year: '2024',
        title: 'Temple Hopping Day',
        mood: '🙏 Peaceful',
        weather: '🌤️ 29°C',
        entry:
          'Today was all about temples and spirituality. Started before dawn to catch sunrise at Tanah Lot - the temple perched on a rock formation in the ocean is straight out of a fairytale! The waves crashing around it while the sun rose behind... pure magic. Later visited Uluwatu Temple on the cliff edge. The Kecak fire dance performance at sunset was mesmerizing - 50+ men chanting in unison while telling the Ramayana story through dance. Finished with fresh grilled seafood on Jimbaran Beach with my feet in the sand. Perfect day! ✨',
        highlights: [
          '⛩️ Tanah Lot sunrise ceremony',
          '🍜 Local warung breakfast',
          '🏛️ Uluwatu Temple exploration',
          '🔥 Kecak fire dance performance',
          '🦞 Beachside seafood dinner',
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800',
            caption: 'Tanah Lot Temple',
          },
          {
            url: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800',
            caption: 'Temple details',
          },
          {
            url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800',
            caption: 'Kecak dance',
          },
          {
            url: 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?w=800',
            caption: 'Sunset at Uluwatu',
          },
        ],
        video360Url: 'https://www.youtube.com/embed/KudedLV0tP0',
        has360: true,
      },
      {
        day: 4,
        date: 'June 18',
        year: '2024',
        title: 'Under the Sea',
        mood: '🤿 Adventurous',
        weather: '☀️ 30°C',
        entry:
          "Ocean day! Went snorkeling at Blue Lagoon and WOW - the underwater world is incredible! Saw so many colorful fish, coral reefs, and even a sea turtle! 🐢 The water was crystal clear, felt like swimming in an aquarium. Tried surfing at Kuta Beach in the afternoon. Let's just say I spent more time falling off the board than standing on it 😂 but it was so much fun! The instructor was super patient. Evening at Rock Bar watching the sunset with a cocktail in hand - living my best island life! 🍹",
        highlights: [
          '🤿 Snorkeling at Blue Lagoon',
          '🐠 Saw a sea turtle!',
          '🏄 Surfing lessons (lots of wipeouts)',
          '🏖️ Finns Beach Club lunch',
          '🍹 Sunset cocktails at Rock Bar',
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
            caption: 'Blue lagoon waters',
          },
          {
            url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800',
            caption: 'Underwater adventure',
          },
          {
            url: 'https://images.unsplash.com/photo-1502933691298-84fc14542831?w=800',
            caption: 'Surfing attempt!',
          },
          {
            url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
            caption: 'Beach club vibes',
          },
        ],
        video360Url: 'https://www.youtube.com/embed/3KuY-4gaPAM',
        has360: true,
      },
      {
        day: 5,
        date: 'June 19',
        year: '2024',
        title: 'Volcano Sunrise Trek',
        mood: '🏔️ Accomplished',
        weather: '🌡️ 18°C',
        entry:
          "Woke up at 3AM for the Mount Batur sunrise trek - crazy I know, but SO worth it! The hike up in the dark was challenging but our guide was amazing. Reached the summit just as the sun started to rise. Watching the sky turn from dark blue to orange and gold while standing on an active volcano... I have no words. One of the most beautiful things I've ever witnessed! 🌄 Had breakfast cooked by volcanic steam (yes, really!). Stopped at a coffee plantation on the way back and tried the famous Luwak coffee. Ended with a soak in natural hot springs. My legs are tired but my heart is full! ❤️",
        highlights: [
          '🌙 3:30 AM wake up call',
          '⛰️ Summit reached at sunrise',
          '🥚 Volcanic steam breakfast',
          '☕ Luwak coffee plantation visit',
          '♨️ Hot springs relaxation',
        ],
        images: [
          {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            caption: 'Summit sunrise',
          },
          {
            url: 'https://images.unsplash.com/photo-1454391304352-2bf4678b1a7a?w=800',
            caption: 'Volcanic landscape',
          },
          {
            url: 'https://images.unsplash.com/photo-1571613307761-2e5a7662c5d3?w=800',
            caption: 'Coffee plantation',
          },
          {
            url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
            caption: 'Hot springs bliss',
          },
        ],
        video360Url: 'https://www.youtube.com/embed/1Ne1hqOXKKI',
        has360: true,
      },
    ],
  };

  const handleCopyJourney = () => {
    alert('Journey copied to your dashboard! You can now customize it.');
    router.push('/dashboard');
  };

  const handleDownloadPDF = () => {
    alert('PDF download started! Your itinerary will be downloaded shortly.');
  };

  const handleNextDay = () => {
    if (currentDay < journey.days.length - 1 && !isFlipping) {
      setFlipDirection('forward');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentDay(currentDay + 1);
        setTimeout(() => setIsFlipping(false), 800);
      }, 400);
    }
  };

  const handlePrevDay = () => {
    if (currentDay > 0 && !isFlipping) {
      setFlipDirection('backward');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentDay(currentDay - 1);
        setTimeout(() => setIsFlipping(false), 800);
      }, 400);
    }
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
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentDay}
                  initial={
                    isFlipping
                      ? flipDirection === 'forward'
                        ? {
                            rotateY: -90,
                            opacity: 0,
                            scale: 0.9,
                          }
                        : {
                            rotateY: 90,
                            opacity: 0,
                            scale: 0.9,
                          }
                      : false
                  }
                  animate={{
                    rotateY: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={
                    flipDirection === 'forward'
                      ? {
                          rotateY: 90,
                          opacity: 0,
                          scale: 0.9,
                        }
                      : {
                          rotateY: -90,
                          opacity: 0,
                          scale: 0.9,
                        }
                  }
                  transition={{
                    duration: 0.8,
                    ease: [0.45, 0.05, 0.15, 1], // Custom easing for smooth page turn
                    opacity: { duration: 0.4 },
                    scale: { duration: 0.6 },
                  }}
                  style={{
                    transformStyle: 'preserve-3d',
                    transformOrigin:
                      flipDirection === 'forward'
                        ? 'right center'
                        : 'left center',
                  }}
                  className="absolute inset-0"
                >
                  {/* Split Page Layout - DIARY STYLE */}
                  <div className="grid h-full grid-cols-2">
                    {/* LEFT PAGE - Diary Entry */}
                    <div
                      className="relative overflow-y-auto"
                      style={{
                        background:
                          'linear-gradient(135deg, #FFFEF9 0%, #FBF8F1 100%)',
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
                                {currentDayData.date}, {currentDayData.year}
                              </p>
                              <p className="text-sm text-slate-500">
                                Day {currentDayData.day} of{' '}
                                {journey.days.length}
                              </p>
                            </div>

                            {/* Mood & Weather stamps */}
                            <div className="flex gap-2">
                              <div className="rotate-2 rounded-lg border-2 border-yellow-300 bg-yellow-100 px-3 py-1 shadow-sm">
                                <p className="text-sm">{currentDayData.mood}</p>
                              </div>
                              <div className="-rotate-2 rounded-lg border-2 border-blue-300 bg-blue-100 px-3 py-1 shadow-sm">
                                <p className="text-sm">
                                  {currentDayData.weather}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Title - handwritten */}
                          <h1
                            className="mb-4 text-5xl text-slate-900"
                            style={{ fontFamily: 'Caveat, cursive' }}
                          >
                            {currentDayData.title}
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
                            {currentDayData.entry}
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
                            Today's Highlights
                          </h3>
                          <div className="space-y-2">
                            {currentDayData.highlights.map(
                              (highlight, index) => (
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
                              )
                            )}
                          </div>
                        </motion.div>

                        {/* 360 View Button */}
                        {currentDayData.has360 && (
                          <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            onClick={() =>
                              handleOpenMedia(
                                '360',
                                currentDayData.video360Url,
                                currentDayData.title
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
                    </div>

                    {/* CENTER SPINE */}
                    <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 z-30 -ml-6 w-12">
                      <div className="h-full w-full bg-gradient-to-r from-slate-900/15 via-slate-900/5 to-transparent" />
                    </div>

                    {/* RIGHT PAGE - Photo Gallery */}
                    <div
                      className="relative overflow-y-auto"
                      style={{
                        background:
                          'linear-gradient(135deg, #FBF8F1 0%, #F5F1E8 100%)',
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
                          {currentDayData.images.map((image, index) => (
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
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
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
          </div>

          {/* Page Number Indicator Below */}
          <div className="mt-6 flex items-center justify-center gap-3">
            {journey.days.map((_, index) => (
              <button
                key={index}
                onClick={() => !isFlipping && setCurrentDay(index)}
                disabled={isFlipping}
                className="group relative"
              >
                <div
                  className={`transition-all duration-300 ${
                    index === currentDay
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
              <Image360Viewer
                imageUrl={selectedMedia.url}
                width="100%"
                height="100%"
              />

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
    </div>
  );
}
