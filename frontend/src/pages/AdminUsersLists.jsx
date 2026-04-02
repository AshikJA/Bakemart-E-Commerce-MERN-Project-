import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiSearch, FiUsers, FiShield, FiSlash, FiX, FiMail, FiCalendar } from 'react-icons/fi';

export default function AdminUsersLists() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Ban/Unban confirmation modal
  const [banModal, setBanModal] = useState({ isOpen: false, user: null, reason: '' });


  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || res.data);
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const openBanModal = (user) => {
    setBanModal({ isOpen: true, user, reason: '' });
  };

  const confirmToggleBan = async () => {
    try {
      await api.patch(`/admin/toggle-user-ban/${banModal.user._id}`, { reason: banModal.reason });
      toast.success(`User ${banModal.user.status === 'active' ? 'banned' : 'unbanned'} successfully!`);
      setBanModal({ isOpen: false, user: null, reason: '' });
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = users.filter(u => u.status === 'active').length;
  const bannedCount = users.filter(u => u.status === 'banned').length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link to="/admin/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-800 font-medium mb-3 transition-colors text-sm">
              <FiArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <FiUsers className="text-blue-500" /> User Management
            </h1>
            <p className="text-slate-500 text-sm mt-1">{users.length} total users</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-2 text-center">
                <div className="text-xl font-black text-green-600">{activeCount}</div>
                <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active</div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-2 text-center">
                <div className="text-xl font-black text-red-500">{bannedCount}</div>
                <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Banned</div>
              </div>
            </div>
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-5 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-72 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-50/80 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-5 font-bold">User</th>
                  <th className="px-6 py-5 font-bold">Email</th>
                  <th className="px-6 py-5 font-bold text-center">Status</th>
                  <th className="px-6 py-5 font-bold text-center">Verified</th>
                  <th className="px-6 py-5 font-bold text-right">Wallet</th>
                  <th className="px-6 py-5 font-bold">Joined</th>
                  <th className="px-6 py-5 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-medium">Loading users…</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-16 text-center text-slate-400 font-medium">No users found.</td></tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user._id} className={`hover:bg-slate-50/50 transition-colors ${user.status === 'banned' ? 'bg-red-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm ${user.status === 'banned' ? 'bg-red-400' : 'bg-blue-500'}`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800">{user.name}</h3>
                            {user.status === 'banned' && user.banReason && (
                              <p className="text-[10px] text-red-400 font-medium mt-0.5">Reason: {user.banReason}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 text-slate-600">
                          <FiMail size={14} className="text-slate-400" /> {user.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${user.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {user.status === 'active' ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${user.isEmailVerified ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'}`}>
                          {user.isEmailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-800">₹{user.walletBalance || 0}</td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 text-slate-500 text-xs">
                          <FiCalendar size={13} /> {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openBanModal(user)}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            user.status === 'active'
                              ? 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                              : 'bg-green-50 text-green-600 hover:bg-green-500 hover:text-white'
                          }`}
                        >
                          {user.status === 'active' ? <><FiSlash size={14} /> Ban</> : <><FiShield size={14} /> Unban</>}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ban/Unban Confirmation Modal */}
      {banModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${banModal.user?.status === 'active' ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'}`}>
                {banModal.user?.status === 'active' ? <FiSlash size={32} /> : <FiShield size={32} />}
              </div>
              <h3 className="text-2xl font-black text-gray-900">
                {banModal.user?.status === 'active' ? 'Ban User?' : 'Unban User?'}
              </h3>
              <p className="text-gray-500 mt-2">
                {banModal.user?.status === 'active'
                  ? <>Banning <strong>{banModal.user?.name}</strong> will immediately restrict their access.</>
                  : <>Unbanning <strong>{banModal.user?.name}</strong> will restore their account access.</>
                }
              </p>
            </div>

            {banModal.user?.status === 'active' && (
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Reason for ban</label>
                <textarea
                  rows={3}
                  placeholder="Optional: provide a reason..."
                  value={banModal.reason}
                  onChange={(e) => setBanModal({...banModal, reason: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none text-sm resize-none"
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={confirmToggleBan}
                className={`flex-1 py-4 text-white font-black rounded-2xl shadow-xl transition-all ${
                  banModal.user?.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                Yes, {banModal.user?.status === 'active' ? 'Ban' : 'Unban'}
              </button>
              <button
                onClick={() => setBanModal({ isOpen: false, user: null, reason: '' })}
                className="px-8 py-4 bg-gray-100 text-gray-700 font-black rounded-2xl hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}