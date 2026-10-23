import { useState, type FormEvent } from 'react';
import { ShieldCheck, MessageSquare } from 'lucide-react';
import { RatingStars } from '@/components/ui/rating-stars';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/toast';
import type { Review } from '@/types/database.types';

export interface ReviewListProps {
  promptId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  hasPurchased?: boolean;
  onAddReview?: (rating: number, comment: string) => Promise<void>;
}

export function ReviewList({
  reviews,
  averageRating,
  totalReviews,
  hasPurchased = false,
  onAddReview,
}: ReviewListProps) {
  const { isUser, openAuthModal } = useAuth();
  const { success, error: toastError } = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddReview?.(rating, comment);
      setComment('');
      success('Review recorded in public ledger');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to publish review';
      toastError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <h3 className="font-serif text-2xl font-bold text-text-ivory">
            Collector Reviews & Verification
          </h3>
          <p className="text-xs text-text-muted mt-1">
            Exclusively authored by verified buyers who unlocked full prompt access.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5">
          <span className="font-serif text-3xl font-bold text-gold-light">
            {averageRating.toFixed(1)}
          </span>
          <div className="flex flex-col">
            <RatingStars rating={averageRating} size="sm" />
            <span className="text-[11px] font-mono text-text-muted">
              {totalReviews} verified ratings
            </span>
          </div>
        </div>
      </div>

      {/* Add Review Form (Only for verified buyers) */}
      {hasPurchased ? (
        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 border border-gold/30 space-y-4">
          <h4 className="text-sm font-semibold text-text-ivory flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span>Leave a Verified Review</span>
          </h4>

          <div>
            <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
              Your Rating
            </label>
            <RatingStars rating={rating} interactive onRatingChange={setRating} size="lg" />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-text-muted mb-1.5">
              Review Notes & Output Feedback
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Detail your rendering experience, model settings used, or fidelity results..."
              className="w-full rounded-lg border border-white/10 bg-elevated p-3 text-sm text-text-ivory placeholder:text-text-muted/40 focus:border-gold focus:outline-none"
            />
          </div>

          <Button type="submit" variant="gold" size="sm" isLoading={isSubmitting}>
            Submit Verified Review
          </Button>
        </form>
      ) : isUser ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-text-muted flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-gold shrink-0" />
          <span>Only verified buyers who have acquired this prompt may author reviews.</span>
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-xs text-text-muted flex items-center justify-between">
          <span>Sign in to verify your acquisitions and leave a rating.</span>
          <Button variant="outline" size="sm" onClick={openAuthModal}>
            Sign In
          </Button>
        </div>
      )}

      {/* Reviews Stream */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-sm text-text-muted italic">
            No reviews published yet for this atelier item. Be the first verified buyer to leave
            feedback.
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="glass-panel rounded-xl p-5 border border-white/5 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-gold/20 flex items-center justify-center font-serif text-xs font-bold text-gold-light">
                    {rev.user?.full_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-text-ivory block">
                      {rev.user?.full_name || 'Collector'}
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">
                      {formatDate(rev.created_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Verified Buyer</span>
                  </span>
                  <RatingStars rating={rev.rating} size="sm" />
                </div>
              </div>

              {rev.comment && (
                <p className="text-sm text-text-muted leading-relaxed pl-9">
                  <MessageSquare className="h-3.5 w-3.5 inline mr-2 text-gold/70" />
                  {rev.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
