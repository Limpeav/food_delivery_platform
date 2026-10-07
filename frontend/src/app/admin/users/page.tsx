'use client';

import React, { useEffect, useState } from 'react';
import { Users, Shield, ShieldAlert, ShieldCheck, UserX, UserCheck, Search, Filter } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Role, User, UserStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Pagination } from '@/components/ui/Pagination';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/components/ui/Toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Debounce the search input (400ms) so we don't fire on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 0 whenever filters change
  useEffect(() => {
    setPage(0);
  }, [selectedRole, debouncedSearch]);

  // Reload whenever page, role, or debounced search changes
  useEffect(() => {
    loadUsers();
  }, [selectedRole, debouncedSearch, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        role: selectedRole,
        search: debouncedSearch || undefined,
        page,
        size: 20,
      });
      setUsers(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err: any) {
      if (err?.response?.status === 401) return;
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [selectedUserForStatus, setSelectedUserForStatus] = useState<User | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const openStatusConfirm = (user: User) => {
    setSelectedUserForStatus(user);
    setStatusModalOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedUserForStatus) return;
    const nextStatus: UserStatus = selectedUserForStatus.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setUpdatingId(selectedUserForStatus.id);
    try {
      const updated = await adminService.updateUserStatus(selectedUserForStatus.id, nextStatus);
      setUsers((prev) => prev.map((u) => (u.id === selectedUserForStatus.id ? updated : u)));
      toast.success(
        nextStatus === 'SUSPENDED'
          ? `Account for ${selectedUserForStatus.name} has been suspended.`
          : `Account for ${selectedUserForStatus.name} has been reactivated.`
      );
      setStatusModalOpen(false);
      setSelectedUserForStatus(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user account status.');
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Server-side search — no client-side filtering needed
  const filtered = users;

  const roles: { label: string; value?: Role }[] = [
    { label: 'All Roles', value: undefined },
    { label: 'Customers', value: 'CUSTOMER' },
    { label: 'Restaurant Owners', value: 'RESTAURANT_OWNER' },
    { label: 'Drivers', value: 'DRIVER' },
    { label: 'Admins', value: 'ADMIN' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          User Management & Security Access
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Inspect registered platform users, monitor database-backed roles, and suspend malicious accounts
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {roles.map((r) => (
            <button
              key={r.label}
              onClick={() => setSelectedRole(r.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === r.value
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); }}
            className="pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 w-full sm:w-64 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <Loading fullPage message="Loading platform users..." />
      ) : (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5">Contact</th>
                  <th className="py-3 px-5">Database Role</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Registered</th>
                  <th className="py-3 px-5 text-right">Security Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-400">ID #{u.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{u.email}</p>
                      <p className="text-[10px] text-slate-400">{u.phoneNumber || 'No phone'}</p>
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                            : u.role === 'RESTAURANT_OWNER'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : u.role === 'DRIVER'
                            ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                            : 'bg-orange-100 dark:bg-orange-950/60 text-[#FF5A1F] dark:text-orange-300'
                        }`}
                      >
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      {u.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                          <ShieldAlert className="w-3.5 h-3.5" /> Suspended
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      {u.role !== 'ADMIN' && (
                        <button
                          type="button"
                          onClick={() => openStatusConfirm(u)}
                          disabled={updatingId === u.id}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60'
                              : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend Account' : 'Re-Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={20}
            onPageChange={(p) => setPage(p - 1)}
            className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800"
          />
        </div>
      )}

      {/* In-app Confirmation Modal for Suspend / Reactivate */}
      <ConfirmModal
        isOpen={statusModalOpen && !!selectedUserForStatus}
        onClose={() => {
          if (!updatingId) {
            setStatusModalOpen(false);
            setSelectedUserForStatus(null);
          }
        }}
        onConfirm={handleConfirmToggleStatus}
        isLoading={updatingId === selectedUserForStatus?.id}
        variant={selectedUserForStatus?.status === 'ACTIVE' ? 'danger' : 'success'}
        title={
          selectedUserForStatus?.status === 'ACTIVE'
            ? 'Suspend User Account?'
            : 'Re-Activate User Account?'
        }
        description={
          selectedUserForStatus && (
            <div className="space-y-3 mt-2 text-left">
              <p>
                {selectedUserForStatus.status === 'ACTIVE'
                  ? 'This user will immediately be barred from signing in and cannot place orders or use services.'
                  : 'This user will regain access to their account and can sign in normally.'}
              </p>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedUserForStatus.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">ID #{selectedUserForStatus.id}</span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  {selectedUserForStatus.email} • Role:{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {selectedUserForStatus.role}
                  </span>
                </div>
              </div>
            </div>
          )
        }
        confirmText={
          selectedUserForStatus?.status === 'ACTIVE'
            ? 'Yes, Suspend Account'
            : 'Yes, Re-Activate'
        }
        cancelText="Cancel"
      />
    </div>
  );
}
