# Hotel Search Feature Documentation

## Overview
The Hotel Search feature has been added to the Hotels page, allowing users to search for hotels by location, check-in/check-out dates, and number of guests. The search bar is prominently displayed at the top of the page in the hero section.

## Components

### 1. HotelSearch Component (`src/components/HotelSearch.tsx`)
**Purpose**: Renders the hotel search form with input fields

**Features**:
- Location/City input field with Map Pin icon
- Check-in date picker (minimum date is today)
- Check-out date picker (must be after check-in date)
- Guest count selector (1-5+ guests)
- Search button with loading indicator
- Form validation with toast notifications
- Responsive design (1 column on mobile, 5 columns on desktop)
- Disabled state during search

**Props**:
```typescript
interface HotelSearchProps {
  onSearch: (params: HotelSearchParams) => void;  // Callback when search is submitted
  isLoading: boolean;  // Show loading spinner in button
}
```

**Search Parameters**:
```typescript
interface HotelSearchParams {
  location: string;
  checkInDate: string;  // YYYY-MM-DD format
  checkOutDate: string;  // YYYY-MM-DD format
  guests: number;
}
```

### 2. HotelResults Component (`src/components/HotelResults.tsx`)
**Purpose**: Displays hotel search results as interactive cards

**Features**:
- Loading skeleton state with 6 placeholder cards
- Error state with red alert message
- Empty results message with helpful instructions
- Hotel cards with:
  - Hotel image with hover zoom effect
  - Like/favorite button (heart icon)
  - Hotel name and location
  - Star rating with review count
  - Amenities badges
  - Price per night
  - Book Now button
- Responsive grid (2-3 columns)
- Staggered animation on card entrance

**Props**:
```typescript
interface HotelResultsProps {
  hotels: HotelResult[];  // Array of hotels to display
  isLoading: boolean;     // Show loading skeleton
  error: string | null;   // Show error message if present
  onBooking: (hotel: HotelResult) => void;  // Callback when book button clicked
}
```

**Hotel Result Interface**:
```typescript
interface HotelResult {
  id: string;
  name: string;
  location: string;        // Street address
  city: string;            // City name
  country: string;         // Country name
  rating: number;          // 1-5 stars
  reviews: number;         // Number of reviews
  pricePerNight: number;   // Price in USD
  image: string;           // Image URL
  description: string;     // Hotel description
  amenities: string[];     // Array of amenity names
  guests: number;          // Max guests
}
```

### 3. Hotel Service (`src/services/hotelService.ts`)
**Purpose**: Handles hotel API calls and data management

**Functions**:
- `searchHotels(params: HotelSearchParams): Promise<HotelResult[]>`
  - Accepts location, check-in date, check-out date, and guest count
  - Returns array of matching hotels
  - Includes 800ms simulated delay for API realism

**Current Implementation**: Mock Data
The service currently returns mock hotel data that matches the search location. Six sample hotels are available:
1. Luxury City Hotel - 5-star luxury
2. Modern Boutique Resort - Modern design focused
3. Elegant Plaza Hotel - Classic elegance
4. Riverside Resort - Nature views
5. Heritage Grand Hotel - Historic charm
6. Metropolitan Tower - Contemporary luxury

**Mock Data Filtering**:
- Searches by city name
- Searches by hotel name
- Searches by location string
- Returns all mock hotels if no matches found

**Future API Integration**: The service includes commented examples for three real APIs:
1. **Amadeus Hotel Search API** (Recommended)
   - Enterprise-grade API
   - Requires API key and secret
   - Full implementation example included

2. **RapidAPI Hotels.com Integration**
   - Third-party hotel booking API
   - Requires RapidAPI key
   - Full implementation example included

3. **Google Hotels API**
   - Google's hotel search
   - Requires Google API key
   - Basic implementation example included

## Integration in Hotels Page

### Location
The HotelSearch component replaces the original static search bar at the top of the hotel page hero section.

### State Management
The hotels page component manages search state:
```typescript
const [searchResults, setSearchResults] = useState<HotelResult[]>([]);
const [isSearching, setIsSearching] = useState(false);
const [searchError, setSearchError] = useState<string | null>(null);
const [hasSearched, setHasSearched] = useState(false);
```

### Handler Functions

