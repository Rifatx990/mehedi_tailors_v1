
import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PlusIcon, 
  TrashIcon, 
  PhotoIcon, 
  XMarkIcon, 
  PencilSquareIcon, 
  BriefcaseIcon,
  CloudArrowUpIcon,
  CheckBadgeIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { PartnerBrand } from '../../types.ts';

const AdminPartnersPage: React.FC = () => {
  const { partnerBrands, addPartnerBrand, updatePartnerBrand, removePartnerBrand } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<PartnerBrand | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: '', logo: '', isActive: true });
  const [useUrl, setUseUrl] = useState(false);

  // Normalizes problematic URLs (specifically Imgur) to ensure they are direct image streams
  const normalizeUrl = (url: string) => {
    if (!url) return '';
    let processed = url.trim();
    if (processed.includes('imgur.com') && !processed.includes('i.imgur.com')) {
      const match = processed.match(/imgur\.com\/(?:gallery\/|a\/|r\/[^\/]+\/)?([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        return `https://i.imgur.com/${match[1]}.png`;
      }
    }
    return processed;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const brandData: PartnerBrand = {
      id: editingBrand ? editingBrand.id : 'PB-' + Date.now(),
      name: form.name,
      logo: useUrl ? normalizeUrl(form.logo) : form.logo,
      isActive: form.isActive
    };
    if (editingBrand) await updatePartnerBrand(brandData);
    else await addPartnerBrand(brandData);
    setIsModalOpen(false);
    setEditingBrand(null);
    setUseUrl(false);
  };

  const openAddModal = () => {
    setEditingBrand(null);
    setForm({ name: '', logo: '', isActive: true });
    setUseUrl(false);
    setIsModalOpen(true);
  };

  const openEditModal = (brand: PartnerBrand) => {
    setEditingBrand(brand);
    setForm(brand);
    setUseUrl(!brand.logo.startsWith('data:'));
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-6 md:p-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center space-x-3 text-emerald-600 mb-2">
              <span className="w-8 h-px bg-emerald-600"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Artisan Alliances</span>
            </div>
            <h1 className="text-4xl font-bold serif text-slate-900 tracking-tight">Partner Directory</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest font-medium">{partnerBrands.length} Prestigious Mills & Textile Clothiers</p>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 transition-all active:scale-95"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Onboard Artisan Brand</span>
          </button>
        </header>

        {partnerBrands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {partnerBrands.map(brand => (
              <div key={brand.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:shadow-2xl transition-all duration-500 flex flex-col items-center relative overflow-hidden">
                 <div className={`absolute top-0 right-0 p-4 rounded-bl-[2rem] ${brand.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                    {brand.isActive ? <CheckBadgeIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
                 </div>
                 
                 <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] mb-6 flex items-center justify-center p-6 overflow-hidden border border-slate-100 group-hover:bg-white transition-colors shadow-inner">
                    <img 
                      src={brand.logo} 
                      className="w-full h-full object-contain filter group-hover:grayscale-0 grayscale transition-all duration-700" 
                      alt={brand.name} 
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                 </div>
                 
                 <h3 className="text-lg font-bold text-slate-900 mb-1">{brand.name}</h3>
                 <span className={`text-[9px] font-black uppercase tracking-[0.2em] mb-8 ${brand.isActive ? 'text-emerald-500' : 'text-slate-300'}`}>
                   {brand.isActive ? 'Active Collaboration' : 'Archived'}
                 </span>
                 
                 <div className="flex space-x-3 w-full border-t border-slate-50 pt-6">
                    <button 
                      onClick={() => openEditModal(brand)} 
                      className="flex-1 flex items-center justify-center space-x-2 py-3 bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all font-bold uppercase text-[9px] tracking-widest"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                      <span>Refine</span>
                    </button>
                    <button 
                      onClick={() => { if(window.confirm('Detach this partner from the archive?')) removePartnerBrand(brand.id) }} 
                      className="p-3 bg-red-50 text-red-300 hover:text-red-600 rounded-xl transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
             <BriefcaseIcon className="w-16 h-16 text-slate-100 mx-auto mb-6" />
             <h3 className="text-xl font-bold serif text-slate-400 tracking-tight">Alliance Ledger is Empty</h3>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-2">Start registering your textile partners to build brand authority.</p>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-10 md:p-14 w-full max-w-2xl shadow-2xl relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-950 transition-transform hover:rotate-90 duration-300"><XMarkIcon className="w-8 h-8" /></button>
              
              <div className="flex items-center space-x-4 mb-10 pb-6 border-b border-slate-50">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center shadow-inner">
                    <SparklesIcon className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold serif text-slate-900 tracking-tight">{editingBrand ? 'Refine Alliance' : 'Onboard Partner'}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Global Textile Authority Console</p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-2">Official Brand Designation</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-600/5 transition font-bold text-lg" placeholder="e.g. Scabal Brussels" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4 px-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Corporate Identity (Logo)</label>
                    <button 
                      type="button" 
                      onClick={() => setUseUrl(!useUrl)}
                      className="text-[9px] font-black uppercase text-teal-600 hover:text-teal-700 transition-colors"
                    >
                      {useUrl ? 'Switch to Local Upload' : 'Use Remote URL'}
                    </button>
                  </div>

                  {useUrl ? (
                    <div className="relative group">
                       <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-teal-600 transition-colors" />
                       <input 
                        required 
                        value={form.logo} 
                        onChange={e => setForm({...form, logo: e.target.value})} 
                        className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-teal-600/5 transition font-mono text-[10px]" 
                        placeholder="https://i.imgur.com/..." 
                       />
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()} 
                      className={`w-full aspect-[21/9] border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 p-10 ${form.logo ? 'border-teal-500 bg-teal-50/5' : 'border-slate-200 bg-slate-50 hover:border-teal-600'}`}
                    >
                      {form.logo ? (
                        <img src={form.logo} className="h-full object-contain mx-auto drop-shadow-xl" alt="Preview" />
                      ) : (
                        <>
                          <CloudArrowUpIcon className="w-12 h-12 text-slate-200 mb-4" />
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select High-Resolution SVG/PNG</p>
                        </>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-8 bg-slate-950 rounded-[2.5rem] shadow-2xl border border-white/5">
                   <div className="pl-2">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-white">Public Showcase</h4>
                      <p className="text-[9px] text-slate-500 uppercase font-black mt-1">Render on artisan collaboration slider</p>
                   </div>
                   <button 
                      type="button"
                      onClick={() => setForm({...form, isActive: !form.isActive})}
                      className={`w-14 h-8 rounded-full transition-all relative shrink-0 ${form.isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-xl ${form.isActive ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white py-7 rounded-[2rem] font-bold uppercase tracking-[0.2em] text-xs shadow-3xl hover:bg-teal-700 active:scale-[0.98] transition-all">
                  Synchronize Alliance Credentials
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPartnersPage;
