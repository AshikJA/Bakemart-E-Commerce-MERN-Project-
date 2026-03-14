import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

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
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4">
      <div
        className="w-full max-w-[807px] rounded-[25px] px-8 py-12 sm:px-16 sm:py-16"
        style={{ backgroundColor: "#8E6251" }}
      >
        {/* Title */}
        <h1 className="text-white font-extrabold text-center leading-tight mb-6 text-4xl sm:text-5xl lg:text-[55px]">
          Forgot your Password
        </h1>

        {/* Subtitle */}
        <p
          className="text-white text-center text-base sm:text-lg lg:text-[23px] leading-snug mb-6"
          style={{ opacity: 0.7 }}
        >
          Please enter the Email address, associated with your account. We will
          send a password reset link.
        </p>

        {message && (
          <p className="text-center text-sm text-green-200 mb-4">
            {message}
          </p>
        )}
        {error && (
          <p className="text-center text-sm text-red-200 mb-4">
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
            className="w-full max-w-[394px] rounded-[10px] bg-white px-5 py-4 text-[15px] font-light text-[#2B2222] outline-none border-none placeholder:text-[#2B2222] placeholder:font-extralight"
          />

          {/* Send Reset Link Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-3 w-full max-w-[394px] rounded-[18px] px-6 py-3 text-black font-semibold text-lg sm:text-[20px] cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#B3A9A9" }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
            >
              <path d="M3 20V14L11 12L3 10V4L22 12L3 20Z" fill="black" />
            </svg>
            {loading ? "Sending..." : "Send reset link"}
          </button>

          {/* Back to Login */}
          <Link
            to="/login"
            className="text-black text-xl sm:text-[25px] font-normal hover:underline"
          >
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}
