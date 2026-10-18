'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Utensils, DollarSign, Clock, Check, X, Layers, Sparkles } from 'lucide-react';
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

  // Modifier Groups Modal
  const [modifierModalOpen, setModifierModalOpen] = useState(false);
  const [targetFood, setTargetFood] = useState<FoodItem | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupRequired, setGroupRequired] = useState(false);
  const [optionsList, setOptionsList] = useState<{ name: string; additionalPrice: string }[]>([
    { name: '', additionalPrice: '0.00' },
  ]);
  const [savingModifiers, setSavingModifiers] = useState(false);

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

  const handleOpenModifierModal = (food: FoodItem) => {
    setTargetFood(food);
    setGroupName('');
    setGroupRequired(false);
    setOptionsList([
      { name: '', additionalPrice: '0.00' },
      { name: '', additionalPrice: '0.00' },
    ]);
    setModifierModalOpen(true);
  };

  const handleSaveModifierGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFood || !groupName.trim()) return;

    const validOptions = optionsList.filter((o) => o.name.trim().length > 0);
    if (validOptions.length === 0) {
      alert('Please provide at least one option item (e.g. Regular, Large)');
      return;
    }

    setSavingModifiers(true);
    try {
      await foodService.addOptionGroup(targetFood.id, {
        name: groupName.trim(),
        required: groupRequired,
        minSelect: groupRequired ? 1 : 0,
        maxSelect: 1,
        options: validOptions.map((o, idx) => ({
          name: o.name.trim(),
          additionalPrice: parseFloat(o.additionalPrice) || 0,
          isDefault: idx === 0,
        })),
      });

      const itemsPage = await foodService.getOwnerFoods({ page, size: 20 });
      setFoods(itemsPage.content || []);
      setModifierModalOpen(false);
      setTargetFood(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save option group');
    } finally {
      setSavingModifiers(false);
    }
  };

  const handleDeleteOptionGroup = async (foodId: number, groupId: number) => {
    if (!confirm('Are you sure you want to delete this option group?')) return;
    try {
      await foodService.deleteOptionGroup(foodId, groupId);
      const itemsPage = await foodService.getOwnerFoods({ page, size: 20 });
      setFoods(itemsPage.content || []);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete option group');
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
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Menu & Food Catalog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your dishes, prices, preparation times, and instant stock availability
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="rounded-xl text-xs gap-1.5 font-bold self-start shadow-xs"
        >
          <Plus className="w-4 h-4" /> Add Food Item
        </Button>
      </div>

      {/* Food Items Table / Cards */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
        {foods.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500">
            No dishes added yet. Click &quot;Add Food Item&quot; to begin.
          </div>
        ) : (
          foods.map((food) => (
            <div key={food.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
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
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{food.name}</h3>
                    <Badge variant="primary" size="sm">
                      {food.menuCategoryName || 'Dish'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {food.description || 'No description provided'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="font-black text-slate-900 dark:text-white">${food.price.toFixed(2)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" /> {food.preparationTime} mins
                    </span>
                  </div>

                  {/* Option Group Badges */}
                  {food.optionGroups && food.optionGroups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {food.optionGroups.map((g) => (
                        <span
                          key={g.id}
                          className="inline-flex items-center gap-1.5 text-[10px] bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F] border border-orange-200/80 dark:border-orange-900/60 font-semibold px-2 py-0.5 rounded-lg"
                        >
                          <span>{g.name} ({g.options?.length || 0})</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOptionGroup(food.id, g.id);
                            }}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete option group"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Toggle & Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenModifierModal(food)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-[#FF5A1F] hover:border-orange-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Configure modifiers and option groups"
                >
                  <Layers className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  <span className="hidden sm:inline">Modifiers</span>
                </button>

                <button
                  onClick={() => handleToggleAvailability(food)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    food.available
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {food.available ? 'In Stock' : 'Sold Out'}
                </button>

                <button
                  onClick={() => handleDeleteFood(food.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
          className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Menu Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#FF5A1F]"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Ingredients, flavors, allergen notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#FF5A1F]"
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

      {/* Add Modifier Group Modal */}
      <Modal
        isOpen={modifierModalOpen}
        onClose={() => setModifierModalOpen(false)}
        title={`Customize Modifiers — ${targetFood?.name || 'Dish'}`}
        description="Configure options like sizes, toppings, spice levels, or sauces"
      >
        <form onSubmit={handleSaveModifierGroup} className="space-y-4 pt-2">
          <Input
            label="Option Group Name"
            placeholder="e.g. Size, Crust Type, Add-on Toppings"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />

          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              id="groupRequired"
              checked={groupRequired}
              onChange={(e) => setGroupRequired(e.target.checked)}
              className="w-4 h-4 text-[#FF5A1F] rounded-md focus:ring-[#FF5A1F] cursor-pointer"
            />
            <label htmlFor="groupRequired" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Required selection (customer must pick at least 1 option)
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Option Items & Extra Prices
              </label>
              <button
                type="button"
                onClick={() =>
                  setOptionsList([...optionsList, { name: '', additionalPrice: '0.00' }])
                }
                className="text-xs font-bold text-[#FF5A1F] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {optionsList.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`e.g. ${idx === 0 ? 'Regular' : 'Large (14")'}`}
                    value={opt.name}
                    onChange={(e) => {
                      const updated = [...optionsList];
                      updated[idx].name = e.target.value;
                      setOptionsList(updated);
                    }}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F]"
                    required
                  />
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={opt.additionalPrice}
                      onChange={(e) => {
                        const updated = [...optionsList];
                        updated[idx].additionalPrice = e.target.value;
                        setOptionsList(updated);
                      }}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-6 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F]"
                      required
                    />
                  </div>
                  {optionsList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setOptionsList(optionsList.filter((_, i) => i !== idx))}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setModifierModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={savingModifiers}>
              Save Modifiers
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
