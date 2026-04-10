import { useState, useMemo } from "react";
import api from "../../api/client";
import "../../styles/index.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "../../components/Icons";
import { FiUser, FiMail, FiLock, FiCheckCircle, FiAlertCircle, FiAlertTriangle } from "react-icons/fi";

/* ── Password-strength helper ── */
function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Too short", color: "#ef4444" },
    { label: "Weak",      color: "#f97316" },
    { label: "Fair",      color: "#eab308" },
    { label: "Good",      color: "#84cc16" },
    { label: "Strong",    color: "#22c55e" },
  ];
  return { score, ...map[score] };
}

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState("");
  const [success, setSuccess]   = useState("");
  const navigate = useNavigate();

  const strength = useMemo(() => getStrength(form.password), [form.password]);

  /* Real-time confirm-password hint */
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear top-level error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    /* ── Client-side validation ── */
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please re-enter your confirm password.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", form);
      setSuccess("Account created! Redirecting to OTP verification…");
      const email = form.email;
      setTimeout(() => navigate("/verify-otp", { state: { email } }), 1500);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message;

      /* Map backend messages to friendly UI copy */
      if (msg === "User already exists") {
        setError("An account with this email already exists. Try signing in instead.");
      } else if (msg === "Passwords do not match") {
        setError("Passwords do not match. Please re-enter your confirm password.");
      } else if (msg?.toLowerCase().includes("email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(msg || "Registration failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6B3F1F]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4A96A]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

      <div className="w-full max-w-lg mx-4 relative grid lg:grid-cols-1 gap-12">

        {/* Branding */}
        <div className="text-center animate-in fade-in slide-in-from-top duration-700">
          <Link to="/" className="inline-block p-4 rounded-3xl bg-[#6B3F1F] shadow-2xl mb-4 transform hover:scale-110 transition-transform">
            <span className="text-3xl">🍫</span>
          </Link>
          <h1 className="text-4xl font-black text-[#6B3F1F] tracking-tight">Join Bakemart</h1>
          <p className="text-[#A0522D] font-bold text-xs tracking-widest uppercase mt-1">Start Your Sweet Journey</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[40px] shadow-2xl p-8 sm:p-10 space-y-6 animate-in zoom-in duration-500">

          {/* ── Error Banner ── */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl animate-in fade-in duration-300">
              <FiAlertCircle className="text-red-500 mt-0.5 shrink-0" size={18} />
              <p className="text-red-600 text-sm font-semibold leading-snug">{error}</p>
            </div>
          )}

          {/* ── Success Banner ── */}
          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl animate-in fade-in duration-300">
              <FiCheckCircle className="text-green-500 shrink-0" size={18} />
              <p className="text-green-700 text-sm font-semibold">{success}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Name + Email row */}
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Name */}
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

              {/* Email */}
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

            {/* Password */}
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

              {/* Strength bar */}
              {form.password.length > 0 && (
                <div className="space-y-1 px-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength.score ? strength.color : "#e5e7eb" }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: strength.color }}>
                    {strength.label}
                    {form.password.length < 6 && " — min. 6 characters required"}
                  </p>
                </div>
              )}

              {!form.password && (
                <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase tracking-widest pl-1 italic">
                  Min. 6 characters with a sprinkle of magic
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#6B3F1F] uppercase tracking-[0.2em] ml-1">Confirm Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4A96A] transition-colors" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border-none text-sm font-bold text-[#6B3F1F] placeholder:text-gray-300 outline-none transition-all shadow-inner
                    ${passwordsMismatch ? "focus:ring-4 focus:ring-red-200" : ""}
                    ${passwordsMatch    ? "focus:ring-4 focus:ring-green-200" : ""}
                    ${!passwordsMatch && !passwordsMismatch ? "focus:ring-4 focus:ring-[#D4A96A]/20" : ""}
                  `}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#6B3F1F] transition-colors"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              {/* Inline match hint */}
              {passwordsMatch && (
                <p className="flex items-center gap-1 text-[10px] font-bold text-green-600 pl-1 animate-in fade-in duration-200">
                  <FiCheckCircle size={11} /> Passwords match
                </p>
              )}
              {passwordsMismatch && (
                <p className="flex items-center gap-1 text-[10px] font-bold text-red-500 pl-1 animate-in fade-in duration-200">
                  <FiAlertTriangle size={11} /> Passwords do not match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6B3F1F] text-white py-4 rounded-[20px] font-black text-lg shadow-xl hover:shadow-2xl transition-all hover:bg-[#A0522D] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "Creating Account…" : "Begin Your Journey"}
            </button>
          </form>

          {/* Footer link */}
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
