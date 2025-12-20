
import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  XMarkIcon, 
  SparklesIcon,
  CloudArrowUpIcon,
  GlobeAltIcon,
  PhotoIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { BespokeService } from '../../types.ts';

const AdminBespokeServicesPage: React.FC = () => {
  const { bespokeServices, addBespokeService, updateBespokeService, removeBespokeService } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<BespokeService | null>(null);
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Partial<BespokeService>>({
    name: '', icon: '👔', image: '', basePrice: 0, description: '', isActive: true
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, image: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const serviceData: BespokeService = {
      id: editingService ? editingService.id : 'S-' + Date.now(),
      name: form.name || '',
      icon: form.icon || '🧵',
      image: form.image || '',
      basePrice: form.basePrice || 0,
      description: form.description || '',
      isActive: form.isActive !== undefined ? form.isActive : true
    };

    if (editingService) await updateBespokeService(serviceData);
    else await addBespokeService(serviceData);
    
    setIsModalOpen(false);
    setEditingService(null);
    setForm({ name: '', icon: '👔', image: '', basePrice: 0, description: '', isActive: true });
  };

  const openAddModal = () => {
    setEditingService(null);
    setForm({ name: '', icon: '👔', image: '', basePrice: 0, description: '', isActive: true });
    setImageSource('upload');
    setIsModalOpen(true);
  };

  const openEditModal = (service: BespokeService) => {
    setEditingService(service);
    setForm(service);
    setImageSource(service.image?.startsWith('data:') ? 'upload' : 'url');
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <span className="w-8 h-px bg-amber-600"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Service Architecture</span>
            </div>
            <h1 className="text-4xl font-bold serif text-slate-900 tracking-tight">Bespoke Framework</h1>
            <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-bold">Manage customization options & pricing</p>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-slate-900 text-white px-10 py-4 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] flex items-center space-x-3 shadow-2xl hover:bg-amber-600 transition-all active:scale-95"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Define New Service</span>
          </button>
        </header>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                <th className="px-10 py-6">Identity</th>
                <th className="px-10 py-6">Designation</th>
                <th className="px-10 py-6">Base Valuation</th>
                <th className="px-10 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right">Directives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bespokeServices.map(service => (
                <tr key={service.id} className="hover:bg-slate-50 transition group">
                  <td className="px-10 py-8">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-slate-100 overflow-hidden">
                      {service.image ? <img src={service.image} className="w-full h-full object-cover" /> : service.icon}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="font-bold text-slate-900">{service.name}</p>
                    <p className="text-[10px] text-slate-400 max-w-xs truncate">{service.description}</p>
                  </td>
                  <td className="px-10 py-8 font-black text-slate-900">
                    BDT {service.basePrice.toLocaleString()}
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${service.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                      {service.isActive ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right space-x-2">
                    <button 
                        onClick={() => openEditModal(service)}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-all shadow-sm"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => removeBespokeService(service.id)}
                        className="p-3 text-slate-200 hover:text-red-500 transition-colors"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-10 md:p-14 w-full max-w-4xl shadow-2xl relative animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-950 transition-transform hover:rotate-90 duration-300"><XMarkIcon className="w-10 h-10" /></button>
              
              <div className="flex items-center space-x-5 mb-10 pb-8 border-b border-slate-50">
                 <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <SparklesIcon className="w-10 h-10" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold serif text-slate-900 tracking-tight">{editingService ? 'Refine Service' : 'Define Service'}</h2>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Customization Parameter Manager</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Service Label</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold" placeholder="e.g. Formal Shirt" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Base Creation Fee (BDT)</label>
                      <input required type="number" value={form.basePrice} onChange={e => setForm({...form, basePrice: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-black text-2xl text-slate-900" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Lifecycle State</label>
                      <select value={form.isActive ? 'active' : 'archived'} onChange={e => setForm({...form, isActive: e.target.value === 'active'})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none appearance-none font-black text-xs uppercase tracking-widest">
                        <option value="active">Active Selection</option>
                        <option value="archived">Archived/Hidden</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Service Icon (Emoji)</label>
                    <input required value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold text-center text-xl" placeholder="👔" />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Sartorial Description</label>
                    <textarea required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-[2rem] outline-none focus:ring-4 focus:ring-amber-600/5 transition resize-none font-medium leading-relaxed" placeholder="Brief explanation of the service scope..." />
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Reference Photo</label>
                       <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                          <button type="button" onClick={() => setImageSource('upload')} className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 text-[10px] font-bold uppercase ${imageSource === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                             <CloudArrowUpIcon className="w-3.5 h-3.5" />
                             <span>Upload</span>
                          </button>
                          <button type="button" onClick={() => setImageSource('url')} className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 text-[10px] font-bold uppercase ${imageSource === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                             <GlobeAltIcon className="w-3.5 h-3.5" />
                             <span>URL</span>
                          </button>
                       </div>
                    </div>

                    {imageSource === 'upload' ? (
                       <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[2.5rem] text-center cursor-pointer hover:border-amber-600 transition-all flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                          {form.image && imageSource === 'upload' ? (
                             <img src={form.image} className="w-full h-full object-cover rounded-2xl shadow-xl" alt="" />
                          ) : (
                             <>
                                <PhotoIcon className="w-16 h-16 text-slate-200 mb-4" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Showcase File</span>
                             </>
                          )}
                          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                       </div>
                    ) : (
                       <div className="space-y-4">
                          <div className="relative group">
                             <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-600 transition-colors" />
                             <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-amber-600/5 transition font-mono text-xs" placeholder="https://..." />
                          </div>
                          {form.image && (
                            <div className="w-full aspect-[4/3] rounded-[2.5rem] border border-slate-100 bg-slate-50 overflow-hidden relative shadow-inner">
                               <img src={form.image} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/800?text=Invalid+Link'} />
                            </div>
                          )}
                       </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-slate-100">
                <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-bold uppercase tracking-[0.2em] text-xs shadow-3xl hover:bg-amber-600 transition-all active:scale-[0.98]">
                  {editingService ? 'Commit Architectural Changes' : 'Publish Bespoke Option'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminBespokeServicesPage;
