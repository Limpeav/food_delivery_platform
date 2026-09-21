'use client';

import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Star,
  Trash2,
  AlertTriangle,
  Search,
  Store,
  User as UserIcon,
  ShoppingBag,
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Review } from '@/types';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminService.getReviews({ page, size: 20 });
      setReviews(res.content);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Failed to load reviews' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await adminService.deleteReview(deleteTarget.id);
      setFeedback({ type: 'success', message: 'Review removed successfully' });
      setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'Failed to delete review' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesQuery =
      searchQuery.trim() === '' ||
      r.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.restaurantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.foodItemName && r.foodItemName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRating = selectedRating === null || r.rating === selectedRating;

    return matchesQuery && matchesRating;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Review Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor, inspect, and moderate customer ratings and written reviews across all restaurants
          </p>
        </div>
        <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {reviews.length} Total Reviews
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-bold underline cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reviews by customer, restaurant, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedRating(null)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedRating === null
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Ratings
          </button>
          {[5, 4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => setSelectedRating(stars === selectedRating ? null : stars)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedRating === stars
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{stars}</span>
              <Star className="w-3 h-3 fill-current" />
            </button>
          ))}
        </div>
      </div>

      {/* Review List */}
      {loading ? (
        <Loading fullPage message="Loading platform reviews..." />
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No reviews found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedRating !== null
              ? 'No reviews match your filter criteria. Try adjusting your search query or rating filter.'
              : 'No customer reviews have been submitted on the platform yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
            >
              <div>
                {/* Header: Customer, Restaurant, Date */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-900">
                        {review.customerName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Store className="w-3 h-3 text-slate-400" />
                      <span>{review.restaurantName}</span>
                      {review.foodItemName && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <ShoppingBag className="w-3 h-3" />
                            {review.foodItemName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 font-black text-xs shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{review.rating}.0</span>
                  </div>
                </div>

                {/* Review Text */}
                <div className="mt-3">
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    {review.comment ? `"${review.comment}"` : 'No written feedback provided.'}
                  </p>
                </div>
              </div>

              {/* Footer: Date and Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Order #{review.orderId} • {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent'}
                </span>
                <button
                  onClick={() => setDeleteTarget(review)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Moderate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={page + 1}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={20}
        onPageChange={(p) => setPage(p - 1)}
        className="px-2"
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Moderate Review"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <p>
              Are you sure you want to permanently delete this review? This will automatically recalculate the restaurant and food item rating.
            </p>
          </div>

          {deleteTarget && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{deleteTarget.customerName}</span>
                <span className="text-amber-600">★ {deleteTarget.rating} / 5</span>
              </div>
              <p className="text-slate-600 italic">
                {deleteTarget.comment || 'No written comment'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Delete Review
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
