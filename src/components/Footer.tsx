import Link from 'next/link';
import { Plane, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Plane className="size-6 text-white" />
              </div>
              <span className="text-white">Weave</span>
            </div>
            <p className="text-sm">
              Your journey begins here. Plan, explore, and experience the world like never before.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/flights" className="hover:text-white transition-colors">Flights</Link></li>
              <li><Link href="/hotels" className="hover:text-white transition-colors">Hotels</Link></li>
              <li><Link href="/packages" className="hover:text-white transition-colors">Packages</Link></li>
              <li><Link href="/journeys" className="hover:text-white transition-colors">Community Journeys</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-white mb-4">Contact Info</h3>
            <ul className="space-y-2 text-sm mb-4">
              <li>Email: hello@weave.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: Auckland, New Zealand</li>
            </ul>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="size-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="size-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="size-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Linkedin className="size-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2025 Weave. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}