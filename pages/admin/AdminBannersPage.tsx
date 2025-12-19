
import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { PlusIcon, TrashIcon, PhotoIcon, XMarkIcon, CheckCircleIcon, NoSymbolIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold serif">Marketing Banners</h1>
          <button 
            onClick={() => { setEditingBanner(null); setForm({ title:'', subtitle:'', imageUrl:'', linkUrl:'', isActive:true }); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-xl"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Publish Banner</span>
          </button>
        </header>

        {banners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {banners.map(banner => (
              <div key={banner.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 group">
                <div className="aspect-video relative overflow-hidden">
                  <img src={banner.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt="" />
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button onClick={() => updateBanner({...banner, isActive: !banner.isActive})} className={`p-2 rounded-full shadow-lg ${banner.isActive ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}>
                      {banner.isActive ? <CheckCircleIcon className="w-5 h-5" /> : <NoSymbolIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="p-8 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold serif">{banner.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{banner.subtitle}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => { setEditingBanner(banner); setForm(banner); setIsModalOpen(true); }} className="p-2 bg-slate-50 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"><PencilSquareIcon className="w-5 h-5" /></button>
                    <button onClick={() => removeBanner(banner.id)} className="p-2 bg-slate-50 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <PhotoIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No banners staged.</p>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-12 w-full max-w-2xl shadow-2xl relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-3xl font-bold serif mb-8">{editingBanner ? 'Modify' : 'Archive'} Banner</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Headline</label>
                    <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Subtitle</label>
                    <textarea rows={3} value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none resize-none" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Banner Asset</label>
                    <div onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center cursor-pointer hover:border-amber-600 transition">
                      {form.imageUrl ? <img src={form.imageUrl} className="w-20 h-12 object-cover mx-auto rounded-lg shadow-lg" alt="" /> : <PhotoIcon className="w-10 h-10 text-slate-200 mx-auto" />}
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    </div>
                  </div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-5 h-5 accent-amber-600" />
                    <span className="text-sm font-bold text-slate-700">Display Live</span>
                  </label>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 mt-10 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl">Deploy Asset</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminBannersPage;
