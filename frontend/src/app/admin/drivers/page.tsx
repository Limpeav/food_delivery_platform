'use client';

import React, { useEffect, useState } from 'react';
import { Bike, Check, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Driver } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvedFilter, setApprovedFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [approvedFilter]);

  useEffect(() => {
    loadDrivers();
  }, [approvedFilter, page]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const isApproved =
        approvedFilter === 'ALL' ? undefined : approvedFilter === 'APPROVED';
      const res = await adminService.getDrivers({
        approved: isApproved,
        page,
        size: 20,
      });
      setDrivers(res.content);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, approve: boolean) => {
    setActionLoading(id);
    try {
      const updated = await adminService.approveDriver(id, approve);
      setDrivers(drivers.map((d) => (d.id === id ? updated : d)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update driver');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Delivery Fleet Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify rider vehicle documents, driving licenses, and grant dispatch authorization
          </p>
        </div>

        <select
          value={approvedFilter}
          onChange={(e) => setApprovedFilter(e.target.value as any)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-[#FF5A1F]"
        >
          <option value="ALL">All Drivers</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Authorized Drivers</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <Loading message="Loading drivers..." />
      ) : drivers.length === 0 ? (
        <EmptyState
          icon={<Bike className="w-8 h-8" />}
          title="No drivers found"
          description="There are currently no driver accounts matching this filter."
        />
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs divide-y divide-slate-100">
          {drivers.map((driver) => (
            <div key={driver.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shrink-0">
                  <Bike className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{driver.name}</h3>
                    <Badge variant={driver.approved ? 'success' : 'warning'} size="sm">
                      {driver.approved ? 'Authorized' : 'Pending Verification'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Phone: <span className="font-semibold text-slate-700">{driver.phoneNumber || 'N/A'}</span> • Vehicle: {driver.vehicleType} ({driver.vehicleNumber})
                  </p>
                  <p className="text-xs text-slate-400">
                    License Number: <span className="font-mono">{driver.licenseNumber}</span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {!driver.approved ? (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleApprove(driver.id, true)}
                    isLoading={actionLoading === driver.id}
                    className="rounded-xl text-xs gap-1 font-bold"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve Rider
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApprove(driver.id, false)}
                    isLoading={actionLoading === driver.id}
                    className="rounded-xl text-xs gap-1 text-rose-600 hover:bg-rose-50"
                  >
                    <X className="w-3.5 h-3.5" /> Revoke Authorization
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={20}
            onPageChange={(p) => setPage(p - 1)}
            className="px-6 py-4 bg-slate-50/50"
          />
        </div>
      )}
    </div>
  );
}
