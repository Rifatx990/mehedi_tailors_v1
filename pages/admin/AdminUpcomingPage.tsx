
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PlusIcon, 
  TrashIcon, 
  ClockIcon, 
  XMarkIcon, 
  PhotoIcon,
  PencilSquareIcon,
  SparklesIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { UpcomingProduct } from '../../types.ts';

const AdminUpcomingPage: React.FC = () => {
  const { upcomingProducts, addUpcomingProduct, updateUpcomingProduct, removeUpcomingProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UpcomingProduct | null>(null);

  const [form, setForm] = useState<Partial<UpcomingProduct>>({
    name: '', image: '', description: '', expectedDate: '', isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: UpcomingProduct = {
      id: editingItem ? editingItem.id : 'UP-' + Date.now(),
      name: form.name || '',
      image: form.image || '',
      description: form.description || '',
      expectedDate: form.expectedDate || '',
      isActive: form.isActive !== undefined ? form.isActive : true
    };
    if (editingItem) await updateUpcomingProduct(data);
    else await addUpcomingProduct(data);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center space-x-2 text-teal-600 mb-2 font-bold uppercase tracking-widest text-[10px]">
              <SparklesIcon className="w-4 h-4" />
              <span>Horizon Management</span>
            </div>
            <h1 className="text-4xl font-bold serif text-slate-900">Upcoming Prototype Launch</h1>
          </div>
          <button 
            onClick={() => { setEditingItem(null); setForm({name:'', image:'', description:'', expectedDate:'', isActive:true}); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl hover:bg-teal-600 transition-all"
          >
            <PlusIcon className="w-4 h-4 mr-2 inline" />
            Define Future Model
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingProducts.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500">
               <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-6">
                  <img src={p.image} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt="" />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[8px] font-black uppercase border ${p.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {p.isActive ? 'Live on Index' : 'Hidden'}
                  </div>
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">{p.name}</h3>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4 flex items-center space-x-2">
                 <CalendarDaysIcon className="w-3.5 h-3.5" />
                 <span>ETA: {new Date(p.expectedDate).toLocaleDateString()}</span>
               </p>
               <div className="flex space-x-2 pt-6 border-t border-slate-50">
                  <button onClick={() => { setEditingItem(p); setForm(p); setIsModalOpen(true); }} className="flex-1 bg-slate-50 text-slate-500 py-3 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all font-bold uppercase text-[9px] tracking-widest">Modify Specs</button>
                  <button onClick={() => removeUpcomingProduct(p.id)} className="p-3 bg-red-50 text-red-300 hover:text-red-500 rounded-xl transition-all"><TrashIcon className="w-5 h-5" /></button>
               </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
             <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-10 md:p-14 w-full max-w-xl shadow-3xl relative animate-in zoom-in duration-300">
                <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-950 transition-transform hover:rotate-90"><XMarkIcon className="w-10 h-10" /></button>
                <h2 className="text-3xl font-bold serif mb-10 pb-6 border-b border-slate-50">{editingItem ? 'Update Model' : 'Define Future Model'}</h2>
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Prototype Designation</label>
                      <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none font-bold" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Expected Reveal Date</label>
                        <input required type="date" value={form.expectedDate} onChange={e => setForm({...form, expectedDate: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none font-bold text-xs" />
                      </div>
                      <div className="flex flex-col justify-end">
                        <label className="flex items-center space-x-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl cursor-pointer">
                           <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-5 h-5 accent-teal-600" />
                           <span className="text-[10px] font-black uppercase text-slate-500">Live Status</span>
                        </label>
                      </div>
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Media Asset URL</label>
                      <input required value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none font-mono text-[10px]" placeholder="https://..." />
                   </div>
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Horizon Narrative</label>
                      <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none font-medium leading-relaxed text-sm" placeholder="Tell the story of this future piece..." />
                   </div>
                   <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:bg-teal-600 transition-all">Synchronize Launch Records</button>
                </div>
             </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUpcomingPage;
