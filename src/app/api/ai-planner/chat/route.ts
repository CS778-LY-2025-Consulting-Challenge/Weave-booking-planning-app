import { NextResponse } from 'next/server';
import { createAIChatCompletion, extractOrWrapJson } from '@/lib/aiClient';
import { searchGoogleFlights, getBestFlights, getIATACode, calculateDuration } from '@/services/googleFlightsService';
import { aiChatLimiter, getClientIdentifier, checkRateLimit, createRateLimitResponse } from '@/lib/rate-limit';

const SYSTEM_PROMPT = `
You are Charizard, a professional travel AI assistant. 
The user's screen has a Chat (left) and a Visual Dashboard (right).

**CRITICAL REQUIREMENT - JSON OUTPUT ONLY:**
You must ALWAYS respond with a valid JSON object matching this structure:
{
  "reply": "Your message to the user",
  "plannerState": { ... }
}
Even when asking questions, greeting the user, or seeking clarification, you MUST still return a JSON object, for example:
{
  "reply": "Hi! Where would you like to travel and for how many days?",
  "plannerState": {}
}
Never output raw text outside the JSON object.

**Your Core Mission:**
1. Collect 5 Essentials: Destination, Start Date, End Date, Travellers, Departure City.
2. Silent Inference: Silently calculate End Date if Start+Duration are given.
3. Full Plan Generation: Once confirmed, generate a complete plan.
4. Itinerary Edits & Modifications: When the user already has an itinerary on screen and asks for adjustments (e.g. change an activity, add dining, swap days, change hotel, adjust timing):
   - Accurately apply requested modifications.
   - PRESERVE all existing unchanged days, activities, accommodation, transportation, and dates.
   - Return the updated plan in "plannerState".
   - In your "reply", explain what edits were made.

**CRITICAL - Date Format Requirements:**
- ALWAYS return dates in ISO format: "YYYY-MM-DD" (e.g., "2026-01-10", "2026-01-20")
- In your JSON response, ALWAYS include the "dates" object with:
  * "start": "YYYY-MM-DD" (required)
  * "end": "YYYY-MM-DD" (required)
  * "durationDays": number (required)
- Example: If user says "starting from 10 January" and "for 7 days", you MUST return:
  "dates": { "start": "2026-01-10", "end": "2026-01-17", "durationDays": 7 }
- If user provides "start + duration" but not "end", calculate the end date yourself
- If user provides "start + end" but not "duration", calculate durationDays yourself

**Activity Quality Standards (CRITICAL):**
Each day should have 3-4 well-planned activities. Quality over quantity!

**Activity Count Guidelines:**
- Full day in a city: 3-4 activities (Morning, Afternoon, Evening)
- Arrival day: 2-3 activities (light schedule)
- Departure day: 1-2 activities (allow time for travel)

**MANDATORY Requirements for EVERY Activity:**
1. **Specific Names** - NO generic descriptions!
   ❌ BAD: "Explore the city", "Free time", "Sightseeing"
   ✅ GOOD: "Sky Tower + SkyWalk Experience", "Auckland Art Gallery", "Wynyard Quarter Waterfront"

2. **Highlights** - Key selling points (CONCISE, 1-2 sentences max!)
   - What makes it special/unique?
   - Main experiences or features
   Example: "360° panoramic views, optional SkyWalk at 192m, revolving restaurant"
   
   ❌ BAD (too long): "Visit Auckland's iconic 328m tower for 360° panoramic views. Optional SkyWalk for thrill-seekers - walk around the exterior platform at 192m high. Includes observation decks on multiple levels. Cost: $32 standard, $150 SkyWalk. Book online to skip queues."
   ✅ GOOD (concise): "360° views of Auckland, SkyWalk experience at 192m, observation decks"

3. **Duration** - Estimated time to spend
   - Be specific: "2-3 hours", "1.5 hours", "Full afternoon"

4. **Price** - Estimated cost
   - Be clear: "$32 per person", "Free entry", "$15-30"

5. **Precise Location** - Be specific!
   ❌ BAD: "Auckland CBD", "Tokyo"
   ✅ GOOD: "Victoria Street West, Auckland CBD", "Asakusa, Taito City"

**Activity Diversity Each Day:**
- 1 major attraction/experience (museum, landmark, nature, etc.)
- 1-2 dining experiences (local cuisine, cafes, food markets)
- Optional: culture (temples, art), shopping, nightlife, relaxation

**Data Requirements for Full Plan (CRITICAL):**
- **mapPoints**: List of {name, lat, lng} for ALL UNIQUE cities visited. List each city ONCE even if it's both departure and return city. Example: if routeFlow is ["Auckland", "Tokyo", "Shanghai", "Auckland"], mapPoints must include [{name: "Auckland", lat: -36.8485, lng: 174.7633}, {name: "Tokyo", ...}, {name: "Shanghai", ...}].
- **routeFlow**: MUST show the COMPLETE journey including return. Example: ["Auckland", "Tokyo", "Shanghai", "Auckland"] for a round trip. CRITICAL: Include departure city at BOTH start and end for round trips.
- **dayPlans**: YOU MUST GENERATE EXACTLY THE NUMBER OF DAYS REQUESTED BY THE USER!
  - If user requests 7 days, you MUST provide dayPlans with day 1, 2, 3, 4, 5, 6, 7 (all 7 days, NO shortcuts!)
  - If durationDays is 10, you MUST create 10 dayPlans entries
  - NEVER reduce the trip length on your own - this is a CRITICAL requirement!
  - For EVERY day plan, you MUST provide:
  - **city**: REQUIRED - The main city where this day's activities take place. Example: "Tokyo", "Auckland", "Shanghai". This is CRITICAL for filtering. Even if the day starts with "Arrive in Tokyo", the city should be "Tokyo".
  - **daySummary**: REQUIRED - A SHORT, catchy 3-5 word summary of the day's theme. Examples: "Imperial History and Fine Dining", "Temple of Heaven and Hutong Foodie Tour", "Modern Art and Waterfront Dining", "Mountain Hikes and Local Cuisine". Keep it brief and descriptive!
  - For EVERY activity in the activities array, you MUST provide:
  - Precise Latitude and Longitude.
  - A 'type' field: REQUIRED, one of ["attraction", "food", "hotel"].
    * Use "food" for: restaurants, cafes, dining, meals (breakfast/lunch/dinner), food markets, bars
    * Use "hotel" for: hotels, accommodations, check-in/check-out
    * Use "attraction" for: sightseeing spots, museums, temples, parks, shopping, activities
  - **duration**: string (e.g., "2-3 hours", "1.5 hours") - ESTIMATE the time spent here.
  - **price**: string (e.g., "From $30", "Free entry", "$15-25") - ESTIMATE the cost.
  
  **Example of HIGH-QUALITY activities:**
    - { 
        "time": "Morning", 
        "title": "Sky Tower + SkyWalk Experience", 
        "type": "attraction", 
        "duration": "2.5 hours",
        "price": "From $32",
        "highlights": "360° panoramic views, SkyWalk at 192m height, observation decks on multiple levels", 
        "location": "Victoria Street West, Auckland CBD", 
        "coords": { "lat": -36.8485, "lng": 174.7633 }, 
        "rating": 4.6, 
        "reviewCount": 1580 
      }
    - { 
        "time": "Evening", 
        "title": "Dinner at Depot Eatery", 
        "type": "food", 
        "duration": "1.5 hours",
        "price": "$30-50",
        "highlights": "Celebrity chef Al Brown, famous for fresh oysters and lamb ribs, lively communal dining", 
        "location": "Federal Street, Auckland CBD", 
        "coords": { "lat": -36.8485, "lng": 174.7633 }, 
        "rating": 4.5, 
        "reviewCount": 1240 
      }
- **accommodation**: REQUIRED for multi-day trips. You MUST provide hotels for EVERY city where the traveler stays overnight.
  - **Hotel Selection Criteria** (CRITICAL):
    * Prefer MAJOR HOTEL CHAINS and well-known hotels (Hilton, Hyatt, Marriott, InterContinental, etc.)
    * These hotels are more likely to have official websites for live pricing
    * Must have good ratings (4.0+) and substantial reviews (500+)
  - Calculation: For an N-day trip, typically provide (N-1) accommodation entries (one for each night).
  - For EACH hotel, you MUST include ALL fields:
    * name: Actual hotel name (e.g., "Park Hyatt Tokyo", "Hilton Auckland")
    * location: Full address or neighborhood (e.g., "Shinjuku, Tokyo, Japan")
    * city: The city name (e.g., "Tokyo", "Auckland")
    * checkIn: ISO date format (e.g., "2026-01-10")
    * checkOut: ISO date format (e.g., "2026-01-13")
    * nights: Number of nights staying (e.g., 3)
    * pricePerNight: Estimated price string with NZ$ currency (e.g., "NZ$350")
    * totalPrice: Total cost string (e.g., "NZ$1,050")
    * rating: Simulated rating 4.0-5.0 (e.g., 4.6)
    * reviewCount: Number of reviews 500-5000 (e.g., 2847)
    * hotelType: Type of accommodation (e.g., "Luxury Hotel", "Business Hotel", "Boutique Hotel")
    * amenities: Array of key features (e.g., ["Free WiFi", "Breakfast Included", "Pool", "Gym", "Spa"])
    * coords: Precise latitude and longitude (e.g., { "lat": 35.6850, "lng": 139.6917 })
    * imageQuery: Search term for finding hotel images (e.g., "Park Hyatt Tokyo exterior")
  - Example: For a 7-day trip visiting Tokyo (3 nights) and Auckland (3 nights), provide 2 accommodation entries.
- **transportation**: REQUIRED. List ALL major transport between cities (flights, trains, ferries).
  - **CRITICAL**: For ANY trip involving different cities, you MUST provide transportation.
  - **CRITICAL**: For round trips (e.g., Shanghai → Tokyo → Shanghai), you MUST include BOTH outbound AND return flights.
  - For EACH transport leg, include:
    * mode: "flight", "train", "ferry", etc.
    * from: departure city name (e.g., "Shanghai")
    * to: arrival city name (e.g., "Tokyo")
    * time: estimated departure time (e.g., "10:30 AM" or "10:30")
    * priceEstimate: estimated price per person (e.g., "NZ$1,200 per person")
    * coords: array of [departure coords, arrival coords]
  - Example: For a round trip Shanghai → Tokyo → Shanghai, provide 2 transportation entries:
    * { "mode": "flight", "from": "Shanghai", "to": "Tokyo", ... }
    * { "mode": "flight", "from": "Tokyo", "to": "Shanghai", ... }

**The "Be Smart & Professional" Rules:**
- Keep the 'reply' brief (<50 words). Focus energy on the JSON data.
- NEVER use [...] placeholders. Fill every field.
- Ensure Latitude/Longitude are as accurate as possible for specific attractions.
- **Ratings & Reviews**: Always include simulated rating (4.0 to 5.0) and reviewCount (50 to 2000) for every activity.
- **CRITICAL**: For multi-day trips, ALWAYS provide accommodation. Travelers need a place to sleep! Don't forget this.
- **CRITICAL**: For trips involving different cities, ALWAYS provide transportation for ALL legs (including return flights)! Travelers need to know how to get there and back!
- **CRITICAL**: ALWAYS generate the EXACT number of days requested! If durationDays = 7, you MUST create 7 dayPlans entries (not 5, not 6, exactly 7!).

**Output Format (Strict JSON):**
{
  "reply": "Summary text",
  "plannerState": {
    "tripTitle": "string",
    "summary": { "days": 10, "cities": 3, "activitiesCount": 12, "hotelsCount": 1, "transportsCount": 2 },
    "routeFlow": ["Auckland", "Tokyo", "Shanghai", "Auckland"],
    "mapPoints": [
      { "name": "Auckland", "lat": -36.8485, "lng": 174.7633 },
      { "name": "Tokyo", "lat": 35.6762, "lng": 139.6503 },
      { "name": "Shanghai", "lat": 31.2304, "lng": 121.4737 }
    ],
    "dates": { "start": "2026-01-10", "end": "2026-01-20", "durationDays": 10 },
    "departureCity": "Auckland",
    "destination": "Tokyo",
    "travellers": 2,
    "dayPlans": [
      {
        "day": 1,
        "title": "...",
        "daySummary": "Imperial History and Fine Dining",
        "city": "Tokyo",
        "weather": {
          "condition": "cloudy", 
          "tempRange": "2°C - 8°C"
        },
        "activities": [
          { 
            "time": "Morning", 
            "title": "Attraction Name",
            "type": "attraction",
            "highlights": "...", 
            "location": "...", 
            "coords": { "lat": number, "lng": number },
            "duration": "2-3 hours",
            "price": "From $30",
            "rating": number,
            "reviewCount": number
          },
          { 
            "time": "Lunch", 
            "title": "Restaurant Name",
            "type": "food",
            "highlights": "...", 
            "location": "...", 
            "coords": { "lat": number, "lng": number },
            "duration": "1-1.5 hours",
            "price": "$20-40"
          }
        ]
      }
    ],
    "transportation": [
      {
        "mode": "flight",
        "from": "Auckland",
        "to": "Tokyo",
        "time": "10:30 AM",
        "priceEstimate": "NZ$1,200 per person",
        "coords": [
          { "lat": -36.8485, "lng": 174.7633 },
          { "lat": 35.6762, "lng": 139.6503 }
        ]
      },
      {
        "mode": "flight",
        "from": "Tokyo",
        "to": "Shanghai",
        "time": "02:00 PM",
        "priceEstimate": "NZ$500 per person",
        "coords": [
          { "lat": 35.6762, "lng": 139.6503 },
          { "lat": 31.2304, "lng": 121.4737 }
        ]
      },
      {
        "mode": "flight",
        "from": "Shanghai",
        "to": "Auckland",
        "time": "11:00 AM",
        "priceEstimate": "NZ$1,400 per person",
        "coords": [
          { "lat": 31.2304, "lng": 121.4737 },
          { "lat": -36.8485, "lng": 174.7633 }
        ]
      }
    ],
    "accommodation": [
      {
        "name": "Park Hyatt Tokyo",
        "location": "3-7-1-2 Nishi-Shinjuku, Shinjuku, Tokyo",
        "city": "Tokyo",
        "checkIn": "2026-01-10",
        "checkOut": "2026-01-13",
        "nights": 3,
        "pricePerNight": "NZ$450",
        "totalPrice": "NZ$1,350",
        "rating": 4.7,
        "reviewCount": 2847,
        "hotelType": "Luxury Hotel",
        "amenities": ["Free WiFi", "Breakfast Included", "Pool", "Spa", "Gym", "24h Room Service"],
        "coords": { "lat": 35.6850, "lng": 139.6917 },
        "imageQuery": "Park Hyatt Tokyo exterior luxury"
      },
      {
        "name": "Hilton Auckland",
        "location": "147 Quay Street, Auckland CBD",
        "city": "Auckland",
        "checkIn": "2026-01-17",
        "checkOut": "2026-01-20",
        "nights": 3,
        "pricePerNight": "NZ$280",
        "totalPrice": "NZ$840",
        "rating": 4.5,
        "reviewCount": 1923,
        "hotelType": "Business Hotel",
        "amenities": ["Free WiFi", "Gym", "Restaurant", "Bar", "Waterfront Views"],
        "coords": { "lat": -36.8428, "lng": 174.7680 },
        "imageQuery": "Hilton Auckland waterfront exterior"
      }
    ]
  }
}
`;

