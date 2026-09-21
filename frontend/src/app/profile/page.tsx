'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Plus, Trash2, CheckCircle2, Phone, Mail, Shield } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { addressService } from '@/services/addressService';
import { Address } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Address Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [label, setLabel] = useState('Home');
  const [recipient, setRecipient] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('Phnom Penh');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated) {
      loadAddresses();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const list = await addressService.getAddresses();
      setAddresses(list);
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
        latitude: 11.5564,
        longitude: 104.9282,
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
    if (!confirm('Are you sure you want to remove this address?')) return;
    try {
      await addressService.deleteAddress(id);
      setAddresses(addresses.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || (loading && !user)) {
    return <Loading fullPage message="Loading profile..." />;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Account & Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal profile and delivery destination address book
        </p>
      </div>

      {/* User Info Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF1EB] text-[#FF5A1F] flex items-center justify-center font-black text-2xl">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {user?.email}
                </span>
                {user?.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {user?.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Badge variant="primary" size="md">
            {user?.role.replace(/_/g, ' ')}
          </Badge>
        </div>
      </div>

      {/* Address Book Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#FF5A1F]" /> Saved Delivery Addresses
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Addresses available for 1-click checkout
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
            <Plus className="w-3.5 h-3.5" /> Add Address
          </Button>
        </div>

        {addresses.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-500">
            No saved addresses. Add your home or office address to start ordering.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-900 hover:underline cursor-pointer"
                      >
                        Make Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-700">
                  {addr.recipientName} ({addr.phoneNumber})
                </p>
                <p className="text-xs text-slate-500">
                  {addr.addressLine}, {addr.city}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Delivery Address"
        description="Enter recipient and street coordinates"
      >
        <form onSubmit={handleCreateAddress} className="space-y-4 pt-2">
          <Input
            label="Label"
            placeholder="Home, Office, Apartment..."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
          <Input
            label="Recipient Name"
            placeholder="Recipient full name"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            placeholder="+855 12 345 678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <Input
            label="Street Address / Building"
            placeholder="House #24, Street 302"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            required
          />
          <Input
            label="City"
            placeholder="Phnom Penh"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
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
              isLoading={saving}
            >
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
