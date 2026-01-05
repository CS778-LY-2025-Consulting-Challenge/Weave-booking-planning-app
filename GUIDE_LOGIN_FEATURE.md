# Guide Login Feature - Testing & Implementation Guide

## Overview
This guide covers the new "Login as Guide" feature that allows guides to log in separately and view their upcoming appointments in a dedicated dashboard.

## What's New

### 1. **Dual Login Page**
- The login page now has a toggle between "Login as Traveler" and "Login as Guide"
- Both modes use the same email/password form
- Visual toggle at the top of the login form

### 2. **Guide Dashboard** (`/guide-dashboard`)
- Private route accessible only to authenticated guides
- Displays all upcoming appointments for the logged-in guide
- Shows key stats: upcoming count, total booked, appointments this week
- Each appointment displays:
  - Traveler name
  - Journey/package name
  - Date and time (with smart formatting: "Today", "Tomorrow", or date)
  - Meeting type (video call or in-person)
  - Status badge
- Appointments sorted by soonest date first
- Friendly empty state when no appointments exist

### 3. **Authentication Updates**
- Enhanced AuthContext to support:
  - `userType`: 'traveler' | 'guide'
  - `guideId`: Unique guide identifier
  - `guideEmail`: Guide's email address
  - `guideName`: Guide's display name
  - `logout()`: Clear all auth data and navigate to login

## How to Test

### Test 1: Login as Guide (Happy Path)

1. **Navigate to login page**
   ```
   http://localhost:3000/auth
   ```

2. **Switch to "Login as Guide"**
   - Click the "Login as Guide" button in the toggle

3. **Enter test credentials**
   - Email: `guide@example.com`
   - Password: `password123`

4. **Click "Log in"**
   - Should redirect to `/guide-dashboard`
   - Demo appointments will be loaded automatically

5. **Verify dashboard content**
   - Header shows "Welcome, guide!" with email
   - Shows 2 upcoming appointments:
     - Sarah Johnson - Tokyo 5-Day Adventure (in 2 days, video call)
     - Michael Chen - Kyoto Heritage Walk (in 5 days, in-person)
   - Stats show: 2 Upcoming, 2 Total Booked, 1 This Week

### Test 2: Login as Traveler (Original Flow)

1. **Navigate to login page**
   ```
   http://localhost:3000/auth
   ```

2. **Click "Login as Traveler"** (default)

3. **Enter any email/password**
   - Email: `traveler@example.com`
   - Password: `password123`

4. **Click "Log in"**
   - Should redirect to `/dashboard` (original user dashboard)

### Test 3: Empty State

1. **Test with different guide email**
   - Login as guide with email: `different-guide@example.com`
   - Should see empty state: "No upcoming appointments yet"
   - Shows friendly message and action button

### Test 4: Route Protection

1. **Without login**, try to access `/guide-dashboard`
   - Should redirect to `/auth`

2. **Login as traveler**, then navigate to `/guide-dashboard`
   - Should redirect to `/auth`
   - Only guides can access the guide dashboard

### Test 5: Logout Flow

1. **Login as guide**
2. **Click "Logout"** button in top-right
   - All auth data cleared
   - Redirect to `/auth`
   - Can verify in localStorage that guide info is removed

### Test 6: Persistent Login

1. **Login as guide**
2. **Refresh the page**
   - Should stay logged in
   - Dashboard content preserved
   - (AuthContext loads from localStorage)

### Test 7: Responsive Design

Test at different screen sizes:

- **Mobile (375px)**
  - Toggle buttons stack well
  - Appointment cards are readable
  - Stats cards responsive
  - Logout button shows icon only

- **Tablet (768px)**
  - Two-column layout
  - More spacing

- **Desktop (1024px+)**
  - Full three-column stats
  - All details visible

## Feature Details

### Login Page Changes
- **File**: `src/components/animated-characters-login-page.tsx`
- **Changes**:
  - Added `loginMode` state
  - Added mode toggle buttons
  - Updated `handleSubmit()` to handle guide login
  - Guide login sets: `guideId`, `guideEmail`, `guideName`
  - Redirects guides to `/guide-dashboard`, travelers to `/dashboard`

