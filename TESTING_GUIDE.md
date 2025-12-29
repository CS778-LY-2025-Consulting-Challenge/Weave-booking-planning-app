# Guide Booking Feature - Testing Guide

## How to Test the Feature

### 1. Navigate to the Guides Page
- Open the application at `http://localhost:3000`
- Navigate to the Guides page (`/guides`)

### 2. Test the Booking Flow

#### Step 1: Click "Book appointment"
- Scroll through the guide carousel
- You'll see a "Book appointment" button at the bottom of each guide card
- Click it to open the booking dialog

#### Step 2: Select Date and Time
- Choose a date from the calendar (Sundays and past dates are disabled)
- Once a date is selected, available time slots appear below
- Click on a time slot to select it (it will highlight in blue)
- Click "Continue to details" button

#### Step 3: Fill in Your Details
- At the top, you'll see a blue summary box with your selected time
- Fill in:
  - Full name (required)
  - Email address (required)
  - Notes/reason for appointment (optional)
- Form validates in real-time
- Click "Confirm appointment"

#### Step 4: Booking Confirmation
- Success screen appears with a green checkmark
- Shows complete booking details
- Displays message about video call starting

#### Step 5: Video Call Opens
- After 2 seconds, the video call interface automatically opens
- Full-screen overlay with professional design
- Features:
  - Call duration counter
  - Connection quality indicator
  - Mute/unmute button
  - Video on/off toggle
  - End call button (red phone icon)
  - Picture-in-picture for your camera
  - Guide's avatar in main video area

### 3. Test Different Scenarios

#### Test Form Validation
- Try submitting without filling required fields
- Try entering an invalid email
- Check error messages appear in red

#### Test Multiple Guides
- Book appointments with different guides
- Notice guide info updates in dialog
- Verify guide name/avatar appears in video call

#### Test Video Call Controls
- Click mute button (turns red when muted)
- Click video toggle (turns red when off)
- Click end call button to close
- Try fullscreen toggle button

#### Test Responsive Design
- Resize browser window
- Check mobile breakpoints
- Verify calendar and forms remain usable

### 4. Expected Behavior

✅ **What Should Work:**
- Smooth dialog open/close animations
- Calendar date selection
- Time slot selection with visual feedback
- Form validation and error display
- Booking confirmation screen
- Automatic video call launch
- Video call controls toggle states
- Call duration counter
- Clean dialog close/reset

✅ **Visual Quality Checks:**
- Consistent colors throughout
- Smooth hover effects
- Clear typography
- Proper spacing
- Icons align correctly
- Buttons have hover states
- Loading states appear during transitions

### 5. Browser Testing
Recommended to test in:
- Chrome (primary)
- Firefox
- Safari
- Edge
- Mobile browsers (responsive view)

### 6. Known Limitations (by design)
- No real backend integration (simulated API calls)
- No actual video streaming (placeholder UI)
- All time slots shown as available
- No email actually sent
- No payment processing

These are intentional for the prototype and can be easily integrated later.

## Quick Test Checklist

- [ ] Guide cards display "Book appointment" button
- [ ] Booking dialog opens when button clicked
- [ ] Calendar allows date selection
- [ ] Time slots appear after date selection
- [ ] Form validates required fields
- [ ] Booking confirmation appears after submit
- [ ] Video call opens automatically
- [ ] Video controls work (visual state changes)
- [ ] End call closes the video interface
- [ ] Can book appointments with multiple guides
- [ ] Mobile responsive (test at 375px width)
- [ ] No console errors in browser dev tools

## Screenshots Recommended
When testing, capture:
1. Guide card with booking button
2. Booking dialog - date/time selection
3. Booking dialog - form step
4. Confirmation screen
5. Video call interface
6. Mobile view of each step
