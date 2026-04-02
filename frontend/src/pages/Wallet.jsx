import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { toast } from 'react-toastify';
import { FiDollarSign, FiArrowDownLeft, FiArrowUpRight } from 'react-icons/fi';

export default function Wallet() {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await api.get('/wallet');
      setWallet(res.data);
    } catch (error) {
      toast.error('Failed to fetch wallet info');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center font-bold text-[#6B3F1F]">Loading Wallet...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDF6EC] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Wallet Balance Card */}
        <div className="bg-[#6B3F1F] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 blur-[2px]">
            <FiDollarSign className="text-9xl" />
          </div>
          <div className="relative z-10">
            <h1 className="text-white/70 font-bold uppercase tracking-widest text-sm mb-2">Available Balance</h1>
            <div className="text-6xl font-black text-[#D4A96A] tracking-tighter shadow-sm">
              ₹{wallet.balance.toFixed(2)}
            </div>
            <p className="mt-4 text-sm text-white/80 max-w-sm">
              Use your wallet balance to quickly checkout without the hassle of payment gateways. Your refunds are added directly here.
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[#D4A96A]/20">
          <h2 className="text-2xl font-black text-[#6B3F1F] mb-6">Transaction History</h2>
          
          {wallet.transactions.length === 0 ? (
            <p className="text-gray-500 italic text-center py-8">No transactions found.</p>
          ) : (
            <div className="space-y-4">
              {wallet.transactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {tx.type === 'credit' ? <FiArrowDownLeft size={24} /> : <FiArrowUpRight size={24} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{tx.description}</h3>
                      <p className="text-xs text-gray-500 mt-1">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`font-black text-lg ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
