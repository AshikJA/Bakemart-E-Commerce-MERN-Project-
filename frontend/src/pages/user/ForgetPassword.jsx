import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data?.message || "If that email exists, a reset link has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FDF6EC] flex items-center justify-center p-4">
      <div className="w-full max-w-[807px] rounded-[35px] border border-[#D4A96A]/20 px-8 py-12 sm:px-16 sm:py-16 shadow-lg bg-[#F5E6D3]">
        {/* Title */}
        <h1 className="text-[#6B3F1F] font-black text-center leading-tight mb-6 text-4xl sm:text-5xl lg:text-[55px]">
          Forgot your Password
        </h1>

        {/* Subtitle */}
        <p className="text-[#A0522D] font-medium text-center text-base sm:text-lg lg:text-[23px] leading-snug mb-6">
          Please enter the Email address associated with your account. We will
          send a password reset link.
        </p>

        {message && (
          <p className="text-center font-bold text-lg text-green-600 mb-4">
            {message}
          </p>
        )}
        {error && (
          <p className="text-center font-bold text-lg text-red-500 mb-4">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8">
          {/* Email Input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email..."
            className="w-full max-w-[394px] rounded-2xl bg-white px-6 py-4 text-lg font-bold text-[#6B3F1F] shadow-sm focus:ring-4 focus:ring-[#D4A96A]/20 outline-none border-none placeholder:text-[#A0522D]/70 transition-all"
          />

          {/* Send Reset Link Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full max-w-[394px] rounded-2xl px-6 py-4 bg-[#6B3F1F] text-white font-black text-xl sm:text-2xl shadow-xl hover:bg-[#A0522D] transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <path d="M3 20V14L11 12L3 10V4L22 12L3 20Z" fill="white" />
            </svg>
            {loading ? "Sending..." : "Send reset link"}
          </button>

          {/* Back to Login */}
          <Link
            to="/login"
            className="text-[#6B3F1F] text-xl sm:text-2xl font-black hover:text-[#A0522D] transition-colors"
          >
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}
