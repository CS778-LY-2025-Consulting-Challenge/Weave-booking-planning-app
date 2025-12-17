import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Star, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Review {
  id: number;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  helpful: number;
  notHelpful: number;
  photos?: string[];
  verified: boolean;
}

interface ReviewsProps {
  itemName: string;
  reviews?: Review[];
}

export default function Reviews({
  itemName,
  reviews: initialReviews,
}: ReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(
    initialReviews || [
      {
        id: 1,
        userName: 'Sarah Martinez',
        userAvatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        rating: 5,
        date: '2024-11-28',
        title: 'Absolutely Amazing Experience!',
        comment:
          "This was hands down the best trip I've ever taken. Everything was perfectly organized, the accommodations were luxurious, and our guide was incredibly knowledgeable. The itinerary was well-paced with a perfect mix of activities and relaxation. Highly recommend!",
        helpful: 24,
        notHelpful: 1,
        photos: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
        ],
        verified: true,
      },
      {
        id: 2,
        userName: 'Michael Chen',
        userAvatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        rating: 4,
        date: '2024-11-15',
        title: 'Great value for money',
        comment:
          'Overall a fantastic experience. The hotels were beautiful and the food was excellent. Only minor issue was some of the transportation timings could have been better communicated. But definitely would book again!',
        helpful: 18,
        notHelpful: 2,
        verified: true,
      },
      {
        id: 3,
        userName: 'Emily Thompson',
        userAvatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        rating: 5,
        date: '2024-10-30',
        title: 'Dream vacation come true',
        comment:
          'Everything exceeded my expectations. The attention to detail was remarkable, and the customer service was top-notch. Our tour guide went above and beyond to make sure we had an unforgettable experience.',
        helpful: 32,
        notHelpful: 0,
        photos: [
          'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800',
        ],
        verified: true,
      },
      {
        id: 4,
        userName: 'David Rodriguez',
        userAvatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        rating: 4,
        date: '2024-10-12',
        title: 'Wonderful but a few hiccups',
        comment:
          'The destinations were breathtaking and most arrangements were perfect. Had a small issue with one of the hotel bookings, but the support team resolved it quickly. Overall, a memorable trip!',
        helpful: 12,
        notHelpful: 3,
        verified: false,
      },
    ]
  );

  const [newReview, setNewReview] = useState({
    rating: 0,
    title: '',
    comment: '',
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [selectedReviewPhotos, setSelectedReviewPhotos] = useState<string[]>(
    []
  );

  // Calculate rating statistics
  const avgRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  const ratingCounts = [5, 4, 3, 2, 1].map(
    (rating) => reviews.filter((r) => r.rating === rating).length
  );

  const handleSubmitReview = () => {
    if (newReview.rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (newReview.title.trim() === '' || newReview.comment.trim() === '') {
      toast.error('Please fill in all fields');
      return;
    }

    const review: Review = {
      id: reviews.length + 1,
      userName: 'You',
      userAvatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      rating: newReview.rating,
      date: new Date().toISOString().split('T')[0],
      title: newReview.title,
      comment: newReview.comment,
      helpful: 0,
      notHelpful: 0,
      photos: uploadedPhotos,
      verified: true,
    };

    setReviews([review, ...reviews]);
    setNewReview({ rating: 0, title: '', comment: '' });
    setUploadedPhotos([]);
    setReviewDialogOpen(false);
    toast.success('Review submitted successfully!');
  };

  const handleHelpful = (id: number, isHelpful: boolean) => {
    setReviews(
      reviews.map((review) => {
        if (review.id === id) {
          return {
            ...review,
            helpful: isHelpful ? review.helpful + 1 : review.helpful,
            notHelpful: !isHelpful ? review.notHelpful + 1 : review.notHelpful,
          };
        }
        return review;
      })
    );
    toast.success('Thank you for your feedback!');
  };

  const handlePhotoUpload = () => {
    // Simulate photo upload with placeholder images
    const placeholderPhotos = [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    ];
    const randomPhoto =
      placeholderPhotos[Math.floor(Math.random() * placeholderPhotos.length)];
    setUploadedPhotos([...uploadedPhotos, randomPhoto]);
    toast.success('Photo added!');
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  const openPhotoGallery = (photos: string[], index: number) => {
    setSelectedReviewPhotos(photos);
    setSelectedImageIndex(index);
  };

  const closePhotoGallery = () => {
    setSelectedImageIndex(null);
    setSelectedReviewPhotos([]);
  };

  return (
    <div className="space-y-6">
      {/* Rating Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left: Average Rating */}
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold text-gray-900">
                {avgRating.toFixed(1)}
              </div>
              <div className="mb-2 flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= Math.round(avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-600">{reviews.length} reviews</p>
            </div>

            {/* Right: Rating Breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating, idx) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex w-16 items-center gap-1">
                    <span className="text-sm">{rating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Progress
                    value={(ratingCounts[idx] / reviews.length) * 100}
                    className="flex-1"
                  />
                  <span className="w-12 text-right text-sm text-gray-600">
                    {ratingCounts[idx]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write a Review Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Star className="h-4 w-4" />
              Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Write a Review for {itemName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Rating */}
              <div className="space-y-2">
                <Label>Your Rating *</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      onClick={() =>
                        setNewReview({ ...newReview, rating: star })
                      }
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoveredRating || newReview.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="reviewTitle">Review Title *</Label>
                <input
                  id="reviewTitle"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Sum up your experience"
                  value={newReview.title}
                  onChange={(e) =>
                    setNewReview({ ...newReview, title: e.target.value })
                  }
                />
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="reviewComment">Your Review *</Label>
                <Textarea
                  id="reviewComment"
                  placeholder="Tell us about your experience..."
                  rows={6}
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                />
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <Label>Add Photos (Optional)</Label>
                <div className="flex flex-wrap gap-3">
                  {uploadedPhotos.map((photo, index) => (
                    <div key={index} className="group relative">
                      <img
                        src={photo}
                        alt={`Upload ${index + 1}`}
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {uploadedPhotos.length < 5 && (
                    <button
                      onClick={handlePhotoUpload}
                      className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 transition-colors hover:border-blue-500 hover:bg-blue-50"
                    >
                      <Camera className="h-8 w-8 text-gray-400" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  You can add up to 5 photos
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSubmitReview} className="flex-1">
                  Submit Review
                </Button>
                <Button
                  onClick={() => setReviewDialogOpen(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={review.userAvatar}
                      alt={review.userName}
                    />
                    <AvatarFallback>
                      {review.userName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {review.userName}
                          </h4>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <h5 className="mb-2 font-semibold text-gray-900">
                      {review.title}
                    </h5>
                    <p className="mb-3 text-gray-700">{review.comment}</p>

                    {/* Photos */}
                    {review.photos && review.photos.length > 0 && (
                      <div className="mb-3 flex gap-2">
                        {review.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt={`Review photo ${idx + 1}`}
                            className="h-24 w-24 cursor-pointer rounded-lg object-cover transition-opacity hover:opacity-80"
                            onClick={() =>
                              openPhotoGallery(review.photos || [], idx)
                            }
                          />
                        ))}
                      </div>
                    )}

                    {/* Helpful */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">Was this helpful?</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleHelpful(review.id, true)}
                        className="gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Yes ({review.helpful})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleHelpful(review.id, false)}
                        className="gap-1"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        No ({review.notHelpful})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Photo Gallery Modal */}
      {selectedImageIndex !== null && (
        <Dialog
          open={selectedImageIndex !== null}
          onOpenChange={closePhotoGallery}
        >
          <DialogContent className="max-w-4xl">
            <div className="relative">
              <img
                src={selectedReviewPhotos[selectedImageIndex]}
                alt="Review photo"
                className="h-auto max-h-[80vh] w-full rounded-lg object-contain"
              />
              <div className="mt-4 flex justify-center gap-2">
                {selectedReviewPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                      idx === selectedImageIndex
                        ? 'border-blue-500'
                        : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}