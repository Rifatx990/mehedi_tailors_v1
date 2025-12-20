
import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { PlusIcon, TrashIcon, PhotoIcon, XMarkIcon, CheckCircleIcon, NoSymbolIcon, PencilSquareIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Banner } from '../../types.ts';

const AdminBannersPage: React.FC = () => {
  const { banners, addBanner, updateBanner, removeBanner } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ title: '', subtitle: '', imageUrl: '', linkUrl: '', isActive: true });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bannerData: Banner = {
      id: editingBanner ? editingBanner.id : 'B-' + Date.now(),
      ...form
    };
    if (editingBanner) await updateBanner(bannerData);
    else await addBanner(bannerData);
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const activeCount = banners.filter(b => b.isActive).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <span className="w-8 h-px bg-amber-600"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Homepage Assets</span>
            </div>
            <h1 className="text-4xl font-bold serif text-slate-900">Hero Gallery Manager</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest font-medium">Currently {activeCount} live hero slides</p>
          </div>
          <button 
            onClick={() => { setEditingBanner(null); setForm({ title:'', subtitle:'', imageUrl:'', linkUrl:'', isActive:true }); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-xl shadow-slate-200 active:scale-95 transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Hero Picture</span>
          </button>
        </header>

        {banners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {banners.map(banner => (
              <div key={banner.id} className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 group transition-all hover:shadow-xl hover:-translate-y-1">
                <div className="aspect-[21/9] relative overflow-hidden bg-slate-100">
                  <img src={banner.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-1000" alt="" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500"></div>
                  
                  <div className="absolute top-6 right-6 flex space-x-2">
                    <button 
                      onClick={() => updateBanner({...banner, isActive: !banner.isActive})} 
                      className={`p-3 rounded-2xl shadow-xl transition-all ${banner.isActive ? 'bg-emerald-500 text-white' : 'bg-white/90 backdrop-blur text-slate-400 hover:text-slate-900'}`}
                      title={banner.isActive ? "Hide from Homepage" : "Set Active"}
                    >
                      {banner.isActive ? <CheckCircleIcon className="w-5 h-5" /> : <NoSymbolIcon className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 text-white drop-shadow-lg">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">{banner.isActive ? 'Live on Site' : 'In Archive'}</p>
                    <h3 className="text-xl font-bold serif line-clamp-1">{banner.title}</h3>
                  </div>
                </div>
                
                <div className="p-8 flex justify-between items-center bg-white">
                  <div className="flex-grow pr-4">
                    <p className="text-xs text-slate-400 line-clamp-1 italic">"{banner.subtitle}"</p>
                  </div>
                  <div className="flex space-x-3 shrink-0">
                    <button onClick={() => { setEditingBanner(banner); setForm(banner); setIsModalOpen(true); }} className="p-3 bg-slate-50 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all shadow-sm"><PencilSquareIcon className="w-5 h-5" /></button>
                    <button onClick={() => removeBanner(banner.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <PhotoIcon className="w-16 h-16 text-slate-100 mx-auto mb-6" />
             <h3 className="text-xl font-bold serif text-slate-400">Hero Carousel is Empty</h3>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-2">Add your first masterpiece picture to go live.</p>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 md:p-12 w-full max-w-3xl shadow-2xl relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-transform hover:rotate-90 duration-300"><XMarkIcon className="w-8 h-8" /></button>
              
              <div className="flex items-center space-x-3 mb-8">
                <SparklesIcon className="w-6 h-6 text-amber-500" />
                <h2 className="text-3xl font-bold serif">{editingBanner ? 'Refine' : 'Lodge'} Hero Picture</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Main Heading</label>
                    <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold" placeholder="e.g. The Winter Bespoke Collection" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Context / Subtitle</label>
                    <textarea rows={3} value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none resize-none font-medium text-sm" placeholder="Crafting heritage since 1980..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Call-to-Action Link</label>
                    <input value={form.linkUrl} onChange={e => setForm({...form, linkUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none font-mono text-xs" placeholder="/shop" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">High-Res Asset</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()} 
                      className={`w-full aspect-video border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all ${form.imageUrl ? 'border-emerald-500 bg-emerald-50/10 p-2' : 'border-slate-200 bg-slate-50 hover:border-amber-600'}`}
                    >
                      {form.imageUrl ? (
                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner">
                           <img src={form.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                           <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <span className="bg-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase shadow-xl">Replace Asset</span>
                           </div>
                        </div>
                      ) : (
                        <>
                          <PhotoIcon className="w-12 h-12 text-slate-200 mb-2" />
                          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Drop Image or Click</p>
                        </>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                     <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-900">Visibility Status</h4>
                        <p className="text-[9px] text-slate-400 uppercase font-bold mt-1">Directly toggles site live state</p>
                     </div>
                     <button 
                        type="button"
                        onClick={() => setForm({...form, isActive: !form.isActive})}
                        className={`w-14 h-8 rounded-full transition-all relative shrink-0 ${form.isActive ? 'bg-amber-600' : 'bg-slate-300'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${form.isActive ? 'left-7' : 'left-1'}`}></div>
                      </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-6 mt-12 rounded-[2rem] font-bold uppercase tracking-widest text-xs shadow-2xl hover:bg-slate-800 active:scale-[0.99] transition-all">
                Update Global Homepage Assets
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminBannersPage;
