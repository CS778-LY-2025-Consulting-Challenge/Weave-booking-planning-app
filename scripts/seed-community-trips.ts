import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding community trips...');

  // Trip 1: Auckland Adventure with full details
  const aucklandPlannerState = {
    destination: 'Auckland',
    days: 4,
    tripTitle: 'Shanghai to Auckland Adventure',
    dayPlans: [
      {
        day: 1,
        date: '2026-03-15',
        title: 'Arrival & City Exploration',
        summary: 'Welcome to Auckland! Explore the city center and waterfront.',
        city: 'Auckland',
        weather: { condition: 'Sunny', tempRange: '18-24°C' },
        activities: [
          {
            time: '10:00 AM',
            title: 'Sky Tower Observation',
            location: 'Sky Tower, Auckland CBD',
            type: 'attraction',
            duration: '2 hours',
            highlights: 'Panoramic city views from 328 meters high',
            rating: 4.6,
            reviewCount: 15234,
            costEstimate: '$32 NZD',
            coords: { lat: -36.8485, lng: 174.7633 }
          },
          {
            time: '1:00 PM',
            title: 'Viaduct Harbour Lunch',
            location: 'Viaduct Harbour',
            type: 'food',
            duration: '1.5 hours',
            highlights: 'Fresh seafood with harbor views',
            rating: 4.5,
            costEstimate: '$45 NZD',
            coords: { lat: -36.8425, lng: 174.7655 }
          },
          {
            time: '3:30 PM',
            title: 'Auckland Art Gallery',
            location: 'Wellesley Street East',
            type: 'attraction',
            duration: '2 hours',
            highlights: 'New Zealand and Pacific art collection',
            rating: 4.4,
            costEstimate: 'Free',
            coords: { lat: -36.8506, lng: 174.7679 }
          }
        ]
      },
      {
        day: 2,
        date: '2026-03-16',
        title: 'Islands & Maritime Heritage',
        summary: 'Ferry to Waiheke Island for wine tasting and beaches.',
        city: 'Waiheke Island',
        weather: { condition: 'Partly Cloudy', tempRange: '19-23°C' },
        activities: [
          {
            time: '9:00 AM',
            title: 'Ferry to Waiheke Island',
            location: 'Auckland Ferry Terminal',
            type: 'attraction',
            duration: '40 minutes',
            highlights: 'Scenic ferry ride through Hauraki Gulf',
            rating: 4.7,
            costEstimate: '$42 NZD return',
            coords: { lat: -36.8424, lng: 174.7677 }
          },
          {
            time: '11:00 AM',
            title: 'Wine Tasting Tour',
            location: 'Cable Bay Vineyards',
            type: 'attraction',
            duration: '3 hours',
            highlights: 'Award-winning wines with stunning views',
            rating: 4.8,
            reviewCount: 892,
            costEstimate: '$75 NZD',
            coords: { lat: -36.8042, lng: 175.0889 }
          },
          {
            time: '3:00 PM',
            title: 'Onetangi Beach',
            location: 'Onetangi Beach',
            type: 'attraction',
            duration: '2 hours',
            highlights: 'Golden sand beach perfect for swimming',
            rating: 4.6,
            costEstimate: 'Free',
            coords: { lat: -36.7889, lng: 175.0798 }
          }
        ]
      },
      {
        day: 3,
        date: '2026-03-17',
        title: 'Nature & Wildlife',
        summary: 'Explore rainforest and see native wildlife at Tiritiri Matangi.',
        city: 'Auckland',
        weather: { condition: 'Clear', tempRange: '17-22°C' },
        activities: [
          {
            time: '8:00 AM',
            title: 'Tiritiri Matangi Island',
            location: 'Tiritiri Matangi Island',
            type: 'attraction',
            duration: '6 hours',
            highlights: 'Wildlife sanctuary with rare native birds',
            rating: 4.9,
            reviewCount: 567,
            costEstimate: '$95 NZD',
            coords: { lat: -36.6019, lng: 174.8858 }
          },
          {
            time: '5:00 PM',
            title: 'Dinner at The Grove',
            location: 'St Patricks Square, Auckland',
            type: 'food',
            duration: '2 hours',
            highlights: 'Fine dining with contemporary New Zealand cuisine',
            rating: 4.7,
            costEstimate: '$120 NZD',
            coords: { lat: -36.8485, lng: 174.7633 }
          }
        ]
      },
      {
        day: 4,
        date: '2026-03-18',
        title: 'West Coast Adventure',
        summary: 'Black sand beaches and stunning coastal scenery.',
        city: 'Auckland',
        weather: { condition: 'Sunny', tempRange: '20-25°C' },
        activities: [
          {
            time: '9:00 AM',
            title: 'Piha Beach',
            location: 'Piha Beach',
            type: 'attraction',
            duration: '3 hours',
            highlights: 'Iconic black sand beach with Lion Rock',
            rating: 4.8,
            reviewCount: 2341,
            costEstimate: 'Free',
            coords: { lat: -37.0408, lng: 174.4697 }
          },
          {
            time: '1:00 PM',
            title: 'Waitakere Ranges',
            location: 'Waitakere Ranges Regional Park',
            type: 'attraction',
            duration: '2.5 hours',
            highlights: 'Rainforest walks and waterfalls',
            rating: 4.7,
            costEstimate: 'Free',
            coords: { lat: -36.9167, lng: 174.5167 }
          }
        ]
      }
    ]
  };

  const trip1 = await prisma.communityTrip.create({
    data: {
      userId: 'user_test_001',
      userName: 'MooVo',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      title: 'Shanghai to Auckland Adventure',
      destination: 'Auckland',
      thumbnailUrl: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad',
      duration: '4 days',
      rating: 4.5,
      description: 'This itinerary balances sightseeing, cultural learning, food experiences, and relaxation. Activities include Sky Tower, Waiheke Island wine tasting, wildlife sanctuary visits, and West Coast exploration.',
      plannerState: JSON.stringify(aucklandPlannerState),
      highlights: JSON.stringify(['City Exploration', 'Island Wine Tasting', 'Wildlife Sanctuary', 'Black Sand Beaches', 'Rainforest Walks']),
      dayGuides: JSON.stringify({
        day1: 'Start your Auckland adventure with the iconic Sky Tower for breathtaking views, followed by a seafood lunch at Viaduct Harbour.',
        day2: 'Take the ferry to Waiheke Island for world-class wine tasting and beautiful beaches.',
        day3: 'Visit Tiritiri Matangi Island to see rare native birds in their natural habitat.',
        day4: 'Explore the dramatic West Coast with its black sand beaches and lush rainforest.'
      }),
      sourceType: 'scratch',
      viewCount: 567,
      importCount: 6,
      commentCount: 0, // Will be updated after adding comments
      likeCount: 0,
    },
  });

  // Add comments to Trip 1
  await prisma.comment.createMany({
    data: [
      {
        tripId: trip1.id,
        userId: 'user_comment_001',
        userName: 'Sarah Chen',
        userAvatar: 'https://i.pravatar.cc/150?img=5',
        content: 'Amazing itinerary! I followed this trip last month and it was perfect. The wine tasting on Waiheke Island was the highlight!'
      },
      {
        tripId: trip1.id,
        userId: 'user_comment_002',
        userName: 'James Wilson',
        userAvatar: 'https://i.pravatar.cc/150?img=12',
        content: 'Great suggestions! Would recommend adding Mt. Eden for sunset views on Day 1.'
      },
      {
        tripId: trip1.id,
        userId: 'user_comment_003',
        userName: 'Emily Taylor',
        userAvatar: 'https://i.pravatar.cc/150?img=9',
        content: 'Tiritiri Matangi Island was incredible! We saw so many native birds. Book the ferry early as it fills up quickly.'
      }
    ]
  });

  // Update comment count
  await prisma.communityTrip.update({
    where: { id: trip1.id },
    data: { commentCount: 3 }
  });

  // Trip 2: Tokyo Adventure with full details
  const tokyoPlannerState = {
    destination: 'Tokyo',
    days: 4,
    tripTitle: 'Shanghai to Tokyo Adventure',
    dayPlans: [
      {
        day: 1,
        date: '2026-04-10',
        title: 'Modern Tokyo',
        summary: 'Explore Shibuya, Harajuku, and cutting-edge technology.',
        city: 'Tokyo',
        weather: { condition: 'Clear', tempRange: '15-22°C' },
        activities: [
          {
            time: '10:00 AM',
            title: 'Shibuya Crossing',
            location: 'Shibuya Station',
            type: 'attraction',
            duration: '1 hour',
            highlights: "World's busiest pedestrian crossing",
            rating: 4.6,
            reviewCount: 8934,
            costEstimate: 'Free',
            coords: { lat: 35.6595, lng: 139.7004 }
          },
          {
            time: '12:00 PM',
            title: 'Harajuku & Takeshita Street',
            location: 'Harajuku',
            type: 'attraction',
            duration: '2 hours',
            highlights: 'Youth fashion, crepes, and unique shops',
            rating: 4.5,
            costEstimate: '¥2000',
            coords: { lat: 35.6702, lng: 139.7027 }
          },
          {
            time: '3:00 PM',
            title: 'teamLab Borderless',
            location: 'Azabudai Hills',
            type: 'attraction',
            duration: '2.5 hours',
            highlights: 'Immersive digital art museum',
            rating: 4.8,
            reviewCount: 5621,
            costEstimate: '¥3800',
            coords: { lat: 35.6606, lng: 139.7388 }
          }
        ]
      },
      {
        day: 2,
        date: '2026-04-11',
        title: 'Traditional Tokyo',
        summary: 'Experience ancient temples, gardens, and Japanese culture.',
        city: 'Tokyo',
        weather: { condition: 'Partly Cloudy', tempRange: '14-20°C' },
        activities: [
          {
            time: '8:30 AM',
            title: 'Senso-ji Temple',
            location: 'Asakusa',
            type: 'attraction',
            duration: '2 hours',
            highlights: "Tokyo's oldest temple with traditional shopping street",
            rating: 4.7,
            reviewCount: 12456,
            costEstimate: 'Free',
            coords: { lat: 35.7148, lng: 139.7967 }
          },
          {
            time: '11:30 AM',
            title: 'Sushi Lunch at Tsukiji',
            location: 'Tsukiji Outer Market',
            type: 'food',
            duration: '1.5 hours',
            highlights: 'Fresh sushi and seafood delicacies',
            rating: 4.8,
            costEstimate: '¥4500',
            coords: { lat: 35.6654, lng: 139.7707 }
          },
          {
            time: '2:00 PM',
            title: 'Imperial Palace East Garden',
            location: 'Chiyoda',
            type: 'attraction',
            duration: '2 hours',
            highlights: 'Beautiful Japanese gardens and historical ruins',
            rating: 4.6,
            costEstimate: 'Free',
            coords: { lat: 35.6852, lng: 139.7528 }
          }
        ]
      },
      {
        day: 3,
        date: '2026-04-12',
        title: 'Anime & Pop Culture',
        summary: 'Dive into Akihabara and Ikebukuro anime culture.',
        city: 'Tokyo',
        weather: { condition: 'Sunny', tempRange: '16-23°C' },
        activities: [
          {
            time: '10:00 AM',
            title: 'Akihabara Electric Town',
            location: 'Akihabara',
            type: 'attraction',
            duration: '3 hours',
            highlights: 'Electronics, anime, manga, and gaming paradise',
            rating: 4.7,
            reviewCount: 6789,
            costEstimate: '¥3000',
            coords: { lat: 35.7022, lng: 139.7744 }
          },
          {
            time: '2:00 PM',
            title: 'Pokemon Center Mega Tokyo',
            location: 'Ikebukuro Sunshine City',
            type: 'attraction',
            duration: '1.5 hours',
            highlights: 'Largest Pokemon store in Japan',
            rating: 4.8,
            costEstimate: '¥5000',
            coords: { lat: 35.7295, lng: 139.7193 }
          },
          {
            time: '5:00 PM',
            title: 'Ramen Dinner',
            location: 'Ikebukuro',
            type: 'food',
            duration: '1 hour',
            highlights: 'Authentic Tokyo ramen experience',
            rating: 4.6,
            costEstimate: '¥1200',
            coords: { lat: 35.7295, lng: 139.7109 }
          }
        ]
      },
      {
        day: 4,
        date: '2026-04-13',
        title: 'Tokyo Bay & Nightlife',
        summary: 'Explore Odaiba and experience Tokyo nightlife.',
        city: 'Tokyo',
        weather: { condition: 'Clear', tempRange: '17-24°C' },
        activities: [
          {
            time: '10:00 AM',
            title: 'Odaiba Seaside Park',
            location: 'Odaiba',
            type: 'attraction',
            duration: '2 hours',
            highlights: 'Waterfront views and Rainbow Bridge',
            rating: 4.5,
            costEstimate: 'Free',
            coords: { lat: 35.6297, lng: 139.7744 }
          },
          {
            time: '1:00 PM',
            title: 'TeamLab Planets',
            location: 'Toyosu',
            type: 'attraction',
            duration: '2 hours',
            highlights: 'Walk through water immersive art',
            rating: 4.9,
            reviewCount: 4321,
            costEstimate: '¥3800',
            coords: { lat: 35.6463, lng: 139.7951 }
          },
          {
            time: '7:00 PM',
            title: 'Tokyo Tower Night View',
            location: 'Minato',
            type: 'attraction',
            duration: '2 hours',
            highlights: 'Illuminated city views from iconic tower',
            rating: 4.7,
            reviewCount: 9876,
            costEstimate: '¥1200',
            coords: { lat: 35.6586, lng: 139.7454 }
          }
        ]
      }
    ]
  };

  const trip2 = await prisma.communityTrip.create({
    data: {
      userId: 'user_test_002',
      userName: 'MooVo',
      userAvatar: 'https://i.pravatar.cc/150?img=1',
      title: 'Shanghai to Tokyo Adventure',
      destination: 'Tokyo',
      thumbnailUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
      duration: '4 days',
      rating: 4.5,
      description: 'Experience the perfect blend of modern and traditional Tokyo. From bustling Shibuya to serene temples, anime culture to fine dining, this itinerary covers all the must-see attractions.',
      plannerState: JSON.stringify(tokyoPlannerState),
      highlights: JSON.stringify(['Shibuya Crossing', 'Digital Art Museums', 'Ancient Temples', 'Anime Culture', 'Tokyo Tower']),
      dayGuides: JSON.stringify({
        day1: 'Start with the iconic Shibuya Crossing, explore trendy Harajuku, and immerse yourself in digital art at teamLab.',
        day2: 'Visit ancient Senso-ji Temple, enjoy fresh sushi at Tsukiji, and stroll through Imperial Palace gardens.',
        day3: 'Dive into otaku culture in Akihabara and visit the mega Pokemon Center in Ikebukuro.',
        day4: 'Relax at Odaiba waterfront, experience teamLab Planets, and end with Tokyo Tower night views.'
      }),
      sourceType: 'scratch',
      viewCount: 234,
      importCount: 5,
      commentCount: 0,
      likeCount: 0,
    },
  });

  console.log('✅ Created trips with full details:', { 
    trip1: trip1.id, 
    trip2: trip2.id,
    trip1Comments: 3
  });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
