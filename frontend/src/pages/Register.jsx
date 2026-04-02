import { useState } from "react";
import api from "../api/client";
import "../styles/index.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "../components/Icons";
import { FiUser, FiMail, FiLock, FiStar } from "react-icons/fi";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      const res = await api.post("/auth/register", form);
      setSuccess("Account created successfully!");
      const email = form.email;
      setTimeout(() => navigate("/verify-otp", { state: { email } }), 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6B3F1F]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4A96A]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>

      <div className="w-full max-w-lg mx-4 relative grid lg:grid-cols-1 gap-12">
        {/* Branding (Mobile only style) or consistent with login */}
        <div className="text-center animate-in fade-in slide-in-from-top duration-700">
           <Link to="/" className="inline-block p-4 rounded-3xl bg-[#6B3F1F] shadow-2xl mb-4 transform hover:scale-110 transition-transform">
             <span className="text-3xl">🍫</span>
           </Link>
           <h1 className="text-4xl font-black text-[#6B3F1F] tracking-tight">Join Bakemart</h1>
           <p className="text-[#A0522D] font-bold text-xs tracking-widest uppercase mt-1">Start Your Sweet Journey</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[40px] shadow-2xl p-8 sm:p-10 space-y-8 animate-in zoom-in duration-500">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold animate-shake">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 text-sm font-bold flex items-center gap-2">
              <FiStar className="animate-spin" /> {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#6B3F1F] uppercase tracking-[0.2em] ml-1">Name</label>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4A96A] transition-colors" />
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none text-sm font-bold text-[#6B3F1F] placeholder:text-gray-300 focus:ring-4 focus:ring-[#D4A96A]/20 outline-none transition-all shadow-inner"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#6B3F1F] uppercase tracking-[0.2em] ml-1">Email</label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4A96A] transition-colors" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none text-sm font-bold text-[#6B3F1F] placeholder:text-gray-300 focus:ring-4 focus:ring-[#D4A96A]/20 outline-none transition-all shadow-inner"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#6B3F1F] uppercase tracking-[0.2em] ml-1">Create Password</label>
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
              <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-widest pl-1 italic">
                Min. 8 characters with a sprinkle of magic
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#6B3F1F] uppercase tracking-[0.2em] ml-1">Confirm Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4A96A] transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={form.confirmPassword}
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
              className="w-full bg-[#6B3F1F] text-white py-4 rounded-[20px] font-black text-lg shadow-xl hover:shadow-2xl transition-all hover:bg-[#A0522D] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Creating Account..." : "Begin Your Journey"}
            </button>
          </form>

          <div className="pt-6 text-center border-t border-gray-100">
            <p className="text-sm font-bold text-gray-400">
                Already a member?{" "}
                <Link to="/login" className="text-[#D4A96A] hover:text-[#6B3F1F] font-black hover:underline transition-all">
                    Sign In
                </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] pb-8">
            The Gold Standard of Cocoa
        </p>
      </div>
    </div>
  );
}

export default Register;
