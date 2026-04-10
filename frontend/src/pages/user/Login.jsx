import { useState } from "react";
import api from "../../api/client";
import "../../styles/index.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "../../components/Icons";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { mergeLocalCartOnLogin } from "../../utils/cartUtils";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login: authLogin } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/auth/login", form);
      setSuccess("Login successfully");
      
      // Use the global login function from Context
      authLogin(res.data.user, res.data.token);
      
      // Merge local cart to DB
      await mergeLocalCartOnLogin();

      setTimeout(() => navigate("/", { replace: true }), 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Abstract Background Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6B3F1F]/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D4A96A]/10 rounded-full blur-3xl"></div>
      
      <div className="w-full max-w-md mx-4 relative">
        {/* Logo/Brand Area */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-block p-4 rounded-3xl bg-[#6B3F1F] shadow-2xl mb-4 transform hover:rotate-12 transition-transform cursor-pointer">
             <span className="text-3xl">🍫</span>
          </div>
          <h1 className="text-4xl font-black text-[#6B3F1F] tracking-tight">Bakemart</h1>
          <p className="text-[#A0522D] font-bold text-sm tracking-widest uppercase mt-1">Premium Chocolates</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[40px] shadow-2xl p-8 sm:p-10 space-y-8 animate-in zoom-in duration-500">
          <header className="space-y-2 text-center">
            <h2 className="text-2xl font-black text-[#6B3F1F]">Welcome Back</h2>
            <p className="text-gray-500 font-medium text-sm italic">Indulge in your favorite treats again.</p>
          </header>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3 animate-shake">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600"></div>
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 text-sm font-bold flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
              {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#6B3F1F] uppercase tracking-[0.2em] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4A96A] transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none text-sm font-bold text-[#6B3F1F] placeholder:text-gray-300 focus:ring-4 focus:ring-[#D4A96A]/20 outline-none transition-all shadow-inner"
                  placeholder="you@chocolatier.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-[#6B3F1F] uppercase tracking-[0.2em]">
                    Password
                </label>
                <Link to='/forgot-password' theme="none" className="text-[10px] font-black text-[#D4A96A] hover:text-[#6B3F1F] uppercase tracking-widest transition-colors">
                    Forgot?
                </Link >
              </div>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4A96A] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border-none text-sm font-bold text-[#6B3F1F] placeholder:text-gray-300 focus:ring-4 focus:ring-[#D4A96A]/20 outline-none transition-all shadow-inner"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6B3F1F] transition-colors"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-[#6B3F1F] text-white py-4 rounded-[20px] font-black text-lg shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-4"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Authenticating..." : "Sign In"}
                {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform"></div>
            </button>
          </form>

          <div className="pt-6 text-center">
            <p className="text-sm font-bold text-gray-400">
                New to Bakemart?{" "}
                <Link to="/register" className="text-[#D4A96A] hover:text-[#6B3F1F] underline decoration-2 underline-offset-4 transition-colors">
                    Create Account
                </Link>
            </p>
          </div>
        </div>

        {/* Footer Credit */}
        <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
            Bespoke Confectionery Since 1992
        </p>
      </div>
    </div>
  );
}

export default Login;
