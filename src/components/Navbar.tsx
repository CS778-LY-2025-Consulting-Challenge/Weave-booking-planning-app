"use client";

import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Plane,
  Settings,
  User as UserIcon,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import AnimatedLogoutButton from './AnimatedLogoutButton';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

export default function Navbar() {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if we're on the Home page
  const isHomePage = pathname === '/';
  const NAVBAR_REVEAL_RATIO = 0.45;

  // Default hidden on home page, visible on other pages
  const [isVisible, setIsVisible] = useState(!isHomePage);
  const [hasScrolled, setHasScrolled] = useState(false);
  const lastScrollY = useRef(0);

  // Check if we're on the Guides page, Auth page, or Dashboard page
  const isGuidesPage = pathname === '/guides';
  const isFlightsPage = pathname === '/flights';
  const isHotelsPage = pathname === '/hotels';
  const isDestinationsPage = pathname === '/destinations';
  const isJourneysPage = pathname === '/journeys';
  const isPackagesPage = pathname === '/packages';
  const isDarkTextPage =
    pathname === '/' ||
    pathname === '/guides' ||
    pathname === '/auth' ||
    pathname === '/dashboard' ||
    pathname === '/profile' ||
    pathname === '/wishlist' ||
    (pathname === '/flights' && hasScrolled) ||
    (pathname === '/hotels' && hasScrolled) ||
    (pathname === '/destinations' && hasScrolled) ||
    (pathname === '/journeys' && hasScrolled) ||
    (pathname === '/packages' && hasScrolled);

  // Handle scroll visibility on home page and text color on flights/hotels/destinations/journeys/packages page
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      
      if (isHomePage) {
        // Reveal navbar shortly after the hero is in motion
        const revealPoint = viewportHeight * NAVBAR_REVEAL_RATIO;
        const shouldShow = scrollY > revealPoint;
        
        if (shouldShow) {
          // Show on scroll up, hide on scroll down
          if (scrollY < lastScrollY.current || scrollY <= 10) {
            setIsVisible(true);
          } else if (scrollY > lastScrollY.current && scrollY > 100) {
            setIsVisible(false);
          }
        } else {
          setIsVisible(false);
        }
      } else {
        // On all other pages: show at top, hide on scroll down, show on scroll up
        if (scrollY <= 10) {
          setIsVisible(true);
        } else if (scrollY < lastScrollY.current) {
          // Scrolling up
          setIsVisible(true);
        } else if (scrollY > lastScrollY.current && scrollY > 100) {
          // Scrolling down
          setIsVisible(false);
        }
      }
      
      if (isFlightsPage) {
        // Change text color after scrolling past the scroll down button on flights page
        setHasScrolled(scrollY > viewportHeight);
      }
      
      if (isHotelsPage || isDestinationsPage || isJourneysPage || isPackagesPage) {
        // Change text color after scrolling to second page
        setHasScrolled(scrollY > viewportHeight);
      }
      
      lastScrollY.current = scrollY;
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage, isFlightsPage, isHotelsPage, isDestinationsPage, isJourneysPage, isPackagesPage]);

  const handleLogout = () => {
    console.log('Logging out...');
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setDropdownOpen(false);
    router.push('/');
  };

  const handleDashboardClick = () => {
    console.log('Navigating to dashboard...');
    setDropdownOpen(false);
    router.push('/dashboard');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/flights', label: 'Flights' },
    { href: '/hotels', label: 'Hotels' },
    { href: '/packages', label: 'Packages' },
    { href: '/destinations', label: 'Trending Destinations' },
    { href: '/journeys', label: 'Community Journeys' },
    { href: '/guides', label: 'Local Guides' },
    { href: '/ai-planner', label: 'AI Planner' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="rounded-full border border-white/20 bg-black/30 px-4 py-2 shadow-2xl backdrop-blur-xl text-white" style={{background: 'linear-gradient(90deg, rgba(34,34,34,0.85) 0%, rgba(34,34,34,0.7) 50%, rgba(34,34,34,0.85) 100%)'}}>
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
            >
              <span className="text-white text-3xl drop-shadow-lg" style={{ fontFamily: 'var(--font-butterfly-kids)' }}>Weave</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-6 xl:flex">
              {navLinks.slice(0, 7).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white transition-all duration-300 hover:scale-105 hover:text-gray-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-4">
              <SignedIn>
                <div className="flex items-center gap-4">
                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      className="flex items-center gap-1 text-sm text-white transition-all duration-300 hover:scale-105 hover:text-gray-200 px-3 py-2 rounded-md bg-black/30 border border-white/20"
                      onClick={() => setDropdownOpen((open) => !open)}
                    >
                      <UserIcon className="size-4" />
                      User
                      <ChevronDown className="size-4" />
                    </button>
                    {dropdownOpen && (
                      <div ref={dropdownRef} className="absolute right-0 mt-2 w-44 rounded-md bg-black/90 border border-white/20 shadow-lg z-50">
                        <div className="py-1">
                          <button
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white hover:bg-white/10"
                            onClick={() => { setDropdownOpen(false); router.push('/dashboard'); }}
                          >
                            <LayoutDashboard className="size-4" />
                            Dashboard
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: 'w-10 h-10 rounded-full border border-white/20',
                        userButtonPopoverCard: 'bg-black/30 border border-white/20 backdrop-blur-xl',
                        userPreviewMainIdentifier: 'text-white',
                        userButtonBox: 'flex-row-reverse',
                      }
                    }}
                  >
                    <UserButton.MenuItems>
                      <UserButton.Action
                        label="My Trips"
                        labelIcon={<MapPin className="size-4" />}
                        onClick={() => router.push('/trips/saved')}
                      />
                    </UserButton.MenuItems>
                  </UserButton>
                </div>
              </SignedIn>
              <SignedOut>
                <Button
                  onClick={() => router.push('/auth')}
                  size="sm"
                  className="bg-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-100 text-gray-900"
                >
                  Sign In
                </Button>
              </SignedOut>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 lg:hidden"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-black/20 text-white">
                  <div className="mt-8 flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="p-2 text-white transition-colors hover:text-gray-200"
                      >
                        {link.label}
                      </Link>
                    ))}

                    {/* Mobile Auth Section */}
                    <SignedIn>
                      <div className="my-2 h-px bg-white/20" />
                      <Link
                        href="/trips/saved"
                        className="flex items-center gap-2 p-2 text-white transition-colors hover:text-gray-200"
                      >
                        <MapPin className="size-4" />
                        My Trips
                      </Link>
                      <Link
                        href="/user-profile"
                        className="flex items-center gap-2 p-2 text-white transition-colors hover:text-gray-200"
                      >
                        <Settings className="size-4" />
                        Profile Settings
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 p-2 text-white transition-colors hover:text-gray-200"
                      >
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-2 p-2 text-white transition-colors hover:text-gray-200"
                      >
                        <Heart className="size-4" />
                        My Wishlist
                      </Link>
                    </SignedIn>
                    <SignedOut>
                      <div className="my-2 h-px bg-white/20" />
                      <Button
                        onClick={() => router.push('/auth')}
                        className="mx-2 bg-white shadow-lg transition-all duration-300 hover:bg-gray-100 text-gray-900"
                      >
                        Sign In
                      </Button>
                      <Button
                        onClick={() => router.push('/signup')}
                        variant="outline"
                        className="mx-2 border-white/30 text-white hover:bg-white/10"
                      >
                        Sign Up
                      </Button>
                    </SignedOut>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}