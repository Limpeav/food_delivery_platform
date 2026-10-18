'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  QrCode,
  Clock,
  RefreshCw,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { KhqrResponse } from '@/types';
import { useTranslation } from '@/stores/languageStore';

interface BakongKhqrModalProps {
  isOpen: boolean;
  orderId: number;
  amount?: number;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

const KHQR_TIMEOUT_SECONDS = 300; // 5 minutes
const EXCHANGE_RATE_KHR = 4100; // 1 USD = 4,100 KHR

export function BakongKhqrModal({
  isOpen,
  orderId,
  amount: initialAmount,
  onClose,
  onPaymentSuccess,
}: BakongKhqrModalProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [khqrData, setKhqrData] = useState<KhqrResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(KHQR_TIMEOUT_SECONDS);
  const [isExpired, setIsExpired] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sound chime on payment success
  const playSuccessChime = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);
      }
    } catch {
      // Audio not permitted or supported
    }
  }, []);

  // Fetch or generate KHQR
  const fetchKhqr = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      setError(null);
      setIsExpired(false);
      setCountdown(KHQR_TIMEOUT_SECONDS);

      const data = await paymentService.getKhqr(orderId);
      setKhqrData(data);

      if (data.paymentStatus === 'SUCCESS') {
        setIsSuccess(true);
      }
    } catch (err: any) {
      console.error('Failed to generate Bakong KHQR:', err);
      setError(err.response?.data?.message || 'Unable to generate Bakong KHQR. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Handle successful payment transition
  const handleSuccess = useCallback(() => {
    setIsSuccess(true);
    playSuccessChime();

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    setTimeout(() => {
      if (onPaymentSuccess) {
        onPaymentSuccess();
      } else {
        router.push(`/orders/${orderId}`);
      }
    }, 1800);
  }, [onPaymentSuccess, orderId, playSuccessChime, router]);

  // Polling verification function
  const checkPaymentStatus = useCallback(async () => {
    if (!orderId || isSuccess || isExpired) return;
    try {
      setIsVerifying(true);
      const res = await paymentService.verifyKhqr(orderId, false);
      if (res.verified || res.paymentStatus === 'SUCCESS') {
        handleSuccess();
      }
    } catch {
      // Normal when polling before user scans; silent catch
    } finally {
      setIsVerifying(false);
    }
  }, [orderId, isSuccess, isExpired, handleSuccess]);

  // Dev simulation
  const handleSimulatePayment = async () => {
    if (!orderId || simulating || isSuccess) return;
    try {
      setSimulating(true);
      const res = await paymentService.verifyKhqr(orderId, true);
      if (res.verified || res.paymentStatus === 'SUCCESS') {
        handleSuccess();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to simulate payment');
    } finally {
      setSimulating(false);
    }
  };

  // Init when modal opens
  useEffect(() => {
    if (isOpen && orderId) {
      setIsSuccess(false);
      fetchKhqr();
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isOpen, orderId, fetchKhqr]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || loading || isSuccess || isExpired) return;

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isOpen, loading, isSuccess, isExpired]);

  // Auto-polling interval (every 2.5 seconds)
  useEffect(() => {
    if (!isOpen || loading || isSuccess || isExpired) return;

    pollIntervalRef.current = setInterval(() => {
      checkPaymentStatus();
    }, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, loading, isSuccess, isExpired, checkPaymentStatus]);

  if (!isOpen) return null;

  const totalAmountUsd = khqrData?.amount ?? initialAmount ?? 0;
  const totalAmountKhr = Math.round(totalAmountUsd * EXCHANGE_RATE_KHR);
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedCountdown = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const copyKhqrString = () => {
    if (!khqrData?.qrCode) return;
    navigator.clipboard.writeText(khqrData.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQrImage = () => {
    if (!khqrData?.qrImage) return;
    const link = document.createElement('a');
    link.href = khqrData.qrImage;
    link.download = `Cravery-KHQR-Order-${orderId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    if (isSuccess) {
      if (onPaymentSuccess) onPaymentSuccess();
      else router.push(`/orders/${orderId}`);
    } else {
      if (confirm(t.checkoutPage.khqrModal.closePrompt)) {
        onClose();
        router.push(`/orders/${orderId}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[94vh] flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Top Bakong KHQR Header Banner */}
        <div className="bg-gradient-to-r from-[#E12326] via-[#D11E21] to-[#B31417] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs">
              <span className="text-[#E12326] font-black tracking-tighter text-sm font-sans">
                KHQR
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-widest uppercase text-white/90">
                  Bakong
                </span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  NBC Official
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">
                {t.checkoutPage.khqrModal.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Success State */}
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg ring-8 ring-emerald-50 dark:ring-emerald-900/30">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {t.checkoutPage.khqrModal.successTitle}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  {t.checkoutPage.khqrModal.successDesc}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">{t.orderTrackingPage.orderNumber}:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">#{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">${totalAmountUsd.toFixed(2)} USD</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 animate-pulse">
                Redirecting to your order tracking screen...
              </p>
            </div>
          ) : loading ? (
            /* Loading State */
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 border-3 border-[#E12326] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Generating dynamic Bakong KHQR...
              </p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 max-w-xs mx-auto">
                {error}
              </p>
              <button
                onClick={fetchKhqr}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          ) : (
            /* Main KHQR Display */
            <>
              {/* Dual Amount Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center space-y-1">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {t.checkoutPage.khqrModal.amountUsd}
                </p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-2xl font-black text-[#E12326]">
                    ${totalAmountUsd.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-slate-400">USD</span>
                </div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  ≈ ៛{totalAmountKhr.toLocaleString()} KHR
                </p>
              </div>

              {/* QR Image Box */}
              <div className="relative mx-auto w-64 h-64 p-3 rounded-2xl bg-white shadow-md border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                {isExpired ? (
                  <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-4 text-center space-y-2 z-10">
                    <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {t.checkoutPage.khqrModal.expired}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {t.checkoutPage.khqrModal.expiredDesc}
                    </p>
                    <button
                      onClick={fetchKhqr}
                      className="mt-2 px-3.5 py-1.5 rounded-xl bg-[#E12326] hover:bg-[#C91C1F] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {t.checkoutPage.khqrModal.regenerate}
                    </button>
                  </div>
                ) : null}

                {khqrData?.qrImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={khqrData.qrImage}
                    alt="Bakong KHQR Code"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <QrCode className="w-24 h-24 text-slate-300" />
                )}
              </div>

              {/* Countdown & Polling Indicator */}
              <div className="flex items-center justify-between text-xs px-2">
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {t.checkoutPage.khqrModal.expiresIn}:{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      {formattedCountdown}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-[#E12326] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#E12326] animate-ping" />
                  <span>{isVerifying ? t.checkoutPage.khqrModal.verifying : t.checkoutPage.khqrModal.waitingPayment}</span>
                </div>
              </div>

              {/* Supported Banking Apps list */}
              <div className="pt-1 text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  {t.checkoutPage.khqrModal.supportedApps}
                </p>
              </div>

              {/* Quick Actions (Copy / Download) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={copyKhqrString}
                  className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? t.checkoutPage.khqrModal.copied : t.checkoutPage.khqrModal.copyKhqr}
                </button>

                <button
                  onClick={downloadQrImage}
                  className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t.checkoutPage.khqrModal.saveQr}
                </button>
              </div>

              {/* Development Simulation Button */}
              {(khqrData?.simulated || process.env.NODE_ENV !== 'production') && (
                <div className="pt-2">
                  <button
                    onClick={handleSimulatePayment}
                    disabled={simulating || isExpired}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-300/80 dark:border-amber-700/60 hover:from-amber-500/20 hover:to-orange-500/20 text-[#FF5A1F] dark:text-orange-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    {simulating ? 'Simulating verification...' : t.checkoutPage.khqrModal.simulateSuccess}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-1">
                    {t.checkoutPage.khqrModal.simulatedNotice}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            Order #{orderId} • {t.checkoutPage.khqrModal.merchantName}
          </span>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            {t.checkoutPage.khqrModal.viewOrder}
          </button>
        </div>
      </div>
    </div>
  );
}
