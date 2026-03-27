import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';  
import { FiUser, FiShoppingBag, FiCreditCard, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({ name: '', email: '' });
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data.user);
      setAddresses(response.data.addresses);
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put('/auth/profile', user);
      if (response.data.requireEmailVerification) {
        toast.info(response.data.message);
        setShowEmailOtpModal(true);
      } else {
        toast.success('Profile updated successfully');
        setUser(response.data.user);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/profile/verify-email', { otp: emailOtp });
      toast.success(response.data.message);
      setShowEmailOtpModal(false);
      setEmailOtp('');
      setUser(response.data.user);
    } catch (err) {
      console.error('Error verifying email OTP:', err);
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await api.patch(`/auth/address/${editingAddress._id}`, addressForm);
        toast.success('Address updated');
      } else {
        await api.post('/auth/address', addressForm);
        toast.success('Address added');
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      fetchProfile();
    } catch (err) {
      console.error('Error saving address:', err);
      toast.error('Failed to save address');
    }
  };

  const deleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/auth/address/${id}`);
      toast.success('Address deleted');
      fetchProfile();
    } catch (err) {
      console.error('Error deleting address:', err);
      toast.error('Delete failed');
    }
  };

  const startEditAddress = (addr) => {
    setEditingAddress(addr);
    setAddressForm({
      name: addr.name,
      phoneNumber: addr.phoneNumber,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault
    });
    setShowAddressForm(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FDF6EC] py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-1/4 bg-[#F5E6D3] rounded-[35px] p-8 h-fit lg:h-[700px] shadow-sm border border-[#D4A96A]/20">
          <div className="flex flex-col gap-15 mt-20">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full py-5 rounded-[25px] text-2xl font-black transition-all ${activeTab === 'profile' ? 'bg-[#6B3F1F] text-white shadow-xl scale-105' : 'bg-white text-[#6B3F1F] hover:bg-[#FDF6EC]'}`}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`w-full py-5 rounded-[25px] text-2xl font-black transition-all ${activeTab === 'orders' ? 'bg-[#6B3F1F] text-white shadow-xl scale-105' : 'bg-white text-[#6B3F1F] hover:bg-[#FDF6EC]'}`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('wallet')}
              className={`w-full py-5 rounded-[25px] text-2xl font-black transition-all ${activeTab === 'wallet' ? 'bg-[#6B3F1F] text-white shadow-xl scale-105' : 'bg-white text-[#6B3F1F] hover:bg-[#FDF6EC]'}`}
            >
              Wallet
            </button>
            <Link to="/">
            <button 
              className={`w-full py-5 rounded-[25px] text-2xl font-black bg-[#D4A96A] hover:bg-[#A0522D] text-[#6B3F1F] hover:text-white transition-all active:scale-95`}
            >
              Dashboard
            </button>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full lg:w-3/4 bg-white rounded-[35px] p-10 min-h-[600px] shadow-sm border border-[#D4A96A]/10">
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl font-extrabold text-center mb-10 text-gray-800 tracking-tight">Account Info</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xl font-bold text-[#6B3F1F] ml-2">Name</label>
                  <input 
                    type="text" 
                    value={user.name}
                    onChange={(e) => setUser({...user, name: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-[#FDF6EC] border-none text-[#6B3F1F] text-lg shadow-sm focus:ring-4 focus:ring-[#D4A96A]/20 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xl font-bold text-[#6B3F1F] ml-2">Email</label>
                  <input 
                    type="email" 
                    value={user.email}
                    onChange={(e) => setUser({...user, email: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-[#FDF6EC] border-none text-[#6B3F1F] text-lg shadow-sm focus:ring-4 focus:ring-[#D4A96A]/20 outline-none transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 mt-4 bg-[#6B3F1F] text-white text-2xl font-black rounded-2xl shadow-xl hover:bg-[#A0522D] transition-all active:scale-95"
                >
                  Save Profile
                </button>
              </form>

              {/* Address Section */}
              <div className="mt-12">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-black text-[#6B3F1F] tracking-tight">Saved Addresses</h3>
                  <button 
                    onClick={() => { setShowAddressForm(true); setEditingAddress(null); setAddressForm({name:'',phoneNumber:'',street:'',city:'',state:'',pincode:'',isDefault:false})}}
                    className="bg-[#A0522D] text-white px-8 py-3 rounded-2xl font-black text-xl shadow-lg hover:bg-[#6B3F1F] transition-all active:scale-95"
                  >
                    + Add New
                  </button>
                </div>

                <div className="space-y-6">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="bg-[#FDF6EC] rounded-[30px] p-8 shadow-sm border border-[#D4A96A]/10">
                      <div className="flex flex-col gap-2 mb-6">
                        <div className="flex justify-between items-start">
                           <h4 className="text-2xl font-black text-[#6B3F1F]">{addr.name}</h4>
                           {addr.isDefault && <span className="text-[10px] font-black bg-[#D4A96A] text-[#6B3F1F] px-3 py-1 rounded-full uppercase tracking-tighter">Default</span>}
                        </div>
                        <p className="text-lg text-[#A0522D] font-bold">{addr.phoneNumber}</p>
                        <p className="text-lg text-gray-600 leading-relaxed italic">
                          {addr.street}, {addr.city},<br/>
                          {addr.state} - {addr.pincode}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => startEditAddress(addr)}
                          className="flex-1 py-3 bg-[#6B3F1F] text-white font-black rounded-2xl shadow-md hover:bg-[#A0522D] transition-all text-lg"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteAddress(addr._id)}
                          className="flex-1 py-3 bg-red-50 text-red-500 font-black rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all text-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {addresses.length === 0 && (
                    <p className="text-center text-gray-500 py-10 font-medium">No addresses saved yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FiShoppingBag className="text-8xl text-[#D4A96A] mb-6 opacity-40" />
              <h2 className="text-3xl font-black text-[#6B3F1F]">Your Orders History</h2>
              <p className="text-[#A0522D] mt-2 font-medium">Start shopping to see your purchase history!</p>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FiCreditCard className="text-8xl text-[#D4A96A] mb-6 opacity-40" />
              <h2 className="text-3xl font-black text-[#6B3F1F]">Wallet Feature Coming Soon</h2>
              <p className="text-[#A0522D] mt-2 font-medium">Manage your refunds and credits in one place.</p>
            </div>
          )}
        </div>
      </div>

      {/* Email Verification OTP Modal */}
      {showEmailOtpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-[35px] p-10 max-w-md w-full shadow-2xl">
            <h3 className="text-3xl font-extrabold mb-4 text-gray-800 text-center">
              Verify New Email
            </h3>
            <p className="text-center text-gray-600 mb-8 font-medium">
              We've sent a 6-digit OTP to your new email address. Please enter it below to confirm the change.
            </p>
            <form onSubmit={handleVerifyEmailOtp} className="space-y-6">
              <div className="space-y-2">
                <input 
                  type="text" 
                  maxLength={6}
                  required
                  placeholder="OTP"
                  value={emailOtp}
                  onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-6 py-4 rounded-2xl bg-[#FDF6EC] border-none text-[#6B3F1F] text-center text-2xl tracking-[0.5em] shadow-inner focus:ring-4 focus:ring-[#D4A96A]/20 outline-none transition-all font-black"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 py-4 bg-[#6B3F1F] text-white font-black rounded-2xl shadow-xl hover:bg-[#A0522D] transition-all">
                  Verify OTP
                </button>
                <button type="button" onClick={() => { setShowEmailOtpModal(false); setEmailOtp(''); fetchProfile(); }} className="flex-1 py-4 bg-[#F5E6D3] text-[#6B3F1F] font-black rounded-2xl border border-[#D4A96A]/20 hover:bg-[#D4A96A] transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-[35px] p-10 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-3xl font-extrabold mb-8 text-gray-800">
              {editingAddress ? 'Edit Address' : 'New Address'}
            </h3>
            <form onSubmit={handleAddressSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600 ml-1 uppercase tracking-wider">Contact Name</label>
                  <input required value={addressForm.name} onChange={e=>setAddressForm({...addressForm, name: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-gray-100 border-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600 ml-1 uppercase tracking-wider">Phone</label>
                  <input required value={addressForm.phoneNumber} onChange={e=>setAddressForm({...addressForm, phoneNumber: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-gray-100 border-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-600 ml-1 uppercase tracking-wider">Street / Locality</label>
                <textarea required rows={2} value={addressForm.street} onChange={e=>setAddressForm({...addressForm, street: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-gray-100 border-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600 ml-1 uppercase tracking-wider">City</label>
                  <input required value={addressForm.city} onChange={e=>setAddressForm({...addressForm, city: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-gray-100 border-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600 ml-1 uppercase tracking-wider">State</label>
                  <input required value={addressForm.state} onChange={e=>setAddressForm({...addressForm, state: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-gray-100 border-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-600 ml-1 uppercase tracking-wider">Pincode</label>
                <input required value={addressForm.pincode} onChange={e=>setAddressForm({...addressForm, pincode: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-gray-100 border-none" />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="submit" className="flex-1 py-4 bg-[#6B3F1F] text-white font-black rounded-2xl shadow-xl hover:bg-[#A0522D] transition-all">
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
                <button type="button" onClick={()=>setShowAddressForm(false)} className="flex-1 py-4 bg-[#F5E6D3] text-[#6B3F1F] font-black rounded-2xl border border-[#D4A96A]/20 hover:bg-[#D4A96A] transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;