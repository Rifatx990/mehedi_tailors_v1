
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { PlusIcon, TrashIcon, PencilSquareIcon, PhotoIcon, XMarkIcon, ArchiveBoxIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
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
    
    // Convert comma-separated strings to arrays if necessary
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
      name: '', 
      category: categories[0] || 'General', 
      price: 0, 
      image: '', 
      description: '', 
      availableSizes: [], 
      colors: [],
      fabricType: 'Premium',
      inStock: true
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
      <main className="flex-grow p-8 md:p-16">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold serif">Inventory Control</h1>
          <button 
            onClick={openAddModal}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-xl"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </header>

        {products.length > 0 ? (
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
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
                        <span className="font-bold">{p.name}</span>
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
                      <button onClick={() => openEditModal(p)} className="p-2 text-slate-400 hover:text-amber-600"><PencilSquareIcon className="w-5 h-5" /></button>
                      <button onClick={() => removeProduct(p.id)} className="p-2 text-slate-300 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <ArchiveBoxIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <h3 className="text-xl font-bold serif text-slate-400">Inventory Empty</h3>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 md:p-12 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-3xl font-bold serif mb-8">{editingProduct ? 'Modify' : 'Archive'} Product</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Name</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Base Price</label>
                      <input type="number" required value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Sale Price (Optional)</label>
                      <input type="number" value={form.discountPrice || ''} onChange={e => setForm({...form, discountPrice: e.target.value ? parseFloat(e.target.value) : undefined})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" placeholder="No discount" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none">
                       {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                       <h4 className="text-sm font-bold text-slate-900">Inventory Status</h4>
                       <p className="text-[10px] text-slate-400 uppercase font-bold">Patrons will be notified on restock</p>
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
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Primary Image</label>
                    <div onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center cursor-pointer hover:border-amber-600 transition">
                       {form.image ? <img src={form.image} className="w-20 h-24 object-cover mx-auto rounded-lg shadow-lg" alt="" /> : <PhotoIcon className="w-10 h-10 text-slate-200 mx-auto" />}
                       <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Sizes (Comma separated)</label>
                    <input value={form.availableSizes as any} onChange={e => setForm({...form, availableSizes: e.target.value as any})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" placeholder="S, M, L, XL" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Colors (Comma separated)</label>
                    <input value={form.colors as any} onChange={e => setForm({...form, colors: e.target.value as any})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" placeholder="Navy, Black, etc." />
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-5 mt-10 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl transition-all hover:bg-slate-800">Commit to Archive & Notify Patrons</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProductsPage;
