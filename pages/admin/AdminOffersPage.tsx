
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  XMarkIcon, 
  TagIcon,
  PhotoIcon,
  LinkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Offer } from '../../types.ts';

const AdminOffersPage: React.FC = () => {
  const { offers, addOffer, updateOffer, removeOffer } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const [form, setForm] = useState<Partial<Offer>>({
    title: '', description: '', discountTag: '', imageUrl: '', linkUrl: '', isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: Offer = {
      id: editingOffer ? editingOffer.id : 'OFF-' + Date.now(),
      title: form.title || '',
      description: form.description || '',
      discountTag: form.discountTag || '',
      imageUrl: form.imageUrl || '',
      linkUrl: form.linkUrl || '',
      isActive: form.isActive !== undefined ? form.isActive : true
    };
    if (editingOffer) await updateOffer(data);
    else await addOffer(data);
    setIsModalOpen(false);
    setEditingOffer(null);
    setForm({ title:'', description:'', discountTag:'', imageUrl:'', linkUrl:'', isActive:true });
  };

  const openEditModal = (offer: Offer) => {
    setEditingOffer(offer);
    setForm(offer);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <span className="w-8 h-px bg-amber-600"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Conversion Strategies</span>
            </div>
            <h1 className="text-4xl font-bold serif text-slate-900 tracking-tight">Offer Management</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest font-bold">{offers.length} Promotional modules defined</p>
          </div>
          <button 
            onClick={() => { setEditingOffer(null); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-10 py-4 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] flex items-center space-x-3 shadow-2xl hover:bg-amber-600 transition-all active:scale-95"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Launch New Offer</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {offers.map(offer => (
             <div key={offer.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500 flex flex-col">
                <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                   <img src={offer.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                   <div className="absolute top-3 right-3 bg-amber-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase shadow-lg">{offer.discountTag}</div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{offer.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6 flex-grow">{offer.description}</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                   <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${offer.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-300'}`}>
                     {offer.isActive ? 'Live' : 'Hidden'}
                   </span>
                   <div className="flex space-x-2">
                      <button onClick={() => openEditModal(offer)} className="p-3 bg-slate-50 text-slate-400 hover:text-amber-600 rounded-xl transition-all"><PencilSquareIcon className="w-5 h-5" /></button>
                      <button onClick={() => removeOffer(offer.id)} className="p-3 bg-red-50 text-red-300 hover:text-red-500 rounded-xl transition-all"><TrashIcon className="w-5 h-5" /></button>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[150] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
             <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-10 md:p-14 w-full max-w-xl shadow-3xl relative animate-in zoom-in duration-300">
                <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-950 transition-transform hover:rotate-90"><XMarkIcon className="w-10 h-10" /></button>
                <h2 className="text-3xl font-bold serif mb-10 pb-6 border-b border-slate-50">Promotional Logic</h2>
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-2">Offer Heading</label>
                      <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none font-bold" placeholder="e.g. Wedding Season Suite" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Badge Text</label>
                        <input required value={form.discountTag} onChange={e => setForm({...form, discountTag: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none font-black text-amber-600" placeholder="e.g. 20% OFF" />
                      </div>
                      <div className="flex flex-col justify-end">
                        <label className="flex items-center space-x-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl cursor-pointer">
                           <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-5 h-5 accent-amber-600" />
                           <span className="text-[10px] font-black uppercase text-slate-500">Live Status</span>
                        </label>
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Media Asset (Artisan Photo URL)</label>
                      <div className="relative">
                        <PhotoIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input required value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-4 rounded-2xl outline-none font-mono text-[10px]" placeholder="https://..." />
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Click Destination URL</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input required value={form.linkUrl} onChange={e => setForm({...form, linkUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-4 rounded-2xl outline-none font-mono text-[10px]" placeholder="/shop" />
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Short Narrative</label>
                      <textarea required rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none font-medium text-sm leading-relaxed" placeholder="Tell the story of this benefit..." />
                   </div>
                   <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-amber-600 transition-all">Synchronize Promotion Ledger</button>
                </div>
             </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOffersPage;
