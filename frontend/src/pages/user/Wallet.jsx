import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiArrowUpRight, FiArrowDownLeft, FiShoppingBag, FiClock, FiAlertCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function Wallet() {
    const { walletBalance, refreshWallet } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/wallet/transactions');
            setTransactions(res.data || []);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            toast.error('Could not load transaction history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
        refreshWallet();
    }, []);

    return (
        <div className="min-h-screen bg-[#FDF6EC] py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center text-[#6B3F1F] font-bold hover:text-[#A0522D] transition-colors group"
                    >
                        <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    <h1 className="text-3xl font-black text-[#6B3F1F] tracking-tight">My Wallet 💰</h1>
                </div>

                {/* Wallet Balance Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-[#6B3F1F] to-[#A0522D] rounded-[40px] p-8 sm:p-12 text-white shadow-2xl">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4A96A]/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-8">
                        <div className="text-center sm:text-left">
                            <h2 className="text-[#D4A96A] font-black uppercase tracking-[0.3em] text-xs mb-4">BakeMart Wallet</h2>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl sm:text-7xl font-black tracking-tighter">₹{walletBalance.toLocaleString('en-IN')}</span>
                                <span className="text-[#F5E6D3] font-bold text-lg">.00</span>
                            </div>
                            <p className="mt-4 text-[#F5E6D3]/70 font-medium max-w-xs text-sm italic">
                                Use your balance for instant checkouts and sweet surprises.
                            </p>
                        </div>
                        
                        <Link to="/shop" className="w-full sm:w-auto bg-[#D4A96A] hover:bg-[#F5E6D3] text-[#6B3F1F] px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-3">
                            <FiShoppingBag /> Shop Now
                        </Link>
                    </div>
                </div>

                {/* Transaction History Section */}
                <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[40px] shadow-sm p-6 sm:p-10 space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                        <h2 className="text-2xl font-black text-[#6B3F1F] flex items-center gap-3">
                            <FiClock className="text-[#D4A96A]" /> 
                            Transaction History
                        </h2>
                    </div>

                    {loading ? (
                        <div className="space-y-4 py-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <span className="text-4xl">🛒</span>
                            </div>
                            <p className="text-[#6B3F1F] font-bold text-lg">No transactions yet</p>
                            <p className="text-gray-400 text-sm mt-1 font-medium">Your future treats will appear here!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx) => (
                                <div 
                                    key={tx._id} 
                                    className="group flex items-center justify-between p-5 rounded-3xl border border-gray-50 bg-white hover:bg-gray-50 hover:border-[#D4A96A]/20 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                                            tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {tx.type === 'credit' ? <FiArrowDownLeft size={28} /> : <FiArrowUpRight size={28} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[#6B3F1F] group-hover:text-[#A0522D] transition-colors">
                                                {tx.description}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">
                                                    {new Date(tx.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                                {tx.orderId && (
                                                    <Link 
                                                        to={`/view-orders`} // Navigate to view orders where this ID exists
                                                        className="text-[10px] text-[#D4A96A] font-black uppercase hover:underline"
                                                    >
                                                        Details
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className={`text-xl sm:text-2xl font-black tracking-tight ${
                                        tx.type === 'credit' ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer Info */}
                    <div className="pt-6 border-t border-gray-50 flex items-center gap-2 text-gray-400 italic text-[11px] font-medium">
                        <FiAlertCircle className="text-[#D4A96A]" />
                        <span>Showing your most recent 20 activities.</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
