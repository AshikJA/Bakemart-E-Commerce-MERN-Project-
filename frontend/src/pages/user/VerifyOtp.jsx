import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../../api/client';
import { Link } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('token', res.data.token);
      setSuccess('Email verified successfully!');
      setTimeout(() => navigate('/', { replace: true }), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-4 bg-white rounded-[40px] shadow-2xl border border-[#D4A96A]/20 p-8 space-y-6">
        <div className="text-center">
          <div className="inline-block p-4 rounded-3xl bg-[#6B3F1F] shadow-xl mb-4">
            <span className="text-3xl">🍫</span>
          </div>
          <h1 className="text-2xl font-black text-[#6B3F1F]">Verify your email</h1>
          <p className="text-[#A0522D] text-sm mt-2 font-medium">
            We've sent a 6-digit code to your email.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 text-sm font-bold text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!initialEmail && (
            <div className="space-y-2">
              <label className="text-xs font-black text-[#6B3F1F] uppercase tracking-widest ml-1">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#FDF6EC] border-none text-sm font-bold text-[#6B3F1F] placeholder:text-[#A0522D]/50 focus:ring-4 focus:ring-[#D4A96A]/20 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-[#6B3F1F] uppercase tracking-widest ml-1">
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-4 py-4 rounded-2xl bg-[#FDF6EC] border-none text-center text-2xl tracking-[0.5em] font-black text-[#6B3F1F] focus:ring-4 focus:ring-[#D4A96A]/20 outline-none transition-all"
              placeholder="123456"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-[#6B3F1F] text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-[#A0522D] transition-all active:scale-95 disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Remember password?{' '}
            <Link to="/login" className="text-[#D4A96A] font-bold hover:text-[#6B3F1F] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
