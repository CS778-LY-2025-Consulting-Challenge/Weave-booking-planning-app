'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Eye,
  Download,
  MapPin,
  Calendar,
  Clock,
  Star,
  ArrowLeft,
  Send,
  Loader2,
  Check,
  User,
  Share2,
  Trash2,
  Edit,
  Compass,
  Smile,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import DailyRouteMap from '@/components/DailyRouteMap';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { CommentItem } from '@/components/CommentItem';
import UGCSignalsPanel from '@/components/UGCSignalsPanel';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

type DayGuide = {
  dayNumber: number;
  dayTitle: string;
  guide: string;
  activities: Array<{
    name: string;
    imageUrl?: string;
    time?: string;
    location?: string;
  }>;
};

type CommunityTrip = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  title: string;
  destination: string;
  thumbnailUrl: string;
  duration: string;
  rating: number;
  description: string | null;
  plannerState: {
    routeFlow?: Array<{ departure?: string; destination?: string }>;
    mapPoints?: Array<{ name: string; lat: number; lng: number }>;
    dates?: { start?: string; end?: string };
    dayPlans?: Array<{
      day: number;
      date?: string;
      title: string;
      daySummary?: string;
      summary?: string;
      city?: string;
      weather?: {
        condition?: string;
        tempRange?: string;
        text?: string;
        tempC?: number;
      };
      activities: Array<{
        time?: string;
        title: string;
        highlights?: string;
        location?: string;
        coords?: { lat: number; lng: number };
        type?: string;
        duration?: string;
        price?: string;
        rating?: number;
        costEstimate?: string;
        imageUrl?: string;
      }>;
    }>;
    transportation?: any;
    accommodation?: any;
  };
  highlights: string[];
  dayGuides?: DayGuide[]; // 新增：每天的旅行攻略
  viewCount: number;
  importCount: number;
  likeCount: number;
  commentCount: number;
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    content: string;
    createdAt: string;
    parentId?: string | null;
  }>;
  likes: Array<{
    userId: string;
  }>;
  createdAt: string;
  updatedAt: string;
  _count: {
    comments: number;
    likes: number;
  };
};

