
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { useNavigate, Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon, 
  PhoneIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-sent';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { setUser, setAdminUser, setWorkerUser, registerNewUser, allUsers, initiatePasswordReset } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '', password: '', name: '', phone: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'forgot-password') {
        const success = await initiatePasswordReset(formData.email);
        if (success) {
            setMode('reset-sent');
        } else {
            setError('This email identity is not registered in our artisan archive.');
        }
        setLoading(false);
        return;
    }

    setTimeout(() => {
      if (mode === 'login') {
        const found = allUsers.find(u => 
          u.email.toLowerCase() === formData.email.toLowerCase() && 
          u.password === formData.password
        );
        
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
        } else {
          setError('Authentication failed. Invalid credentials or unregistered account.');
        }
      } else if (mode === 'register') {
        const exists = allUsers.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
        if (exists) {
          setError('A patron account with this email already exists in our registry.');
          setLoading(false);
          return;
        }

        const newUser = {
          id: 'u' + Math.random().toString(36).substr(2, 5),
          name: formData.name || 'Valued Customer',
          email: formData.email, 
          phone: formData.phone || '+880 1XXX-XXXXXX',
          address: 'Ashulia, Savar, Dhaka', 
          measurements: [], 
          role: 'customer' as const,
          password: formData.password 
        };
        
        registerNewUser(newUser).then(() => {
          setUser(newUser);
          navigate('/dashboard');
        });
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
              <CheckCircleIcon className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold serif mb-4 text-slate-900">Protocol Dispatched</h1>
              <p className="text-slate-500 mb-10 leading-relaxed">We have transmitted a secure recovery token to <span className="text-slate-900 font-bold">{formData.email}</span>. Verify your identity via our outbox log or your inbox.</p>
              <button onClick={() => setMode('login')} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-600 transition-all">Return to Entrance</button>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-bold serif mb-2 text-slate-900">
                {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Join Us' : 'Access Recovery'}
              </h1>
              <p className="text-slate-500 mb-10">
                {mode === 'login' ? 'Sign in to access your bespoke profiles.' : mode === 'register' ? 'Start your handcrafted journey with Mehedi.' : 'Verify your identity to regain atelier access.'}
              </p>

              {error && (
                <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-rose-100 flex items-center space-x-3">
                  <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input required name="name" onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600/20" placeholder="Full Name" />
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600/20" placeholder="email@example.com" />
                  </div>
                </div>
                {mode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input required name="phone" onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600/20" placeholder="+880 1XXXXXXXXX" />
                    </div>
                  </div>
                )}
                {mode === 'login' && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Security Key (Password)</label>
                      <button type="button" onClick={() => setMode('forgot-password')} className="text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700">Forgot Key?</button>
                    </div>
                    <div className="relative">
                      <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600/20" placeholder="••••••••" />
                    </div>
                  </div>
                )}
                {mode === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Establish Security Key</label>
                    <div className="relative">
                      <FingerPrintIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-600/20" placeholder="••••••••" />
                    </div>
                  </div>
                )}
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition shadow-xl disabled:opacity-50 active:scale-[0.98]">
                  {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Join Atelier' : 'Initiate Recovery'}
                </button>
                {mode === 'forgot-password' && (
                    <button type="button" onClick={() => setMode('login')} className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900">Cancel Recovery</button>
                )}
              </form>

              <div className="mt-10 text-center text-xs">
                <p className="text-slate-500">{mode === 'login' ? "New to Mehedi? " : mode === 'register' ? "Already registered? " : ""}<button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-amber-600 font-bold hover:underline">{mode === 'login' ? 'Register Now' : (mode === 'register' ? 'Sign In' : '')}</button></p>
                <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center space-x-4">
                  <Link to="/admin/login" className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition">Staff Control</Link>
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
