'use client';

import React, { useEffect, useState } from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { restaurantService } from '@/services/restaurantService';
import { adminService } from '@/services/adminService';
import { RestaurantCategory } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Loading } from '@/components/ui/Loading';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<RestaurantCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await restaurantService.getCategories();
      setCategories(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const created = await adminService.createCategory({
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        active: true,
      });
      setCategories([...categories, created]);
      setModalOpen(false);
      setName('');
      setDescription('');
      setImageUrl('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await adminService.deleteCategory(id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Loading fullPage message="Loading cuisines..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Restaurant Cuisine Categories
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize merchant discovery with cuisine tags and icons
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="rounded-xl text-xs gap-1.5 font-bold self-start"
        >
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div
            key={c.id}
            className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 overflow-hidden flex items-center justify-center shrink-0 text-xl font-bold text-[#FF5A1F]">
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                ) : (
                  '🍽️'
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {c.description || 'Cuisine tag'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDelete(c.id)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Cuisine Category"
        description="Create a new cuisine tag for restaurant grouping"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4 pt-2">
          <Input
            label="Category Name"
            placeholder="e.g. Seafood, Ramen, Bakery..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Image URL"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="Short description of the food style"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
