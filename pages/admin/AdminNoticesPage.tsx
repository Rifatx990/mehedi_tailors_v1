
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  XMarkIcon, 
  MegaphoneIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Notice } from '../../types.ts';

const AdminNoticesPage: React.FC = () => {
  const { notices, addNotice, updateNotice, removeNotice } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const [form, setForm] = useState<Partial<Notice>>({
    content: '', type: 'info', isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: Notice = {
      id: editingNotice ? editingNotice.id : 'N-' + Date.now(),
      content: form.content || '',
      type: form.type || 'info',
      isActive: form.isActive !== undefined ? form.isActive : true,
      createdAt: editingNotice ? editingNotice.createdAt : new Date().toISOString()
    };
    if (editingNotice) await updateNotice(data);
    else await addNotice(data);
    setIsModalOpen(false);
    setEditingNotice(null);
    setForm({ content:'', type:'info', isActive:true });
  };

  const openEditModal = (n: Notice) => {
    setEditingNotice(n);
    setForm(n);
    setIsModalOpen(true);
  };

  const activeNotices = notices.filter(n => n.isActive);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center space-x-3 text-emerald-600 mb-2">
              <span className="w-8 h-px bg-emerald-600"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Artisan Broadcast</span>
            </div>
            <h1 className="text-4xl font-bold serif text-slate-900 tracking-tight">Notice Configuration</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest font-bold">{activeNotices.length} Active announcements on ticker</p>
          </div>
          <button 
            onClick={() => { setEditingNotice(null); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-10 py-4 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] flex items-center space-x-3 shadow-2xl hover:bg-emerald-600 transition-all active:scale-95"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Archive New Notice</span>
          </button>
        </header>

        {activeNotices.length > 1 && (
            <div className="mb-8 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start space-x-4">
                <InformationCircleIcon className="w-6 h-6 text-amber-600 shrink-0" />
                <p className="text-[11px] text-amber-800 leading-relaxed font-bold italic">Note: Only the latest active notice is displayed on the homepage ticker to maintain minimalist artisan aesthetic.</p>
            </div>
        )}

        <div className="grid grid-cols-1 gap-6">
           {notices.map(notice => (
             <div key={notice.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all duration-500 flex items-center justify-between gap-8">
                <div className="flex items-center space-x-6 min-w-0">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform ${
                       notice.type === 'warning' ? 'bg-red-50 text-red-600' :
                       notice.type === 'promotion' ? 'bg-amber-50 text-amber-600' :
                       'bg-slate-900 text-white'
                   }`}>
                      <MegaphoneIcon className="w-7 h-7" />
                   </div>
                   <div className="min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{notice.content}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Class: {notice.type}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{new Date(notice.createdAt).toLocaleDateString()}</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                   <button 
                     onClick={() => updateNotice({...notice, isActive: !notice.isActive})}
                     className={`px-5 py-2 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${notice.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-300'}`}
                   >
                     {notice.isActive ? 'Live' : 'Hidden'}
                   </button>
                   <div className="flex space-x-2">
                      <button onClick={() => openEditModal(notice)} className="p-3 bg-slate-50 text-slate-400 hover:text-amber-600 rounded-xl transition-all"><PencilSquareIcon className="w-5 h-5" /></button>
                      <button onClick={() => removeNotice(notice.id)} className="p-3 bg-red-50 text-red-300 hover:text-red-500 rounded-xl transition-all"><TrashIcon className="w-5 h-5" /></button>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[150] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
             <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-10 md:p-14 w-full max-w-xl shadow-3xl relative animate-in zoom-in duration-300">
                <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-950 transition-transform hover:rotate-90"><XMarkIcon className="w-10 h-10" /></button>
                <h2 className="text-3xl font-bold serif mb-10 pb-6 border-b border-slate-50">Archive Broadcast</h2>
                <div className="space-y-6">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Ticker Narrative</label>
                      <textarea required rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-[2rem] outline-none font-medium text-lg leading-relaxed focus:ring-4 focus:ring-emerald-600/5 transition" placeholder="e.g. Workshop closing for Eid holidays on June 15th..." />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Broadcast Class</label>
                        <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none appearance-none font-black text-xs uppercase tracking-widest">
                           <option value="info">Informational (Slate)</option>
                           <option value="promotion">Promotional (Amber)</option>
                           <option value="warning">Urgent Warning (Red)</option>
                        </select>
                      </div>
                      <div className="flex flex-col justify-end">
                        <label className="flex items-center space-x-3 bg-slate-50 border border-slate-100 p-5 rounded-2xl cursor-pointer">
                           <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-6 h-6 accent-emerald-600" />
                           <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Global Live</span>
                        </label>
                      </div>
                   </div>
                   <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-3xl hover:bg-emerald-600 transition-all active:scale-95">Synchronize Broadcast Ledger</button>
                </div>
             </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminNoticesPage;
