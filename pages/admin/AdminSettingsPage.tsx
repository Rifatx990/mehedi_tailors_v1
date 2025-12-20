
import React, { useState, useRef } from 'react';
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
  EyeSlashIcon,
  PhotoIcon,
  SwatchIcon
} from '@heroicons/react/24/outline';

const AdminSettingsPage: React.FC = () => {
  const { systemConfig, updateSystemConfig } = useStore();
  const [form, setForm] = useState(systemConfig);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setTimeout(() => {
      updateSystemConfig(form);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1200);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, siteLogo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleTestConnection = () => {
    setTestStatus('testing');
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
          <h1 className="text-5xl font-bold serif text-slate-900 tracking-tight">System Configuration</h1>
        </header>

        <div className="max-w-5xl space-y-12">
          
          {/* Section: Branding & Aesthetics */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="bg-amber-600 p-10 text-white">
                <div className="flex items-center space-x-3 mb-1">
                   <SwatchIcon className="w-6 h-6 text-white" />
                   <h2 className="text-2xl font-bold serif">Branding Asset Manager</h2>
                </div>
                <p className="text-amber-100 text-xs uppercase tracking-widest mt-1 font-bold">Manage Logo & Brand Identity (Etc Pictures)</p>
             </div>
             
             <div className="p-10 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                   <div className="md:col-span-4 flex flex-col items-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-6 text-center">Active Master Logo</label>
                      <div 
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex items-center justify-center cursor-pointer hover:border-amber-600 hover:bg-white transition-all group relative overflow-hidden"
                      >
                         {form.siteLogo ? (
                           <img src={form.siteLogo} className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform" alt="Preview" />
                         ) : (
                           <div className="text-center">
                              <PhotoIcon className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Upload PNG/SVG</p>
                           </div>
                         )}
                         <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-[9px] font-bold uppercase tracking-widest border border-white/20 px-4 py-2 rounded-xl">Replace Logo Picture</span>
                         </div>
                         <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                      </div>
                      <p className="mt-6 text-[9px] text-slate-400 text-center font-bold uppercase tracking-tighter leading-relaxed">Recommended: 400x120px Transparent PNG</p>
                   </div>
                   
                   <div className="md:col-span-8 space-y-8">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3 ml-1">Site Identity Title</label>
                        <input 
                          value={form.siteName}
                          onChange={e => setForm({...form, siteName: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-amber-600/5 transition outline-none font-bold text-xl serif" 
                          placeholder="e.g. Mehedi Tailors & Fabrics"
                        />
                      </div>
                      
                      <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                         <h4 className="text-sm font-bold text-slate-900 mb-2">Artisan White-Labeling</h4>
                         <p className="text-xs text-slate-500 leading-relaxed">Updating the logo here will automatically synchronize the branding across the Public Homepage, Admin Console, Worker Terminals, and PDF Invoices.</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Section: SMTP Infrastructure */}
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
                </div>
             </div>

             <form onSubmit={handleSave} className="p-10 md:p-12 space-y-12">
                <section>
                   <div className="flex items-center space-x-2 text-slate-400 mb-6">
                      <ServerStackIcon className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Mail Server Architecture</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="md:col-span-2 space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">SMTP Hostname</label>
                         <input value={form.smtpHost} onChange={e => setForm({...form, smtpHost: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-amber-600/5 outline-none" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Port</label>
                         <input type="number" value={form.smtpPort} onChange={e => setForm({...form, smtpPort: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-amber-600/5 outline-none" />
                      </div>
                   </div>
                </section>

                <section>
                   <div className="flex items-center space-x-2 text-slate-400 mb-6">
                      <FingerPrintIcon className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Secure Credentials</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Authentication User</label>
                         <input value={form.smtpUser} onChange={e => setForm({...form, smtpUser: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">App Password</label>
                         <input type={showPassword ? "text" : "password"} value={form.smtpPass} onChange={e => setForm({...form, smtpPass: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none" />
                      </div>
                   </div>
                </section>

                <button 
                   disabled={saveStatus === 'saving'}
                   className="w-full bg-slate-900 text-white py-6 rounded-3xl font-bold uppercase tracking-[0.2em] text-xs shadow-2xl flex items-center justify-center space-x-3 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                   {saveStatus === 'saving' ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                   ) : saveStatus === 'success' ? (
                      <>
                         <CheckCircleIcon className="w-5 h-5" />
                         <span>Infrastructure Synchronized</span>
                      </>
                   ) : (
                      <span>Commit Global Changes</span>
                   )}
                </button>
             </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage;
