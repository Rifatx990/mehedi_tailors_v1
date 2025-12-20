
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { useNavigate, Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon, 
  ChevronLeftIcon,
  ExclamationCircleIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { setUser, setAdminUser, registerNewUser, allUsers } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '', password: '', name: '', phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate Network Latency for Global Handshake
    setTimeout(async () => {
      if (mode === 'login') {
        const found = allUsers.find(u => 
          u.email.toLowerCase() === formData.email.toLowerCase() && 
          u.password === formData.password
        );
        
        if (found) {
          if (found.role === 'admin') {
             setAdminUser(found);
             navigate('/admin/dashboard');
          } else {
             setUser(found);
             navigate('/dashboard');
          }
        } else {
          setError('Authentication failed. Verify credentials in the Global Ledger.');
        }
      } else {
        const exists = allUsers.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
        if (exists) {
          setError('Patron identity already exists in our archive.');
          setLoading(false);
          return;
        }

        const newUser = {
          id: 'u' + Math.random().toString(36).substr(2, 5),
          name: formData.name || 'Valued Patron',
          email: formData.email, 
          phone: formData.phone || '+880 1XXX-XXXXXX',
          address: 'Ashulia, Savar, Dhaka', 
          measurements: [], 
          role: 'customer' as const,
          password: formData.password 
        };
        
        await registerNewUser(newUser);
        setUser(newUser);
        navigate('/dashboard');
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src="https://images.unsplash.com/photo-1594932224828-b4b059b6f6f9?q=80&w=2080&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
        <div className="absolute bottom-20 left-20 text-white max-w-md">
          <h2 className="text-5xl font-bold serif mb-6 tracking-tight">Artisan Heritage.</h2>
          <p className="text-lg text-slate-300 font-light leading-relaxed">Enter the digital world of Mehedi Tailors. Where craftsmanship meets global connectivity.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 mb-12"><ChevronLeftIcon className="w-4 h-4 mr-1" />Back to Store</Link>
          
          <h1 className="text-4xl font-bold serif mb-2 text-slate-900">{mode === 'login' ? 'Patron Sign In' : 'Join the Atelier'}</h1>
          <p className="text-slate-500 mb-10 text-sm">Access your bespoke silhouettes and order pipeline.</p>

          {error && (
            <div className="mb-6 p-5 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center space-x-3">
              <ExclamationCircleIcon className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input required name="name" onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-12 pr-4 py-5 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold" placeholder="Arif Ahmed" />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure Email</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input required type="email" name="email" onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-12 pr-4 py-5 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold" placeholder="patron@gmail.com" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Security Key</label>
              <div className="relative">
                <FingerPrintIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                <input required type="password" name="password" onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-12 pr-4 py-5 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-3xl hover:bg-amber-600 transition-all disabled:opacity-50">
              {loading ? 'Consulting Global Ledger...' : mode === 'login' ? 'Authenticate Access' : 'Register Identity'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-xs text-slate-500 hover:text-amber-600 transition font-bold">
              {mode === 'login' ? "New to the archive? Create Identity" : "Already registered? Authenticate"}
            </button>
            <div className="mt-8 pt-8 border-t border-slate-200">
               <Link to="/admin/login" className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-slate-900 transition">Administrative Staff Entrance</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
