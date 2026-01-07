# Google Maps API Integration

## Overview

This project now uses **Google Maps Places API (New)** for detailed attraction information in the "View Details" panel, including:
- ✅ Real-time accurate place data (phone, website, hours)
- ✅ High-quality photos from Google
- ✅ Authentic user reviews and ratings
- ✅ Opening hours with detailed schedules
- ✅ Price level information

**Note:** Mapbox is still used for:
- The main 3D globe map
- The activity change map display
- Static map previews

## Setup Instructions

### 1. Get Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API (New)**
4. Create credentials (API Key)

### 2. Secure Your API Key (IMPORTANT!)

⚠️ **Security Best Practice:**

In the Google Cloud Console, restrict your API key:

1. Go to **APIs & Services > Credentials**
2. Click on your API key
3. Under **API restrictions**, select:
   - ✅ Places API (New)
   - ✅ Maps Static API (if using map images)
4. Under **Website restrictions**, add your domains:
   - `http://localhost:3000/*` (for development)
   - `https://yourdomain.com/*` (for production)

This prevents unauthorized use of your API key.

### 3. Add API Key to Your Project

**Option A: Environment Variable (Recommended for Production)**

Create a `.env.local` file in the project root:

```bash
GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**Option B: Hardcoded (Only for Testing)**

The API key is currently hardcoded in:
- `src/app/api/google-places/details/route.ts`

You can update it there, but remember to use environment variables for production!

### 4. Verify Setup

1. Start the dev server: `npm run dev`
2. Go to the AI Planner
3. Generate a trip
4. Click "Change" on any activity
5. Click "View Details" on any alternative attraction
6. You should see:
   - Multiple high-quality Google photos
   - Real reviews from Google users
   - Accurate contact information
   - Detailed opening hours

## API Endpoints

### `/api/google-places/details`

**Query Parameters:**
- `name` (string): Place name
- `lat` (number): Latitude
- `lng` (number): Longitude

**Response:**
```json
{
  "name": "Tokyo Tower",
  "address": "4 Chome-2-8 Shibakoen, Minato City, Tokyo 105-0011, Japan",
  "phone": "+81 3-3433-5111",
  "website": "https://www.tokyotower.co.jp/",
  "rating": 4.3,
  "reviewCount": 48234,
  "priceLevel": "$$",
  "hours": "Monday: 9:00 AM – 11:00 PM\nTuesday: 9:00 AM – 11:00 PM\n...",
  "description": "Iconic 1958 tower with observatories...",
  "reviews": [
    {
      "author": "John Doe",
      "authorPhoto": "https://...",
      "rating": 5,
      "text": "Amazing views!",
      "time": "2024-01-15",
      "relativeTime": "2 weeks ago"
    }
  ],
  "photos": [
    "https://places.googleapis.com/v1/.../media?key=...&maxHeightPx=1200",
    "..."
  ]
}
```

## Cost Considerations

Google Places API (New) pricing (as of 2024):
- **Text Search**: $32 per 1,000 requests
- **Place Details**: $17 per 1,000 requests (with reviews/photos)
- **Photo**: Free (via API key in URL)

For typical usage:
- **1 trip generation** ≈ 0 Google API calls (uses OpenAI + Mapbox)
- **1 "Change Activity" click** ≈ 0 Google API calls (pre-cached)
- **1 "View Details" click** ≈ 1 Text Search + 1 Details call ≈ $0.049

**Free tier:** $200 free credits per month ≈ ~4,000 detail views per month

## Troubleshooting

### "Place not found" Error
- The place name might be too generic
- Try adding more context (city name) to the search
- Check console logs for search results

### Photos Not Loading
- Ensure your API key has access to Places API
- Check browser console for CORS errors
- Verify the API key in the photo URL is correct

### Reviews Not Showing
- Some places might not have Google reviews
- The API might return empty reviews array
- Check the `reviewCount` field

## Development Tips

### Testing with Sample Data

If you want to test without using API quota:

1. Use the fallback mode by simulating an API error
2. The component will show basic attraction info
3. Re-enable Google API when ready to test full functionality

### Caching Strategy

Currently, Google Places API is called on-demand when users click "View Details". To improve performance and reduce costs:

- Consider caching responses in localStorage
- Implement server-side caching with Redis
- Pre-fetch details for top-rated attractions

## Migration from Foursquare

Previously, the app used Foursquare API for place details. Google Places provides:

**Advantages:**
- ✅ More accurate and up-to-date information
- ✅ Better photo quality and quantity
- ✅ Authentic Google user reviews
- ✅ Detailed opening hours
- ✅ Direct integration with Google Maps ecosystem

**Note:** You can still keep Foursquare as a fallback if needed.

## Questions?

If you encounter any issues:
1. Check browser console for error messages
2. Verify API key permissions in Google Cloud Console
3. Test the API endpoint directly: `/api/google-places/details?name=Tokyo%20Tower&lat=35.6586&lng=139.7454`

