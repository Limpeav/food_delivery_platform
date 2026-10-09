'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Phone,
  Mail,
  Shield,
  ShoppingBag,
  ArrowRight,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Receipt,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useTranslation } from '@/stores/languageStore';
import { addressService } from '@/services/addressService';
import { orderService } from '@/services/orderService';
import { Address, Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { LocationPicker, LocationPickerValue } from '@/components/ui/LocationPicker';

export default function AccountDashboardPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Address Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [label, setLabel] = useState('Home');
  const [recipient, setRecipient] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Phnom Penh');
  const [location, setLocation] = useState<LocationPickerValue>({
    lat: 11.5564,
    lng: 104.9282,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
      } else if (user.role !== 'CUSTOMER') {
        // Enforce customer portal route protection
        if (user.role === 'ADMIN') router.push('/admin/dashboard');
        else if (user.role === 'RESTAURANT_OWNER') router.push('/restaurant/dashboard');
        else if (user.role === 'DRIVER') router.push('/driver/dashboard');
      } else {
        loadData();
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [addrList, orderData] = await Promise.allSettled([
        addressService.getAddresses(),
        orderService.getMyOrders({ page: 0, size: 3 }),
      ]);

      if (addrList.status === 'fulfilled') setAddresses(addrList.value);
      if (orderData.status === 'fulfilled') setRecentOrders(orderData.value.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await addressService.createAddress({
        label,
        recipientName: recipient,
        phoneNumber: phone,
        addressLine,
        city,
        latitude: location.lat,
        longitude: location.lng,
        isDefault: addresses.length === 0,
      });
      setAddresses([...addresses, created]);
      setModalOpen(false);
      setAddressLine('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const updated = await addressService.setDefault(id);
      setAddresses(addresses.map((a) => (a.id === id ? updated : { ...a, isDefault: false })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm(t.accountPage.confirmRemoveAddress)) return;
    try {
      await addressService.deleteAddress(id);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || (loading && !user)) {
    return <Loading fullPage message={t.accountPage.loadingAccount} />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF5A1F] uppercase tracking-wider">
            {t.accountPage.customerDashboard}
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 mt-1">
            {t.accountPage.welcome}, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.accountPage.subtitle}
          </p>
        </div>

        <Link
          href="/restaurants"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#FF5A1F] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#FF5A1F]/30 hover:bg-[#E04812] transition-all self-start sm:self-auto"
        >
          <ShoppingBag className="w-4 h-4" />
          {t.accountPage.orderFoodNow}
        </Link>
      </div>

      {/* Account Info Card */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-[#FF5A1F] flex items-center justify-center font-black text-2xl shadow-xs">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user?.name}</h2>
                <Badge variant="success" size="sm">
                  {user?.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}
                </span>
                {user?.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {user?.phoneNumber}
                  </span>
                )}
                <span className="flex items-center gap-1 text-slate-400">
                  <Shield className="w-3.5 h-3.5" /> {t.accountPage.role}: {user?.role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/account/payments"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-400" />
              {t.accountPage.paymentHistory}
            </Link>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              {t.accountPage.resetPassword}
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Saved Addresses & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Addresses (2 Cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#FF5A1F]" /> {t.accountPage.savedAddresses}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t.accountPage.savedAddressesSubtitle}
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setRecipient(user?.name || '');
                setPhone(user?.phoneNumber || '');
                setModalOpen(true);
              }}
              className="rounded-xl text-xs gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> {t.accountPage.addNewAddress}
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
              {t.accountPage.noAddresses}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-2 relative hover:border-orange-200 dark:hover:border-orange-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-850 px-1.5 py-0.5 text-[10px] font-bold">
                          {t.accountPage.defaultBadge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr.id)}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:underline cursor-pointer"
                        >
                          {t.accountPage.setDefault}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        aria-label={t.accountPage.deleteAddress}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {addr.recipientName} ({addr.phoneNumber})
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {addr.addressLine}, {addr.city}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Recent Orders (1 Col) */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" /> {t.accountPage.recentOrders}
            </h3>
            <Link
              href="/orders"
              className="text-xs font-bold text-[#FF5A1F] hover:underline flex items-center gap-1"
            >
              {t.accountPage.allOrders} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
              {t.accountPage.noRecentOrders}
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 hover:border-orange-200 dark:hover:border-orange-900 transition-all"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{t.accountPage.orderNumber}{order.id}</span>
                    <Badge variant="primary" size="sm">
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                    {order.restaurantName}
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 text-xs">
                    <span className="text-slate-400 text-[10px]">
                      {new Date(order.createdAt).toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US')}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">${order.totalAmount.toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t.accountPage.addressModalTitle}
        description={t.accountPage.addressModalDesc}
      >
        <form onSubmit={handleCreateAddress} className="space-y-4 pt-2">
          {/* Map Location Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              {t.accountPage.pinLocationTitle}
            </label>
            <LocationPicker
              value={location}
              onChange={(loc) => {
                setLocation(loc);
                if (loc.address && !addressLine) {
                  setAddressLine(loc.address);
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t.common.status ? 'Label' : 'Label'}
              placeholder={t.accountPage.labelPrompt}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
            <Input
              label={t.accountPage.labelCity}
              placeholder={t.accountPage.cityPlaceholder}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label={t.accountPage.labelRecipientName}
              placeholder={t.accountPage.recipientPlaceholder}
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
            <Input
              label={t.accountPage.labelPhoneNumber}
              placeholder={t.accountPage.phonePlaceholder}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <Input
            label={t.accountPage.streetAddress}
            placeholder={t.accountPage.streetAddressPlaceholder}
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            required
          />
          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saving}
            >
              {saving ? t.accountPage.savingAddress : t.accountPage.saveAddress}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
