
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { useNavigate, Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon, 
  PhoneIcon,
  ChevronLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-sent';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { setUser, setAdminUser, setWorkerUser, registerNewUser, allUsers } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '', password: '', name: '', phone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (mode === 'login') {
        // Priority 1: Check Database
        const found = allUsers.find(u => u.email === formData.email);
        
        if (found) {
          if (found.role === 'admin') {
             setAdminUser(found);
             navigate('/admin/dashboard');
          } else if (found.role === 'worker') {
             setWorkerUser(found);
             navigate('/worker/dashboard');
          } else {
             setUser(found);
             navigate('/dashboard');
          }
          setLoading(false);
          return;
        }

        // Priority 2: Simulation Defaults
        if (formData.email === 'admin@meheditailors.com' && formData.password === 'admin123') {
          const admin = {
            id: 'admin-001', name: 'Mehedi Admin', email: formData.email,
            phone: '+8801720267213', address: 'Dhonaid, Ashulia', measurements: [], role: 'admin' as const
          };
          setAdminUser(admin);
          navigate('/admin/dashboard');
        } else if (formData.email === 'worker@meheditailors.com' && formData.password === 'worker123') {
          const worker = {
            id: 'worker-001', name: 'Kabir Artisan', email: formData.email,
            phone: '+8801711122233', address: 'Worker Quarters, Savar', measurements: [], role: 'worker' as const,
            specialization: 'Master Stitcher'
          };
          setWorkerUser(worker);
          navigate('/worker/dashboard');
        } else {
          // Automatic Customer Creation for Demo
          const demoUser = {
            id: 'u' + Math.random().toString(36).substr(2, 5),
            name: 'Valued Customer', email: formData.email, phone: '+880 17XXX-XXXXXX',
            address: 'Ashulia, Savar, Dhaka', measurements: [], role: 'customer' as const
          };
          setUser(demoUser);
          navigate('/dashboard');
        }
      } else if (mode === 'register') {
        const newUser = {
          id: 'u' + Math.random().toString(36).substr(2, 5),
          name: formData.name || 'Valued Customer',
          email: formData.email, phone: formData.phone || '+880 1XXX-XXXXXX',
          address: 'Ashulia, Savar, Dhaka', measurements: [], role: 'customer' as const
        };
        registerNewUser(newUser).then(() => {
          setUser(newUser);
          navigate('/dashboard');
        });
      } else {
        setMode('reset-sent');
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1594932224828-b4b059b6f6f9?q=80&w=2080&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" alt="Bespoke" />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
        <div className="absolute bottom-20 left-20 text-white max-w-md">
          <h2 className="text-5xl font-bold serif mb-6">Hand-Crafted Heritage.</h2>
          <p className="text-lg text-slate-200 font-light">Enter the world of Mehedi Tailors. Where every stitch tells a story of Savar's finest tailoring.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-24 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right-4 duration-700">
          <Link to="/" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 mb-12 transition"><ChevronLeftIcon className="w-4 h-4 mr-1" />Back to Store</Link>

          {mode === 'reset-sent' ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold serif mb-4">Email Dispatched</h1>
              <p className="text-slate-500 mb-10 leading-relaxed">Check <span className="text-slate-900 font-bold">{formData.email}</span> for instructions.</p>
              <button onClick={() => setMode('login')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest transition">Return to Login</button>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold serif mb-2">{mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join Us' : 'Recover Access'}</h1>
              <p className="text-slate-500 mb-10">{mode === 'login' ? 'Sign in to access your measurements.' : 'Start your bespoke journey with Mehedi.'}</p>

              {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-widest border border-red-100">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Name</label>
                    <div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input required name="name" onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600/20" /></div>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email</label>
                  <div className="relative"><EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600/20" /></div>
                </div>
                {mode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone</label>
                    <div className="relative"><PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input required name="phone" onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600/20" /></div>
                  </div>
                )}
                {mode !== 'forgot-password' && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center"><label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Password</label>{mode === 'login' && <button type="button" onClick={() => setMode('forgot-password')} className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Forgot?</button>}</div>
                    <div className="relative"><LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600/20" /></div>
                  </div>
                )}
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-800 transition shadow-xl">{loading ? 'Verifying...' : mode === 'login' ? 'Sign In' : 'Create Account'}</button>
              </form>

              <div className="mt-10 text-center text-xs">
                <p className="text-slate-500">{mode === 'login' ? "New to Mehedi? " : "Already registered? "}<button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-amber-600 font-bold hover:underline">{mode === 'login' ? 'Register Now' : 'Sign In'}</button></p>
                <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center space-x-4">
                  <Link to="/admin/login" className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition">Admin Access</Link>
                  <span className="text-slate-200">|</span>
                  <button onClick={() => { setFormData({email:'worker@meheditailors.com', password:'worker123', name:'', phone:''}); setMode('login'); }} className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition">Worker Access</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
