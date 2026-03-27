import { useState } from "react";
import api from "../api/client";
import "../styles/index.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "../components/Icons";

function Login() {
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
      console.log("Response:", res.data);
      localStorage.setItem('token', res.data.token);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
      <div className="w-full max-w-md mx-4 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          {/* <p className="text-sm text-slate-400">Create your account.</p> */}
        </header>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-emerald-400">{success}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-200">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div>
            <Link to='/forgot-password' > Forgot Password</Link >
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5
                       rounded-lg bg-blue-600 text-sm font-semibold text-white
                       hover:bg-blue-700 active:scale-[0.98] transition disabled:opacity-60"
          >
            {loading ? "Login..." : "Login"}
          </button>
        </form>
        <p className="text-xs text-center text-slate-500">
          Don&apos;t have an account?{" "}
          <span className="text-blue-400 hover:underline cursor-pointer">
            <Link to="/register" className="text-blue-400 hover:underline">
              Register
            </Link>
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
