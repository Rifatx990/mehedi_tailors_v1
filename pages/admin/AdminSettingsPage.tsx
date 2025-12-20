
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
  SwatchIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  CloudArrowUpIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const AdminSettingsPage: React.FC = () => {
  const { systemConfig, updateSystemConfig, isHydrated, exportDb, importDb, resetSystemData } = useStore();
  const [form, setForm] = useState(systemConfig);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isHydrated) setForm(systemConfig);
  }, [isHydrated, systemConfig]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setTimeout(() => {
      updateSystemConfig(form);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      if (window.confirm("Importing a database file will overwrite all current records. Continue?")) {
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
            <span className="text-[10px] font-bold uppercase tracking-widest">Global Infrastructure</span>
          </div>
          <h1 className="text-5xl font-bold serif text-slate-900 tracking-tight">System Configuration</h1>
        </header>

        <div className="max-w-5xl space-y-12 pb-20">
          
          {/* BRANDING CONFIGURATION - NEW SECTION */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="bg-amber-600 p-10 text-white">
                <div className="flex items-center space-x-3 mb-1">
                   <PhotoIcon className="w-6 h-6 text-white" />
                   <h2 className="text-2xl font-bold serif">Document Branding</h2>
                </div>
                <p className="text-amber-100 text-xs uppercase tracking-widest mt-1 font-bold">Logo & Identity Persistence</p>
             </div>
             
             <div className="p-10 md:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Official Site Title</label>
                         <input value={form.siteName} onChange={e => setForm({...form, siteName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none font-bold" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Shop Logo URL (Document Header)</label>
                         <div className="relative group">
                            <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-600 transition-colors" />
                            <input value={form.siteLogo} onChange={e => setForm({...form, siteLogo: e.target.value})} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-4 rounded-2xl outline-none font-mono text-xs" placeholder="https://..." />
                         </div>
                         <p className="text-[9px] text-slate-400 mt-2 italic px-1">* This logo is automatically injected into all automated and manual email documents.</p>
                      </div>
                   </div>
                   <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-6">Logo Header Preview</p>
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 max-w-full overflow-hidden">
                         {form.siteLogo ? (
                           <img src={form.siteLogo} alt="Logo" className="max-h-16 w-auto object-contain mx-auto" />
                         ) : (
                           <div className="h-16 w-40 flex items-center justify-center text-slate-300 italic text-xs font-bold uppercase">No Logo URL</div>
                         )}
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* DATABASE MAINTENANCE */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="bg-teal-600 p-10 text-white">
                <div className="flex items-center space-x-3 mb-1">
                   <ServerStackIcon className="w-6 h-6 text-white" />
                   <h2 className="text-2xl font-bold serif">Database Engine (IndexedDB)</h2>
                </div>
                <p className="text-teal-100 text-xs uppercase tracking-widest mt-1 font-bold">Manage persistent "File" Storage</p>
             </div>
             
             <div className="p-10 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between">
                      <div>
                         <h4 className="font-bold text-slate-900 mb-2 flex items-center space-x-2">
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            <span>Export DB File</span>
                         </h4>
                         <p className="text-xs text-slate-500 leading-relaxed">Download a structured JSON "file" containing all products, orders, and system logs. Highly recommended for weekly backups.</p>
                      </div>
                      <button onClick={exportDb} className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition shadow-lg">Download Backup .JSON</button>
                   </div>
                   
                   <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between">
                      <div>
                         <h4 className="font-bold text-slate-900 mb-2 flex items-center space-x-2">
                            <ArrowUpTrayIcon className="w-4 h-4" />
                            <span>Import DB File</span>
                         </h4>
                         <p className="text-xs text-slate-500 leading-relaxed">Restore the entire system state from a previously exported JSON file. This will replace all current data.</p>
                      </div>
                      <input type="file" ref={importInputRef} onChange={handleImport} className="hidden" accept=".json" />
                      <button onClick={() => importInputRef.current?.click()} className="mt-6 w-full py-4 bg-teal-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-teal-700 transition shadow-lg">Upload JSON Backup</button>
                   </div>
                </div>
                <div className="mt-8 flex justify-center">
                   <button 
                    onClick={() => { if(window.confirm('IRREVERSIBLE: This will wipe the local database files. Continue?')) resetSystemData(); }}
                    className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition"
                   >
                      <TrashIcon className="w-4 h-4" />
                      <span>Wipe Database Files</span>
                   </button>
                </div>
             </div>
          </div>

          {/* SMTP NOTIFICATION ENGINE */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
             <div className="bg-slate-900 p-10 text-white">
                <h2 className="text-2xl font-bold serif">TSX Notification Engine</h2>
                <p className="text-slate-400 text-xs uppercase tracking-widest mt-1 font-medium">Bespoke SMTP Logic & Simulation</p>
             </div>

             <form onSubmit={handleSave} className="p-10 md:p-12 space-y-12">
                <section>
                   <div className="flex items-center space-x-2 text-slate-400 mb-6">
                      <CloudArrowUpIcon className="w-5 h-5" />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Atelier Messaging Authority</h3>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Sender Master Name</label>
                         <input value={form.senderName} onChange={e => setForm({...form, senderName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">System Outbound Email</label>
                         <input type="email" value={form.senderEmail} onChange={e => setForm({...form, senderEmail: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none" />
                      </div>
                   </div>
                </section>

                <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100">
                   <div className="flex items-start space-x-4">
                      <ShieldCheckIcon className="w-6 h-6 text-amber-600 mt-1" />
                      <div>
                         <h4 className="text-sm font-bold text-slate-900">Virtual Simulation Active</h4>
                         <p className="text-xs text-slate-600 leading-relaxed mt-1">In this environment, "Send Email" triggers a TSX internal dispatch to the <strong>Atelier Outbox</strong>. This logs the data permanently for your inspection as if a real SMTP server had processed it.</p>
                      </div>
                   </div>
                </div>

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
