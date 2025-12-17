'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Plane, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface DestinationData {
  id: string;
  name: string;
  country: string;
  title: string;
  subtitle: string;
  videoId: string;
  startTime?: number;
  description: string;
  fullDescription: string;
  bookingCta: string;
  bestTime: string;
  capital: string;
  population: string;
  area: string;
  languages: string;
}

export default function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Scroll to top when component loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const destinationsData: Record<string, DestinationData> = {
    koror: {
      id: 'koror',
      name: 'Koror',
      country: 'Palau',
      title: 'Rock Islands',
      subtitle: 'The Rock Islands of Palau are a UNESCO World Heritage site',
      videoId: '0rpzPJJHy8A',
      description:
        'This tiny Pacific island paradise offers spectacular diving and vibrant culture – perfect for travellers seeking immersive escapes and aquatic adventures.',
      fullDescription:
        "Koror is the gateway to one of the world's most pristine marine environments. The Rock Islands, a collection of over 250 limestone and coral islands, offer some of the most spectacular diving and snorkeling experiences on Earth. Beneath the crystal-clear waters, you'll discover vibrant coral reefs teeming with marine life, hidden caves, and underwater tunnels. The famous Jellyfish Lake provides a surreal swimming experience among millions of harmless jellyfish. On land, lush tropical vegetation covers dramatic karst formations, creating a landscape unlike anywhere else. The local Palauan culture adds depth to your visit, with traditional customs and warm hospitality making every traveler feel welcome. Whether you're exploring WWII wrecks, kayaking through pristine lagoons, or simply relaxing on secluded beaches, Koror offers an adventure that combines natural beauty with cultural richness.",
      bookingCta: 'Book a Trip to Palau',
      bestTime: 'Year-round destination with seasonal highlights',
      capital: 'Ngerulmud',
      population: 'Approx. 21,000',
      area: '459 km²',
      languages: 'Palauan, English, Filipino, Chinese',
    },
    kochi: {
      id: 'kochi',
      name: 'Kochi',
      country: 'Japan',
      title: 'Kochi Prefecture',
      subtitle:
        'A peaceful slice of Japan with cherry blossoms and mountain landscapes',
      videoId: '-M8svKQkYsQ',
      startTime: 0,
      description:
        'Known for cherry blossoms and delicious cuisine, Kochi offers a more relaxed, off-the-beaten-track slice of Japan for travellers looking for less hustle and bustle.',
      fullDescription:
        "Nestled on the southern coast of Shikoku Island, Kochi Prefecture offers an authentic Japanese experience away from the crowds. The region is famous for its dramatic coastline, rugged mountains, and pristine rivers. Spring brings spectacular cherry blossom displays that rival those in more famous locations, but with far fewer tourists. The prefecture's culinary scene is exceptional, particularly known for its katsuo no tataki (seared bonito) and yuzu citrus products. History enthusiasts will appreciate Kochi Castle, one of only twelve original castles remaining in Japan. The Sunday street market, running for over 300 years, showcases local crafts and fresh produce. Nature lovers can explore the Shimanto River, Japan's last free-flowing river, or hike through ancient forests. The laid-back atmosphere, combined with genuine local hospitality, makes Kochi perfect for travelers seeking to experience traditional Japan at a slower, more meaningful pace.",
      bookingCta: 'Book a Trip to Kochi',
      bestTime: 'Year-round destination with seasonal highlights',
      capital: 'Kochi City',
      population: 'Approx. 900,000',
      area: '18,491 km²',
      languages: 'Japanese',
    },
    bilbao: {
      id: 'bilbao',
      name: 'Bilbao',
      country: 'Spain',
      title: 'Guggenheim Museum',
      subtitle: 'Where medieval charm meets contemporary architecture',
      videoId: 'lE9Gp1poFiE',
      description:
        "This walkable artistic city, where medieval streets meet modernist architecture, is the perfect base for a culture-rich escapade to Spain's Basque Country.",
      fullDescription:
        "Bilbao has transformed from an industrial port city into one of Europe's most exciting cultural destinations. The iconic Guggenheim Museum, with its titanium curves designed by Frank Gehry, catalyzed this renaissance and remains a masterpiece of contemporary architecture. But Bilbao is far more than just one building. The Casco Viejo (Old Town) features charming narrow streets, traditional pintxos bars, and the impressive Santiago Cathedral. The riverside promenade connects modern and historic districts, showcasing the city's successful urban renewal. Basque cuisine shines here, from humble pintxos to Michelin-starred restaurants. The local food culture is social and vibrant, with bar-hopping for small plates being a beloved tradition. Art lovers can explore multiple museums, including the Fine Arts Museum with its impressive collection. The surrounding Basque countryside offers additional adventures, from coastal towns to mountain villages. Bilbao's compact size makes it perfect for walking, and the friendly locals take pride in sharing their unique culture with visitors.",
      bookingCta: 'Book a Trip to Bilbao',
      bestTime: 'Year-round destination with seasonal highlights',
      capital: 'Bilbao',
      population: 'Approx. 350,000',
      area: '39.3 km²',
      languages: 'Basque, Spanish',
    },
    maldives: {
      id: 'maldives',
      name: 'Maldives',
      country: 'Maldives',
      title: 'Paradise Islands',
      subtitle: 'Crystal-clear waters and luxurious overwater bungalows',
      videoId: '3-xO_HTFXuk',
      description:
        'A tropical paradise featuring pristine beaches, crystal-clear waters, and luxurious overwater bungalows perfect for romantic getaways and diving adventures.',
      fullDescription:
        "The Maldives represents the ultimate tropical paradise, consisting of 26 ring-shaped atolls spread across the Indian Ocean. Each island resort offers its own slice of heaven, with powdery white sand beaches, turquoise lagoons, and some of the world's most vibrant coral reefs. The underwater world is extraordinary, featuring manta rays, whale sharks, sea turtles, and countless tropical fish species. Luxury resorts range from intimate boutique properties to expansive islands with world-class spas, restaurants, and water sports facilities. Overwater bungalows provide direct access to the lagoon, where you can snorkel right from your deck. The Maldivian culture, while influenced by Islam, warmly welcomes visitors with genuine hospitality. Sunset cruises on traditional dhoni boats, underwater dining experiences, and stargazing from pristine beaches create unforgettable memories. Whether you're celebrating a honeymoon, anniversary, or simply seeking ultimate relaxation, the Maldives delivers an unparalleled experience of natural beauty and luxury.",
      bookingCta: 'Book a Trip to Maldives',
      bestTime: 'Year-round destination with seasonal highlights',
      capital: 'Masquer',
      population: 'Approx. 540,000',
      area: '298 km²',
      languages: 'Dhivehi, English',
    },
    iceland: {
      id: 'iceland',
      name: 'Reykjavik',
      country: 'Iceland',
      title: 'Land of Fire and Ice',
      subtitle: 'Dramatic landscapes and the magical Northern Lights',
      videoId: 'TQtu1TLOf4I',
      description:
        'Experience dramatic landscapes, geothermal wonders, and the magical Northern Lights in this land of fire and ice, perfect for adventure seekers.',
      fullDescription:
        "Iceland captivates visitors with its otherworldly landscapes and raw natural power. From the capital Reykjavik, adventure beckons in every direction. The Golden Circle route showcases geysers shooting water high into the air, the massive Gullfoss waterfall, and the historic Thingvellir National Park where tectonic plates meet. The Blue Lagoon offers a surreal bathing experience in milky-blue geothermal waters. Black sand beaches contrast with white glaciers, while volcanic craters and lava fields demonstrate the island's fiery origins. Winter brings the magical Northern Lights dancing across dark skies, while summer offers the midnight sun and endless daylight for exploration. Glacier hiking, ice cave tours, and whale watching provide thrilling activities. The small population and vast wilderness create a sense of isolation and peace. Icelandic culture, rooted in Viking heritage and literary traditions, adds depth to the visit. Modern Reykjavik balances cosmopolitan cafes and music venues with easy access to nature. Iceland challenges and rewards visitors with its extreme beauty and unique character.",
      bookingCta: 'Book a Trip to Iceland',
      bestTime: 'Year-round destination with seasonal highlights',
      capital: 'Reykjavik',
      population: 'Approx. 360,000',
      area: '103,000 km²',
      languages: 'Icelandic, English',
    },
    cusco: {
      id: 'cusco',
      name: 'Cusco',
      country: 'Peru',
      title: 'Gateway to Machu Picchu',
      subtitle: 'Ancient Incan capital with rich history and mountain scenery',
      videoId: 'wsMOr6Lb_Tc',
      description:
        'The gateway to Machu Picchu, this ancient Incan capital combines rich history, stunning mountain scenery, and vibrant local culture.',
      fullDescription:
        "Cusco sits high in the Peruvian Andes at 3,400 meters, serving as the historic capital of the Inca Empire. The city itself is a UNESCO World Heritage site, where Spanish colonial architecture rises on Incan foundations, creating a unique architectural blend. The Plaza de Armas forms the heart of the city, surrounded by baroque churches and arcaded walkways. Narrow cobblestone streets climb hills to reveal ancient Incan walls with precisely fitted stones, including the famous 12-sided stone. Markets overflow with colorful textiles, fresh produce, and local crafts. While Cusco is the jumping-off point for Machu Picchu, the city and Sacred Valley deserve several days of exploration. Nearby ruins like Sacsayhuaman and Ollantaytambo showcase Incan engineering genius. The vibrant local culture blends indigenous Quechua traditions with colonial influences, evident in festivals, cuisine, and daily life. Peruvian food, from hearty soups to ceviche and guinea pig, reflects the region's agricultural diversity. The altitude requires acclimatization, but coca tea and a slower pace help visitors adjust while soaking in the magical atmosphere of this ancient city.",
      bookingCta: 'Book a Trip to Peru',
      bestTime: 'Year-round destination with seasonal highlights',
      capital: 'Lima',
      population: 'Approx. 33 million',
      area: '1,285,216 km²',
      languages: 'Spanish, Quechua, Aymara',
    },
  };

  const destination = id ? destinationsData[id] : null;

  if (!destination) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">Destination not found</h2>
          <Button onClick={() => router.push('/destinations')}>
            Back to Destinations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* Back Button */}
      <div className="fixed top-24 left-8 z-50">
        <Button
          onClick={() => router.push('/destinations')}
          variant="outline"
          size="sm"
          className="gap-2 bg-white/90 shadow-lg backdrop-blur-sm hover:bg-white"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      {/* Video Section */}
      <div className="relative h-screen w-full overflow-hidden bg-black">
        {/* Video Player - Auto-playing */}
        <div className="relative h-full w-full overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${destination.videoId}?autoplay=1&mute=1&start=${destination.startTime || 17}&rel=0&controls=0&loop=1&playlist=${destination.videoId}`}
            title={destination.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-1/2 left-1/2 h-[56.25vw] min-h-full w-[177.77vh] min-w-full -translate-x-1/2 -translate-y-1/2"
            style={{ pointerEvents: 'none' }}
          />

          {/* Gradient Overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

          {/* Info Bar at Bottom */}
          <div className="absolute right-0 bottom-0 left-0 border-t border-white/10 bg-black/60 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-8 py-4">
              <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
                <div>
                  <p className="mb-1 text-xs text-white/70">
                    Best time to visit
                  </p>
                  <p className="text-white">{destination.bestTime}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-white/70">Capital</p>
                  <p className="text-white">{destination.capital}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-white/70">Population</p>
                  <p className="text-white">{destination.population}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-white/70">Area</p>
                  <p className="text-white">{destination.area}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-white/70">
                    Official languages
                  </p>
                  <p className="text-white">{destination.languages}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Title */}
          <div className="mb-8">
            <h2 className="mb-4">
              Discover {destination.name}, {destination.country}
            </h2>
            <p className="text-xl leading-relaxed text-gray-600">
              {destination.description}
            </p>
          </div>

          {/* Full Description */}
          <div className="prose prose-lg max-w-none">
            <p className="leading-relaxed whitespace-pre-line text-gray-700">
              {destination.fullDescription}
            </p>
          </div>

          {/* Quick Info Cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 p-6">
              <Calendar className="mb-3 size-8 text-blue-600" />
              <h4 className="mb-2">Best Time to Visit</h4>
              <p className="text-sm text-gray-600">{destination.bestTime}</p>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 p-6">
              <Users className="mb-3 size-8 text-purple-600" />
              <h4 className="mb-2">Perfect For</h4>
              <p className="text-sm text-gray-600">
                Couples, families, and solo adventurers
              </p>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-pink-50 to-orange-50 p-6">
              <Plane className="mb-3 size-8 text-pink-600" />
              <h4 className="mb-2">Getting There</h4>
              <p className="text-sm text-gray-600">
                International flights available from major hubs
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center">
            <h3 className="mb-4 text-white">Ready to Start Your Journey?</h3>
            <p className="mb-8 text-lg text-white/90">
              Explore our curated packages and start planning your adventure to{' '}
              {destination.name}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                onClick={() => router.push('/packages')}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                View Packages
              </Button>
              <Button
                onClick={() => router.push('/flights')}
                size="lg"
                variant="outline"
              >
                Find Flights
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}