### AuthContext Changes
- **File**: `src/context/AuthContext.tsx`
- **New exports**:
  - `UserType` type: 'traveler' | 'guide'
  - `setUserType()`: Switch between user roles
  - `guideId`, `guideEmail`, `guideName`: Guide-specific data
  - `setGuideInfo()`: Set guide details at login
  - `logout()`: Clear all auth data

### New Guide Dashboard
- **File**: `src/app/guide-dashboard/page.tsx`
- **Components**:
  - `GuideDashboard` (main page)
  - `AppointmentCard` (individual appointment)
  - `EmptyStateCard` (no appointments state)
- **Features**:
  - Auth protection (redirects non-guides to `/auth`)
  - Filters appointments by current guide's email
  - Sorts by date (soonest first)
  - Smart date formatting
  - Meeting type icons

## Demo Data

The system comes with demo appointments for testing:

```javascript
{
  id: '1',
  guideEmail: 'guide@example.com',
  travelerName: 'Sarah Johnson',
  journeyName: 'Tokyo 5-Day Adventure',
  dateTime: '2 days from now',
  meetingType: 'video call',
  status: 'confirmed'
}
{
  id: '2',
  guideEmail: 'guide@example.com',
  travelerName: 'Michael Chen',
  journeyName: 'Kyoto Heritage Walk',
  dateTime: '5 days from now',
  meetingType: 'in-person',
  status: 'confirmed'
}
```

To add more demo appointments, edit the `handleSubmit` function in the login page.

## Future Integration Points

When ready to integrate with a real backend:

1. **Guide Authentication**
   ```typescript
   // Replace the mock validation with API call
   const response = await fetch('/api/auth/guide/login', {
     method: 'POST',
     body: JSON.stringify({ email, password })
   });
   const { guide } = await response.json();
   setGuideInfo(guide.id, guide.email, guide.name);
   ```

2. **Fetch Real Appointments**
   ```typescript
   // Replace localStorage with API call
   const response = await fetch(`/api/guides/${guideEmail}/appointments`);
   const appointments = await response.json();
   setAppointments(appointments);
   ```

3. **Real-time Updates**
   - Use WebSockets or polling to update appointments
   - Add notification system for new bookings

## Styling & UX Notes

- **Color scheme**: Matches existing Weave design
- **Icons**: Uses lucide-react from existing setup
- **Spacing**: Tailwind utilities for consistency
- **Typography**: Uses existing font sizes and weights
- **Animations**: Subtle transitions on hover
- **Accessibility**: Proper label associations, semantic HTML

## Common Issues & Solutions

### Issue: "No upcoming appointments yet" displays incorrectly
**Solution**: Verify the `guideEmail` in localStorage matches the appointment's `guideEmail` exactly (case-sensitive).

### Issue: Guide redirects back to login
**Solution**: Check that `isAuthenticated && userType === 'guide'` both evaluate to true.

### Issue: Demo appointments not showing
**Solution**: Clear localStorage, logout completely, and login again with `guide@example.com`.

### Issue: Characters not animated on login page
**Solution**: Ensure `src/components/animated-characters-login-page.tsx` is correctly imported and no console errors present.

## Quick Reference

| Action | Route | Expected Outcome |
|--------|-------|------------------|
| Login as Guide | `/auth` → Guide Login | → `/guide-dashboard` |
| Login as Traveler | `/auth` → Traveler Login | → `/dashboard` |
| Access Dashboard | `/guide-dashboard` (not logged in) | → `/auth` (redirected) |
| Logout | Click "Logout" button | → `/auth` + cleared localStorage |
| Refresh while logged | Refresh page | → Stay on `/guide-dashboard` |

## Questions or Issues?

Check the implementation in:
- `src/context/AuthContext.tsx` - Auth state management
- `src/components/animated-characters-login-page.tsx` - Login UI
- `src/app/guide-dashboard/page.tsx` - Guide dashboard

All code is well-commented and follows the app's existing patterns.
