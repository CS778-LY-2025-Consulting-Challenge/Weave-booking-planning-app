/*
 * UPCOMING BOOKINGS TICKETS - VISUAL DESIGN REFERENCE
 * 
 * This document shows what the ticket components look like visually
 * 
 * ================================================================
 * DESKTOP VIEW - Two Tickets Side by Side
 * ================================================================
 * 
 * ┌─ FLIGHT TICKET ──────────────────────┐  ┌─ HOTEL TICKET ──────────────────────┐
 * │ • ✈️ FLIGHT TICKET                   │  │ • 🏨 HOTEL BOOKING                 │
 * │ •   Emirates            Flight # EK20│  │ •   London                         │
 * │ •                                    │  │ •                                  │
 * │ •                                    │  │ •                                  │
 * ├─────────────────────────────────────┤  ├─────────────────────────────────────┤
 * │                                     │  │                                     │
 * │   FROM                      TO      │  │   HOTEL                             │
 * │   JFK        →→→→→→→→→→   LHR      │  │   The Ritz London                  │
 * │                                     │  │                                     │
 * │ DATE                  CLASS         │  │ CHECK-IN              CHECK-OUT    │
 * │ Feb 15, 2026         Business      │  │ Feb 15                Feb 20       │
 * │                                     │  │                                     │
 * │ TOTAL PRICE                         │  │ ROOM TYPE                           │
 * │ $1,299                              │  │ Deluxe Suite                       │
 * │                                     │  │                                     │
 * │                                     │  │ TOTAL PRICE                        │
 * │                                     │  │ $5,000                             │
 * └─────────────────────────────────────┘  └─────────────────────────────────────┘
 * 
 * Key Features:
 * - Blue gradient background for flights
 * - Amber gradient background for hotels
 * - Dashed borders (perforation effect)
 * - Left side dots (tear-off line)
 * - Professional typography and spacing
 * - Clear information hierarchy
 * 
 * ================================================================
 * MOBILE VIEW - Stacked Vertically
 * ================================================================
 * 
 * ┌─ FLIGHT TICKET ──────────────────────┐
 * │ • ✈️ FLIGHT TICKET                   │
 * │ •   Emirates            Flight # EK20│
 * │ •                                    │
 * │ FROM                      TO         │
 * │ JFK            →→→→→    LHR         │
 * │                                      │
 * │ DATE                  CLASS          │
 * │ Feb 15, 2026         Business       │
 * │                                      │
 * │ TOTAL PRICE                          │
 * │ $1,299                               │
 * └──────────────────────────────────────┘
 * 
 * ┌─ HOTEL TICKET ───────────────────────┐
 * │ • 🏨 HOTEL BOOKING                  │
 * │ •   London                           │
 * │ •                                    │
 * │ HOTEL                                │
 * │ The Ritz London                      │
 * │                                      │
 * │ CHECK-IN              CHECK-OUT     │
 * │ Feb 15                Feb 20        │
 * │                                      │
 * │ ROOM TYPE                            │
 * │ Deluxe Suite                         │
 * │                                      │
 * │ TOTAL PRICE                          │
 * │ $5,000                               │
 * └──────────────────────────────────────┘
 * 
 * ================================================================
 * EMPTY STATE - No Bookings
 * ================================================================
 * 
 * ┌─ NO FLIGHT YET ──────────────────────┐  ┌─ NO HOTEL YET ─────────────────────┐
 * │ •                                    │  │ •                                  │
 * │ •          ✈️                        │  │ •          🏨                      │
 * │ •                                    │  │ •                                  │
 * │ •  No Flight Booked Yet              │  │ •  No Hotel Booked Yet             │
 * │ *                                    │  │ *                                  │
 * │ *  Book your next adventure and      │  │ *  Find your perfect stay and      │
 * │ *  see your flight here!             │  │ *  it will appear here!            │
 * │ *                                    │  │ *                                  │
 * │ *       [+ Book a Flight]            │  │ *       [+ Book a Hotel]           │
 * │ *                                    │  │ *                                  │
 * └──────────────────────────────────────┘  └──────────────────────────────────────┘
 * 
 * Features:
 * - Light gray background
 * - Dashed gray borders
 * - Centered content
 * - Muted icons (gray-400)
 * - Call-to-action buttons with icons
 * - Clear friendly messaging
 * 
 * ================================================================
 * COLOR SCHEME
 * ================================================================
 * 
 * Flight Tickets:
 * - Border: border-blue-300 (dashed)
 * - Background: from-blue-50 via-white to-blue-50 (gradient)
 * - Accent: text-blue-600
 * - Dots: bg-blue-200
 * 
 * Hotel Tickets:
 * - Border: border-amber-300 (dashed)
 * - Background: from-amber-50 via-white to-amber-50 (gradient)
 * - Accent: text-amber-600
 * - Dots: bg-amber-200
 * 
 * Empty State:
 * - Border: border-gray-300 (dashed)
 * - Background: from-gray-50 to-gray-100 (gradient)
 * - Icon: text-gray-400
 * - Dots: bg-gray-300
 * 
 * ================================================================
 * INTERACTIVE STATES
 * ================================================================
 * 
 * HOVER (Desktop):
 * - shadow-lg → shadow-xl (enhanced shadow)
 * - Cards appear to lift slightly
 * - Smooth transition (transition-shadow)
 * 
 * CLICK (Future):
 * - Open booking details modal
 * - Show full itinerary
 * - Display confirmation details
 * - Option to modify/cancel
 * 
 * ================================================================
 * RESPONSIVE BREAKPOINTS
 * ================================================================
 * 
 * Small Screens (Mobile - max-width: 768px):
 * - grid-cols-1 (full width)
 * - Tickets stack vertically
 * - Single column layout
 * - Padding: p-6
 * 
 * Medium Screens & Up (Tablet/Desktop):
 * - md:grid-cols-2 (two columns)
 * - Tickets sit side-by-side
 * - Gap between cards: gap-6
 * - Padding: p-6 md:p-8 (more padding on larger screens)
 * 
 * ================================================================
 * TYPOGRAPHY
 * ================================================================
 * 
 * Titles (From/To, Hotel Name):
 * - Font Size: text-2xl
 * - Weight: font-bold
 * - Color: text-gray-900
 * 
 * Labels (Date, Class, Price):
 * - Font Size: text-xs
 * - Weight: normal
 * - Color: text-gray-500
 * 
 * Values (Dates, Classes, Prices):
 * - Font Size: text-sm to text-2xl
 * - Weight: font-semibold to font-bold
 * - Color: text-gray-900 or accent color (blue-600, amber-600)
 * 
 * Headers (Flight Ticket, Hotel Booking):
 * - Font Size: text-xs
 * - Weight: font-semibold
 * - Letter Spacing: tracking-widest
 * - Color: text-blue-600 or text-amber-600
 * 
 * ================================================================
 * SPACING DETAILS
 * ================================================================
 * 
 * Container Padding: p-6 (desktop), p-6 md:p-8 (responsive)
 * Internal Gaps: gap-4 (between sections), gap-6 (between cards)
 * Border Spacing:
 * - Border top/bottom: border-t-2 / border-b-2
 * - Border style: border-dashed
 * - Border color: dashed-[color]-200
 * - Padding around borders: pt-4, pb-4
 * 
 * ================================================================
 * PERFORATION EFFECT DETAILS
 * ================================================================
 * 
 * Left Side Dots:
 * - Position: absolute left-0 top-1/2 -translate-y-1/2
 * - Count: 6 dots (empty state), 8 dots (with booking)
 * - Size: h-2 w-2 (8px × 8px)
 * - Style: rounded-full
 * - Color: bg-blue-200 (flight), bg-amber-200 (hotel), bg-gray-300 (empty)
 * - Spacing: space-y-1 (gap between dots)
 * 
 * Dashed Borders:
 * - All borders: border-2 border-dashed
 * - Color varies: blue-300, amber-300, gray-300
 * - Creates authentic ticket tear-off look
 * 
 * ================================================================
 */
