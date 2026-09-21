'use client';

import React, { useEffect, useState } from 'react';
import { Users, Shield, ShieldAlert, ShieldCheck, UserX, UserCheck, Search, Filter } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { Role, User, UserStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Pagination } from '@/components/ui/Pagination';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [selectedRole]);

  useEffect(() => {
    loadUsers();
  }, [selectedRole, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({ role: selectedRole, page, size: 20 });
      setUsers(res.content || []);
      setTotalPages(res.totalPages || 0);
      setTotalElements(res.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change ${user.name}'s account status to ${nextStatus}?`)) {
      return;
    }
    setUpdatingId(user.id);
    try {
      const updated = await adminService.updateUserStatus(user.id, nextStatus);
      setUsers(users.map((u) => (u.id === user.id ? updated : u)));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phoneNumber && u.phoneNumber.includes(term))
    );
  });

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
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Users className="w-6 h-6 text-purple-600" />
          User Management & Security Access
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect registered platform users, monitor database-backed roles, and suspend malicious accounts
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-1.5">
          {roles.map((r) => (
            <button
              key={r.label}
              onClick={() => setSelectedRole(r.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === r.value
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
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
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs w-full sm:w-64 focus:bg-white focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <Loading fullPage message="Loading platform users..." />
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5">Contact</th>
                  <th className="py-3 px-5">Database Role</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Registered</th>
                  <th className="py-3 px-5 text-right">Security Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-400">ID #{u.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <p className="font-medium text-slate-800">{u.email}</p>
                      <p className="text-[10px] text-slate-400">{u.phoneNumber || 'No phone'}</p>
                    </td>

                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'RESTAURANT_OWNER'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.role === 'DRIVER'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-[#FF5A1F]'
                        }`}
                      >
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      {u.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
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
                          onClick={() => handleToggleStatus(u)}
                          disabled={updatingId === u.id}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
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
            className="px-6 py-4 bg-slate-50/50"
          />
        </div>
      )}
    </div>
  );
}
