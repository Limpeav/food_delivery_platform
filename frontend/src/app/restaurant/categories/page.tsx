'use client';

import React, { useEffect, useState } from 'react';
import { Layers, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { restaurantService } from '@/services/restaurantService';
import { MenuCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';

export default function RestaurantCategoriesPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const list = await restaurantService.getOwnerMenuCategories();
      setCategories(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await restaurantService.createMenuCategory({
        name,
        description,
        displayOrder: categories.length + 1,
        active: true,
      });
      setCategories([...categories, created]);
      setModalOpen(false);
      setName('');
      setDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu category?')) return;
    try {
      await restaurantService.deleteMenuCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loading fullPage message="Loading menu categories..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-emerald-600" />
            Menu Categories
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize dishes into customer-facing sections (e.g. Appetizers, Mains, Drinks)
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="rounded-xl text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 bg-white space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No categories created yet</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create categories like &quot;Burgers&quot;, &quot;Sides&quot;, or &quot;Desserts&quot; to classify your food items.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="rounded-xl text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 mt-2"
          >
            <Plus className="w-3.5 h-3.5" /> Create First Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3 hover:border-emerald-200 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">
                  #{idx + 1}
                </span>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {cat.description || 'No description provided'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active Section
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Menu Category"
        description="Add a new classification group for your restaurant dishes"
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <Input
            label="Category Name"
            placeholder="e.g. Burgers, Artisan Pizzas, Desserts"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Short Description"
            placeholder="e.g. Fresh flame-grilled quarter pound patties"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="pt-3 flex justify-end gap-2">
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
              isLoading={saving}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
