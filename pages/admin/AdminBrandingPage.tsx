
import React, { useState, useRef } from 'react';
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
  RectangleStackIcon
} from '@heroicons/react/24/outline';

const AdminBrandingPage: React.FC = () => {
  const { systemConfig, updateSystemConfig } = useStore();
  const [form, setForm] = useState(systemConfig);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const headerFileRef = useRef<HTMLInputElement>(null);
  const docFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'siteLogo' | 'documentLogo') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, [target]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      updateSystemConfig(form);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  const handleReset = (target: 'siteLogo' | 'documentLogo') => {
    if (window.confirm(`Reset the ${target === 'siteLogo' ? 'Header' : 'Document'} logo to default placeholder?`)) {
      setForm(prev => ({ 
        ...prev, 
        [target]: target === 'siteLogo' 
          ? 'https://via.placeholder.com/200x80?text=HEADER+LOGO' 
          : 'https://via.placeholder.com/300x120?text=DOCUMENT+LOGO' 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <span className="w-8 h-px bg-amber-600"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Visual Identity Studio</span>
            </div>
            <h1 className="text-4xl font-bold serif text-slate-900">Logo Management</h1>
            <p className="text-slate-400 mt-2 text-sm max-w-lg">Manage the high-resolution assets used for the customer interface and official artisan documentation.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {saveStatus === 'saving' ? 'Synchronizing...' : saveStatus === 'success' ? 'Branding Saved' : 'Commit Changes'}
          </button>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
           {/* 1. Header Logo CRUD */}
           <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden group">
              <div className="bg-slate-900 p-10 text-white">
                 <div className="flex items-center space-x-4 mb-2">
                    <RectangleStackIcon className="w-6 h-6 text-amber-500" />
                    <h2 className="text-2xl font-bold serif">Primary Interface Logo</h2>
                 </div>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Appears in Navigation Header & Footer</p>
              </div>
              
              <div className="p-10 space-y-10">
                 <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 flex flex-col items-center">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-8 tracking-[0.2em]">Active Preview</p>
                    <div className="bg-white p-6 rounded-2xl shadow-inner border border-slate-100 max-w-full overflow-hidden transition-all group-hover:shadow-lg">
                       <img src={form.siteLogo} alt="Header Preview" className="max-h-16 w-auto object-contain" />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3 ml-1">Logo Resource (URL)</label>
                       <div className="relative">
                          <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input 
                            value={form.siteLogo} 
                            onChange={e => setForm({...form, siteLogo: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-4 rounded-2xl outline-none font-mono text-xs focus:ring-4 focus:ring-amber-600/5 transition-all" 
                          />
                       </div>
                    </div>

                    <div className="flex space-x-4">
                       <button 
                        onClick={() => headerFileRef.current?.click()}
                        className="flex-1 flex items-center justify-center space-x-2 bg-slate-100 text-slate-900 py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-slate-200 transition"
                       >
                          <CloudArrowUpIcon className="w-4 h-4" />
                          <span>Local Upload</span>
                       </button>
                       <button 
                        onClick={() => handleReset('siteLogo')}
                        className="p-4 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition"
                       >
                          <TrashIcon className="w-4 h-4" />
                       </button>
                    </div>
                    <input type="file" ref={headerFileRef} onChange={e => handleFileUpload(e, 'siteLogo')} className="hidden" accept="image/*" />
                 </div>
              </div>
           </div>

           {/* 2. Document Logo CRUD */}
           <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden group">
              <div className="bg-teal-600 p-10 text-white">
                 <div className="flex items-center space-x-4 mb-2">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                    <h2 className="text-2xl font-bold serif">Artisan Document Header</h2>
                 </div>
                 <p className="text-teal-100 text-[10px] font-black uppercase tracking-widest">Injected into Emails & Printed Invoices</p>
              </div>
              
              <div className="p-10 space-y-10">
                 <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 flex flex-col items-center">
                    <p className="text-[9px] font-black uppercase text-slate-400 mb-8 tracking-[0.2em]">Document Preview</p>
                    <div className="bg-white p-6 rounded-2xl shadow-inner border border-slate-100 max-w-full overflow-hidden transition-all group-hover:shadow-lg">
                       <img src={form.documentLogo || form.siteLogo} alt="Doc Preview" className="max-h-20 w-auto object-contain" />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3 ml-1">Document Asset (URL)</label>
                       <div className="relative">
                          <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input 
                            value={form.documentLogo} 
                            onChange={e => setForm({...form, documentLogo: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-4 rounded-2xl outline-none font-mono text-xs focus:ring-4 focus:ring-teal-600/5 transition-all" 
                          />
                       </div>
                    </div>

                    <div className="flex space-x-4">
                       <button 
                        onClick={() => docFileRef.current?.click()}
                        className="flex-1 flex items-center justify-center space-x-2 bg-teal-50 text-teal-600 py-4 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-teal-600 hover:text-white transition"
                       >
                          <CloudArrowUpIcon className="w-4 h-4" />
                          <span>Upload Doc Logo</span>
                       </button>
                       <button 
                        onClick={() => handleReset('documentLogo')}
                        className="p-4 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition"
                       >
                          <TrashIcon className="w-4 h-4" />
                       </button>
                    </div>
                    <input type="file" ref={docFileRef} onChange={e => handleFileUpload(e, 'documentLogo')} className="hidden" accept="image/*" />
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-16 p-10 bg-amber-50 rounded-[3rem] border border-amber-100 flex items-start space-x-6">
           <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
              <CheckCircleIcon className="w-6 h-6 text-amber-600" />
           </div>
           <div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Branding Persistence OK</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl italic">"These assets are synchronized across the entire TSX cluster. All transactional dispatches automatically pull the <strong>Artisan Document Header</strong> to ensure high-standard consistency in communication."</p>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminBrandingPage;
