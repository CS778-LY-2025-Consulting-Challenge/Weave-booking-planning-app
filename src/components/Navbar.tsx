import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Plane,
  Settings,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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

  // Check if we're on the Guides page, Auth page, or Dashboard page
  const isGuidesPage = pathname === '/guides';
  const isDarkTextPage =
    pathname === '/guides' ||
    pathname === '/auth' ||
    pathname === '/dashboard' ||
    pathname === '/profile' ||
    pathname === '/wishlist';

  // Handle scroll visibility on home page
  useEffect(() => {
    if (!isHomePage) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      // Reveal navbar shortly after the hero is in motion
      const revealPoint = viewportHeight * NAVBAR_REVEAL_RATIO;
      setIsVisible(scrollY > revealPoint);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

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
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="rounded-full border border-white/20 bg-white/10 px-6 py-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 transition-transform duration-300 hover:scale-105"
            >
              <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2 shadow-lg">
                <Plane className="size-6 text-white" />
              </div>
              <span
                className={
                  isDarkTextPage
                    ? 'text-black drop-shadow-lg'
                    : 'text-white drop-shadow-lg'
                }
              >
                Weave
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-6 xl:flex">
              {navLinks.slice(0, 7).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isDarkTextPage
                      ? 'text-sm text-black transition-all duration-300 hover:scale-105 hover:text-gray-700'
                      : 'text-sm text-white transition-all duration-300 hover:scale-105 hover:text-gray-200'
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <Button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    variant="ghost"
                    size="sm"
                    className={
                      isDarkTextPage
                        ? 'gap-2 border border-gray-300 bg-gray-100 text-black transition-all duration-300 hover:bg-gray-200'
                        : 'gap-2 border border-white/30 bg-white/20 text-white transition-all duration-300 hover:bg-white/30'
                    }
                  >
                    <User className="size-4" />
                    <span className="hidden sm:inline">Profile</span>
                    <ChevronDown
                      className={`size-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </Button>

                  {/* Custom Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 z-[100] mt-2 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-xl">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          router.push('/profile');
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <Settings className="size-4" />
                        Profile & Settings
                      </button>
                      <button
                        onClick={handleDashboardClick}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          router.push('/wishlist');
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <Heart className="size-4" />
                        My Wishlist
                      </button>
                      <div className="my-1 h-px bg-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="size-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => router.push('/auth')}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-purple-700"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      isDarkTextPage
                        ? 'text-black hover:bg-gray-100 lg:hidden'
                        : 'text-white hover:bg-white/20 lg:hidden'
                    }
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="mt-8 flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="p-2 text-gray-600 transition-colors hover:text-gray-900"
                      >
                        {link.label}
                      </Link>
                    ))}

                    {/* Mobile Auth Section */}
                    {isAuthenticated && (
                      <>
                        <div className="my-2 h-px bg-gray-200" />
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 p-2 text-gray-600 transition-colors hover:text-gray-900"
                        >
                          <Settings className="size-4" />
                          Profile & Settings
                        </Link>
                        <button
                          onClick={handleDashboardClick}
                          className="flex items-center gap-2 p-2 text-left text-gray-600 transition-colors hover:text-gray-900"
                        >
                          <LayoutDashboard className="size-4" />
                          Dashboard
                        </button>
                        <Link
                          href="/wishlist"
                          className="flex items-center gap-2 p-2 text-gray-600 transition-colors hover:text-gray-900"
                        >
                          <Heart className="size-4" />
                          My Wishlist
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 p-2 text-left text-red-600 transition-colors hover:text-red-700"
                        >
                          <LogOut className="size-4" />
                          Logout
                        </button>
                      </>
                    )}
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