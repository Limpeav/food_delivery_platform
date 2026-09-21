'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle2,
  Bike,
  Store,
  MapPin,
  Phone,
  AlertCircle,
  Star,
  Receipt,
  Navigation,
} from 'lucide-react';
import { orderService } from '@/services/orderService';
import { reviewService } from '@/services/reviewService';
import { Order, OrderStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = Number(resolvedParams.id);
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const o = await orderService.getOrderById(orderId);
        setOrder(o);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }
    if (orderId) {
      loadData();
    }
  }, [orderId]);

  // Polling for live status updates every 6 seconds
  useEffect(() => {
    if (!order || ['DELIVERED', 'CANCELLED', 'REJECTED'].includes(order.status)) {
      return;
    }
    const interval = setInterval(async () => {
      try {
        const fresh = await orderService.getOrderById(orderId);
        setOrder(fresh);
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [order, orderId]);

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(orderId);
      setOrder(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setSubmittingReview(true);
    try {
      await reviewService.createReview({
        orderId: order.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewSubmitted(true);
      setReviewModalOpen(false);
      alert('Thank you for rating your food!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <Loading fullPage message="Loading tracking status..." />;
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order not found</h2>
        <Link href="/orders" className="mt-4 inline-block text-sm font-bold text-[#FF5A1F]">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const steps: { label: string; key: OrderStatus }[] = [
    { label: 'Order Placed', key: 'PENDING' },
    { label: 'Confirmed', key: 'CONFIRMED' },
    { label: 'Kitchen Preparing', key: 'PREPARING' },
    { label: 'Ready for Pickup', key: 'READY_FOR_PICKUP' },
    { label: 'Out for Delivery', key: 'OUT_FOR_DELIVERY' },
    { label: 'Delivered', key: 'DELIVERED' },
  ];

  const getStepStatus = (stepKey: OrderStatus) => {
    const statusOrder: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      return 'cancelled';
    }
    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'upcoming';
  };

  const formattedOrderNumber = order.id.toString().padStart(6, '0');

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Order #{formattedOrderNumber}
            </h1>
            <Badge
              variant={
                order.status === 'DELIVERED'
                  ? 'success'
                  : order.status === 'CANCELLED' || order.status === 'REJECTED'
                  ? 'danger'
                  : 'primary'
              }
              size="md"
            >
              {order.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {order.status === 'PENDING' && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancelOrder}
              isLoading={cancelling}
              className="rounded-xl text-xs"
            >
              Cancel Order
            </Button>
          )}

          {order.status === 'DELIVERED' && !reviewSubmitted && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setReviewModalOpen(true)}
              className="rounded-xl text-xs gap-1.5"
            >
              <Star className="w-3.5 h-3.5 fill-white" /> Rate & Review
            </Button>
          )}
        </div>
      </div>

      {/* Pipeline Visualizer */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6">
          Delivery Pipeline
        </h2>

        {order.status === 'CANCELLED' || order.status === 'REJECTED' ? (
          <div className="flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-700">
            <AlertCircle className="w-6 h-6 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-bold">This order was {order.status.toLowerCase()}</p>
              <p className="text-xs text-rose-600 mt-0.5">
                Any pre-authorized amounts have been credited back.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {steps.map((step) => {
              const status = getStepStatus(step.key);
              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    status === 'active'
                      ? 'border-[#FF5A1F] bg-[#FFF1EB] text-[#FF5A1F] ring-2 ring-[#FF5A1F]/20'
                      : status === 'completed'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-100 bg-slate-50/60 text-slate-400'
                  }`}
                >
                  <div className="flex justify-center mb-1.5">
                    {status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : status === 'active' ? (
                      <Clock className="w-5 h-5 text-[#FF5A1F] animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <p className="text-xs font-bold leading-tight">{step.label}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid: Driver Dispatch + Order Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Driver Card & Restaurant */}
        <div className="lg:col-span-6 space-y-6">
          {/* Driver Tracking Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Bike className="w-5 h-5 text-[#FF5A1F]" />
              <h2 className="text-base font-bold text-slate-900">
                Driver & GPS Dispatch
              </h2>
            </div>

            {order.driverName ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {order.driverName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {order.driverName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {order.vehicleType || 'Motorbike'} • {order.vehicleNumber || 'Phnom Penh 1B-9988'}
                      </p>
                    </div>
                  </div>
                  {order.driverPhone && (
                    <a
                      href={`tel:${order.driverPhone}`}
                      className="p-2.5 rounded-xl bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Simulated GPS Coordinate Card */}
                <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      Live GPS Position
                    </span>
                    <Badge variant="success" size="sm">
                      {order.deliveryStatus ? order.deliveryStatus.replace(/_/g, ' ') : 'IN TRANSIT'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                    <span>Lat: {order.driverLatitude?.toFixed(4) || '11.5564'}</span>
                    <span>Lng: {order.driverLongitude?.toFixed(4) || '104.9282'}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Estimated Arrival:</span>
                    <span className="font-bold text-white">~15-20 mins</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-500">
                <Bike className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="font-medium text-slate-700">Driver Auto-Assignment In Progress</p>
                <p className="mt-0.5">
                  Nearest available driver will be assigned as soon as food is ready.
                </p>
              </div>
            )}
          </div>

          {/* Restaurant & Destination Card */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Delivery Route</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Store className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">{order.restaurantName}</p>
                  <p className="text-slate-500">{order.restaurantAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">
                    {order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ''}
                  </p>
                  <p className="text-slate-500">{order.deliveryAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Items & Financials */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Receipt className="w-5 h-5 text-[#FF5A1F]" />
            <h2 className="text-base font-bold text-slate-900">
              Items Ordered
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-orange-100 text-[#FF5A1F] text-xs font-bold flex items-center justify-center">
                    {item.quantity}×
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.foodName}</h4>
                    <p className="text-[11px] text-slate-400">
                      ${item.unitPrice.toFixed(2)} each
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-900">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-slate-800">${order.deliveryFee.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Voucher Discount</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-slate-100 pt-3 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Paid</span>
              <span className="text-base font-black text-[#FF5A1F]">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Payment Mode:</span>
              <Badge variant="neutral" size="sm">
                {order.paymentMethod.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Rate & Review Your Meal"
        description="Share your experience to help others and support the restaurant"
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Overall Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= reviewRating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="What did you love? How was the food temperature and taste?"
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submittingReview}
            >
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
