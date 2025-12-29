# Guide Appointment Booking System

## Overview
A production-ready appointment booking system for 1:1 sessions with local travel guides. Users can book appointments, select time slots, and join video calls with guides.

## Features Implemented

### 1. Guide Card Enhancement
- Added "Book appointment" button to each guide card in the carousel
- Button styled to match existing design system with hover effects
- Button passes guide information to the booking flow

### 2. Booking Dialog (GuideBookingDialog.tsx)
A comprehensive multi-step booking experience:

**Step 1: Select Time**
- Clean calendar interface for date selection
- Sundays disabled, past dates disabled
- Available time slots displayed for selected date
- Time slots are clickable buttons with hover states
- Selected slot highlighted in blue

**Step 2: Appointment Form**
- Booking summary showing guide, date, time, and session type
- Form fields:
  - Full name (required)
  - Email (required, validated)
  - Notes/reason for appointment (optional)
- Real-time validation with error messages
- Professional form layout with clear labels

**Step 3: Confirmation**
- Success state with checkmark icon
- Complete booking details displayed
- Email confirmation notice
- Smooth transition to video call

### 3. Video Call Popout (VideoCallPopout.tsx)
Professional video call interface:

**Features:**
- Full-screen or windowed mode toggle
- Live connection indicator
- Call duration counter
- Connecting state with loading animation
- Main video area with guide avatar/placeholder
- Picture-in-picture for user's camera
- Control buttons:
  - Mute/unmute microphone
  - Toggle video on/off
  - End call
- Connection quality indicator (HD badge)
- Appointment details footer
- Animated background elements
- Professional color scheme (gradient blues/purples)

### 4. User Flow
1. User clicks "Book appointment" on a guide card
2. Booking dialog opens with guide info at top
3. User selects date from calendar
4. User selects time slot from available times
5. User fills in contact details and notes
6. User confirms booking
7. Success screen shown with booking summary
8. Video call automatically opens after 2 seconds
9. Professional video call interface simulates live session

## Technical Implementation

### Components Created
- `GuideBookingDialog.tsx` - Main booking flow modal
- `VideoCallPopout.tsx` - Video call interface
- Updated `guides/page.tsx` - Integrated booking system

### Key Libraries Used
- `date-fns` - Date formatting and manipulation
- `lucide-react` - Icons throughout the UI
- Shadcn UI components - Dialog, Calendar, Button, Input, etc.

### State Management
- Booking state tracked at page level
- Multi-step form flow within dialog
- Smooth transitions between steps
- Proper cleanup on dialog close

### Design Highlights
- Consistent with existing Weave design system
- Professional gradient backgrounds
- Smooth animations and transitions
- Responsive layouts (mobile + desktop)
- Clear visual hierarchy
- Accessible form validation
- Loading and connecting states

### Future Enhancement Opportunities
- Real backend API integration
- Real video SDK integration (e.g., Twilio, Agora, Daily.co)
- Payment processing for paid sessions
- Calendar sync (Google Calendar, iCal)
- Email/SMS reminders
- Guide availability management system
- Time zone handling for international bookings
- Past appointment history
- Rating and review after session

## Usage

```tsx
// The booking flow is automatically integrated into the Guides page
// Click "Book appointment" on any guide card to start
```

## Styling Notes
- All colors match existing design system
- Border radius consistent throughout (rounded-lg, rounded-xl, rounded-2xl)
- Spacing uses Tailwind's spacing scale
- Hover states on all interactive elements
- Focus states for accessibility
- Mobile-responsive breakpoints

This implementation provides a complete, shippable booking experience that feels like a real production feature.
