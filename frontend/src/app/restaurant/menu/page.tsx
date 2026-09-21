'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Utensils, DollarSign, Clock, Check, X } from 'lucide-react';
import { foodService } from '@/services/foodService';
import { restaurantService } from '@/services/restaurantService';
import { FoodItem, MenuCategory, Restaurant } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Pagination } from '@/components/ui/Pagination';

export default function RestaurantMenuPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Add Item Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const myRest = await restaurantService.getMyRestaurant();
        setRestaurant(myRest);
        const [cats, itemsPage] = await Promise.all([
          restaurantService.getMenuCategories(myRest.id),
          foodService.getOwnerFoods({ page, size: 20 }),
        ]);
        setCategories(cats);
        setFoods(itemsPage.content || []);
        setTotalPages(itemsPage.totalPages || 0);
        setTotalElements(itemsPage.totalElements || 0);
        if (cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page]);

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return;
    setSubmitting(true);
    try {
      const created = await foodService.createFoodItem({
        name,
        description: description.trim() || undefined,
        price: parseFloat(price),
        preparationTime: parseInt(prepTime) || 15,
        imageUrl: imageUrl.trim() || undefined,
        menuCategoryId: Number(categoryId),
        available: true,
      });
      setFoods([...foods, created]);
      setModalOpen(false);
      setName('');
      setDescription('');
      setPrice('');
      setImageUrl('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create food item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (food: FoodItem) => {
    try {
      const updated = await foodService.updateFoodItem(food.id, {
        available: !food.available,
      });
      setFoods(foods.map((f) => (f.id === food.id ? updated : f)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFood = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await foodService.deleteFoodItem(id);
      setFoods(foods.filter((f) => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <Loading fullPage message="Loading menu items..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Menu & Food Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your dishes, prices, preparation times, and instant stock availability
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="rounded-xl text-xs gap-1.5 font-bold self-start"
        >
          <Plus className="w-4 h-4" /> Add Food Item
        </Button>
      </div>

      {/* Food Items Table / Cards */}
      <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
        {foods.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No dishes added yet. Click &quot;Add Food Item&quot; to begin.
          </div>
        ) : (
          foods.map((food) => (
            <div key={food.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={
                      food.imageUrl ||
                      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80'
                    }
                    alt={food.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{food.name}</h3>
                    <Badge variant="primary" size="sm">
                      {food.menuCategoryName || 'Dish'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {food.description || 'No description provided'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="font-black text-slate-900">${food.price.toFixed(2)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {food.preparationTime} mins
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Toggle & Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleAvailability(food)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    food.available
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {food.available ? 'In Stock' : 'Sold Out'}
                </button>

                <button
                  onClick={() => handleDeleteFood(food.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Delete dish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
        <Pagination
          currentPage={page + 1}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={20}
          onPageChange={(p) => setPage(p - 1)}
          className="px-6 py-4 bg-slate-50/50"
        />
      </div>

      {/* Add Food Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Food Item"
        description="Add a new dish to your restaurant menu"
      >
        <form onSubmit={handleCreateFood} className="space-y-4 pt-2">
          <Input
            label="Dish Name"
            placeholder="e.g. Classic Cheese Burger"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              placeholder="7.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Prep Time (mins)"
              type="number"
              placeholder="15"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Menu Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#FF5A1F]"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Photo Image URL (Optional)"
            placeholder="https://images.unsplash.com/photo-..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Ingredients, flavors, allergen notes..."
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
              Add Food Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