**handleHotelSearch**:
- Called when user submits search form
- Sets isSearching to true
- Calls searchHotels service
- Updates searchResults on success
- Sets searchError on failure
- Shows toast notifications for user feedback
- Sets hasSearched to true

**handleHotelBooking**:
- Called when user clicks "Book Now" on a hotel card
- Shows success toast notification
- Ready for routing to booking confirmation page

### Results Display
Results are conditionally rendered after the hero section only when hasSearched is true, preventing blank results from showing on initial page load.

## Usage Guide

### For Users
1. Go to the Hotels page (`/hotels`)
2. Enter desired location in the search bar
3. Select check-in date (minimum is today)
4. Select check-out date (must be after check-in)
5. Select number of guests from dropdown
6. Click "Search Hotels" button
7. View results below the hero section
8. Like hotels by clicking heart icon
9. Click "Book Now" to proceed with booking

### For Developers

#### Adding Real API Integration
1. Choose an API provider (see options in hotelService.ts)
2. Get API credentials
3. Add credentials to `.env.local`:
   ```
   AMADEUS_API_KEY=your_key
   AMADEUS_API_SECRET=your_secret
   ```
4. Uncomment and implement the API call in hotelService.ts
5. Remove mock data or keep as fallback

#### Customizing Hotel Results Display
Modify HotelResults component props to customize:
- Grid columns: Change `md:grid-cols-2 lg:grid-cols-3`
- Amenity badges: Modify `Badge` component styling
- Card animations: Adjust `motion` props
- Like button: Change heart icon behavior

#### Extending Search Functionality
Add more filters by:
1. Expanding HotelSearchParams interface
2. Adding form fields to HotelSearch component
3. Using parameters in searchHotels service
4. Updating mock data filtering logic

## Error Handling

The feature includes comprehensive error handling:

1. **Form Validation Errors**: Toast notifications for invalid inputs
2. **API Errors**: Caught and displayed in HotelResults error state
3. **Network Errors**: Fallback to mock data
4. **Empty Results**: User-friendly message with search suggestions

## Styling & Responsiveness

### Mobile (< 768px)
- Search form: Single column layout
- Hotel cards: 2 columns
- Touch-friendly button sizes

### Tablet (768px - 1024px)
- Search form: 3-4 column layout
- Hotel cards: 2-3 columns

### Desktop (> 1024px)
- Search form: Full 5 column layout
- Hotel cards: 3 columns

All components use Tailwind CSS for consistent styling with the existing site design.

## Performance Considerations

1. **Lazy Loading**: Hotel images use Unsplash URLs with size optimization
2. **Memoization**: Consider wrapping HotelResults in React.memo for large datasets
3. **Pagination**: Implement for results > 20 hotels
4. **Caching**: Consider SWR or React Query for API caching
5. **Skeleton Loading**: Provides visual feedback during 800ms API delay

## Accessibility

- Form labels with proper htmlFor attributes
- ARIA labels where needed
- Keyboard navigation support
- Button focus states
- Semantic HTML structure
- Icon labels via title attributes

## Testing Recommendations

1. **Unit Tests**: Test HotelSearch validation logic
2. **Integration Tests**: Test handleHotelSearch function
3. **E2E Tests**: Test complete search-to-booking flow
4. **API Mocking**: Use mock data for consistent testing
5. **Responsive Tests**: Test on multiple screen sizes

## Future Enhancements

1. **Filters**: Price range, rating, amenities filters
2. **Sorting**: By price, rating, distance, popularity
3. **Pagination**: For large result sets
4. **Map View**: Show hotels on interactive map
5. **Favorites**: Save favorite hotels to user profile
6. **Booking Flow**: Complete booking with confirmation
7. **Reviews**: Display guest reviews and ratings
8. **Advanced Search**: More granular location selection
9. **Availability Calendar**: Real-time availability checking
10. **Payment Integration**: Stripe or similar for booking payments

## Troubleshooting

### Search button not working
- Check that location, dates, and guests are all selected
- Verify `handleHotelSearch` function is defined
- Check browser console for errors

### No results displayed
- Verify search location matches mock data (e.g., "New York", "Paris")
- Check that hasSearched state is true
- Try different search terms

### Images not loading
- Verify internet connection
- Check Unsplash image URLs are accessible
- Consider using local images for production

### API integration failing
- Verify API credentials in .env.local
- Check API rate limits
- Review API documentation for current endpoints
- Test API credentials in Postman first
