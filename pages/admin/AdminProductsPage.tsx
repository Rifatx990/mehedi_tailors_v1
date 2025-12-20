
import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { PlusIcon, TrashIcon, PencilSquareIcon, PhotoIcon, XMarkIcon, ArchiveBoxIcon, CheckCircleIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { Product } from '../../types.ts';

const AdminProductsPage: React.FC = () => {
  const { products, categories, updateProduct, addProduct, removeProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Partial<Product>>({
    name: '', category: categories[0] || 'Uncategorized', price: 0, image: '', description: '', availableSizes: [], colors: [], inStock: true
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
    const processArray = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
      return [];
    };

    const productData: Product = {
      id: editingProduct ? editingProduct.id : 'p' + Date.now(),
      name: form.name || 'Unnamed Product',
      category: form.category || categories[0] || 'General',
      price: form.price || 0,
      discountPrice: form.discountPrice,
      image: form.image || 'https://via.placeholder.com/600x800',
      description: form.description || '',
      availableSizes: processArray(form.availableSizes),
      colors: processArray(form.colors),
      fabricType: form.fabricType || 'Premium',
      inStock: form.inStock === undefined ? true : form.inStock
    };

    if (editingProduct) await updateProduct(productData);
    else await addProduct(productData);
    
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({ 
      name: '', category: categories[0] || 'General', price: 0, image: '', description: '', availableSizes: [], colors: [], fabricType: 'Premium', inStock: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setForm({
      ...p,
      availableSizes: Array.isArray(p.availableSizes) ? p.availableSizes.join(', ') : p.availableSizes as any,
      colors: Array.isArray(p.colors) ? p.colors.join(', ') : p.colors as any
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-4 md:p-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold serif text-slate-900">Inventory Control</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 font-bold">Catalog Lifecycle Management</p>
          </div>
          <button 
            onClick={openAddModal}
            className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 shadow-xl shadow-slate-200 active:scale-95 transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </header>

        {products.length > 0 ? (
          <div className="space-y-4 md:space-y-0">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                    <th className="px-10 py-6">Product</th>
                    <th className="px-10 py-6">Availability</th>
                    <th className="px-10 py-6 text-center">Price</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-10 py-8 flex items-center space-x-4">
                        <img src={p.image} className="w-12 h-12 object-cover rounded-xl shadow-sm" alt="" />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{p.name}</span>
                          <span className="text-[10px] font-bold uppercase text-slate-400">{p.category}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${p.inStock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${p.inStock ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                            <span>{p.inStock ? 'In Stock' : 'Out of Stock'}</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <div className="flex flex-col items-center">
                            <span className="font-bold">BDT {p.price.toLocaleString()}</span>
                            {p.discountPrice && <span className="text-[9px] text-rose-500 font-bold uppercase">Sale: BDT {p.discountPrice.toLocaleString()}</span>}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right space-x-2">
                        <button onClick={() => openEditModal(p)} className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"><PencilSquareIcon className="w-5 h-5" /></button>
                        <button onClick={() => removeProduct(p.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><TrashIcon className="w-5 h-5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Adaptive Cards */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {products.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-4">
                   <img src={p.image} className="w-20 h-24 object-cover rounded-2xl flex-shrink-0" />
                   <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start">
                         <h3 className="font-bold text-slate-900 truncate pr-2">{p.name}</h3>
                         <span className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${p.inStock ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      </div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">{p.category}</p>
                      <div className="mt-3 flex items-baseline space-x-2">
                         <span className="font-bold text-slate-900">BDT {p.price.toLocaleString()}</span>
                         {p.discountPrice && <span className="text-[8px] text-rose-500 font-black uppercase">SALE</span>}
                      </div>
                      <div className="mt-4 flex space-x-2">
                         <button onClick={() => openEditModal(p)} className="flex-1 py-2 bg-slate-50 text-slate-900 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-100">Edit</button>
                         <button onClick={() => removeProduct(p.id)} className="p-2 text-red-300 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <ArchiveBoxIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <h3 className="text-xl font-bold serif text-slate-400">Inventory Empty</h3>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-8 md:p-12 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-transform hover:rotate-90"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-2xl md:text-3xl font-bold serif mb-8 text-slate-900">{editingProduct ? 'Modify' : 'Archive'} Product</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Name</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-medium" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Base Price</label>
                      <input type="number" required value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Sale Price</label>
                      <input type="number" value={form.discountPrice || ''} onChange={e => setForm({...form, discountPrice: e.target.value ? parseFloat(e.target.value) : undefined})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-rose-600/5 transition font-bold text-rose-600" placeholder="Optional" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none appearance-none font-bold text-xs tracking-widest">
                       {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                       <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Live State</h4>
                       <p className="text-[9px] text-slate-400 uppercase font-black mt-0.5">Toggle Visibility</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setForm({...form, inStock: !form.inStock})}
                      className={`w-14 h-8 rounded-full transition-all relative shrink-0 ${form.inStock ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${form.inStock ? 'left-7' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Primary Display Asset</label>
                    <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-square md:aspect-auto md:h-64 bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[2rem] text-center cursor-pointer hover:border-amber-600 transition-all flex flex-col items-center justify-center">
                       {form.image ? (
                        <div className="relative group/img">
                           <img src={form.image} className="w-32 h-44 object-cover rounded-xl shadow-2xl" alt="" />
                           <div className="absolute inset-0 bg-black/10 rounded-xl opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><span className="text-[8px] bg-white px-2 py-1 rounded font-bold">REPLACE</span></div>
                        </div>
                       ) : <PhotoIcon className="w-12 h-12 text-slate-200" />}
                       <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block ml-1">Variant Sizes (CSV)</label>
                    <input value={form.availableSizes as any} onChange={e => setForm({...form, availableSizes: e.target.value as any})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none font-mono text-xs" placeholder="S, M, L, XL" />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-6 mt-12 rounded-[2rem] font-bold uppercase tracking-widest text-xs shadow-2xl hover:bg-slate-800 transition-all active:scale-95">Commit Global Registry Changes</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProductsPage;