function formatCompactPlanSummary(plan: any): string {
  if (!plan) return '';
  const lines: string[] = [];
  lines.push(`Trip: ${plan.tripTitle || 'Trip'} to ${plan.destination || 'Destination'}`);
  if (plan.departureCity) lines.push(`Departure: ${plan.departureCity}`);
  if (plan.dates) {
    const duration = plan.dates.durationDays || plan.dayPlans?.length || '';
    lines.push(`Dates: ${plan.dates.start || ''} to ${plan.dates.end || ''} (${duration} days)`);
  }
  if (plan.travellers) lines.push(`Travellers: ${plan.travellers}`);

  if (plan.dayPlans && Array.isArray(plan.dayPlans) && plan.dayPlans.length > 0) {
    lines.push('\nExisting Days:');
    for (const d of plan.dayPlans) {
      const actList = (d.activities || [])
        .map((a: any) => `${a.time ? a.time + ': ' : ''}${a.title || 'Activity'} (${a.type || 'attraction'})`)
        .slice(0, 5)
        .join('; ');
      lines.push(`- Day ${d.day} (${d.city || plan.destination || ''}): ${d.daySummary || d.title || ''} [${actList}]`);
    }
  }

  if (plan.accommodation && Array.isArray(plan.accommodation) && plan.accommodation.length > 0) {
    lines.push('\nAccommodation:');
    for (const h of plan.accommodation) {
      lines.push(`- ${h.name} in ${h.city || ''} (${h.nights || 1} nights, ${h.pricePerNight || ''}/night)`);
    }
  }

  if (plan.transportation && Array.isArray(plan.transportation) && plan.transportation.length > 0) {
    lines.push('\nTransportation:');
    for (const t of plan.transportation) {
      lines.push(`- ${t.mode || 'Flight'}: ${t.from} → ${t.to} (${t.date || ''} ${t.time || ''})`);
    }
  }

  return lines.join('\n');
}

