<div align="center">

# Weave Travel Booking (Charizard)

![Landing Preview](public/home/landing.gif)

Modern, animated travel discovery and booking prototype built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4. Features an interactive AI travel co-pilot (Charizard), rich destination pages, and a full booking flow.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-149ECA?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-2F74C0?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer)
![Recharts](https://img.shields.io/badge/Recharts-1C1C1C?style=for-the-badge)

</div>

## Overview

This app showcases a full travel flow: destination discovery, trip planning, and booking preview—wrapped in a polished UX. It includes an AI chat assistant ("Charizard") that helps users brainstorm itineraries, view flights/hotels, and confirm bookings—all with a responsive, modern design.

## Features

- AI Co‑Pilot: Floating chat assistant (`Charizard`) to ideate trips and itineraries.
- Discovery: Destinations, guides, packages, and journeys with dedicated detail pages.
- Booking Preview: Flights UI, hotels, passenger/date selectors, and a confirmation screen.
- Personalization: Dashboard, profile, and wishlist pages for saved experiences.
- Delightful UI: Parallax hero, world maps, carousels, 360/Media viewers, and smooth animations.
- App Router: Next.js `app` directory with typed components and clean routing.

## Tech Stack

- Framework: Next.js 16 (App Router) + React 19 + TypeScript
- Styling: Tailwind CSS v4 with custom CSS variables (see `src/app/index.css`)
- UI Primitives: Radix UI (`src/components/ui/*`)
- Animation: Framer Motion / Motion
- Forms & Validation: React Hook Form + Zod
- Charts & Visuals: Recharts, Embla Carousel

## Project Structure

```
src/
	app/
		page.tsx                # Home
		about/                  # About page
		ai-planner/             # AI planner route
		booking-confirmation/   # Booking confirmation
		contact/                # Contact page
		dashboard/              # User dashboard
		destinations/           # Listing + [id]/page.tsx
		flights/                # Flight search/preview
		guides/                 # Travel guides
		hotels/                 # Hotels
		journeys/               # Journeys + [id]/page.tsx
		packages/               # Packages + [id]/page.tsx
		profile/                # User profile
		wishlist/               # Wishlist
	components/
		AIChat.tsx              # Charizard chat assistant (floating)
		ParallaxHero.tsx        # Landing hero
		TripCarousel.tsx        # Carousels & sections
		WorldMap*.tsx           # Interactive world maps
		ui/                     # Radix-based UI kit
	context/                  # Auth context
	hooks/                    # Custom hooks
	lib/                      # Utilities
public/
	home/, travels/           # Static assets
```

## Getting Started

Prerequisites:

- Node.js ≥ 18.18 (LTS recommended)
- npm (or pnpm/yarn)

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Start a production server (if no `start` script exists, use `next start`):

```bash
# Option A: add a script "start": "next start" then
# npm run start

# Option B: run directly
npx next start -p 3000
```

## Key Routes

- `/` – Landing with hero, trips, and AI chat entry
- `/ai-planner` – Full-page planner surface
- `/destinations`, `/destinations/[id]`
- `/journeys`, `/journeys/[id]`
- `/packages`, `/packages/[id]`
- `/flights`, `/hotels`
- `/dashboard`, `/profile`, `/wishlist`
- `/booking-confirmation`, `/contact`, `/about`

## Styling & Theming

- Tailwind v4 with a centralized theme in `src/app/index.css` (OKLCH colors, CSS variables, radius scale).
- Dark mode supported via the `.dark` class and compatible with `next-themes` if enabled.
- Component styles composed with Radix primitives and utility-first classes.

## Available Scripts

From `package.json`:

- `dev`: Run the Next.js development server
- `build`: Create an optimized production build

Tip: You can add `start`: `next start` for production runtime.

## Environment Variables

No environment variables are required to run the demo. If you add external services (e.g., real flight search, auth, vector stores), place variables in `.env.local` and access via `process.env.NEXT_PUBLIC_*` or `process.env.*` on the server side.

## Deployment

Vercel is recommended:

1. Push the repo to GitHub.
2. Import into Vercel and select the Next.js framework preset.
3. Configure any environment variables if you add integrations.
4. Deploy. Vercel will build using `npm run build`.

## Screenshots

Place screenshots in `public/` and reference them here. For example:

```md
![Home](public/home/hero.png)
![Trips](public/travels/trips.png)
```

## Attributions

See [src/Attributions.md](src/Attributions.md) for asset and library credits.

---

Made with ❤️ for travel, design, and smooth UX.
