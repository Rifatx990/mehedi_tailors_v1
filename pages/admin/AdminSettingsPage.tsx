
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  EnvelopeIcon, 
  KeyIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  ServerStackIcon,
  FingerPrintIcon,
  BoltIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const AdminSettingsPage: React.FC = () => {
  const { emailConfig, updateEmailConfig } = useStore();
  const [form, setForm] = useState(emailConfig);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setTimeout(() => {
      updateEmailConfig(form);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1200);
  };

  const handleTestConnection = () => {
    setTestStatus('testing');
    // Simulate SMTP Handshake
    setTimeout(() => {
      if (form.smtpHost && form.smtpUser && form.smtpPass) {
        setTestStatus('success');
      } else {
        setTestStatus('fail');
      }
      setTimeout(() => setTestStatus('idle'), 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12">
          <div className="flex items-center space-x-3 text-amber-600 mb-2">
            <span className="w-8 h-px bg-amber-600"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Global Infrastructure</span>
          </div>
          <h1 className="text-5xl font-bold serif text-slate-900 tracking-tight">System Settings</h1>
        </header>

        <div className="max-w-5xl">
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="bg-slate-900 p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                   <h2 className="text-2xl font-bold serif">SMTP Notification Engine</h2>
                   <p className="text-slate-400 text-xs uppercase tracking-widest mt-1 font-medium">Direct Mail Server Configuration</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                    className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center space-x-2 ${
                      testStatus === 'success' ? 'bg-emerald-500 text-white' : 
                      testStatus === 'fail' ? 'bg-red-500 text-white' : 
                      'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {testStatus === 'testing' ? (
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : <BoltIcon className="w-4 h-4" />}
                    <span>{testStatus === 'testing' ? 'Testing...' : testStatus === 'success' ? 'Link Ready' : testStatus === 'fail' ? 'Auth Failed' : 'Test Link'}</span>
                  </button>

                  <div className={`px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center space-x-2 ${form.isEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    <div className={`w-2 h-2 rounded-full ${form.isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
                    <span>{form.isEnabled ? 'Service Active' : 'Service Standby'}</span>
                  </div>
                </div>
             </div>

             <form onSubmit={handleSave} className="p-10 md:p-12 space-y-12">
                
                {/* Server Section */}
                <section>
                   <div className="flex items-center space-x-2 text-slate-400 mb-6">
                      <ServerStackIcon className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Mail Server Architecture</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">SMTP Hostname</label>
                         <input 
                            value={form.smtpHost}
                            onChange={e => setForm({...form, smtpHost: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-amber-600/5 transition outline-none font-medium" 
                            placeholder="e.g. smtp.gmail.com"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Port</label>
                         <input 
                            type="number"
                            value={form.smtpPort}
                            onChange={e => setForm({...form, smtpPort: parseInt(e.target.value)})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-amber-600/5 transition outline-none font-medium" 
                            placeholder="465"
                         />
                      </div>
                   </div>
                </section>

                {/* Authentication Section */}
                <section>
                   <div className="flex items-center space-x-2 text-slate-400 mb-6">
                      <FingerPrintIcon className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Secure Credentials</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Authentication User</label>
                         <div className="relative">
                            <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input 
                               value={form.smtpUser}
                               onChange={e => setForm({...form, smtpUser: e.target.value})}
                               className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-4 focus:ring-amber-600/5 transition outline-none font-medium" 
                               placeholder="user@gmail.com"
                            />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Security Key (App Password)</label>
                         <div className="relative">
                            <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input 
                               type={showPassword ? "text" : "password"}
                               value={form.smtpPass}
                               onChange={e => setForm({...form, smtpPass: e.target.value})}
                               className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-12 py-4 focus:ring-4 focus:ring-amber-600/5 transition outline-none font-medium" 
                               placeholder="••••••••••••••••"
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-amber-600 transition"
                            >
                              {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                            </button>
                         </div>
                      </div>
                   </div>
                </section>

                {/* Identity Section */}
                <section>
                   <div className="flex items-center space-x-2 text-slate-400 mb-6">
                      <ShieldCheckIcon className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Sender Profile</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">From Name</label>
                         <input 
                            value={form.senderName}
                            onChange={e => setForm({...form, senderName: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-amber-600/5 transition outline-none font-medium" 
                            placeholder="Mehedi Tailors & Fabrics"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Reply-To Address</label>
                         <input 
                            value={form.senderEmail}
                            onChange={e => setForm({...form, senderEmail: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-amber-600/5 transition outline-none font-medium" 
                            placeholder="orders@meheditailors.com"
                         />
                      </div>
                   </div>
                </section>

                <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-2xl shadow-sm transition-all ${form.secure ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                         <ShieldCheckIcon className="w-6 h-6" />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900 tracking-tight">SSL/TLS Enforcement</h4>
                         <p className="text-xs text-slate-500">Encrypt all outbound traffic (Recommended for Gmail/465)</p>
                      </div>
                   </div>
                   <button 
                      type="button"
                      onClick={() => setForm({...form, secure: !form.secure})}
                      className={`w-14 h-8 rounded-full transition-all relative shrink-0 ${form.secure ? 'bg-amber-600' : 'bg-slate-300'}`}
                   >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${form.secure ? 'left-7' : 'left-1'}`}></div>
                   </button>
                </div>

                <div className="p-8 bg-slate-900 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-2xl shadow-sm transition-all ${form.isEnabled ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-500'}`}>
                         <BoltIcon className="w-6 h-6" />
                      </div>
                      <div>
                         <h4 className="font-bold text-white tracking-tight">Automatic Order Receipts</h4>
                         <p className="text-xs text-slate-400">Trigger transactional emails immediately after checkout</p>
                      </div>
                   </div>
                   <button 
                      type="button"
                      onClick={() => setForm({...form, isEnabled: !form.isEnabled})}
                      className={`w-14 h-8 rounded-full transition-all relative shrink-0 ${form.isEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                   >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${form.isEnabled ? 'left-7' : 'left-1'}`}></div>
                   </button>
                </div>

                <button 
                   disabled={saveStatus === 'saving'}
                   className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold uppercase tracking-[0.2em] text-xs shadow-2xl shadow-slate-200 flex items-center justify-center space-x-3 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                   {saveStatus === 'saving' ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                   ) : saveStatus === 'success' ? (
                      <>
                         <CheckCircleIcon className="w-5 h-5" />
                         <span>Infrastructure Synchronized</span>
                      </>
                   ) : (
                      <span>Commit SMTP Changes</span>
                   )}
                </button>
             </form>
          </div>

          <div className="mt-12 p-12 bg-amber-50 rounded-[3rem] border border-amber-100 flex items-start space-x-8">
             <ExclamationCircleIcon className="w-10 h-10 text-amber-600 mt-1 shrink-0" />
             <div className="space-y-4">
                <h4 className="font-bold text-amber-900 text-xl serif">Gmail Configuration Guide</h4>
                <p className="text-sm text-amber-800 leading-relaxed opacity-90">
                   To use <span className="font-bold">smtp.gmail.com</span>, you must use an <strong>App Password</strong> rather than your primary Google password. 
                   Standard passwords will be rejected as insecure by Google’s mail relay.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest">
                   <div className="bg-white/50 p-4 rounded-2xl border border-amber-200">
                      <span className="text-amber-600 block mb-1">Recommended Port</span>
                      <span className="text-amber-900">465 (SSL) or 587 (TLS)</span>
                   </div>
                   <div className="bg-white/50 p-4 rounded-2xl border border-amber-200">
                      <span className="text-amber-600 block mb-1">Auth Type</span>
                      <span className="text-amber-900">LOGIN / PLAIN</span>
                   </div>
                </div>
                <p className="text-[10px] text-amber-700 italic">Note: Real-time SMTP requires a middle-tier relay (e.g. Node.js microservice) for browser security compatibility.</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage;
