'use client';

import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, Calendar, Sparkles } from 'lucide-react';
import { promotionService } from '@/services/promotionService';
import { Promotion } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';

export default function RestaurantPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountPercent, setDiscountPercent] = useState('15');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    try {
      setLoading(true);
      const res = await promotionService.getMyPromotions();
      setPromotions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setSubmitting(true);
    try {
      const created = await promotionService.createPromotion({
        title,
        description: description.trim() || undefined,
        discountPercentage: parseFloat(discountPercent) || 10,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });
      setPromotions([...promotions, created]);
      setModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create promo');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading fullPage message="Loading promotions..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Store Deals & Promotions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create limited-time percentage discounts to boost store conversion
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="rounded-xl text-xs gap-1.5 font-bold self-start"
        >
          <Plus className="w-4 h-4" /> Create Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            No active store deals. Create one to drive higher order volumes!
          </div>
        ) : (
          promotions.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="primary" size="sm">
                    {p.discountValue}% OFF
                  </Badge>
                  <span className="text-[10px] text-slate-400">Active</span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{p.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{p.description}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> 2 Weeks Campaign
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Launch Store Promotion"
        description="Add a special discount offer for your customers"
      >
        <form onSubmit={handleCreatePromo} className="space-y-4 pt-2">
          <Input
            label="Promotion Title"
            placeholder="e.g. Weekend Flash Sale"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label="Discount Percentage (%)"
            type="number"
            placeholder="15"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 15% off all flame burgers this weekend"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F]"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submitting}
            >
              Launch Promotion
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
