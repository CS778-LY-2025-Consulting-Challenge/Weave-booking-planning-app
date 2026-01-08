# 🌍 Xotelo + Next.js Integration Guide

## Overview

A **performance-optimized hotel search** using Xotelo's TripAdvisor data with lazy-loaded pricing.

**Key Principle:** Don't fetch rates for 30 hotels at once. Fetch them ONLY when needed.

```
User Search
    ↓
🔍 GET /api/xotelo/search?query=tokyo
    ├─ Location resolution (get location_key)
    ├─ Fetch 30 hotels with images, ratings, amenities
    ├─ NO rates fetched yet ✅ (saves ~30 API calls)
    └─ Return: { hotels: [...], hotel_count: 30 }
    ↓
User sees 30 hotels in grid:
    ├─ Hotel name
    ├─ Image (TripAdvisor photo)
    ├─ Rating (4.5 ⭐)
    ├─ Price range estimate ($89-$200/night)
    └─ Button: "View Details & Rates"
    ↓
User clicks hotel card
    ↓
💰 GET /api/xotelo/rates?hotel_key=...&chk_in=...&chk_out=...
    ├─ Fetch live rates from Xotelo
    ├─ Returns rates from: Hotels.com, Booking.com, Expedia, Agoda, etc.
    ├─ Finds lowest price
    └─ Returns booking URL
    ↓
Show modal/detail page with:
    ├─ All OTA prices
    ├─ Lowest rate highlighted
    └─ Button: "Book on [OTA Name]" → Opens booking URL in new tab
```

---

## 📊 API Endpoints

### **1. Search Hotels** (NO rates)

```bash
GET /api/xotelo/search?query=tokyo&chk_in=2025-12-15&chk_out=2025-12-22
```

**Response:**
```json
{
  "location_key": "g1234567",
  "query": "tokyo",
  "hotel_count": 30,
  "has_rates": false,
  "hotels": [
    {
      "key": "g123-d456789",
      "name": "Shinjuku Metropolitan",
      "accommodation_type": "Hotel",
      "image": "https://...",
      "url": "https://www.tripadvisor.com/...",
      "review_summary": {
        "rating": 4.5,
        "count": 2345
      },
      "price_ranges": {
        "minimum": 89,
        "maximum": 250
      },
      "geo": {
        "latitude": 35.6762,
        "longitude": 139.6503
      },
      "mentions": ["Modern", "Trendy", "Comfortable", "Central"],
      "short_place_name": "Shinjuku, Tokyo"
    },
    // ... 29 more hotels
  ]
}
```

**Parameters:**
- `query` *(required)* - City name
- `chk_in` *(optional)* - Check-in date (YYYY-MM-DD)
- `chk_out` *(optional)* - Check-out date (YYYY-MM-DD)
- `fetchRates` *(optional)* - Set to `true` to fetch rates (only for top 10)
- `rateLimit` *(optional)* - Number of hotels to fetch rates for (default: 10)

---

### **2. Fetch Hotel Rates** (On demand)

```bash
GET /api/xotelo/rates?hotel_key=g123-d456789&hotel_name=Shinjuku%20Metropolitan&chk_in=2025-12-15&chk_out=2025-12-22
```

**Response:**
```json
{
  "hotel_key": "g123-d456789",
  "hotel_name": "Shinjuku Metropolitan",
  "check_in": "2025-12-15",
  "check_out": "2025-12-22",
  "rates": [
    {
      "code": "HotelsCom2",
      "name": "Hotels.com",
      "rate": 189.00
    },
    {
      "code": "BookingCom",
      "name": "Booking.com",
      "rate": 195.50
    },
    {
      "code": "Expedia",
      "name": "Expedia",
      "rate": 192.00
    },
    {
      "code": "Agoda",
      "name": "Agoda",
      "rate": 187.00
    }
  ],
  "lowest_rate": 187.00,
  "lowest_provider": "Agoda",
  "booking_url": "https://www.tripadvisor.com/Hotel_Review-g123-d456789.html",
  "ota_links": {
    "tripadvisor": "https://...",
    "booking_com": "https://www.booking.com",
    "hotels_com": "https://www.hotels.com",
    "expedia": "https://www.expedia.com",
    "agoda": "https://www.agoda.com"
  }
}
```

