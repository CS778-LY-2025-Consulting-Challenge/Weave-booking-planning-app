'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bell,
  Check,
  Copy,
  Heart,
  Mail,
  Share2,
  Trash2,
  TrendingDown,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface WishlistItem {
  id: number;
  type: 'package' | 'destination' | 'hotel' | 'flight';
  name: string;
  location: string;
  image: string;
  price: number;
  originalPrice?: number;
  priceAlertEnabled: boolean;
  dateAdded: string;
}

export default function Wishlist() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState(
    'https://weave.travel/wishlist/abc123xyz'
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load wishlist from localStorage
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlistItems(JSON.parse(savedWishlist));
    } else {
      // Mock data
      setWishlistItems([
        {
          id: 1,
          type: 'package',
          name: 'Tropical Paradise Getaway',
          location: 'Maldives',
          image:
            'https://images.unsplash.com/photo-1551727095-10465ee6b17f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzY0NTE3NjA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
          price: 2499,
          originalPrice: 2999,
          priceAlertEnabled: true,
          dateAdded: '2024-11-15',
        },
        {
          id: 2,
          type: 'destination',
          name: 'Santorini',
          location: 'Greece',
          image:
            'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2V8ZW58MXx8fHwxNzY0NDIxNzYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
          price: 1899,
          priceAlertEnabled: false,
          dateAdded: '2024-11-20',
        },
        {
          id: 3,
          type: 'package',
          name: 'Tokyo Cultural Experience',
          location: 'Japan',
          image:
            'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGphcGFuJTIwbmlnaHR8ZW58MXx8fHwxNzY0NTI2MjY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
          price: 3299,
          originalPrice: 3599,
          priceAlertEnabled: true,
          dateAdded: '2024-12-01',
        },
        {
          id: 4,
          type: 'destination',
          name: 'Koror',
          location: 'Palau',
          image:
            'https://images.unsplash.com/photo-1690649416378-1335211d5864?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrb3JvciUyMHBhbGF1JTIwdHJvcGljYWwlMjBwYXJhZGlzZXxlbnwxfHx8fDE3NjQ3OTY2NDV8MA&ixlib=rb-4.1.0&q=80&w=1080',
          price: 2199,
          priceAlertEnabled: true,
          dateAdded: '2024-12-05',
        },
        {
          id: 5,
          type: 'package',
          name: 'European Highlights',
          location: 'Europe',
          image:
            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldXJvcGUlMjBjaXRpZXMlMjB0cmF2ZWx8ZW58MXx8fHwxNzY0NTE4MzMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
          price: 2799,
          priceAlertEnabled: false,
          dateAdded: '2024-12-08',
        },
        {
          id: 6,
          type: 'destination',
          name: 'Bilbao',
          location: 'Spain',
          image:
            'https://images.unsplash.com/photo-1654411975155-a8e99de1710a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWxiYW8lMjBzcGFpbiUyMG1vZGVybiUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NjQ3OTY2NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
          price: 1599,
          priceAlertEnabled: true,
          dateAdded: '2024-12-09',
        },
      ]);
    }
  }, []);

  const removeFromWishlist = (id: number) => {
    const updatedWishlist = wishlistItems.filter((item) => item.id !== id);
    setWishlistItems(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    toast.success('Removed from wishlist');
  };

  const togglePriceAlert = (id: number) => {
    const updatedWishlist = wishlistItems.map((item) =>
      item.id === id
        ? { ...item, priceAlertEnabled: !item.priceAlertEnabled }
        : item
    );
    setWishlistItems(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    const item = updatedWishlist.find((i) => i.id === id);
    if (item?.priceAlertEnabled) {
      toast.success('Price alerts enabled for ' + item.name);
    } else {
      toast.success('Price alerts disabled');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard!');
  };

  const handleShareEmail = () => {
    toast.success('Wishlist shared via email!');
    setShareDialogOpen(false);
  };

  const handleItemClick = (item: WishlistItem) => {
    if (item.type === 'package') {
      router.push(`/packages/${item.id}`);
    } else if (item.type === 'destination') {
      router.push(`/destinations/${item.name.toLowerCase()}`);
    }
  };

  const packages = wishlistItems.filter((item) => item.type === 'package');
  const destinations = wishlistItems.filter(
    (item) => item.type === 'destination'
  );
  const withPriceDrops = wishlistItems.filter(
    (item) => item.originalPrice && item.originalPrice > item.price
  );
  const withAlerts = wishlistItems.filter((item) => item.priceAlertEnabled);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white px-4 py-12">
      <div className="mx-auto max-w-7xl px-[0px] py-[93px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-gray-900">
                My Wishlist
              </h1>
              <p className="text-gray-600">
                Save your favorite destinations and packages
              </p>
            </div>
            <div className="flex gap-3">
              <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Share Wishlist
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Your Wishlist</DialogTitle>
                    <DialogDescription>
                      Share your travel wishlist with friends and family
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Shareable Link</Label>
                      <div className="flex gap-2">
                        <Input value={shareLink} readOnly />
                        <Button
                          onClick={handleCopyLink}
                          variant="outline"
                          className="shrink-0"
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Share via Email</Label>
                      <div className="flex gap-2">
                        <Input placeholder="friend@example.com" />
                        <Button
                          onClick={handleShareEmail}
                          className="shrink-0 gap-2"
                        >
                          <Mail className="h-4 w-4" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">
                    {wishlistItems.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Items</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {packages.length}
                  </p>
                  <p className="text-sm text-gray-600">Packages</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {destinations.length}
                  </p>
                  <p className="text-sm text-gray-600">Destinations</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {withPriceDrops.length}
                  </p>
                  <p className="text-sm text-gray-600">Price Drops</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                All ({wishlistItems.length})
              </TabsTrigger>
              <TabsTrigger value="packages">
                Packages ({packages.length})
              </TabsTrigger>
              <TabsTrigger value="destinations">
                Destinations ({destinations.length})
              </TabsTrigger>
              <TabsTrigger value="price-drops">
                Price Drops ({withPriceDrops.length})
              </TabsTrigger>
              <TabsTrigger value="alerts">
                Price Alerts ({withAlerts.length})
              </TabsTrigger>
            </TabsList>

            {/* All Items */}
            <TabsContent value="all">
              {wishlistItems.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Heart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      Your wishlist is empty
                    </h3>
                    <p className="mb-6 text-gray-600">
                      Start adding packages and destinations you love!
                    </p>
                    <Button onClick={() => router.push('/packages')}>
                      Explore Packages
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {wishlistItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-xl">
                        <div
                          className="relative"
                          onClick={() => handleItemClick(item)}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <Badge className="absolute top-3 left-3 gap-1 bg-red-500 text-white">
                                <TrendingDown className="h-3 w-3" />
                                {Math.round(
                                  ((item.originalPrice - item.price) /
                                    item.originalPrice) *
                                    100
                                )}
                                % OFF
                              </Badge>
                            )}
                          <Badge className="absolute top-3 right-3 bg-white/90 text-gray-900 capitalize">
                            {item.type}
                          </Badge>
                        </div>
                        <CardContent className="pt-4">
                          <h3 className="mb-1 font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          <p className="mb-3 text-sm text-gray-600">
                            {item.location}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              {item.originalPrice &&
                              item.originalPrice > item.price ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-green-600">
                                    ${item.price}
                                  </span>
                                  <span className="text-sm text-gray-400 line-through">
                                    ${item.originalPrice}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold text-gray-900">
                                  ${item.price}
                                </span>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant={
                                item.priceAlertEnabled ? 'default' : 'outline'
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePriceAlert(item.id);
                              }}
                              className="gap-1"
                            >
                              <Bell className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2 pt-0">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleItemClick(item)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromWishlist(item.id);
                            }}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Packages Tab */}
            <TabsContent value="packages">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {packages.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-xl">
                      <div
                        className="relative"
                        onClick={() => handleItemClick(item)}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {item.originalPrice &&
                          item.originalPrice > item.price && (
                            <Badge className="absolute top-3 left-3 gap-1 bg-red-500 text-white">
                              <TrendingDown className="h-3 w-3" />
                              {Math.round(
                                ((item.originalPrice - item.price) /
                                  item.originalPrice) *
                                  100
                              )}
                              % OFF
                            </Badge>
                          )}
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="mb-1 font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="mb-3 text-sm text-gray-600">
                          {item.location}
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            {item.originalPrice &&
                            item.originalPrice > item.price ? (
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-green-600">
                                  ${item.price}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  ${item.originalPrice}
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">
                                ${item.price}
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant={
                              item.priceAlertEnabled ? 'default' : 'outline'
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePriceAlert(item.id);
                            }}
                            className="gap-1"
                          >
                            <Bell className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2 pt-0">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleItemClick(item)}
                        >
                          View Package
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWishlist(item.id);
                          }}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Destinations Tab */}
            <TabsContent value="destinations">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {destinations.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-xl">
                      <div
                        className="relative"
                        onClick={() => handleItemClick(item)}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="mb-1 font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="mb-3 text-sm text-gray-600">
                          {item.location}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            From ${item.price}
                          </span>
                          <Button
                            size="sm"
                            variant={
                              item.priceAlertEnabled ? 'default' : 'outline'
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePriceAlert(item.id);
                            }}
                            className="gap-1"
                          >
                            <Bell className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2 pt-0">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleItemClick(item)}
                        >
                          Explore
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWishlist(item.id);
                          }}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Price Drops Tab */}
            <TabsContent value="price-drops">
              {withPriceDrops.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <TrendingDown className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      No price drops yet
                    </h3>
                    <p className="text-gray-600">
                      Check back later for great deals on your saved items!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="font-medium text-green-800">
                      🎉 Great news! {withPriceDrops.length}{' '}
                      {withPriceDrops.length === 1 ? 'item has' : 'items have'}{' '}
                      dropped in price!
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {withPriceDrops.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="group cursor-pointer overflow-hidden border-green-200 transition-shadow hover:shadow-xl">
                          <div
                            className="relative"
                            onClick={() => handleItemClick(item)}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <Badge className="absolute top-3 left-3 gap-1 bg-red-500 text-white">
                              <TrendingDown className="h-3 w-3" />
                              {item.originalPrice &&
                                Math.round(
                                  ((item.originalPrice - item.price) /
                                    item.originalPrice) *
                                    100
                                )}
                              % OFF
                            </Badge>
                          </div>
                          <CardContent className="pt-4">
                            <h3 className="mb-1 font-semibold text-gray-900">
                              {item.name}
                            </h3>
                            <p className="mb-3 text-sm text-gray-600">
                              {item.location}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-green-600">
                                ${item.price}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                ${item.originalPrice}
                              </span>
                              <span className="text-sm font-medium text-green-600">
                                Save ${(item.originalPrice || 0) - item.price}
                              </span>
                            </div>
                          </CardContent>
                          <CardFooter className="flex gap-2 pt-0">
                            <Button
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleItemClick(item)}
                            >
                              Book Now
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromWishlist(item.id);
                              }}
                              className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Price Alerts Tab */}
            <TabsContent value="alerts">
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Bell className="mt-1 h-6 w-6 text-blue-600" />
                    <div className="flex-1">
                      <h3 className="mb-1 font-semibold text-gray-900">
                        Price Alert Settings
                      </h3>
                      <p className="mb-4 text-sm text-gray-600">
                        Get notified when prices drop on your saved items. Click
                        the bell icon on any item to toggle alerts.
                      </p>
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            Email Notifications
                          </p>
                          <p className="text-sm text-gray-600">
                            Receive price drop alerts via email
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {withAlerts.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="group cursor-pointer overflow-hidden border-blue-200 transition-shadow hover:shadow-xl">
                      <div
                        className="relative"
                        onClick={() => handleItemClick(item)}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <Badge className="absolute top-3 right-3 gap-1 bg-blue-600 text-white">
                          <Bell className="h-3 w-3" />
                          Alert On
                        </Badge>
                      </div>
                      <CardContent className="pt-4">
                        <h3 className="mb-1 font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="mb-3 text-sm text-gray-600">
                          {item.location}
                        </p>
                        <div className="text-lg font-bold text-gray-900">
                          ${item.price}
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2 pt-0">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePriceAlert(item.id);
                          }}
                        >
                          Disable Alert
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromWishlist(item.id);
                          }}
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}