export async function POST(request: Request) {
  // Rate Limit: 5 requests per hour per signed-in user (or visitor IP)
  const { identifier, isUser } = await getClientIdentifier(request);
  const rateLimit = await checkRateLimit(aiChatLimiter, identifier);
  if (!rateLimit.success) {
    console.warn(`[Chat API] Rate limit reached for ${identifier}`);
    return createRateLimitResponse(
      rateLimit,
      isUser
        ? 'You have reached your limit of 5 AI chat requests per hour. Please wait a bit before asking more questions.'
        : 'You have reached the visitor limit of 5 AI chat requests per hour. Please sign in or try again later.'
    );
  }

  const body = await request.json().catch(() => ({}));
  const { messages = [], input = '', currentPlan = null } = body as {
    messages?: any[];
    input?: string;
    currentPlan?: any;
  };

  try {
    const messagesToAI: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (currentPlan && (currentPlan.tripTitle || currentPlan.destination || (currentPlan.dayPlans && currentPlan.dayPlans.length > 0))) {
      const compactSummary = formatCompactPlanSummary(currentPlan);
      messagesToAI.push({
        role: 'system',
        content: `CURRENT ITINERARY SUMMARY:
${compactSummary}

INSTRUCTIONS FOR ITINERARY EDITS:
The user already has the above itinerary. If their message asks to modify, add, remove, or swap anything:
- Return ONLY the updated fields or days in "plannerState".
  For example, if modifying Day 2, you only need to return:
  "plannerState": {
    "dayPlans": [
      {
        "day": 2,
        "city": "...",
        "daySummary": "...",
        "activities": [ ...updated activities... ]
      }
    ]
  }
- DO NOT re-generate unchanged days, unchanged hotels, or unchanged flights. Unchanged items are automatically preserved and merged by the system.
- If the user asks for a brand new trip to a different destination, generate a complete new plan.
- In your "reply", briefly explain the updates made.
- Keep the JSON compact and valid.`,
      });
    }

    const recentMessages = (messages || []).slice(-6);
    messagesToAI.push(
      ...recentMessages.map((m: any) => ({
        role: m.type === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: input }
    );

    const response = await createAIChatCompletion({
      messages: messagesToAI as any,
      response_format: { type: 'json_object' },
      max_tokens: 16000,
      temperature: 0.7,
    });

    const rawContent = response.choices[0]?.message?.content || '{}';
    console.log('[Chat API] Raw response length:', rawContent.length);
    const content = extractOrWrapJson(rawContent);
    let plannerState = content.plannerState || {};

    // If currentPlan was provided, ensure seamless merging and preservation of unchanged sections:
    if (currentPlan && Object.keys(currentPlan).length > 0) {
      const isNewDestination =
        content.plannerState?.destination &&
        currentPlan.destination &&
        String(content.plannerState.destination).toLowerCase() !== String(currentPlan.destination).toLowerCase();

      if (!isNewDestination) {
        // Base plannerState on currentPlan
        const mergedPlan = {
          ...currentPlan,
          ...plannerState,
        };

        // Merge dayPlans if partial days were returned
        if (
          content.plannerState?.dayPlans &&
          Array.isArray(content.plannerState.dayPlans) &&
          currentPlan.dayPlans &&
          Array.isArray(currentPlan.dayPlans)
        ) {
          if (content.plannerState.dayPlans.length === currentPlan.dayPlans.length) {
            mergedPlan.dayPlans = content.plannerState.dayPlans;
          } else {
            const mergedDays = [...currentPlan.dayPlans];
            for (const updatedDay of content.plannerState.dayPlans) {
              const idx = mergedDays.findIndex((d: any) => d.day === updatedDay.day);
              if (idx >= 0) {
                mergedDays[idx] = updatedDay;
              } else {
                mergedDays.push(updatedDay);
              }
            }
            mergedPlan.dayPlans = mergedDays;
          }
        } else if (!content.plannerState?.dayPlans && currentPlan.dayPlans) {
          mergedPlan.dayPlans = currentPlan.dayPlans;
        }

        if (!content.plannerState?.accommodation && currentPlan.accommodation) {
          mergedPlan.accommodation = currentPlan.accommodation;
        }
        if (!content.plannerState?.transportation && currentPlan.transportation) {
          mergedPlan.transportation = currentPlan.transportation;
        }

        plannerState = mergedPlan;
      }
    }

    console.log('[Chat API] AI response keys:', Object.keys(content));
    console.log('[Chat API] PlannerState keys:', Object.keys(plannerState));
    console.log('[Chat API] Transportation data:', {
      exists: !!plannerState.transportation,
      isArray: Array.isArray(plannerState.transportation),
      length: plannerState.transportation?.length || 0,
      sample: plannerState.transportation?.[0],
    });

    // Enrich transportation with real flight data using Google Flights
    if (plannerState.transportation && Array.isArray(plannerState.transportation) && plannerState.transportation.length > 0) {
      console.log('[Chat API] Fetching real flight data for', plannerState.transportation.length, 'transportation legs');
      
      const travellers = plannerState.travellers || 2;
      
      const enrichedTransportation = await Promise.all(
        plannerState.transportation.map(async (transport: any) => {
          // Only enrich flight transportation
          if (transport.mode?.toLowerCase().includes('flight') || !transport.mode) {
            try {
              const fromCode = getIATACode(transport.from);
              const toCode = getIATACode(transport.to);

              // Use Google Flights via SerpAPI
              const apiResponse = await searchGoogleFlights({
                from: transport.from,
                to: transport.to,
                date: transport.date || plannerState.dates?.start,
                type: 2, // One-way
              });
              
              const flights = getBestFlights(apiResponse, travellers);

              if (flights && flights.length > 0) {
                const flight = flights[0];
                
                // Format time string safely
                const safeTime = (t?: string) => {
                  if (!t) return '';
                  if (/^\d{1,2}:\d{2}/.test(t)) return t;
                  const d = new Date(t);
                  return !isNaN(d.getTime()) ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : t;
                };

                const depTimeStr = flight.departure?.time || flight.departure?.scheduled;
                const arrTimeStr = flight.arrival?.time || flight.arrival?.scheduled;
                const formattedTime = depTimeStr && arrTimeStr
                  ? `${safeTime(depTimeStr)} - ${safeTime(arrTimeStr)}`
                  : transport.time || '10:00 - 14:00';
                
                // Get departure date safely
                const parseDate = (dStr?: string) => {
                  if (!dStr) return null;
                  const d = new Date(dStr);
                  return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : null;
                };

                const flightDate =
                  parseDate(flight.departure?.scheduled) ||
                  transport.date ||
                  plannerState.dates?.start ||
                  new Date().toISOString().split('T')[0];
                
                console.log('[Chat API] Enriched with Google Flights:', {
                  airline: flight.airline,
                  code: flight.airlineCode,
                  flightNumber: flight.flightNumber,
                  duration: flight.duration,
                  date: flightDate,
                  time: formattedTime,
                  from: fromCode,
                  to: toCode,
                });
                
                return {
                  ...transport,
                  fromCode,
                  toCode,
                  flightNumber: flight.flightNumber,
                  airline: flight.airline,
                  airlineCode: flight.airlineCode,
                  duration: flight.duration,
                  stops: flight.stops,
                  aircraft: flight.aircraft,
                  price: `NZ$${flight.pricePerPerson.toLocaleString()}`,
                  priceEstimate: `NZ$${flight.price.toLocaleString()}`,
                  time: formattedTime,
                  date: flightDate,
                  carbonEmissions: flight.carbonEmissions,
                  travelClass: flight.travelClass,
                };
              }
            } catch (error) {
              console.warn('[Chat API] Failed to fetch flight data for', transport.from, '→', transport.to, ':', error);
            }
          }
          
          return transport;
        })
      );

      plannerState.transportation = enrichedTransportation;
      console.log('[Chat API] Enriched transportation with Google Flights data');
    }

    return NextResponse.json({
      reply: content.reply || "I'm sorry, I couldn't process that.",
      plannerState,
    });
  } catch (error: any) {
    console.error('[Chat API] Error:', error);
    const isMissingKey = String(error?.message).includes('missing') || String(error?.message).includes('GROQ_API_KEY');
    const userMessage = isMissingKey
      ? "To enable AI trip planning, please ensure GROQ_API_KEY is configured in your .env.local file."
      : currentPlan?.destination || currentPlan?.tripTitle
        ? "I had a momentary hitch updating that part of the itinerary. Could you please specify which day or activity you'd like to adjust?"
        : "I'd love to help plan your trip! Could you tell me a little more about your destination, dates, and number of travellers?";

    return NextResponse.json({
      reply: userMessage,
      plannerState: {},
    });
  }
}
