
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { PlusIcon, TrashIcon, PencilSquareIcon, PhotoIcon, XMarkIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';
import { Product } from '../../types.ts';

const AdminProductsPage: React.FC = () => {
  const { products, categories, updateProduct, addProduct, removeProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Partial<Product>>({
    name: '', category: categories[0] || 'Uncategorized', price: 0, image: '', description: '', availableSizes: [], colors: []
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
      image: form.image || 'https://via.placeholder.com/600x800',
      description: form.description || '',
      availableSizes: processArray(form.availableSizes),
      colors: processArray(form.colors),
      fabricType: form.fabricType || 'Premium',
      inStock: true
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
      fabricType: 'Premium'
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
                  <th className="px-10 py-6">Category</th>
                  <th className="px-10 py-6 text-center">Price</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-10 py-8 flex items-center space-x-4">
                      <img src={p.image} className="w-12 h-12 object-cover rounded-xl shadow-sm" alt="" />
                      <span className="font-bold">{p.name}</span>
                    </td>
                    <td className="px-10 py-8 text-xs font-bold uppercase text-slate-400">{p.category}</td>
                    <td className="px-10 py-8 text-center font-bold">BDT {p.price.toLocaleString()}</td>
                    <td className="px-10 py-8 text-right space-x-2">
                      <button onClick={() => openEditModal(p)} className="p-2 text-slate-400 hover:text-amber-600"><PencilSquareIcon className="w-5 h-5" /></button>
                      <button onClick={() => removeProduct(p.id)} className="p-2 text-slate-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
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
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none">
                       {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Price (BDT)</label>
                    <input type="number" required value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Fabric Type</label>
                    <input value={form.fabricType} onChange={e => setForm({...form, fabricType: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" placeholder="Silk, Cotton, etc." />
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
              <button type="submit" className="w-full bg-slate-900 text-white py-5 mt-10 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl">Commit to Archive</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProductsPage;
