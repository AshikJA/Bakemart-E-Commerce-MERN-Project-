import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="w-full max-w-md mx-4 bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-2xl font-bold">Welcome Home</h1>

        <button
          onClick={handleLogout}
          className="mt-4 inline-flex items-center justify-center px-4 py-2.5
                     rounded-lg bg-red-600 text-sm font-semibold text-white
                     hover:bg-red-700 active:scale-[0.98] transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}