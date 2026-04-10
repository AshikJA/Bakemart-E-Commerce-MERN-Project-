import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCart, clearCart } from '../../utils/cartUtils';
import { FiCheckCircle, FiPlus, FiArrowLeft, FiEdit2, FiX, FiPocket } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phoneNumber: '', street: '', city: '', state: '', pincode: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAddress, setEditAddress] = useState({ index: null, address: { name: '', phoneNumber: '', street: '', city: '', state: '', pincode: '' } });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [upiId, setUpiId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupons, setAppliedCoupons] = useState(location.state?.appliedCoupons || []);
  const [loading, setLoading] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const { walletBalance, refreshWallet } = useAuth();

  useEffect(() => {
    const fetchCartItems = async () => {
      const items = await getCart();
      if (items.length === 0) {
        toast.info('Your cart is empty. Please add items to checkout.');
        navigate('/');
      }
      setCartItems(items);
    };

    fetchCartItems();
    fetchAddresses();

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try { document.body.removeChild(script); } catch (e) {}
    };
  }, [navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = subtotal - discount;
  
  // Wallet Calculations
  const walletToUse = useWallet ? Math.min(walletBalance, totalAmount) : 0;
  const finalRemainingAmount = totalAmount - walletToUse;

  useEffect(() => {
    let totalDiscount = 0;
    appliedCoupons.forEach(coupon => {
      let dAmount = coupon.discountType === 'percentage' 
        ? (subtotal * coupon.discountValue) / 100 
        : coupon.discountValue;
      totalDiscount += dAmount;
    });
    setDiscount(Math.min(totalDiscount, subtotal));
  }, [subtotal, appliedCoupons]);

  const fetchAddresses = async () => {
    try {
      const res = await api.get('/auth/profile');
      setAddresses(res.data.addresses);
      if (res.data.addresses.length > 0) setSelectedAddressIndex(0);
    } catch (error) {
      console.error('Error fetching addresses');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/address', newAddress);
      fetchAddresses();
      setShowAddForm(false);
      setNewAddress({ name: '', phoneNumber: '', street: '', city: '', state: '', pincode: '' });
      toast.success('Address added successfully');
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const handleEditAddress = (index) => {
    setEditAddress({ index, address: { ...addresses[index] } });
    setShowEditModal(true);
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get('/auth/profile');
      const currentAddresses = res.data.addresses;
      const addressId = currentAddresses[editAddress.index]._id;
      const { _id, ...updateData } = editAddress.address;
      await api.patch(`/auth/address/${addressId}`, updateData);
      fetchAddresses();
      setShowEditModal(false);
      toast.success('Address updated successfully');
    } catch (error) {
      toast.error('Failed to update address');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return toast.warning('Enter a coupon code');
    if (appliedCoupons.find(c => c.code === couponCode)) {
        return toast.warning('Coupon already applied');
    }
    try {
      const res = await api.post('/coupons/apply', { code: couponCode });
      setAppliedCoupons([...appliedCoupons, res.data.coupon]);
      setCouponCode('');
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply coupon');
    }
  };

  const handleRemoveCoupon = (code) => {
    setAppliedCoupons(appliedCoupons.filter(c => c.code !== code));
    toast.info('Coupon removed');
  };

  const handlePlaceOrder = async () => {
    if (selectedAddressIndex === null || !addresses[selectedAddressIndex]) {
      return toast.warning('Please select a delivery address');
    }

    setLoading(true);
    const orderPayload = {
      items: cartItems.map(item => ({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      shippingAddress: addresses[selectedAddressIndex],
      paymentMethod,
      subtotal,
      discount,
      totalAmount,
      remainingAmount: finalRemainingAmount,
      walletAmount: walletToUse,
      appliedCoupons: appliedCoupons.map(c => c.code),
    };

    try {
      const res = await api.post('/orders/create', orderPayload);
      
      // If order is already paid (e.g. fully covered by wallet)
      if (res.data.order?.paymentStatus === 'paid') {
        toast.success(res.data.message || 'Order placed using wallet balance!');
        await clearCart();
        navigate('/order-confirmation', { state: { orderId: res.data.order._id } });
        return;
      }

      if (paymentMethod === 'UPI') {
        const { razorpayOrderId, amount_paise } = res.data;
        
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy', 
          amount: amount_paise,
          currency: 'INR',
          name: 'Bakemart',
          description: 'UPI Payment',
          order_id: razorpayOrderId,
          prefill: {
            name: addresses[selectedAddressIndex].name,
            email: '',
            contact: addresses[selectedAddressIndex].phoneNumber,
            method: 'upi',
            vpa: upiId // Prefill UPI ID if provided
          },
          // Simplified config to prevent "no appropriate method" error
          config: {
            display: {
              blocks: {
                upi: {
                  name: "Pay via UPI",
                  instruments: [{ method: "upi" }],
                },
              },
              sequence: ["block.upi"],
              preferences: { show_default_blocks: true }, 
            },
          },
          handler: async function (response) {
            try {
              await api.post('/orders/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              
              toast.success('Payment successful!');
              await clearCart();
              navigate('/order-confirmation', { state: { orderId: res.data.order._id } });
            } catch (err) {
              toast.error('Payment verification failed');
              setLoading(false);
            }
          },
          modal: {
            ondismiss: async function() {
              try {
                await api.post(`/orders/${res.data.order._id}/fail`);
              } catch (err) {
                console.error('Error marking order failed:', err);
              }
              setLoading(false);
            }
          },
          theme: { color: '#6B3F1F' }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function (response) {
          try {
            await api.post(`/orders/${res.data.order._id}/fail`);
          } catch (err) {
            console.error('Error marking order failed:', err);
          }
          toast.error(response.error.description || 'Payment failed.');
          setLoading(false);
        });
        rzp.open();

      } else if (paymentMethod === 'Razorpay') {
        const { razorpayOrderId, amount_paise } = res.data;
        
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy', 
          amount: amount_paise,
          currency: 'INR',
          name: 'Bakemart',
          order_id: razorpayOrderId,
          config: {
            display: {
              blocks: {
                banks: { 
                  name: "Pay via Card / Net Banking", 
                  instruments: [{ method: "card" }, { method: "netbanking" }] 
                },
                upi: { 
                  name: "Pay via UPI", 
                  instruments: [{ method: "upi" }] 
                },
              },
              sequence: ["block.banks", "block.upi"],
              preferences: { show_default_blocks: true },
            },
          },
          handler: async function (response) {
            try {
              await api.post('/orders/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              
              toast.success('Payment successful!');
              await clearCart();
              navigate('/order-confirmation', { state: { orderId: res.data.order._id } });
            } catch (err) {
              toast.error('Payment verification failed');
            }
          },
          modal: {
            ondismiss: async function() {
              try {
                await api.post(`/orders/${res.data.order._id}/fail`);
              } catch (err) {
                console.error('Error marking order failed:', err);
              }
              setLoading(false);
            }
          },
          prefill: {
            name: addresses[selectedAddressIndex].name,
            contact: addresses[selectedAddressIndex].phoneNumber,
          },
          theme: { color: '#6B3F1F' }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function (response) {
          try {
            await api.post(`/orders/${res.data.order._id}/fail`);
          } catch (err) {
            console.error('Error marking order failed:', err);
          }
          toast.error(response.error.description || 'Payment failed.');
          setLoading(false);
        });
        rzp.open();

      } else {
        toast.success('Order placed successfully (COD)');
        await clearCart();
        navigate('/order-confirmation', { state: { orderId: res.data.order._id } });
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-[#6B3F1F] font-bold hover:text-[#A0522D] transition-colors mb-6"
        >
          <FiArrowLeft /> Back to Cart
        </button>
      </div>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8 lg:gap-10">
        
        {/* Left Column - Address & Payment */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Address Section */}
          <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-[#D4A96A]/20">
            <h2 className="text-2xl font-black text-[#6B3F1F] mb-6">Delivery Address</h2>
            
            <div className="space-y-4">
              {addresses.map((addr, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedAddressIndex(idx)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-colors ${selectedAddressIndex === idx ? 'border-[#6B3F1F] bg-[#6B3F1F]/5' : 'border-gray-100 hover:border-[#D4A96A]/50'}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#6B3F1F] truncate">{addr.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{addr.street}, {addr.city}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{addr.state} - {addr.pincode}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2">📞 {addr.phoneNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedAddressIndex === idx && <FiCheckCircle className="text-[#6B3F1F] text-xl flex-shrink-0" />}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditAddress(idx); }}
                        className="p-2 rounded-xl hover:bg-[#6B3F1F]/10 text-[#6B3F1F] transition-colors"
                        title="Edit Address"
                      >
                        <FiEdit2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!showAddForm ? (
              <button 
                onClick={() => setShowAddForm(true)}
                className="mt-6 flex items-center gap-2 text-[#A0522D] font-bold hover:text-[#6B3F1F] transition-colors"
              >
                <FiPlus /> Add New Address
              </button>
            ) : (
              <form onSubmit={handleAddAddress} className="mt-6 bg-[#FDF6EC]/50 p-4 sm:p-6 rounded-2xl border border-[#D4A96A]/20 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input required type="text" placeholder="Full Name" className="p-3 rounded-xl border border-white focus:border-[#D4A96A] outline-none text-sm" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} />
                  <input required type="text" placeholder="Phone Number" className="p-3 rounded-xl border border-white focus:border-[#D4A96A] outline-none text-sm" value={newAddress.phoneNumber} onChange={e => setNewAddress({...newAddress, phoneNumber: e.target.value})} />
                </div>
                <input required type="text" placeholder="Street Address" className="w-full p-3 rounded-xl border border-white focus:border-[#D4A96A] outline-none text-sm" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <input required type="text" placeholder="City" className="p-3 rounded-xl border border-white focus:border-[#D4A96A] outline-none text-sm" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                  <input required type="text" placeholder="State" className="p-3 rounded-xl border border-white focus:border-[#D4A96A] outline-none text-sm" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} />
                  <input required type="text" placeholder="Pincode" className="p-3 rounded-xl border border-white focus:border-[#D4A96A] outline-none text-sm" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button type="submit" className="bg-[#6B3F1F] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#A0522D] transition-colors">Save Address</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-400 font-bold hover:text-[#6B3F1F] transition-colors py-3">Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* Wallet Section */}
          <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-[#D4A96A]/20">
            <h2 className="text-2xl font-black text-[#6B3F1F] mb-6">BakeMart Wallet</h2>
            <div className={`p-6 rounded-[24px] border-2 transition-all duration-500 ${useWallet ? 'border-[#6B3F1F] bg-[#6B3F1F]/5 shadow-inner' : 'border-gray-100 bg-gray-50/50'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl transition-colors ${useWallet ? 'bg-[#6B3F1F] text-white' : 'bg-[#D4A96A]/10 text-[#6B3F1F]'}`}>
                            <FiPocket size={24} />
                        </div>
                        <div>
                            <p className="font-black text-[#6B3F1F]">Use Wallet Balance</p>
                            <p className="text-xs text-[#A0522D] font-medium italic">Current: ₹{walletBalance.toLocaleString('en-IN')}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => {
                            if (walletBalance <= 0) return toast.info('Your wallet balance is zero');
                            setUseWallet(!useWallet);
                            if (!useWallet) setPaymentMethod('Razorpay'); // Switch away from COD if using wallet
                        }}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${useWallet ? 'bg-[#6B3F1F]' : 'bg-gray-200'}`}
                    >
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${useWallet ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                {useWallet && (
                    <div className="mt-6 pt-6 border-t border-[#6B3F1F]/10 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-between items-center text-sm font-bold text-[#6B3F1F]">
                            <span className="opacity-60 uppercase tracking-widest text-[10px]">Applied Balance</span>
                            <span className="text-green-600">-₹{walletToUse.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-[#D4A96A]/20">
            <h2 className="text-2xl font-black text-[#6B3F1F] mb-6">Payment Method</h2>
            
            {finalRemainingAmount <= 0 ? (
                <div className="bg-green-50 border border-green-100 rounded-[24px] p-6 flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in duration-500">
                    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg transform -rotate-6">
                        <FiCheckCircle size={32} />
                    </div>
                    <div>
                        <p className="text-green-800 font-extrabold text-lg">Fully Covered!</p>
                        <p className="text-green-600 text-xs font-bold uppercase tracking-widest mt-1">Your wallet balance covers this order entirely.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-[#6B3F1F] bg-[#6B3F1F]/5' : 'border-gray-100 hover:border-[#D4A96A]/50'} ${useWallet ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    onClick={(e) => { if(useWallet) { e.preventDefault(); toast.info('COD is disabled when using wallet balance'); } }}
                   >
                    <input 
                        type="radio" 
                        name="payment" 
                        value="COD" 
                        disabled={useWallet}
                        checked={paymentMethod === 'COD' && !useWallet} 
                        onChange={() => setPaymentMethod('COD')} 
                        className="w-5 h-5 text-[#6B3F1F]" 
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-[#6B3F1F]">Cash on Delivery (COD)</span>
                      {useWallet && <span className="text-[10px] text-red-500 font-bold">Not available with Wallet usage</span>}
                    </div>
                  </label>
                  <div className={`rounded-2xl border-2 transition-all overflow-hidden ${paymentMethod === 'UPI' ? 'border-[#6B3F1F] bg-[#6B3F1F]/5' : 'border-gray-100 hover:border-[#D4A96A]/50'}`}>
                    <label className="flex items-center gap-4 p-4 cursor-pointer">
                      <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="w-5 h-5 text-[#6B3F1F]" />
                      <div className="flex flex-col flex-grow">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#6B3F1F]">UPI (Google Pay, PhonePe, Paytm)</span>
                          <div className="flex gap-2 items-center opacity-90">
                            <img src="https://img.icons8.com/color/48/google-pay-india.png" alt="GPay" className="h-5 sm:h-6" />
                            <img src="https://img.icons8.com/color/48/phonepe.png" alt="PhonePe" className="h-5 sm:h-6" />
                            <img src="https://img.icons8.com/color/48/bhima-upi.png" alt="UPI" className="h-5 sm:h-6" />
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">Instant payment via any UPI app</span>
                      </div>
                    </label>
                    
                    {paymentMethod === 'UPI' && (
                      <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="h-px bg-[#6B3F1F]/10 mb-4"></div>
                        <div className="space-y-3">
                          <p className="text-[10px] font-bold text-[#6B3F1F]/60 uppercase tracking-wider">Fast Checkout with UPI ID</p>
                          <div className="relative">
                            <input 
                              type="text" 
                              placeholder="yourname@bankid" 
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              className="w-full bg-white border border-[#D4A96A]/30 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6B3F1F] transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">Optional</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${paymentMethod === 'Razorpay' ? 'border-[#6B3F1F] bg-[#6B3F1F]/5' : 'border-gray-100 hover:border-[#D4A96A]/50'}`}>
                    <input type="radio" name="payment" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={() => setPaymentMethod('Razorpay')} className="w-5 h-5 text-[#6B3F1F]" />
                    <div className="flex flex-col">
                      <span className="font-bold text-[#6B3F1F]">Card / Net Banking</span>
                      <span className="text-xs text-gray-500">Credit, Debit Card or Net Banking</span>
                    </div>
                  </label>
                </div>
            )}
          </div>

        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <div className="bg-[#6B3F1F] p-6 sm:p-8 rounded-[40px] text-[#FDF6EC] shadow-2xl sticky top-24">
            <h2 className="text-2xl font-black mb-6">Your Order</h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
              {cartItems.map(item => (
                <div key={item._id} className="flex justify-between items-center text-sm gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
<img 
                          src={item.image ? (item.image.startsWith('http') ? item.image : `${api.defaults.baseURL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${item.image}`) : 'https://via.placeholder.com/50?text=No+Image'}
                         className="w-full h-full object-cover" 
                         alt="" 
                       />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate">{item.name}</p>
                      <p className="text-[10px] opacity-70">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold flex-shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-white/10 my-4"></div>

            <div className="space-y-3 text-sm opacity-90 mb-6">
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span className="font-bold">₹{subtotal}</span>
              </div>
              
              <div className="flex gap-2">
                <input type="text" placeholder="Coupon" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/50 outline-none uppercase" />
                <button onClick={handleApplyCoupon} className="bg-[#D4A96A] text-[#6B3F1F] px-4 rounded-xl font-bold text-xs hover:bg-white transition-colors">Apply</button>
              </div>
              
              {appliedCoupons.length > 0 && (
                <div className="mt-4 space-y-2">
                  {appliedCoupons.map(coupon => (
                    <div key={coupon.code} className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-xl text-green-400 border border-green-400/20">
                      <span className="font-bold text-xs">{coupon.code}</span>
                      <button onClick={() => handleRemoveCoupon(coupon.code)} className="text-white/40 hover:text-red-400 text-[10px] font-bold">Remove</button>
                    </div>
                  ))}
                </div>
              )}
              
              {discount > 0 && (
                <div className="flex justify-between font-bold text-green-400 mt-2">
                  <span>Total Discount</span>
                  <span>-₹{discount.toFixed(0)}</span>
                </div>
              )}

            </div>

            <div className="h-px bg-white/10 my-4"></div>
            
            <div className="flex justify-between items-baseline mb-8">
              <span className="text-lg font-bold">Total Pay</span>
              <div className="text-right">
                {useWallet && (
                    <p className="text-[10px] opacity-60 line-through">₹{totalAmount.toFixed(0)}</p>
                )}
                <span className="text-3xl font-black text-[#D4A96A]">₹{finalRemainingAmount.toFixed(0)}</span>
              </div>
            </div>

            <button 
              onClick={handlePlaceOrder} 
              disabled={loading}
              className={`w-full bg-[#D4A96A] text-[#6B3F1F] py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-[#FDF6EC] transition-all active:scale-95 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : `Place Order`}
            </button>
          </div>
        </div>

      </div>

    {/* Edit Address Modal */}
    {showEditModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-[32px] w-full max-w-md p-6 sm:p-8 relative">
          <button 
            onClick={() => setShowEditModal(false)}
            className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-[#6B3F1F] transition-colors"
          >
            <FiX className="text-xl" />
          </button>
          
          <h2 className="text-2xl font-black text-[#6B3F1F] mb-6">Edit Address</h2>
          
          <form onSubmit={handleUpdateAddress} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input 
                required 
                type="text" 
                placeholder="Full Name" 
                className="p-3 rounded-xl border border-gray-200 focus:border-[#D4A96A] outline-none text-sm" 
                value={editAddress.address.name} 
                onChange={e => setEditAddress({...editAddress, address: {...editAddress.address, name: e.target.value}})} 
              />
              <input 
                required 
                type="text" 
                placeholder="Phone Number" 
                className="p-3 rounded-xl border border-gray-200 focus:border-[#D4A96A] outline-none text-sm" 
                value={editAddress.address.phoneNumber} 
                onChange={e => setEditAddress({...editAddress, address: {...editAddress.address, phoneNumber: e.target.value}})} 
              />
            </div>
            <input 
              required 
              type="text" 
              placeholder="Street Address" 
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-[#D4A96A] outline-none text-sm" 
              value={editAddress.address.street} 
              onChange={e => setEditAddress({...editAddress, address: {...editAddress.address, street: e.target.value}})} 
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <input 
                required 
                type="text" 
                placeholder="City" 
                className="p-3 rounded-xl border border-gray-200 focus:border-[#D4A96A] outline-none text-sm" 
                value={editAddress.address.city} 
                onChange={e => setEditAddress({...editAddress, address: {...editAddress.address, city: e.target.value}})} 
              />
              <input 
                required 
                type="text" 
                placeholder="State" 
                className="p-3 rounded-xl border border-gray-200 focus:border-[#D4A96A] outline-none text-sm" 
                value={editAddress.address.state} 
                onChange={e => setEditAddress({...editAddress, address: {...editAddress.address, state: e.target.value}})} 
              />
              <input 
                required 
                type="text" 
                placeholder="Pincode" 
                className="p-3 rounded-xl border border-gray-200 focus:border-[#D4A96A] outline-none text-sm" 
                value={editAddress.address.pincode} 
                onChange={e => setEditAddress({...editAddress, address: {...editAddress.address, pincode: e.target.value}})} 
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button type="submit" className="bg-[#6B3F1F] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#A0522D] transition-colors">Update Address</button>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-gray-400 font-bold hover:text-[#6B3F1F] transition-colors py-3">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )}
    </div>  
  );
}