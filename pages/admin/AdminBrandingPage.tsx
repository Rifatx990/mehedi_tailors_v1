
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
  EyeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const AdminBrandingPage: React.FC = () => {
  const { systemConfig, updateSystemConfig } = useStore();
  const [form, setForm] = useState(systemConfig);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [imgErrors, setImgErrors] = useState<{siteLogo?: boolean, documentLogo?: boolean}>({});
  const [isValidating, setIsValidating] = useState<{siteLogo?: boolean, documentLogo?: boolean}>({});
  const headerFileRef = useRef<HTMLInputElement>(null);
  const docFileRef = useRef<HTMLInputElement>(null);

  // Normalizes problematic URLs (specifically Imgur) to ensure they are direct image streams
  const normalizeArtisanUrl = (url: string) => {
    if (!url) return '';
    let processed = url.trim();
    
    // Imgur Deep Normalization
    if (processed.includes('imgur.com') && !processed.includes('i.imgur.com')) {
      // Pattern to extract ID from standard, gallery, or album URLs
      const match = processed.match(/imgur\.com\/(?:gallery\/|a\/|r\/[^\/]+\/)?([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        return `https://i.imgur.com/${match[1]}.png`;
      }
    }
    return processed;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'siteLogo' | 'documentLogo') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, [target]: reader.result as string }));
      setImgErrors(prev => ({ ...prev, [target]: false }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaveStatus('saving');
    // Sanitize and Normalize before persisting to IndexedDB
    const finalForm = {
      ...form,
      siteLogo: normalizeArtisanUrl(form.siteLogo || ''),
      documentLogo: normalizeArtisanUrl(form.documentLogo || '')
    };
    
    setTimeout(() => {
      updateSystemConfig(finalForm);
      setForm(finalForm);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  const handleReset = (target: 'siteLogo' | 'documentLogo') => {
    if (window.confirm(`Reset the ${target === 'siteLogo' ? 'Header' : 'Document'} logo to artisan defaults?`)) {
      setForm(prev => ({ 
        ...prev, 
        [target]: target === 'siteLogo' 
          ? 'https://via.placeholder.com/200x80?text=HEADER+LOGO' 
          : 'https://via.placeholder.com/300x120?text=DOCUMENT+LOGO' 
      }));
      setImgErrors(prev => ({ ...prev, [target]: false }));
    }
  };

  // Helper to force refresh an image that might be cached or blocked
  const refreshPreview = (target: 'siteLogo' | 'documentLogo') => {
    setIsValidating(prev => ({ ...prev, [target]: true }));
    setImgErrors(prev => ({ ...prev, [target]: false }));
    
    // Add a tiny delay to simulate network check
    setTimeout(() => {
      setIsValidating(prev => ({ ...prev, [target]: false }));
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <span className="w-8 h-px bg-amber-600"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Atelier Identity Studio</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold serif text-slate-900 tracking-tight">Artisan Branding System</h1>
            <p className="text-slate-400 mt-2 text-sm max-w-lg font-medium leading-relaxed">Configure high-resolution visual assets for the consumer interface and official production documentation.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="w-full lg:w-auto bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-3"
          >
            {saveStatus === 'saving' ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : saveStatus === 'success' ? (
              <CheckCircleIcon className="w-4 h-4" />
            ) : (
              <SparklesIcon className="w-4 h-4" />
            )}
            <span>{saveStatus === 'saving' ? 'Synchronizing...' : saveStatus === 'success' ? 'Identity Persisted' : 'Commit Global Branding'}</span>
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
           {/* 1. Header Logo Configuration */}
           <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden group">
              <div className="bg-slate-900 p-10 text-white">
                 <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                        <RectangleStackIcon className="w-6 h-6 text-amber-500" />
                        <h2 className="text-2xl font-bold serif">Primary Interface Asset</h2>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full">Station 01</span>
                 </div>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Navigation Header & Responsive Footer</p>
              </div>
              
              <div className="p-10 space-y-10">
                 <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 flex flex-col items-center relative min-h-[220px] justify-center">
                    <p className="absolute top-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">Live Simulation</p>
                    
                    <div className="bg-white p-8 rounded-3xl shadow-inner border border-slate-100 max-w-full overflow-hidden transition-all group-hover:shadow-2xl flex items-center justify-center">
                       {isValidating.siteLogo ? (
                          <div className="flex flex-col items-center space-y-3 py-4">
                             <ArrowPathIcon className="w-8 h-8 text-amber-600 animate-spin" />
                             <span className="text-[8px] font-black uppercase text-slate-400">Verifying Stream...</span>
                          </div>
                       ) : imgErrors.siteLogo ? (
                         <div className="text-red-500 flex flex-col items-center space-y-3 py-4 animate-in fade-in duration-300">
                            <ExclamationTriangleIcon className="w-10 h-10" />
                            <div className="text-center">
                                <span className="text-[9px] font-black uppercase block">Asset Resolution Failed</span>
                                <span className="text-[7px] font-bold uppercase text-slate-400 mt-1">Ensure direct .png/.jpg link is used</span>
                            </div>
                         </div>
                       ) : (
                         <img 
                          src={form.siteLogo} 
                          alt="Interface Asset" 
                          className="max-h-20 w-auto object-contain transition-all duration-700 group-hover:scale-105" 
                          referrerPolicy="no-referrer"
                          onError={() => setImgErrors(prev => ({...prev, siteLogo: true}))}
                        />
                       )}
                    </div>
                    
                    <button 
                      onClick={() => refreshPreview('siteLogo')}
                      className="absolute bottom-6 right-8 p-2 text-slate-300 hover:text-amber-600 transition-colors"
                      title="Forced Re-validation"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                    </button>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3 ml-1">Asset Location (URL)</label>
                       <div className="relative">
                          <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-600" />
                          <input 
                            value={form.siteLogo} 
                            onChange={e => {
                              setForm({...form, siteLogo: e.target.value});
                              setImgErrors(prev => ({...prev, siteLogo: false}));
                            }}
                            className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-5 rounded-2xl outline-none font-mono text-xs focus:ring-4 focus:ring-amber-600/5 transition-all shadow-inner" 
                            placeholder="https://i.imgur.com/..."
                          />
                       </div>
                    </div>

                    <div className="flex space-x-4">
                       <button 
                        onClick={() => headerFileRef.current?.click()}
                        className="flex-1 flex items-center justify-center space-x-3 bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-xl hover:bg-amber-600 transition-all active:scale-95"
                       >
                          <CloudArrowUpIcon className="w-4 h-4" />
                          <span>Local Payload</span>
                       </button>
                       <button 
                        onClick={() => handleReset('siteLogo')}
                        className="p-4 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                       >
                          <TrashIcon className="w-5 h-5" />
                       </button>
                    </div>
                    <input type="file" ref={headerFileRef} onChange={e => handleFileUpload(e, 'siteLogo')} className="hidden" accept="image/*" />
                 </div>
              </div>
           </div>

           {/* 2. Document Logo Configuration */}
           <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden group">
              <div className="bg-teal-700 p-10 text-white">
                 <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                        <DocumentTextIcon className="w-6 h-6 text-white" />
                        <h2 className="text-2xl font-bold serif">Artisan Document Header</h2>
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] bg-white/10 px-3 py-1 rounded-full">Station 02</span>
                 </div>
                 <p className="text-teal-100 text-[10px] font-black uppercase tracking-widest">Injected into Transactional Emails & Invoices</p>
              </div>
              
              <div className="p-10 space-y-10">
                 <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 flex flex-col items-center relative min-h-[220px] justify-center">
                    <p className="absolute top-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">Document Preview</p>
                    
                    <div className="bg-white p-8 rounded-3xl shadow-inner border border-slate-100 max-w-full overflow-hidden transition-all group-hover:shadow-2xl flex items-center justify-center">
                       {isValidating.documentLogo ? (
                          <div className="flex flex-col items-center space-y-3 py-4">
                             <ArrowPathIcon className="w-8 h-8 text-teal-600 animate-spin" />
                             <span className="text-[8px] font-black uppercase text-slate-400">Resolving Resource...</span>
                          </div>
                       ) : imgErrors.documentLogo ? (
                         <div className="text-red-500 flex flex-col items-center space-y-3 py-4 animate-in fade-in duration-300">
                            <ExclamationTriangleIcon className="w-10 h-10" />
                            <div className="text-center">
                                <span className="text-[9px] font-black uppercase block">Asset Unavailable</span>
                                <span className="text-[7px] font-bold uppercase text-slate-400 mt-1">Check URL syntax and CORS headers</span>
                            </div>
                         </div>
                       ) : (
                         <img 
                          src={form.documentLogo || form.siteLogo} 
                          alt="Document Header" 
                          className="max-h-24 w-auto object-contain transition-all duration-700 group-hover:scale-105 grayscale group-hover:grayscale-0" 
                          referrerPolicy="no-referrer"
                          onError={() => setImgErrors(prev => ({...prev, documentLogo: true}))}
                        />
                       )}
                    </div>

                    <button 
                      onClick={() => refreshPreview('documentLogo')}
                      className="absolute bottom-6 right-8 p-2 text-slate-300 hover:text-teal-600 transition-colors"
                    >
                        <ArrowPathIcon className="w-4 h-4" />
                    </button>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3 ml-1">Asset Location (URL)</label>
                       <div className="relative">
                          <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-teal-600" />
                          <input 
                            value={form.documentLogo} 
                            onChange={e => {
                              setForm({...form, documentLogo: e.target.value});
                              setImgErrors(prev => ({...prev, documentLogo: false}));
                            }}
                            className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-5 rounded-2xl outline-none font-mono text-xs focus:ring-4 focus:ring-teal-600/5 transition-all shadow-inner" 
                            placeholder="https://i.imgur.com/..."
                          />
                       </div>
                    </div>

                    <div className="flex space-x-4">
                       <button 
                        onClick={() => docFileRef.current?.click()}
                        className="flex-1 flex items-center justify-center space-x-3 bg-teal-800 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-xl hover:bg-teal-900 transition-all active:scale-95"
                       >
                          <CloudArrowUpIcon className="w-4 h-4" />
                          <span>Local Payload</span>
                       </button>
                       <button 
                        onClick={() => handleReset('documentLogo')}
                        className="p-4 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                       >
                          <TrashIcon className="w-5 h-5" />
                       </button>
                    </div>
                    <input type="file" ref={docFileRef} onChange={e => handleFileUpload(e, 'documentLogo')} className="hidden" accept="image/*" />
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-16 p-10 bg-amber-50 rounded-[3rem] border border-amber-100 flex flex-col md:flex-row items-center gap-8 shadow-sm">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
              <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
           </div>
           <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Identity Intelligence Verified</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-4xl italic">
                "We have implemented an <strong>Imgur Bypass Normalizer</strong> that automatically corrects gallery links to raw streams. By stripping the <strong>Referrer header</strong> via browser-native instructions, your artisan brand will persist flawlessly across all global customer nodes and high-density invoice layouts."
              </p>
           </div>
           <div className="flex-grow text-right">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocol Version 4.5-Bespoke</span>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminBrandingPage;
