import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth(.*)',
  '/signup(.*)',
  '/onboarding(.*)',
  '/flights(.*)',
  '/private-jet(.*)',
  '/hotels(.*)',
  '/guides(.*)',
  '/destinations(.*)',
  '/journeys(.*)',
  '/packages(.*)',
  '/api/image-proxy(.*)',
  '/contact(.*)',
  '/about(.*)',
  '/apply-guide(.*)',
  '/ai-planner(.*)',
  '/api/ai-planner(.*)',
  '/api/unsplash(.*)',
  '/api/news(.*)',
  '/api/travel-safety(.*)',
  '/api/update-user-type(.*)',
  '/api/serpapi(.*)',
  '/api/community-trips(.*)',
  '/api/guides/availability(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
