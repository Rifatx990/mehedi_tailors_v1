
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PaintBrushIcon, 
  CloudArrowUpIcon, 
  PhotoIcon, 
  TrashIcon, 
  GlobeAltIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  RectangleStackIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SparklesIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

const AdminBrandingPage: React.FC = () => {
  const { systemConfig, updateSystemConfig } = useStore();
  const [form, setForm] = useState(systemConfig);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [imgErrors, setImgErrors] = useState<{siteLogo?: boolean, documentLogo?: boolean}>({});
  
  const siteFileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal form when system config loads
  useEffect(() => {
    setForm(systemConfig);
  }, [systemConfig]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'siteLogo' | 'documentLogo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Only allow images
    if (!file.type.startsWith('image/')) {
      alert("Invalid file format. Please select an image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, [target]: reader.result as string }));
      setImgErrors(prev => ({ ...prev, [target]: false }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    
    try {
      // Ensure data is pushed to global state and virtual filesystem (database.json)
      await updateSystemConfig(form);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error("Branding update failed:", err);
      setSaveStatus('idle');
      alert("System failed to synchronize branding records.");
    }
  };

  const resetLogo = (target: 'siteLogo' | 'documentLogo') => {
    setForm(prev => ({ ...prev, [target]: '' }));
    setImgErrors(prev => ({ ...prev, [target]: false }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <span className="w-8 h-px bg-amber-600"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Identity Governance</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold serif text-slate-900 tracking-tight">Branding Studio</h1>
            <p className="text-slate-400 mt-2 text-sm max-w-lg font-medium leading-relaxed">
              Updates are written to the root <strong>database.json</strong> and affect all patron-facing touchpoints.
            </p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="w-full lg:w-auto bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
          >
            {saveStatus === 'saving' ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
            <span>{saveStatus === 'saving' ? 'Synchronizing...' : saveStatus === 'success' ? 'Branding Saved' : 'Commit Changes'}</span>
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
           {/* Section 1: Main Site Logo (Navigation/Footer) */}
           <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden group">
              <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                    <RectangleStackIcon className="w-6 h-6 text-amber-500" />
                    <h2 className="text-xl font-bold serif">Primary Site Logo</h2>
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Live Navigation</span>
              </div>
              
              <div className="p-10 space-y-10">
                 {/* Preview Box */}
                 <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-10 flex flex-col items-center justify-center relative group/preview min-h-[200px]">
                    {form.siteLogo && !imgErrors.siteLogo ? (
                       <div className="flex flex-col items-center">
                          <img 
                            src={form.siteLogo} 
                            className="max-h-24 w-auto object-contain transition-transform duration-700 group-hover/preview:scale-110" 
                            referrerPolicy="no-referrer"
                            onError={() => setImgErrors(prev => ({...prev, siteLogo: true}))}
                          />
                          <button 
                            onClick={() => resetLogo('siteLogo')}
                            className="mt-6 text-[9px] font-black uppercase text-rose-500 opacity-0 group-hover/preview:opacity-100 transition-all"
                          >
                            Discard Asset
                          </button>
                       </div>
                    ) : (
                       <div className="text-center">
                          <PhotoIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No logo calibrated</p>
                       </div>
                    )}
                 </div>

                 {/* Input Methods */}
                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Asset Source (URL)</label>
                       <div className="relative group">
                          <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-amber-600 transition-colors" />
                          <input 
                            value={form.siteLogo || ''} 
                            onChange={e => { setForm({...form, siteLogo: e.target.value}); setImgErrors(prev => ({...prev, siteLogo: false})); }}
                            className="w-full bg-slate-50 border border-slate-100 pl-10 pr-4 py-4 rounded-xl outline-none font-mono text-[10px] focus:ring-4 focus:ring-amber-600/5 transition" 
                            placeholder="https://i.imgur.com/your-logo.png"
                          />
                       </div>
                    </div>

                    <div className="relative">
                       <div className="absolute inset-y-0 flex items-center">
                          <div className="h-px w-full bg-slate-100"></div>
                       </div>
                       <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest text-slate-300 bg-white px-4">Or</div>
                    </div>

                    <button 
                      onClick={() => siteFileInputRef.current?.click()}
                      className="w-full flex items-center justify-center space-x-3 py-5 bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-slate-200"
                    >
                       <CloudArrowUpIcon className="w-5 h-5" />
                       <span>Upload Photo File</span>
                    </button>
                    <input 
                      type="file" 
                      ref={siteFileInputRef} 
                      onChange={e => handleFileUpload(e, 'siteLogo')} 
                      className="hidden" 
                      accept="image/*" 
                    />
                 </div>
              </div>
           </div>

           {/* Section 2: Document Logo (Invoices/Receipts) */}
           <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden group">
              <div className="bg-teal-700 p-8 text-white flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                    <h2 className="text-xl font-bold serif">Document Identity</h2>
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-[0.2em] text-teal-200/50">Fiscal Invoices</span>
              </div>
              
              <div className="p-10 space-y-10">
                 {/* Preview Box */}
                 <div className="bg-slate-50 rounded-[2rem] border border-slate-100 p-10 flex flex-col items-center justify-center relative group/preview min-h-[200px]">
                    {form.documentLogo && !imgErrors.documentLogo ? (
                       <div className="flex flex-col items-center">
                          <img 
                            src={form.documentLogo} 
                            className="max-h-20 w-auto object-contain grayscale transition-all group-hover/preview:grayscale-0" 
                            referrerPolicy="no-referrer"
                            onError={() => setImgErrors(prev => ({...prev, documentLogo: true}))}
                          />
                          <p className="mt-4 text-[7px] font-black uppercase text-slate-400 tracking-widest">Printed Header Appearance</p>
                       </div>
                    ) : (
                       <div className="text-center">
                          <PhotoIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No document logo calibrated</p>
                       </div>
                    )}
                 </div>

                 {/* Input Methods */}
                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Asset Source (URL)</label>
                       <div className="relative group">
                          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-teal-600 transition-colors" />
                          <input 
                            value={form.documentLogo || ''} 
                            onChange={e => { setForm({...form, documentLogo: e.target.value}); setImgErrors(prev => ({...prev, documentLogo: false})); }}
                            className="w-full bg-slate-50 border border-slate-100 pl-10 pr-4 py-4 rounded-xl outline-none font-mono text-[10px] focus:ring-4 focus:ring-teal-600/5 transition" 
                            placeholder="https://..."
                          />
                       </div>
                    </div>

                    <button 
                      onClick={() => docFileInputRef.current?.click()}
                      className="w-full flex items-center justify-center space-x-3 py-5 bg-teal-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-teal-600/20"
                    >
                       <CloudArrowUpIcon className="w-5 h-5" />
                       <span>Upload High-Res Logo</span>
                    </button>
                    <input 
                      type="file" 
                      ref={docFileInputRef} 
                      onChange={e => handleFileUpload(e, 'documentLogo')} 
                      className="hidden" 
                      accept="image/*" 
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Global Branding Alert */}
        <div className="mt-12 p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-start space-x-6 shadow-sm">
           <ExclamationTriangleIcon className="w-8 h-8 text-amber-600 flex-shrink-0 mt-1" />
           <div>
              <h4 className="text-base font-black text-slate-900 uppercase tracking-widest">Artisan Identity Handshake</h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-2 font-medium italic">
                Synchronizing branding assets updates the global system configuration. All issued invoices, outbox logs, and patron-facing interfaces will be instantly updated to reflect the new artisan identity stored in <strong>database.json</strong>.
              </p>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminBrandingPage;