**Parameters:**
- `hotel_key` *(required)* - TripAdvisor hotel key (g#####-d#####)
- `hotel_name` *(required)* - Hotel name for logging
- `chk_in` *(required)* - Check-in date (YYYY-MM-DD)
- `chk_out` *(required)* - Check-out date (YYYY-MM-DD)

---

## 💻 Client-Side Usage

### **Search Hotels**

```typescript
import { searchHotels, getHotelRates, openBooking } from '@/services/xoteloService';

// Step 1: Search (fast - no rates fetched)
const results = await searchHotels('Tokyo', '2025-12-15', '2025-12-22');

console.log(`Found ${results.hotel_count} hotels`);
results.hotels.forEach(hotel => {
  console.log(`${hotel.name} - ${hotel.price_ranges.minimum}-${hotel.price_ranges.maximum}`);
});
```

### **Click Hotel Card → Fetch Rates**

```typescript
// Step 2: User clicks hotel → fetch rates
const rates = await getHotelRates(
  hotel.key,                    // "g123-d456789"
  hotel.name,                   // "Shinjuku Metropolitan"
  '2025-12-15',                // check-in
  '2025-12-22'                 // check-out
);

// Show rate breakdown
console.log(`Lowest: $${rates.lowest_rate} (${rates.lowest_provider})`);
rates.rates.forEach(rate => {
  console.log(`${rate.name}: $${rate.rate}`);
});
```

### **Click Book Button → Open Booking**

```typescript
// Step 3: User clicks "Book" → open in new tab
openBooking(rates.booking_url, hotel.name);
// Opens https://www.tripadvisor.com/Hotel_Review-... in new tab
```

---

## ⚡ Performance Benefits

### **Before (Fetching all rates upfront)**

```
1 search query → 30 hotels → 30 rate requests = 31 API calls
Response time: ~8-10 seconds
```

### **After (Lazy loading)**

```
1 search query → 30 hotels (no rates) = 1 API call
Response time: ~1-2 seconds ✅

When user clicks hotel:
1 hotel → 1 rate request = 1 API call (only when needed)
Response time: ~500ms ✅
```

**Savings:** 29 unnecessary API calls avoided per search

---

## 🎨 Example React Component

```typescript
'use client';

import { useState } from 'react';
import { searchHotels, getHotelRates, openBooking, getPriceRangeEstimate, formatRating, getAmenities } from '@/services/xoteloService';
import type { XoteloHotel, XoteloRatesResponse } from '@/services/xoteloService';

export default function HotelSearch() {
  const [hotels, setHotels] = useState<XoteloHotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<XoteloHotel | null>(null);
  const [rates, setRates] = useState<XoteloRatesResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const results = await searchHotels(query, '2025-12-15', '2025-12-22');
      setHotels(results.hotels);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHotel = async (hotel: XoteloHotel) => {
    setSelectedHotel(hotel);
    setRates(null);
    
    // Fetch rates when user clicks hotel
    setLoading(true);
    try {
      const ratesData = await getHotelRates(
        hotel.key,
        hotel.name,
        '2025-12-15',
        '2025-12-22'
      );
      setRates(ratesData);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (bookingUrl: string, hotelName: string) => {
    openBooking(bookingUrl, hotelName);
  };

  return (
    <div>
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search city..."
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* Hotel List Grid */}
      <div className="grid grid-cols-3 gap-4">
        {hotels.map((hotel) => (
          <div
            key={hotel.key}
            className="card cursor-pointer"
            onClick={() => handleSelectHotel(hotel)}
          >
            <img src={hotel.image} alt={hotel.name} className="h-48 w-full object-cover" />
            <h3>{hotel.name}</h3>
            <p>{formatRating(hotel.review_summary.rating, hotel.review_summary.count)}</p>
            <p className="text-lg font-bold">{getPriceRangeEstimate(hotel)}</p>
            <div className="flex gap-2">
              {getAmenities(hotel.mentions).map(amenity => (
                <span key={amenity} className="badge">{amenity}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hotel Details Modal (when user clicks) */}
      {selectedHotel && (
        <div className="modal">
          <h2>{selectedHotel.name}</h2>
          <img src={selectedHotel.image} alt={selectedHotel.name} />
          <p>{formatRating(selectedHotel.review_summary.rating, selectedHotel.review_summary.count)}</p>
          <p>{selectedHotel.short_place_name}</p>

          {loading ? (
            <p>Loading rates...</p>
          ) : rates ? (
            <div>
              <h3>Available Rates</h3>
              <div className="rates-list">
                {rates.rates.map((rate) => (
                  <div
                    key={rate.code}
                    className={rate.rate === rates.lowest_rate ? 'highlighted' : ''}
                  >
                    <span>{rate.name}</span>
                    <span className="price">${rate.rate}</span>
                    {rate.rate === rates.lowest_rate && <span className="badge">BEST PRICE</span>}
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleBook(rates.booking_url, selectedHotel.name)}
                className="btn btn-primary"
              >
                Book on {rates.lowest_provider}
              </button>
            </div>
          ) : (
            <p>Error loading rates</p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 📈 Real-World Flow

### **Scenario: User searches "Tokyo"**

**1️⃣ Initial Load (1 API call)**
```
User enters "Tokyo" → Click Search
GET /api/xotelo/search?query=Tokyo
↓
✅ Returns 30 hotels with images, ratings, price ranges
Response: ~1.5 seconds
Server logs: "Found 30 hotels"
```

**2️⃣ User clicks "Shinjuku Metropolitan" (1 API call)**
```
User clicks hotel card
GET /api/xotelo/rates?hotel_key=g123-d456789&chk_in=2025-12-15&chk_out=2025-12-22
↓
✅ Returns rates from Hotels.com ($189), Booking.com ($195.50), Expedia ($192), Agoda ($187)
Response: ~500ms
Server logs: "Lowest: $187 (Agoda)"
```

**3️⃣ User clicks "Book on Agoda"**
```
window.open('https://www.tripadvisor.com/Hotel_Review-g123-d456789.html', '_blank')
↓
✅ Opens TripAdvisor hotel page in new tab
```

---

## ✅ Checklist

- [x] Search API returns 30 hotels without rates
- [x] Rates API for on-demand pricing
- [x] Client service with lazy loading
- [x] Price range estimates on cards
- [x] Real TripAdvisor ratings
- [x] Hotel images included
- [x] Multiple OTA prices shown
- [x] Direct booking URLs
- [x] Detailed console logging
- [x] TypeScript interfaces
- [x] Performance optimized

---

## 🚀 Quick Start

### **1. Search Hotels**
```typescript
import { searchHotels } from '@/services/xoteloService';

const results = await searchHotels('Tokyo', '2025-12-15', '2025-12-22');
```

### **2. Display Hotel List**
```typescript
{results.hotels.map(hotel => (
  <HotelCard
    hotel={hotel}
    onSelect={() => handleSelectHotel(hotel)}
  />
))}
```

### **3. Fetch Rates on Click**
```typescript
const rates = await getHotelRates(
  hotel.key,
  hotel.name,
  '2025-12-15',
  '2025-12-22'
);
```

### **4. Open Booking**
```typescript
openBooking(rates.booking_url, hotel.name);
```

---

## 🔧 Customization

**Fetch top 20 hotels instead of 30:**
```typescript
GET /api/xotelo/search?query=Tokyo&limit=20
```

**Fetch rates upfront for top 5:**
```typescript
GET /api/xotelo/search?query=Tokyo&fetchRates=true&rateLimit=5
```

**Show specific OTA link:**
```typescript
rates.ota_links.booking_com  // Direct link to Booking.com
rates.ota_links.expedia       // Direct link to Expedia
```

---

## 📊 Summary

| Aspect | Value |
|--------|-------|
| **Hotels per search** | 30 |
| **Initial search time** | ~1-2 seconds |
| **Rate fetch time** | ~500ms |
| **OTA sources** | 4+ (Hotels.com, Booking.com, Expedia, Agoda, etc.) |
| **Images** | TripAdvisor photos |
| **Ratings** | Real TripAdvisor ratings |
| **Booking** | Opens TripAdvisor/OTA in new tab |
| **No authentication** | ✅ Completely free |

