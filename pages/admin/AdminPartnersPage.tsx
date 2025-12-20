
import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { PlusIcon, TrashIcon, PhotoIcon, XMarkIcon, PencilSquareIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { PartnerBrand } from '../../types.ts';

const AdminPartnersPage: React.FC = () => {
  const { partnerBrands, addPartnerBrand, updatePartnerBrand, removePartnerBrand } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<PartnerBrand | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: '', logo: '', isActive: true });

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
      id: editingBrand ? editingBrand.id : 'B-' + Date.now(),
      ...form
    };
    if (editingBrand) await updatePartnerBrand(brandData);
    else await addPartnerBrand(brandData);
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold serif text-slate-900">Partner Brands</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest font-bold">Collaborations & Affiliates</p>
          </div>
          <button 
            onClick={() => { setEditingBrand(null); setForm({ name: '', logo: '', isActive: true }); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-xl hover:bg-amber-600 transition"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Onboard Partner</span>
          </button>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {partnerBrands.map(brand => (
              <div key={brand.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all flex flex-col items-center">
                 <div className="w-24 h-24 bg-slate-50 rounded-2xl mb-6 flex items-center justify-center p-4 overflow-hidden border border-slate-50">
                    <img src={brand.logo} className="w-full h-full object-contain" />
                 </div>
                 <h3 className="text-lg font-bold text-slate-900 mb-1">{brand.name}</h3>
                 <span className={`text-[9px] font-bold uppercase tracking-widest mb-6 ${brand.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>{brand.isActive ? 'Live on Site' : 'Hidden'}</span>
                 
                 <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingBrand(brand); setForm(brand); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-amber-600 transition"><PencilSquareIcon className="w-5 h-5" /></button>
                    <button onClick={() => removePartnerBrand(brand.id)} className="p-2 text-slate-300 hover:text-red-500 transition"><TrashIcon className="w-5 h-5" /></button>
                 </div>
              </div>
           ))}
           {partnerBrands.length === 0 && (
             <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <BriefcaseIcon className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No partner brands registered.</p>
             </div>
           )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 md:p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-3xl font-bold serif mb-8">{editingBrand ? 'Refine' : 'Add'} Partner</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Brand Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold" placeholder="e.g. Italian Millers" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Corporate Logo</label>
                  <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-amber-600 transition-all p-4">
                    {form.logo ? <img src={form.logo} className="h-full object-contain mx-auto" /> : (
                      <>
                        <PhotoIcon className="w-12 h-12 text-slate-200 mb-2" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Upload SVG or Transparent PNG</p>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                   <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Active State</span>
                   <button 
                      type="button"
                      onClick={() => setForm({...form, isActive: !form.isActive})}
                      className={`w-12 h-6 rounded-full transition-all relative ${form.isActive ? 'bg-amber-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${form.isActive ? 'left-6.5 ml-0.5' : 'left-0.5'}`}></div>
                    </button>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl active:scale-[0.98] transition-all">Synchronize Partner Data</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPartnersPage;
