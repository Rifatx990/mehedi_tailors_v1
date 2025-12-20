
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  EnvelopeIcon, 
  ShieldCheckIcon,
  ServerStackIcon,
  FingerPrintIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CloudArrowUpIcon,
  GlobeAltIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  LockClosedIcon,
  CircleStackIcon,
  GiftIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AdminSettingsPage: React.FC = () => {
  const { systemConfig, updateSystemConfig, isHydrated, syncToServer } = useStore();
  const [form, setForm] = useState(systemConfig);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isHydrated) setForm(systemConfig);
  }, [isHydrated, systemConfig]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    try {
      await updateSystemConfig(form);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('idle');
    }
  };

  const handleManualSync = async () => {
    setSaveStatus('saving');
    await syncToServer();
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-6 md:p-16">
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <span className="w-8 h-px bg-amber-600"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Global Governance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold serif text-slate-900 tracking-tight">System Parameters</h1>
            <p className="text-slate-400 mt-2 text-sm max-w-lg font-medium">Unified world state configuration across all user nodes.</p>
          </div>
          <button 
            onClick={handleManualSync}
            disabled={saveStatus === 'saving'}
            className="w-full lg:w-auto bg-emerald-600 text-white px-10 py-5 rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] shadow-2xl flex items-center justify-center space-x-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {saveStatus === 'saving' ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CircleStackIcon className="w-4 h-4" />}
            <span>{saveStatus === 'success' ? 'Ledger Synchronized' : 'Push Global Handshake'}</span>
          </button>
        </header>

        <div className="max-w-6xl space-y-12 pb-24">
          {/* GIFT CARD SUBSYSTEM */}
          <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="bg-indigo-700 p-10 text-white flex justify-between items-center">
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                      <GiftIcon className="w-9 h-9" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold serif">Digital Currency Protocol</h2>
                      <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mt-1">Consumer Buy-System Visibility</p>
                   </div>
                </div>
                <button 
                  onClick={() => setForm({...form, giftCardsEnabled: !form.giftCardsEnabled})}
                  className={`w-14 h-8 rounded-full transition-all relative ${form.giftCardsEnabled ? 'bg-emerald-500' : 'bg-white/20'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-xl ${form.giftCardsEnabled ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>
             
             <div className="p-10 md:p-14 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4 ml-2">Redemption Denominations (CSV)</label>
                      <input 
                        value={form.giftCardDenominations?.join(', ')} 
                        onChange={e => setForm({...form, giftCardDenominations: e.target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v))})}
                        className="w-full bg-slate-50 border border-slate-100 px-8 py-6 rounded-[1.8rem] outline-none font-black text-xl text-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition shadow-inner" 
                      />
                   </div>
                   <div className="flex items-start space-x-4 p-6 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
                      <InformationCircleIcon className="w-7 h-7 text-indigo-500 shrink-0" />
                      <p className="text-xs text-indigo-700 leading-relaxed font-medium">These denominations populate the interactive voucher cards on the artisan storefront. All issued codes are stored in the global JSON ledger.</p>
                   </div>
                </div>
             </div>
          </div>

          {/* SMTP NOTIFICATION BRIDGE */}
          <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="bg-slate-900 p-10 text-white flex justify-between items-center">
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 bg-amber-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                      <EnvelopeIcon className="w-9 h-9" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold serif">Notification Bridge</h2>
                      <p className="text-slate-400 text-[10px] uppercase tracking-widest mt-1 font-black">Transactional Mail Handshake (SMTP)</p>
                   </div>
                </div>
                <div className="flex items-center space-x-4 bg-white/5 px-6 py-2 rounded-xl border border-white/10">
                   <div className={`w-2 h-2 rounded-full ${form.isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{form.isEnabled ? 'Bridge Live' : 'Bridge Terminated'}</span>
                </div>
             </div>

             <form onSubmit={handleSave} className="p-10 md:p-14 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Gateway Host</label>
                      <input required value={form.smtpHost} onChange={e => setForm({...form, smtpHost: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none font-mono text-sm focus:ring-4 focus:ring-amber-600/5 transition" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Secure Port</label>
                      <input required type="number" value={form.smtpPort} onChange={e => setForm({...form, smtpPort: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none font-mono text-sm focus:ring-4 focus:ring-amber-600/5 transition" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Auth Identifier (User)</label>
                      <input required value={form.smtpUser} onChange={e => setForm({...form, smtpUser: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none text-sm focus:ring-4 focus:ring-amber-600/5 transition" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Bridge Passkey</label>
                      <div className="relative">
                         <input required type={showPassword ? "text" : "password"} value={form.smtpPass} onChange={e => setForm({...form, smtpPass: e.target.value})} className="w-full bg-slate-50 border border-slate-100 pl-6 pr-12 py-5 rounded-2xl outline-none text-sm focus:ring-4 focus:ring-amber-600/5 transition" />
                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-amber-600 transition-colors">
                            <KeyIcon className="w-5 h-5" />
                         </button>
                      </div>
                   </div>
                   <div className="space-y-3 flex flex-col justify-end">
                      <label className="flex items-center space-x-4 bg-slate-900 p-5 rounded-2xl border border-white/5 cursor-pointer shadow-xl">
                         <input type="checkbox" checked={form.isEnabled} onChange={e => setForm({...form, isEnabled: e.target.checked})} className="w-6 h-6 accent-amber-600" />
                         <span className="text-[10px] font-black uppercase tracking-widest text-white">Activate Communications</span>
                      </label>
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                   <div className="flex items-start space-x-4 max-w-2xl">
                      <ExclamationTriangleIcon className="w-8 h-8 text-amber-500 shrink-0" />
                      <p className="text-[10px] text-slate-500 leading-relaxed font-bold italic">Verification of SMTP handshakes occurs in real-time. Invalid credentials will cause failures in order notification dispatches. Updates are world-synced.</p>
                   </div>
                   <button type="submit" className="w-full sm:w-auto bg-slate-900 text-white px-16 py-6 rounded-[2rem] font-bold uppercase tracking-[0.3em] text-[10px] shadow-3xl hover:bg-emerald-600 transition-all active:scale-[0.98]">
                      Sign Protocol Update
                   </button>
                </div>
             </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettingsPage;
