import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Review } from '@/types';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  skillName: string;
  onSubmit: (review: Omit<Review, 'id' | 'createdAt'>) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  userName,
  skillName,
  onSubmit
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        user: userName,
        userId: 'current-user', // This would be the current user's ID
        reviewerId: 'current-user', // This would be the current user's ID
        rating,
        comment: comment.trim(),
        swapId: 'swap-id' // This would be passed as a prop
      });
      
      // Reset form
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    onClose();
  };

  const getRatingText = (stars: number) => {
    switch (stars) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Rate your experience';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant border-0 bg-card/95 backdrop-blur animate-scale-in">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            {userName.split(' ').map(n => n[0]).join('')}
          </div>
          
          <CardTitle className="text-xl mb-2">Rate Your Experience</CardTitle>
          <p className="text-muted-foreground">
            How was your <span className="font-medium">{skillName}</span> session with {userName}?
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Star Rating */}
          <div className="text-center space-y-4">
            <div className="flex justify-center items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'text-warning fill-warning'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <p className="text-lg font-medium text-foreground">
              {getRatingText(hoveredRating || rating)}
            </p>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Share your feedback (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about your experience..."
              rows={4}
              className="resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>

          {/* Encouragement */}
          {rating > 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Your feedback helps our community grow! 🌟
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RatingModal;