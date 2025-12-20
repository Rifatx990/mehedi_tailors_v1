
import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PlusIcon, 
  TrashIcon, 
  PhotoIcon, 
  XMarkIcon, 
  ArchiveBoxIcon, 
  LinkIcon, 
  CloudArrowUpIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Fabric } from '../../types.ts';

const AdminFabricsPage: React.FC = () => {
  const { fabrics, addFabric, removeFabric } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: '', description: '', image: '' });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addFabric({ ...form, id: 'f' + Date.now() });
    setIsModalOpen(false);
    setForm({ name: '', description: '', image: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold serif">Fabric Vault</h1>
          <button 
            onClick={() => { setIsModalOpen(true); setImageSource('upload'); }}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-xl"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Secure New Fabric</span>
          </button>
        </header>

        {fabrics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fabrics.map(fabric => (
              <div key={fabric.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
                <div className="aspect-square relative overflow-hidden bg-slate-50">
                  <img src={fabric.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                  <button 
                    onClick={() => removeFabric(fabric.id)}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full text-slate-300 hover:text-red-500 transition shadow-lg opacity-0 group-hover:opacity-100"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-8">
                  <h3 className="text-lg font-bold serif mb-1">{fabric.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{fabric.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <ArchiveBoxIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <h3 className="text-xl font-bold serif text-slate-400">Vault Empty</h3>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 md:p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-transform hover:rotate-90"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-3xl font-bold serif mb-8">Add New Fabric</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Fabric Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" placeholder="Italian Linen" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none resize-none" placeholder="Exquisite summer fabric..." />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Fabric Swatch Media</label>
                     <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button type="button" onClick={() => setImageSource('upload')} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${imageSource === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Upload</button>
                        <button type="button" onClick={() => setImageSource('url')} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${imageSource === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>URL</button>
                     </div>
                  </div>

                  {imageSource === 'upload' ? (
                     <div onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center cursor-pointer hover:border-amber-600 transition">
                        {form.image && imageSource === 'upload' ? (
                          <img src={form.image} className="w-20 h-20 object-cover mx-auto rounded-xl shadow-lg" alt="" />
                        ) : (
                          <>
                            <PhotoIcon className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Image</span>
                          </>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                     </div>
                  ) : (
                    <div className="space-y-4">
                       <div className="relative">
                          <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                          <input 
                            required 
                            value={form.image} 
                            onChange={e => setForm({...form, image: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 pl-10 pr-6 py-4 rounded-2xl outline-none font-mono text-xs" 
                            placeholder="https://..." 
                          />
                       </div>
                       {form.image && (
                         <div className="w-full h-32 rounded-2xl border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner">
                            <img src={form.image} className="h-full w-full object-cover" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/200?text=Invalid+Link'} />
                         </div>
                       )}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Secure Fabric Record</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminFabricsPage;
