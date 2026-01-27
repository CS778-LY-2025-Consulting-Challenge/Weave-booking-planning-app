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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import DailyRouteMap from '@/components/DailyRouteMap';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { cn } from '@/lib/utils';

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
          <Button onClick={() => router.push('/journeys')} variant="outline">
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
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${trip.thumbnailUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828'})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Back Button */}
        <Button
          onClick={() => router.push('/journeys')}
          variant="ghost"
          className="absolute top-24 left-4 z-10 text-white hover:bg-white/20"
        >
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>

        {/* Trip Title & Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-white/20 backdrop-blur-sm text-white border-white/30">
                {trip.duration}
              </Badge>
              <h1 className="font-cormorant text-4xl md:text-5xl font-bold mb-3">
                {trip.title}
              </h1>
              <div className="flex items-center gap-4 mb-6 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span>{trip.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
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
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Itinerary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Author Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
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
              </CardContent>
            </Card>

            {/* Description */}
            {trip.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3">About this trip</h3>
                  <p className="text-zinc-600 leading-relaxed">{trip.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Highlights */}
            {trip.highlights && trip.highlights.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Highlights</h3>
                  <div className="flex flex-wrap gap-2">
                    {trip.highlights.map((highlight, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Day Plans / Travel Guides */}
            {trip.dayGuides && trip.dayGuides.length > 0 ? (
              /* Blog-style Travel Guide Layout */
              <div className="space-y-8">
                <h3 className="font-bold text-2xl text-zinc-800">Travel Guide</h3>
                
                {trip.dayGuides.map((dayGuide, dayIndex) => (
                  <Card key={dayIndex} className="overflow-hidden">
                    <CardContent className="p-0">
                      {/* Day Header */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-purple-600 text-white">
                            Day {dayGuide.dayNumber}
                          </Badge>
                          <h4 className="text-xl font-bold text-zinc-800">
                            {dayGuide.dayTitle}
                          </h4>
                        </div>
                      </div>
                      
                      {/* Content: Activities + Guide */}
                      <div className="grid md:grid-cols-5 gap-6 p-6">
                        {/* Left: Activities with Images */}
                        <div className="md:col-span-2 space-y-4">
                          <h5 className="font-semibold text-sm text-zinc-600 uppercase tracking-wide">
                            Places Visited
                          </h5>
                          {dayGuide.activities.map((activity, actIndex) => (
                            <div key={actIndex} className="space-y-2">
                              {activity.imageUrl && (
                                <div className="relative aspect-video rounded-lg overflow-hidden">
                                  <img
                                    src={activity.imageUrl}
                                    alt={activity.name}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                              )}
                              <div className="space-y-1">
                                <h6 className="font-semibold text-zinc-800">{activity.name}</h6>
                                {activity.time && (
                                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                                    <Clock className="size-3" />
                                    {activity.time}
                                  </p>
                                )}
                                {activity.location && (
                                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                                    <MapPin className="size-3" />
                                    {activity.location}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Right: User Travel Guide */}
                        <div className="md:col-span-3">
                          <h5 className="font-semibold text-sm text-zinc-600 uppercase tracking-wide mb-4">
                            Travel Guide & Tips
                          </h5>
                          {dayGuide.guide ? (
                            <MarkdownRenderer 
                              content={dayGuide.guide} 
                              className="text-zinc-700"
                            />
                          ) : (
                            <p className="text-sm text-zinc-400 italic">
                              No travel guide provided for this day.
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                              onClose={() => {}}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* Comments Section */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">
                  Comments ({trip._count.comments})
                </h3>

                {/* Comment Input */}
                {user ? (
                  <div className="mb-6 space-y-3">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts about this trip..."
                      className="resize-none"
                      rows={3}
                    />
                    <Button
                      onClick={handleSubmitComment}
                      disabled={submittingComment || !commentText.trim()}
                      className="w-full sm:w-auto"
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
                ) : (
                  <div className="mb-6 p-4 bg-zinc-50 rounded-lg text-center">
                    <p className="text-zinc-600 mb-3">Sign in to leave a comment</p>
                    <Button variant="outline" onClick={() => router.push('/auth/signin')}>
                      Sign In
                    </Button>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {trip.comments.length === 0 ? (
                    <p className="text-center text-zinc-500 py-8">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    trip.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-4 bg-zinc-50 rounded-lg">
                        <Avatar className="size-10">
                          <AvatarImage src={comment.userAvatar || undefined} />
                          <AvatarFallback>
                            <User className="size-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-zinc-800">
                              {comment.userName}
                            </span>
                            <span className="text-xs text-zinc-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-zinc-700">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button
                  onClick={handleLike}
                  variant={isLiked ? 'default' : 'outline'}
                  className={cn(
                    'w-full',
                    isLiked && 'bg-red-500 hover:bg-red-600 text-white'
                  )}
                >
                  <Heart className={cn('size-4 mr-2', isLiked && 'fill-current')} />
                  {isLiked ? 'Liked' : 'Like'} ({likeCount})
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="size-4 mr-2" />
                  Share
                </Button>
              </CardContent>
            </Card>

            {/* Trip Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h4 className="font-semibold text-sm text-zinc-700 uppercase tracking-wide">
                  Trip Information
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Duration</span>
                    <span className="font-medium text-zinc-800">{trip.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Destination</span>
                    <span className="font-medium text-zinc-800">{trip.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Days</span>
                    <span className="font-medium text-zinc-800">
                      {trip.dayGuides?.length || dayPlans.length} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Activities</span>
                    <span className="font-medium text-zinc-800">
                      {trip.dayGuides
                        ? trip.dayGuides.reduce((acc, day) => acc + (day.activities?.length || 0), 0)
                        : dayPlans.reduce((acc, day) => acc + (day.activities?.length || 0), 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Overview - Only show if NOT using blog-style layout */}
            {!trip.dayGuides?.length && trip.plannerState.mapPoints && trip.plannerState.mapPoints.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-sm text-zinc-700 uppercase tracking-wide mb-4">
                    Route Overview
                  </h4>
                  <p className="text-xs text-zinc-500 mb-2">
                    Click on a day above to view the detailed route map
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
