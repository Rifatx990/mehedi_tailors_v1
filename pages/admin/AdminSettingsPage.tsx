
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  EnvelopeIcon, 
  CheckCircleIcon,
  ShieldCheckIcon,
  ServerStackIcon,
  FingerPrintIcon,
  BoltIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  CloudArrowUpIcon,
  GlobeAltIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LockClosedIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

const AdminSettingsPage: React.FC = () => {
  const { systemConfig, updateSystemConfig, isHydrated, exportDb, importDb } = useStore();
  const [form, setForm] = useState(systemConfig);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isHydrated) setForm(systemConfig);
  }, [isHydrated, systemConfig]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    // Artificial delay to simulate industrial persistence handshake
    setTimeout(() => {
      updateSystemConfig(form);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  const removeSmtp = () => {
    if (window.confirm("CRITICAL: Remove SMTP credentials? All automated transaction emails will cease immediately.")) {
      const emptySmtp = {
        ...form,
        smtpHost: '',
        smtpPort: 465,
        smtpUser: '',
        smtpPass: '',
        isEnabled: false
      };
      setForm(emptySmtp);
      updateSystemConfig(emptySmtp);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      if (window.confirm("DANGER: Overwrite local database with imported payload? This cannot be undone.")) {
        importDb(json);
      }
    };
    reader.readAsText(file);
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12">
          <div className="flex items-center space-x-3 text-amber-600 mb-2">
            <span className="w-8 h-px bg-amber-600"></span>
            <span className="text-[10px] font-black uppercase tracking-widest">Global Infrastructure Control</span>
          </div>
          <h1 className="text-5xl font-bold serif text-slate-900 tracking-tight">Atelier Parameters</h1>
          <p className="text-slate-400 mt-2 text-sm max-w-lg font-medium leading-relaxed">
             Directly modifying these values updates the root-level configuration inside the virtual database.json file.
          </p>
        </header>

        <div className="max-w-6xl space-y-12 pb-20">
          
          {/* SMTP BRIDGE CONTROL */}
          <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden group">
             <div className="bg-slate-900 p-10 text-white flex justify-between items-center transition-all group-hover:bg-slate-950">
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 bg-amber-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
                      <EnvelopeIcon className="w-9 h-9 text-white" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold serif">SMTP Notification Bridge</h2>
                      <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1 font-black">Transactional Mail Protocol (Auto-Saved)</p>
                   </div>
                </div>
                <div className="flex items-center space-x-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                   <div className={`w-3 h-3 rounded-full ${form.isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-white">{form.isEnabled ? 'Bridge Active' : 'Bridge Offline'}</span>
                </div>
             </div>

             <div className="p-10 md:p-14">
                <form onSubmit={handleSave} className="space-y-10">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Gateway Host</label>
                         <div className="relative">
                            <ServerStackIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                            <input required value={form.smtpHost} onChange={e => setForm({...form, smtpHost: e.target.value})} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-5 rounded-2xl outline-none font-mono text-xs focus:ring-4 focus:ring-amber-600/5 transition shadow-inner" placeholder="smtp.gmail.com" />
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Secure Port</label>
                         <input required type="number" value={form.smtpPort} onChange={e => setForm({...form, smtpPort: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none font-mono text-sm focus:ring-4 focus:ring-amber-600/5 transition shadow-inner" placeholder="465" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Protocol Handshake</label>
                         <div className="relative">
                            <ShieldCheckIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                            <select value={form.secure ? 'ssl' : 'tls'} onChange={e => setForm({...form, secure: e.target.value === 'ssl'})} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-5 rounded-2xl outline-none text-[10px] font-black uppercase tracking-widest appearance-none focus:ring-4 focus:ring-amber-600/5 transition shadow-inner">
                                <option value="ssl">SSL Enforcement</option>
                                <option value="tls">STARTTLS Policy</option>
                            </select>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Auth User (Email)</label>
                         <div className="relative">
                            <FingerPrintIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                            <input required value={form.smtpUser} onChange={e => setForm({...form, smtpUser: e.target.value})} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-5 rounded-2xl outline-none text-sm focus:ring-4 focus:ring-amber-600/5 transition shadow-inner" placeholder="orders@mehedi.com" />
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Bridge Passkey</label>
                         <div className="relative">
                            <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-300" />
                            <input required type={showPassword ? "text" : "password"} value={form.smtpPass} onChange={e => setForm({...form, smtpPass: e.target.value})} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-12 py-5 rounded-2xl outline-none text-sm focus:ring-4 focus:ring-amber-600/5 transition shadow-inner" placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600 transition-colors">
                               <KeyIcon className="w-5 h-5" />
                            </button>
                         </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Global Enable</label>
                        <div className="flex h-[66px] items-center px-6 bg-slate-900 rounded-2xl shadow-xl transition-all group-hover:bg-slate-950 border border-white/5">
                           <input type="checkbox" checked={form.isEnabled} onChange={e => setForm({...form, isEnabled: e.target.checked})} className="w-6 h-6 accent-amber-600 rounded-lg cursor-pointer" />
                           <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-white">Live Dispatches</span>
                        </div>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t border-slate-50">
                      <button 
                        type="submit" 
                        disabled={saveStatus === 'saving'}
                        className="flex-grow bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-amber-600 transition-all flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50"
                      >
                         {saveStatus === 'saving' ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <ShieldCheckIcon className="w-5 h-5" />}
                         <span>{saveStatus === 'success' ? 'Database Synchronized' : 'Commit Bridge Update'}</span>
                      </button>
                      <button 
                        type="button"
                        onClick={removeSmtp}
                        className="px-10 py-6 bg-red-50 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center space-x-3"
                      >
                         <TrashIcon className="w-5 h-5" />
                         <span className="hidden sm:inline">Flush Credentials</span>
                      </button>
                   </div>
                </form>

                <div className="mt-12 p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-start space-x-6 shadow-sm">
                   <ExclamationTriangleIcon className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
                   <div>
                      <h4 className="text-base font-black text-slate-900 uppercase tracking-widest">Digital Sovereignty Protocol</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-2 font-medium italic">
                        "Changes to the SMTP gateway are written directly to the virtual file system. If using third-party relays like Gmail, ensure an App Password is generated. Standard logins will be intercepted by global security headers."
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {/* PERSISTENCE ENGINE MAINTENANCE */}
          <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden group">
             <div className="bg-emerald-700 p-10 text-white transition-all group-hover:bg-emerald-800">
                <div className="flex items-center space-x-5">
                   <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur shadow-xl border border-white/10">
                      <CircleStackIcon className="w-8 h-8 text-white" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold serif">Atomic Persistence Engine</h2>
                      <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mt-1">Virtual database.json File Management</p>
                   </div>
                </div>
             </div>
             
             <div className="p-10 md:p-14">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-xl transition-all group/card">
                      <div className="mb-10">
                         <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover/card:scale-110 transition-transform">
                            <ArrowDownTrayIcon className="w-6 h-6" />
                         </div>
                         <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-3">Snapshot Payload</h4>
                         <p className="text-xs text-slate-500 leading-relaxed font-medium">Download the entire atelier state—orders, artisan scales, and SMTP bridges—as a structured JSON payload.</p>
                      </div>
                      <button onClick={exportDb} className="w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition shadow-2xl active:scale-95">Fetch Backup .JSON</button>
                   </div>
                   
                   <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-xl transition-all group/card">
                      <div className="mb-10">
                         <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover/card:scale-110 transition-transform">
                            <ArrowUpTrayIcon className="w-6 h-6" />
                         </div>
                         <h4 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-3">Override Registry</h4>
                         <p className="text-xs text-slate-500 leading-relaxed font-medium">Replace the current virtual disk with an external JSON payload. This will instantly refresh the atelier's live memory.</p>
                      </div>
                      <input type="file" ref={importInputRef} onChange={handleImport} className="hidden" accept=".json" />
                      <button onClick={() => importInputRef.current?.click()} className="w-full py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition shadow-2xl active:scale-95">Stream JSON Payload</button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage;