export default function CommunityTripDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<CommunityTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(0);

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/community-trips/${tripId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch trip details');
      }

      const data = await response.json();
      setTrip(data);
      setLikeCount(data._count.likes);

      // Check if current user has liked this trip
      if (user && data.likes) {
        setIsLiked(data.likes.some((like: any) => like.userId === user.id));
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      toast.error('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like trips');
      return;
    }

    try {
      const response = await fetch(`/api/community-trips/${tripId}/like`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const data = await response.json();
      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await fetch(`/api/community-trips/${tripId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText,
          userName: user.fullName || user.username || 'Anonymous',
          userAvatar: user.imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      setCommentText('');
      toast.success('Comment posted!');
      fetchTripDetails(); // Refresh to show new comment
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleImport = async () => {
    if (!user) {
      toast.error('Please sign in to import trips');
      return;
    }

    try {
      setImporting(true);
      const response = await fetch(`/api/community-trips/${tripId}/import`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to import trip');
      }

      const data = await response.json();
      toast.success('Trip imported to your saved trips!');

      // Redirect to AI planner with the imported trip
      setTimeout(() => {
        router.push(`/ai-planner?tripId=${data.savedTripId}`);
      }, 1000);
    } catch (error) {
      console.error('Error importing trip:', error);
      toast.error('Failed to import trip');
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) {
      toast.error('Please sign in to delete trips');
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/community-trips/${tripId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete trip');
      }

      toast.success('Trip deleted successfully!');

      // Redirect to journeys page with community tab
      setTimeout(() => {
        router.push('/journeys?tab=community');
      }, 1000);
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete trip');
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-zinc-800 mb-2">Trip not found</h2>
          <Button onClick={() => router.push('/journeys?tab=community')} variant="outline">
            <ArrowLeft className="size-4 mr-2" />
            Back to Journeys
          </Button>
        </div>
      </div>
    );
  }

  const dayPlans = trip.plannerState.dayPlans || [];
  const currentDayPlan = dayPlans[selectedDay];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-50">
      {/* Hero Section - 1/3 of screen height */}
      <div className="relative h-[33vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${trip.thumbnailUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Trip Title & Info - Positioned with more spacing from top */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Back Button and Title on same line */}
              <div className="flex items-center gap-4 mb-6">
                <Button
                  onClick={() => router.push('/journeys?tab=community')}
                  variant="ghost"
                  className="text-white hover:bg-white/20 px-3 py-2 shrink-0"
                >
                  <ArrowLeft className="size-4 mr-2" />
                  Back
                </Button>

                <h1 className="font-cormorant text-4xl md:text-5xl font-bold flex-1">
                  {trip.title}
                </h1>

                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 shrink-0">
                  {trip.duration}
                </Badge>
              </div>

              {/* Location and Rating - Aligned with title */}
              <div className="flex items-center gap-4 mb-3 text-white/90 ml-[88px]">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span>{trip.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Stats - Aligned with title */}
              <div className="flex items-center gap-6 text-sm ml-[88px]">
                <div className="flex items-center gap-2">
                  <Eye className="size-4" />
                  <span>{trip.viewCount} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="size-4" />
                  <span>{likeCount} likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="size-4" />
                  <span>{trip._count.comments} comments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="size-4" />
                  <span>{trip.importCount} imports</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Itinerary */}
          <div className="lg:col-span-3 space-y-3">
            {/* Author Info */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <Avatar className="size-12">
                  <AvatarImage src={trip.userAvatar || undefined} />
                  <AvatarFallback>
                    <User className="size-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-zinc-800">{trip.userName}</p>
                  <p className="text-sm text-zinc-500">
                    Posted {formatDate(trip.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user && user.id === trip.userId && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast.info('Edit functionality coming soon!');
                      }}
                      className="gap-2"
                    >
                      <Edit className="size-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(true)}
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </>
                )}
                <Button
                  onClick={handleImport}
                  disabled={importing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                >
                  {importing ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="size-4 mr-2" />
                      Import to My Trips
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Description */}
            {trip.description && (
              <div className="pt-2 pb-3">
                <h3 className="font-semibold text-lg mb-3">About this trip</h3>
                <p className="text-zinc-600 leading-relaxed">{trip.description}</p>
              </div>
            )}

            {/* Highlights */}
            {trip.highlights && trip.highlights.length > 0 && (
              <div className="py-3 border-b border-zinc-200">
                <h3 className="font-semibold text-lg mb-4">Highlights</h3>
                <div className="flex flex-wrap gap-2">
                  {trip.highlights.map((highlight, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Day Plans / Travel Guides */}
            {trip.dayGuides && trip.dayGuides.length > 0 ? (
              /* Two Column Layout with 1/3 - 2/3 Split */
              <div className="space-y-8 bg-white">
                <h3 className="font-bold text-2xl text-zinc-800 mb-4 px-4">Travel Guide</h3>
                <div className="h-px bg-zinc-200 mb-6"></div>

                {trip.dayGuides.map((dayGuide, dayIndex) => (
                  <div key={dayIndex} className="px-4">
                    {/* Day Header */}
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-zinc-100 rounded-full">
                        <span className="font-bold text-zinc-800 text-lg">
                          DAY {dayGuide.dayNumber}
                        </span>
                      </div>
                    </div>

                    <div className="border-l-4 border-zinc-800 pl-4 mb-6">
                      <h3 className="text-2xl font-bold text-zinc-800">
                        {dayGuide.dayTitle}
                      </h3>
                    </div>

                    {/* Grid Layout: 1/3 Left (Activities) + 2/3 Right (Guide) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Left Column: Activity Cards with Arrow Connections - 1/3 width */}
                      <div
                        className="md:col-span-1 relative"
                        style={{ minHeight: `${(dayGuide.activities.length || 1) * 172}px` }}
                      >
                        {/* SVG for connecting arrows */}
                        <svg
                          className="absolute inset-0 w-full h-full pointer-events-none"
                          style={{ zIndex: 0 }}
                        >
                          {dayGuide.activities.map((_, actIndex) => {
                            if (actIndex === dayGuide.activities.length - 1) return null;

                            const cardHeight = 150; // Approximate card height
                            const spacing = 14;

                            // Calculate positions (staggered layout)
                            const isCurrentLeft = actIndex % 2 === 0;
                            const isNextLeft = (actIndex + 1) % 2 === 0;

                            const currentY = actIndex * (cardHeight + spacing) + cardHeight / 2;
                            const nextY = (actIndex + 1) * (cardHeight + spacing) + cardHeight / 2;

                            const currentX = isCurrentLeft ? 75 : 225; // Left or right position
                            const nextX = isNextLeft ? 75 : 225;

                            // Calculate middle point for the elbow
                            const midY = (currentY + nextY) / 2;

                            return (
                              <g key={actIndex}>
                                {/* Elbow arrow path */}
                                <path
                                  d={`M ${currentX} ${currentY} L ${currentX} ${midY} L ${nextX} ${midY} L ${nextX} ${nextY - 10}`}
                                  stroke="#71717a"
                                  strokeWidth="2"
                                  fill="none"
                                  strokeDasharray="4 4"
                                  markerEnd="url(#arrowhead)"
                                />
                                {/* Arrow head marker */}
                                <defs>
                                  <marker
                                    id="arrowhead"
                                    markerWidth="10"
                                    markerHeight="10"
                                    refX="9"
                                    refY="3"
                                    orient="auto"
                                  >
                                    <polygon points="0 0, 10 3, 0 6" fill="#71717a" />
                                  </marker>
                                </defs>
                              </g>
                            );
                          })}
                        </svg>

                        {/* Activity Cards */}
                        {dayGuide.activities.map((activity, actIndex) => {
                          const isLeft = actIndex % 2 === 0;
                          const topPosition = actIndex * (150 + 14); // Card height + spacing

                          return (
                            <div
                              key={actIndex}
                              className="absolute transition-all duration-300"
                              style={{
                                top: `${topPosition}px`,
                                left: isLeft ? '0' : '50%',
                                width: '45%',
                                zIndex: 10,
                              }}
                            >
                              <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-105 p-0">
                                <CardContent className="p-0">
                                  {/* Activity Image */}
                                  {activity.imageUrl && (
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                      <img
                                        src={activity.imageUrl}
                                        alt={activity.name}
                                        className="w-full h-full object-cover"
                                      />
                                      {/* Order Badge */}
                                      <div className="absolute top-2 right-2 bg-zinc-800 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-lg">
                                        {actIndex + 1}
                                      </div>
                                    </div>
                                  )}

                                  {/* Activity Details */}
                                  <div className="px-2 py-1">
                                    <h4 className="font-semibold text-xs text-zinc-800 leading-tight line-clamp-2">
                                      {activity.name}
                                    </h4>

                                    {activity.time && (
                                      <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                                        <Clock className="size-3 shrink-0" />
                                        <span className="truncate">{activity.time}</span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right Column: Travel Guide - 2/3 width with left dashed border */}
                      <div className="md:col-span-2 md:pl-8 md:border-l-2 md:border-dashed md:border-zinc-300">
                        {dayGuide.guide ? (
                          <div className="bg-white rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <Compass className="size-5 text-zinc-600" />
                              <h4 className="font-semibold text-lg text-zinc-800">Travel Tips</h4>
                            </div>
                            <div className="prose prose-zinc max-w-none">
                              <MarkdownRenderer
                                content={dayGuide.guide}
                                className="text-zinc-700 leading-relaxed"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg p-6">
                            <p className="text-zinc-400 italic">
                              暂无旅行攻略
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Separator Line */}
                    {dayIndex < (trip.dayGuides?.length || 0) - 1 && (
                      <div className="mt-8 pt-8 border-t border-zinc-300"></div>
                    )}
                  </div>
                ))}
              </div>
            ) : dayPlans.length > 0 ? (
              /* Original Day Plans Layout (fallback) */
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Day-by-Day Itinerary</h3>

                  {/* Day Selector */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {dayPlans.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDay(index)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                          selectedDay === index
                            ? 'bg-zinc-800 text-white'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        )}
                      >
                        Day {day.day}
                      </button>
                    ))}
                  </div>

                  {/* Current Day Details */}
                  {currentDayPlan && (
                    <motion.div
                      key={selectedDay}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Day Header */}
                      <div className="border-b pb-4">
                        <h4 className="text-xl font-semibold text-zinc-800 mb-2">
                          {currentDayPlan.title}
                        </h4>
                        {currentDayPlan.daySummary && (
                          <p className="text-zinc-600">{currentDayPlan.daySummary}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                          {currentDayPlan.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="size-4" />
                              <span>{currentDayPlan.date}</span>
                            </div>
                          )}
                          {currentDayPlan.city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="size-4" />
                              <span>{currentDayPlan.city}</span>
                            </div>
                          )}
                          {currentDayPlan.weather?.tempRange && (
                            <div className="flex items-center gap-1">
                              <span>{currentDayPlan.weather.tempRange}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Activities */}
                      <div className="space-y-4">
                        {currentDayPlan.activities.map((activity, actIndex) => (
                          <div
                            key={actIndex}
                            className="flex gap-4 p-4 bg-zinc-50 rounded-lg hover:bg-zinc-100 transition-colors"
                          >
                            {activity.time && (
                              <div className="flex items-center gap-2 text-sm text-zinc-500 min-w-[80px]">
                                <Clock className="size-4" />
                                <span>{activity.time}</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <h5 className="font-semibold text-zinc-800 mb-1">
                                {activity.title}
                              </h5>
                              {activity.highlights && (
                                <p className="text-sm text-zinc-600 mb-2">
                                  {activity.highlights}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-zinc-500">
                                {activity.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="size-3" />
                                    <span>{activity.location}</span>
                                  </div>
                                )}
                                {activity.duration && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="size-3" />
                                    <span>{activity.duration}</span>
                                  </div>
                                )}
                                {activity.costEstimate && (
                                  <Badge variant="outline" className="text-xs">
                                    {activity.costEstimate}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Day Map */}
                      {currentDayPlan.activities.some(a => a.coords) && (
                        <div className="mt-6">
                          <h5 className="font-semibold text-sm text-zinc-700 mb-3">
                            Day {currentDayPlan.day} Route
                          </h5>
                          <div className="rounded-lg overflow-hidden border">
                            <DailyRouteMap
                              activities={currentDayPlan.activities
                                .filter(a => a.coords)
                                .map(a => ({
                                  name: a.title,
                                  lat: a.coords!.lat,
                                  lng: a.coords!.lng,
                                  type: a.type,
                                  imageUrl: a.imageUrl,
                                }))}
                              dayNumber={currentDayPlan.day}
                              dayTitle={currentDayPlan.title}
                              onClose={() => { }}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* UGC Signals - AI-Generated Insights from Comments */}
            <UGCSignalsPanel tripId={tripId} onGenerate={fetchTripDetails} />

            {/* Comments Section - Enhanced */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-xl text-zinc-800">
                    Comments
                  </h3>
                  <span className="text-sm text-zinc-500">
                    {trip._count.comments} {trip._count.comments === 1 ? 'comment' : 'comments'}
                  </span>
                </div>

                {/* Comment Input */}
                {user ? (
                  <div className="mb-8 space-y-3">
                    <div className="relative">
                      <Textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your thoughts about this trip..."
                        className="resize-none pr-12 min-h-[100px]"
                        rows={3}
                      />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                          <Smile className="size-4" />
                        </Button>
                      </div>
                      {showEmojiPicker && (
                        <div className="absolute top-full right-0 z-50 mt-2">
                          <EmojiPicker
                            onEmojiClick={(emoji) => {
                              setCommentText(commentText + emoji.emoji);
                              setShowEmojiPicker(false);
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">
                        Tip: You can use emojis 😊 to express yourself!
                      </span>
                      <Button
                        onClick={handleSubmitComment}
                        disabled={submittingComment || !commentText.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600"
                      >
                        {submittingComment ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="size-4 mr-2" />
                            Post Comment
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-8 p-6 bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-lg text-center border border-zinc-200">
                    <MessageCircle className="size-12 mx-auto mb-3 text-zinc-400" />
                    <p className="text-zinc-700 font-medium mb-2">Join the conversation</p>
                    <p className="text-zinc-600 text-sm mb-4">Sign in to leave a comment and connect with fellow travelers</p>
                    <Button variant="outline" onClick={() => router.push('/auth/signin')} className="bg-white">
                      Sign In
                    </Button>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-6">
                  {trip.comments.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="size-16 mx-auto mb-4 text-zinc-300" />
                      <p className="text-zinc-500 font-medium mb-1">
                        No comments yet
                      </p>
                      <p className="text-zinc-400 text-sm">
                        Be the first to share your thoughts about this trip!
                      </p>
                    </div>
                  ) : (
                    trip.comments
                      .filter((comment) => !comment.parentId)
                      .map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          currentUserId={user?.id}
                          tripId={tripId}
                          onUpdate={fetchTripDetails}
                        />
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons - No card wrapper */}
          <div className="flex items-center gap-4 py-6 border-b border-zinc-200">
            <Button
              onClick={handleLike}
              variant={isLiked ? 'default' : 'ghost'}
              className={cn(
                'gap-2',
                isLiked && 'bg-red-500 hover:bg-red-600 text-white'
              )}
            >
              <Heart className={cn('size-5', isLiked && 'fill-current')} />
              <span>Like ({likeCount})</span>
            </Button>
            <Button variant="ghost" className="gap-2">
              <Share2 className="size-5" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => !deleting && setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-semibold text-zinc-800 mb-2">
                Delete Trip?
              </h3>
              <p className="text-zinc-600 mb-6">
                Are you sure you want to delete this trip? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
