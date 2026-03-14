import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { EyeIcon, EyeOffIcon, LockIcon, ResetIcon } from "../components/Icons";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const emailFromQuery = searchParams.get("email") || "";
  const tokenFromQuery = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!emailFromQuery || !tokenFromQuery) {
      setError("Invalid or missing reset link.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email: emailFromQuery,
        token: tokenFromQuery,
        password: newPassword,
      });
      setMessage(res.data?.message || "Password reset successfully.");
      // small delay then go to login
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[849px] rounded-[25px] overflow-hidden" style={{ backgroundColor: "#8E6251" }}>
        <div className="flex flex-col items-center px-6 sm:px-16 md:px-24 py-12 sm:py-16">
          {/* Title */}
          <h1 className="text-white text-center font-bold text-3xl sm:text-4xl md:text-5xl leading-tight mb-10 sm:mb-14 font-inter">
            Reset your Password
          </h1>

          {/* Form */}
          <form onSubmit={handleReset} className="w-full max-w-[404px] flex flex-col gap-8">
            {error && (
              <p className="text-sm text-red-200 text-center">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-green-200 text-center">
                {message}
              </p>
            )}
            {/* New Password Field */}
            <div className="flex flex-col gap-2.5">
              <label className="text-white font-normal text-xl sm:text-2xl font-inter">
                New Password
              </label>
              <div className="relative">
                <div className="h-10 w-full rounded-[18px] flex items-center px-3 gap-2 relative" style={{ backgroundColor: "#D9D9D9" }}>
                  <LockIcon />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 bg-transparent outline-none border-none text-black text-base font-inter pr-8"
                    placeholder=""
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-black"
                  >
                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="flex flex-col gap-2.5">
              <label className="text-white font-normal text-xl sm:text-2xl font-inter">
                Confirm Password
              </label>
              <div className="relative">
                <div className="h-10 w-full rounded-[18px] flex items-center px-3 gap-2 relative" style={{ backgroundColor: "#D9D9D9" }}>
                  <LockIcon />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex-1 bg-transparent outline-none border-none text-black text-base font-inter pr-8"
                    placeholder=""
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-black"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-11 rounded-[10px] font-semibold text-xl sm:text-2xl font-inter transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
                style={{ backgroundColor: "#BCB7B7" }}
              >
                <ResetIcon />
                <span>{loading ? "Resetting..." : "Reset Password"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
