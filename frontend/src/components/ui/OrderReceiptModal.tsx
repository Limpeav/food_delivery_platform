'use client';

import React, { useRef } from 'react';
import { Printer, Download, X, Store, MapPin, Receipt, CheckCircle2, QrCode } from 'lucide-react';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';

interface OrderReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

export const OrderReceiptModal: React.FC<OrderReceiptModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt,
          #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Controls Header */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
            <Receipt className="w-4 h-4 text-[#FF5A1F]" />
            <span>Tax Invoice & Order Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="rounded-xl text-xs gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#FF5A1F]" /> Print / Save PDF
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" ref={receiptRef} className="p-6 sm:p-8 space-y-6 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900">
          {/* Brand & Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-200 dark:border-slate-700 space-y-1">
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-[#FF5A1F]">Cravery</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                Express
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
              Official Food Delivery Tax Receipt
            </p>
            <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 pt-1">
              INVOICE #{order.id.toString().padStart(6, '0')}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{formattedDate}</p>
          </div>

          {/* Restaurant & Customer Info */}
          <div className="grid grid-cols-2 gap-4 text-xs pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Merchant</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{order.restaurantName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{order.restaurantAddress}</p>
              {order.restaurantPhone && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{order.restaurantPhone}</p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Customer Delivery</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{order.customerName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{order.deliveryAddress}</p>
              {order.customerPhone && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{order.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Order Items</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-left">
                  <th className="pb-1.5 font-semibold">Item</th>
                  <th className="pb-1.5 font-semibold text-center w-12">Qty</th>
                  <th className="pb-1.5 font-semibold text-right w-16">Price</th>
                  <th className="pb-1.5 font-semibold text-right w-16">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {order.items.map((item) => (
                  <tr key={item.id} className="py-2">
                    <td className="py-1.5 pr-2 font-medium text-slate-800 dark:text-slate-200">
                      <div>{item.foodName}</div>
                      {item.selectedOptions && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{item.selectedOptions}</div>
                      )}
                    </td>
                    <td className="py-1.5 text-center text-slate-600 dark:text-slate-400 font-medium">{item.quantity}</td>
                    <td className="py-1.5 text-right text-slate-600 dark:text-slate-400 font-mono">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-1.5 text-right font-bold text-slate-800 dark:text-slate-200 font-mono">
                      ${item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="pt-3 border-t border-dashed border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Items Subtotal</span>
              <span className="font-mono font-medium">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Delivery Fee</span>
              <span className="font-mono font-medium">${order.deliveryFee.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Voucher Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                <span className="font-mono">-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-black text-slate-900 dark:text-white">
              <span>Total Paid</span>
              <span className="text-base text-[#FF5A1F] font-mono">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Details & Dispatch */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Payment Method:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{order.paymentMethod?.replace(/_/g, ' ') || 'Cash on Delivery'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Payment Status:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {order.paymentStatus || 'PAID'}
              </span>
            </div>
            {order.transactionReference && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Transaction Ref:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{order.transactionReference}</span>
              </div>
            )}
            {order.driverName && (
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Delivered By:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{order.driverName}</span>
              </div>
            )}
          </div>

          {/* Footer Barcode Simulation */}
          <div className="pt-2 text-center space-y-2">
            <div className="flex justify-center items-center gap-1.5 opacity-80">
              {Array.from({ length: 36 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-800 dark:bg-slate-300"
                  style={{
                    width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1.5px' : '1px',
                    height: '28px',
                  }}
                />
              ))}
            </div>
            <p className="text-[10px] font-mono tracking-widest text-slate-400">
              *CRV-{order.id.toString().padStart(6, '0')}-TX*
            </p>
            <p className="text-[10px] text-slate-400">
              Thank you for ordering with Cravery! Questions? Support at help@cravery.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
