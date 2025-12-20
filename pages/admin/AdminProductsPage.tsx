
import React, { useState, useRef, useMemo } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  PhotoIcon, 
  XMarkIcon, 
  ArchiveBoxIcon, 
  LinkIcon,
  CloudArrowUpIcon,
  ShoppingBagIcon,
  GlobeAltIcon,
  ExclamationCircleIcon,
  QueueListIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { Product } from '../../types.ts';

const AdminProductsPage: React.FC = () => {
  const { products, categories, updateProduct, addProduct, removeProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Partial<Product>>({
    name: '', 
    category: categories[0] || 'Uncategorized', 
    price: 0, 
    image: '', 
    description: '', 
    availableSizes: [], 
    colors: [], 
    inStock: true, 
    stockCount: 1, // Default stock
    fabricType: 'Premium'
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
      image: form.image || 'https://via.placeholder.com/600x800?text=No+Image',
      description: form.description || '',
      fabricType: form.fabricType || 'Premium',
      availableSizes: processArray(form.availableSizes),
      colors: processArray(form.colors),
      inStock: (form.stockCount || 0) > 0, // Auto inStock based on count
      stockCount: form.stockCount || 0,
      isFeatured: form.isFeatured
    };

    if (editingProduct) await updateProduct(productData);
    else await addProduct(productData);
    
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setImageSource('upload');
    setForm({ 
      name: '', category: categories[0] || 'General', price: 0, image: '', description: '', availableSizes: [], colors: [], fabricType: 'Premium', inStock: true, stockCount: 10
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setImageSource(p.image.startsWith('data:') ? 'upload' : 'url');
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
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <QueueListIcon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Inventory Sovereignty</span>
            </div>
            <h1 className="text-4xl font-bold serif text-slate-900 tracking-tight">Catalogue Management</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 font-bold">Total artisan products: {products.length}</p>
          </div>
          <button 
            onClick={openAddModal}
            className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-[1.8rem] font-bold uppercase tracking-widest text-[10px] flex items-center justify-center space-x-3 shadow-2xl hover:bg-amber-600 transition-all active:scale-95"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Enroll New Artisan Item</span>
          </button>
        </header>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {/* Mobile Adaptive Cards */}
            {products.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center space-x-4">
                  <img src={p.image} className="w-16 h-16 object-cover rounded-2xl shadow-inner border border-slate-100" />
                  <div className="min-w-0 flex-grow">
                    <h3 className="font-bold text-slate-900 truncate text-lg">{p.name}</h3>
                    <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest">{p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Stock</p>
                    <p className={`text-lg font-black ${p.stockCount < 5 ? 'text-rose-500' : 'text-slate-900'}`}>{p.stockCount}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Valuation</p>
                    <p className="font-black text-slate-900">BDT {p.price.toLocaleString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => openEditModal(p)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl transition-all shadow-sm"><PencilSquareIcon className="w-5 h-5" /></button>
                    <button onClick={() => removeProduct(p.id)} className="p-4 bg-rose-50 text-rose-300 rounded-2xl transition-all shadow-sm"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* PC Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
          {products.length > 0 ? (
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                  <th className="px-10 py-6">Asset & Specs</th>
                  <th className="px-10 py-6">Category</th>
                  <th className="px-10 py-6 text-center">Remaining Stock</th>
                  <th className="px-10 py-6 text-center">Retail Valuation</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-10 py-8 flex items-center space-x-6">
                      <div className="relative">
                        <img src={p.image} className="w-16 h-20 object-cover rounded-2xl shadow-sm border border-slate-100" alt="" />
                        {p.stockCount <= 0 && <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center text-[8px] text-white font-black uppercase">OOS</div>}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-lg tracking-tight">{p.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mt-1">ID: {p.id} • {p.fabricType}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">{p.category}</span>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-xl font-black ${p.stockCount <= 3 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>{p.stockCount} Pieces</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest mt-1 ${p.inStock ? 'text-emerald-500' : 'text-rose-400'}`}>
                          {p.inStock ? 'Available For Dispatch' : 'Awaiting Restock'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-black text-slate-900 tracking-tighter">BDT {p.price.toLocaleString()}</span>
                        {p.discountPrice && <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Net: {p.discountPrice.toLocaleString()}</span>}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right space-x-2">
                      <button onClick={() => openEditModal(p)} className="p-4 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all shadow-sm"><PencilSquareIcon className="w-5 h-5" /></button>
                      <button onClick={() => removeProduct(p.id)} className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"><TrashIcon className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-32 text-center">
               <ArchiveBoxIcon className="w-16 h-16 text-slate-100 mx-auto mb-6" />
               <h3 className="text-xl font-bold serif text-slate-400">Inventory Ledger Clear</h3>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 md:p-14 w-full max-w-6xl shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-transform hover:rotate-90 duration-300"><XMarkIcon className="w-10 h-10" /></button>
              
              <div className="flex items-center space-x-5 mb-10 pb-8 border-b border-slate-50">
                 <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                    <ShoppingBagIcon className="w-9 h-9" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold serif text-slate-900 tracking-tight">{editingProduct ? 'Update Registered Item' : 'Enroll New Catalogue Item'}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Artisan Inventory Sync</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-1">Product Designation</label>
                      <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold text-lg" placeholder="e.g. Imperial Silk Sherwani" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-1">Catalogue MSRP (BDT)</label>
                        <input type="number" required value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-black text-2xl" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-1">Inventory Stock Level</label>
                        <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-2xl border border-white/10">
                           <input type="number" min="0" required value={form.stockCount} onChange={e => setForm({...form, stockCount: parseInt(e.target.value)})} className="w-full bg-transparent border-none px-4 py-2 outline-none font-black text-2xl text-amber-500 text-center" />
                           <span className="text-[9px] font-black uppercase text-slate-500 pr-4">Units</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-1">Classification</label>
                            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none appearance-none font-black text-xs uppercase tracking-widest">
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-1">Lifecycle Status</label>
                            <div className="flex h-[66px] items-center px-6 bg-slate-900 rounded-2xl shadow-xl border border-white/5">
                                <div className={`w-2.5 h-2.5 rounded-full mr-4 ${(form.stockCount || 0) > 0 ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'}`}></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">{(form.stockCount || 0) > 0 ? 'Live in Store' : 'Out of Stock'}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-1">Fabric Specifications</label>
                      <input value={form.fabricType} onChange={e => setForm({...form, fabricType: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none font-medium" placeholder="e.g. 100% Egyptian Giza Cotton" />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Artisan Media Asset</label>
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
                       <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-[2.5rem] text-center cursor-pointer hover:border-amber-600 transition-all flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
                          {form.image && imageSource === 'upload' ? (
                             <img src={form.image} className="w-full h-full object-cover rounded-2xl shadow-xl" alt="" />
                          ) : (
                             <>
                                <PhotoIcon className="w-16 h-16 text-slate-200 mb-4" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select High-Res Original</span>
                             </>
                          )}
                          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                       </div>
                    ) : (
                       <div className="space-y-4">
                          <div className="relative group">
                             <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-600 transition-colors" />
                             <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-5 rounded-[1.5rem] outline-none font-mono text-xs shadow-inner" placeholder="https://..." />
                          </div>
                          {form.image && (
                            <div className="w-full aspect-video rounded-[2rem] border border-slate-100 bg-slate-50 overflow-hidden relative shadow-inner">
                               <img src={form.image} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/800?text=Invalid+Artisan+Stream'} />
                            </div>
                          )}
                       </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-1">Scale Dimensions (CSV)</label>
                    <input value={form.availableSizes as any} onChange={e => setForm({...form, availableSizes: e.target.value as any})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none font-mono text-xs shadow-inner" placeholder="S, M, L, XL, XXL" />
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-10 border-t border-slate-100">
                <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start space-x-5 mb-10 shadow-sm">
                    <ExclamationCircleIcon className="w-8 h-8 text-amber-600 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Database Consistency Protocol</p>
                        <p className="text-xs text-amber-800 leading-relaxed mt-2 font-medium italic">"Submitting these changes will automatically update the virtual database.json file in local storage. Stock levels are automatically deducted upon order settlement."</p>
                    </div>
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-bold uppercase tracking-[0.2em] text-[11px] shadow-3xl hover:bg-emerald-600 transition-all active:scale-95">
                   Finalize Global Inventory Synchronisation
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProductsPage;
