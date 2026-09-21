'use client';

import React, { useEffect, useState } from 'react';
import { Store, Check, X, Ban, Star, Clock, MapPin } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Restaurant, RestaurantStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<RestaurantStatus | 'ALL'>('ALL');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  useEffect(() => {
    loadRestaurants();
  }, [statusFilter, page]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const res = await adminService.getRestaurants({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        size: 20,
      });
      setRestaurants(res.content);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: RestaurantStatus) => {
    setActionLoading(id);
    try {
      const updated = await adminService.updateRestaurantStatus(id, status);
      setRestaurants(restaurants.map((r) => (r.id === id ? updated : r)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update restaurant');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusVariant = (s: RestaurantStatus) => {
    switch (s) {
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
      case 'SUSPENDED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Restaurant Partner Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Approve new merchant applications, manage store compliance and statuses
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#FF5A1F]"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <Loading message="Loading restaurants..." />
      ) : restaurants.length === 0 ? (
        <EmptyState
          icon={<Store className="w-8 h-8" />}
          title="No restaurants found"
          description="There are currently no restaurants matching this status filter."
        />
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
          {restaurants.map((rest) => (
            <div key={rest.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={
                      rest.logoUrl ||
                      rest.coverImageUrl ||
                      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={rest.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{rest.name}</h3>
                    <Badge variant={getStatusVariant(rest.status)} size="sm">
                      {rest.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Owner: <span className="font-semibold text-slate-700">{rest.ownerName}</span> • Category: {rest.categoryName}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {rest.rating.toFixed(1)} ({rest.reviewCount} reviews)
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {rest.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {rest.status === 'PENDING' && (
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleUpdateStatus(rest.id, 'APPROVED')}
                      isLoading={actionLoading === rest.id}
                      className="rounded-xl text-xs gap-1 font-bold"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleUpdateStatus(rest.id, 'REJECTED')}
                      isLoading={actionLoading === rest.id}
                      className="rounded-xl text-xs gap-1 font-bold"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </>
                )}

                {rest.status === 'APPROVED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(rest.id, 'SUSPENDED')}
                    isLoading={actionLoading === rest.id}
                    className="rounded-xl text-xs gap-1 text-rose-600 hover:bg-rose-50"
                  >
                    <Ban className="w-3.5 h-3.5" /> Suspend
                  </Button>
                )}

                {rest.status === 'SUSPENDED' && (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleUpdateStatus(rest.id, 'APPROVED')}
                    isLoading={actionLoading === rest.id}
                    className="rounded-xl text-xs gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Unsuspend
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={20}
            onPageChange={(p) => setPage(p - 1)}
            className="px-6 py-4 bg-slate-50/50"
          />
        </div>
      )}
    </div>
  );
}
