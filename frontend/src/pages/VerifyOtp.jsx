import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/client';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('token', res.data.token);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="w-full max-w-md mx-4 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Verify your email</h1>
        <p className="text-sm text-slate-400 text-center">
          We&apos;ve sent a 6-digit code to your email.
        </p>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!initialEmail && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Verification code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm
                         tracking-[0.4em] text-center
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123456"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5
                       rounded-lg bg-blue-600 text-sm font-semibold text-white
                       hover:bg-blue-700 active:scale-[0.98] transition disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
}