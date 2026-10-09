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
  RotateCcw,
  Banknote,
} from 'lucide-react';
import { orderService, DeliveryEta, PaymentInfo } from '@/services/orderService';
import { reviewService } from '@/services/reviewService';
import { Order, OrderStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';
import { DeliveryTrackingMap } from '@/components/ui/DeliveryTrackingMap';
import { OrderReceiptModal } from '@/components/ui/OrderReceiptModal';
import { subscribeToOrder, subscribeToOrderLocation } from '@/lib/websocket';
import { useTranslation } from '@/stores/languageStore';

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = Number(resolvedParams.id);
  const router = useRouter();
  const { t, language } = useTranslation();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [eta, setEta] = useState<DeliveryEta | null>(null);
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [realtimeDriverLocation, setRealtimeDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const o = await orderService.getOrderById(orderId);
        setOrder(o);

        // Fetch payment details
        orderService.getPaymentByOrder(orderId).then(setPayment).catch(() => {});

        // Fetch ETA if order is active
        if (['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'DRIVER_ASSIGNED', 'FOOD_PICKED_UP', 'DELIVERING'].includes(o.status)) {
          orderService.getDeliveryEta(orderId).then(setEta).catch(() => {});
        }
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

  // Real-time WebSocket connection for order updates and driver movement
  useEffect(() => {
    if (!orderId) return;

    // 1. Live Order Status Updates
    const unsubscribeOrder = subscribeToOrder(orderId, (update: any) => {
      console.log('Real-time order update received:', update);
      orderService.getOrderById(orderId).then((fresh) => {
        setOrder(fresh);
        if (['DRIVER_ASSIGNED', 'FOOD_PICKED_UP', 'DELIVERING'].includes(fresh.status)) {
          orderService.getDeliveryEta(orderId).then(setEta).catch(() => {});
        }
      }).catch(console.error);
    });

    // 2. Live Driver GPS Location Updates
    const unsubscribeLocation = subscribeToOrderLocation(orderId, (loc: any) => {
      if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
        setRealtimeDriverLocation({
          lat: loc.latitude,
          lng: loc.longitude,
        });
      }
    });

    return () => {
      unsubscribeOrder();
      unsubscribeLocation();
    };
  }, [orderId]);

  // Fallback Polling (every 15 seconds) for network resilience
  useEffect(() => {
    if (!order || ['DELIVERED', 'CANCELLED', 'REJECTED'].includes(order.status)) {
      return;
    }
    const interval = setInterval(async () => {
      try {
        const fresh = await orderService.getOrderById(orderId);
        setOrder(fresh);

        // Refresh ETA if in delivery
        if (['DRIVER_ASSIGNED', 'FOOD_PICKED_UP', 'DELIVERING'].includes(fresh.status)) {
          orderService.getDeliveryEta(orderId).then(setEta).catch(() => {});
        }
      } catch (err) {
        console.error('Fallback polling error:', err);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [order, orderId]);

  const handleCancelOrder = async () => {
    if (!confirm(t.orderTrackingPage.confirmCancel)) return;
    setCancelling(true);
    try {
      const updated = await orderService.cancelOrder(orderId);
      setOrder(updated);
    } catch (err: any) {
      alert(err.response?.data?.message || t.orderTrackingPage.orderCancelled);
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    if (!order) return;
    setReordering(true);
    try {
      await orderService.reorder(order.id);
      router.push('/cart');
    } catch (err: any) {
      alert(err.response?.data?.message || t.orderTrackingPage.reorderError);
    } finally {
      setReordering(false);
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
      alert(t.orderTrackingPage.reviewSuccess);
    } catch (err: any) {
      alert(err.response?.data?.message || t.orderTrackingPage.reviewError);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <Loading fullPage message={t.orderTrackingPage.loadingTracking} />;
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">{t.orderTrackingPage.orderNotFound}</h2>
        <Link href="/orders" className="mt-4 inline-block text-sm font-bold text-[#FF5A1F]">
          {t.orderTrackingPage.backToOrders}
        </Link>
      </div>
    );
  }

  const steps: { label: string; key: OrderStatus }[] = [
    { label: t.orderTrackingPage.stepPlaced, key: 'PENDING' },
    { label: t.orderTrackingPage.stepConfirmed, key: 'CONFIRMED' },
    { label: t.orderTrackingPage.stepPreparing, key: 'PREPARING' },
    { label: t.orderTrackingPage.stepReady, key: 'READY_FOR_PICKUP' },
    { label: t.orderTrackingPage.stepDelivery, key: 'OUT_FOR_DELIVERY' },
    { label: t.orderTrackingPage.stepDelivered, key: 'DELIVERED' },
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
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {t.orderTrackingPage.orderNumber}{formattedOrderNumber}
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
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t.orderTrackingPage.placedOn}{' '}
            {new Date(order.createdAt).toLocaleString(language === 'km' ? 'km-KH' : 'en-US')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setReceiptModalOpen(true)}
            className="rounded-xl text-xs gap-1.5 shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5 text-[#FF5A1F]" /> {t.orderTrackingPage.officialReceipt}
          </Button>

          {order.status === 'PENDING' && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleCancelOrder}
              isLoading={cancelling}
              className="rounded-xl text-xs"
            >
              {t.orderTrackingPage.cancelOrder}
            </Button>
          )}

          {order.status === 'DELIVERED' && !reviewSubmitted && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setReviewModalOpen(true)}
              className="rounded-xl text-xs gap-1.5"
            >
              <Star className="w-3.5 h-3.5 fill-white" /> {t.orderTrackingPage.rateOrder}
            </Button>
          )}

          {['DELIVERED', 'CANCELLED'].includes(order.status) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReorder}
              isLoading={reordering}
              className="rounded-xl text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#FF5A1F]" /> {t.orderTrackingPage.reorder}
            </Button>
          )}
        </div>
      </div>

      {/* Payment Banner */}
      {order.paymentMethod === 'ONLINE_PAYMENT' ? (
        <div className="rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                {t.orderTrackingPage.onlinePayment} (${order.totalAmount.toFixed(2)})
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                {t.orderTrackingPage.onlinePaymentDesc} {order.transactionReference ? `Ref: ${order.transactionReference}` : ''}
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">{t.orderTrackingPage.paidOnline}</Badge>
        </div>
      ) : (
        <div className="rounded-3xl border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 p-4 sm:p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Banknote className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {t.orderTrackingPage.cashOnDelivery} (${order.totalAmount.toFixed(2)})
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                {t.orderTrackingPage.cashOnDeliveryBannerDesc}
              </p>
            </div>
          </div>
          <Badge variant="warning" size="sm">{t.checkoutPage.cashOnDelivery}</Badge>
        </div>
      )}

      {/* Pipeline Visualizer */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
          {t.orderTrackingPage.pipelineTitle}
        </h2>

        {order.status === 'CANCELLED' || order.status === 'REJECTED' ? (
          <div className="flex items-center gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4 text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-6 h-6 shrink-0 text-rose-500" />
            <div>
              <p className="text-sm font-bold">{t.orderTrackingPage.orderWas} {order.status.toLowerCase()}</p>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
                {t.orderTrackingPage.orderWasDesc}
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
                      ? 'border-[#FF5A1F] bg-[#FFF1EB] dark:bg-orange-950/30 text-[#FF5A1F] ring-2 ring-[#FF5A1F]/20'
                      : status === 'completed'
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <div className="flex justify-center mb-1.5">
                    {status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : status === 'active' ? (
                      <Clock className="w-5 h-5 text-[#FF5A1F] animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700" />
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
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Bike className="w-5 h-5 text-[#FF5A1F]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t.orderTrackingPage.driverCardTitle}
              </h2>
            </div>

            {order.driverName ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {order.driverName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {order.driverName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {order.vehicleType || t.driver.motorcycle} • {order.vehicleNumber || 'Phnom Penh 1B-9988'}
                      </p>
                    </div>
                  </div>
                  {order.driverPhone && (
                    <a
                      href={`tel:${order.driverPhone}`}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Interactive Live Tracking Map */}
                <div className="space-y-3">
                  <DeliveryTrackingMap
                    restaurantLocation={{
                      lat: order.restaurantLatitude || 11.5564,
                      lng: order.restaurantLongitude || 104.9282,
                      name: order.restaurantName,
                      address: order.restaurantAddress,
                    }}
                    deliveryLocation={{
                      lat: order.deliveryLatitude || 11.5621,
                      lng: order.deliveryLongitude || 104.9160,
                      name: order.customerName,
                      address: order.deliveryAddress,
                    }}
                    driverLocation={
                      realtimeDriverLocation
                        ? {
                            lat: realtimeDriverLocation.lat,
                            lng: realtimeDriverLocation.lng,
                            name: order.driverName || t.orderTrackingPage.driverInfo,
                          }
                        : order.driverLatitude && order.driverLongitude
                        ? {
                            lat: order.driverLatitude,
                            lng: order.driverLongitude,
                            name: order.driverName || t.orderTrackingPage.driverInfo,
                          }
                        : undefined
                    }
                    status={order.deliveryStatus || order.status}
                    height={300}
                  />

                  <div className="p-3.5 rounded-2xl bg-slate-950 text-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span className="font-bold text-slate-200">
                        {order.deliveryStatus ? order.deliveryStatus.replace(/_/g, ' ') : t.orderTrackingPage.inTransit}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{t.orderTrackingPage.eta}</span>
                      <span className="font-bold text-emerald-400">
                        {eta ? `${eta.etaMinutes} ${t.orderTrackingPage.mins}${eta.distanceKm ? ` (${eta.distanceKm} km)` : ''}` : `~15-20 ${t.orderTrackingPage.mins}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <DeliveryTrackingMap
                  restaurantLocation={{
                    lat: order.restaurantLatitude || 11.5564,
                    lng: order.restaurantLongitude || 104.9282,
                    name: order.restaurantName,
                    address: order.restaurantAddress,
                  }}
                  deliveryLocation={{
                    lat: order.deliveryLatitude || 11.5621,
                    lng: order.deliveryLongitude || 104.9160,
                    name: order.customerName,
                    address: order.deliveryAddress,
                  }}
                  status={order.status}
                  height={260}
                />
                <div className="p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-500 dark:text-slate-400">
                  <Bike className="w-5 h-5 text-slate-400 dark:text-slate-500 mx-auto mb-1.5" />
                  <p className="font-medium text-slate-700 dark:text-slate-300">{t.orderTrackingPage.driverAutoAssign}</p>
                  <p className="text-[11px] mt-0.5 text-slate-400 dark:text-slate-500">
                    {t.orderTrackingPage.driverAutoAssignDesc}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Restaurant & Destination Card */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.orderTrackingPage.deliveryRoute}</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Store className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{order.restaurantName}</p>
                  <p className="text-slate-500 dark:text-slate-400">{order.restaurantAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ''}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">{order.deliveryAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Items & Financials */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Receipt className="w-5 h-5 text-[#FF5A1F]" />
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t.orderTrackingPage.itemsOrdered}
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {order.items.map((item) => (
              <div key={item.id} className="py-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-orange-100 dark:bg-orange-950/50 text-[#FF5A1F] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {item.quantity}×
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.foodName}</h4>
                    {item.selectedOptions && (
                      <div className="mt-0.5">
                        <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60 px-1.5 py-0.5 rounded">
                          {item.selectedOptions}
                        </span>
                      </div>
                    )}
                    {item.specialInstructions && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5">
                        {t.orderTrackingPage.specialInstructions} {item.specialInstructions}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      ${item.unitPrice.toFixed(2)} {t.orderTrackingPage.each}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 shrink-0">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between">
              <span>{t.checkoutPage.subtotal}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.checkoutPage.deliveryFee}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">${order.deliveryFee.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>{t.checkoutPage.discountCoupon}</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100">
              <span>{t.orderTrackingPage.totalPaid}</span>
              <span className="text-base font-black text-[#FF5A1F]">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>{t.orderTrackingPage.paymentMode}</span>
              <Badge variant="neutral" size="sm">
                {order.paymentMethod.replace(/_/g, ' ')}
              </Badge>
            </div>
            {payment && (
              <>
                <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                  <span>{t.orderTrackingPage.paymentStatus}</span>
                  <Badge variant={payment.status === 'SUCCESS' ? 'success' : payment.status === 'FAILED' ? 'danger' : 'warning'} size="sm">
                    {payment.status}
                  </Badge>
                </div>
                {payment.transactionReference && (
                  <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    <span>{t.orderTrackingPage.reference}</span>
                    <span className="text-slate-600 dark:text-slate-300 font-bold">{payment.transactionReference}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={t.orderTrackingPage.reviewModalTitle}
        description={t.orderTrackingPage.reviewModalDesc}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              {t.orderTrackingPage.reviewOverallRating}
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
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              {t.orderTrackingPage.reviewComments}
            </label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder={t.orderTrackingPage.commentPlaceholder}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReviewModalOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submittingReview}
            >
              {t.orderTrackingPage.submitReview}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Official Tax Invoice & Receipt Modal */}
      {order && (
        <OrderReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          order={order}
        />
      )}
    </div>
  );
}
