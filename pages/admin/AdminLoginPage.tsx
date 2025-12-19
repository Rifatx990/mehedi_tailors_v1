
import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, ShieldCheckIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAdminUser, adminUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (adminUser) {
      navigate('/admin/dashboard');
    }
  }, [adminUser, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // SIMULATED SECURE ADMIN VERIFICATION
    // DEFAULT CREDENTIALS:
    // Email: admin@meheditailors.com
    // Key: admin123
    setTimeout(() => {
      if (email === 'admin@meheditailors.com' && password === 'admin123') {
        const admin = {
          id: 'admin-001',
          name: 'Mehedi Admin',
          email: email,
          phone: '+8801720267213',
          address: 'Dhonaid, Ashulia',
          measurements: [],
          role: 'admin' as const
        };
        setAdminUser(admin);
        navigate('/admin/dashboard');
      } else {
        setError('Unauthorized access. Please verify your administrative credentials.');
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-slate-500 hover:text-white transition mb-8 text-xs uppercase tracking-widest font-bold"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Return to Store</span>
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-600 rounded-[2rem] mb-6 shadow-2xl shadow-amber-600/30 ring-4 ring-amber-600/20">
            <ShieldCheckIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white serif tracking-tight">Admin Portal</h1>
          <p className="text-slate-500 mt-3 text-sm uppercase tracking-widest">Authorized Access Only</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-2xl space-y-8">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-widest border border-red-100 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Secure Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all placeholder:text-slate-300"
                placeholder="admin@meheditailors.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Security Key</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-amber-600/10 focus:border-amber-600 outline-none transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-800 transition shadow-xl shadow-slate-200 flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LockClosedIcon className="w-5 h-5" />
                  <span>Authenticate Access</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-12 text-center">
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
            Bespoke ERP Solutions &copy; 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
