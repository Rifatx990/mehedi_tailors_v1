
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PrinterIcon, 
  MagnifyingGlassIcon,
  TagIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

const AdminCatalogPage: React.FC = () => {
  const { products } = useStore();
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 no-print">
          <div>
            <h1 className="text-4xl font-bold serif text-slate-900">Inventory Catalog</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest font-bold">Printable SKU Directory</p>
          </div>
          <div className="flex space-x-3">
             <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter Catalog..." 
                  className="pl-10 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-amber-600/5 transition" 
                />
             </div>
             <button 
                onClick={() => window.print()}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-xl hover:bg-amber-600 transition"
              >
                <PrinterIcon className="w-5 h-5" />
                <span>Print Catalog</span>
              </button>
          </div>
        </header>

        <div className="invoice-card bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="bg-slate-900 p-10 text-white no-print-bg">
              <h2 className="text-2xl font-bold serif tracking-tight">OFFICIAL PRODUCT DIRECTORY</h2>
              <p className="text-slate-400 text-[10px] uppercase tracking-[0.4em] mt-1">Mehedi Tailors & Fabrics Artisan Archive</p>
           </div>

           <div className="p-10 md:p-16">
              <div className="grid grid-cols-1 gap-1">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b-2 border-slate-900">
                          <th className="py-6 px-4">SKU / ID</th>
                          <th className="py-6 px-4">Product Specs</th>
                          <th className="py-6 px-4">Classification</th>
                          <th className="py-6 px-4 text-center">In-Stock</th>
                          <th className="py-6 px-4 text-right">MSRP Valuation</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {filtered.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 transition group">
                             <td className="py-8 px-4">
                                <span className="font-mono text-xs font-bold bg-slate-100 px-3 py-1 rounded-full">{p.id}</span>
                             </td>
                             <td className="py-8 px-4">
                                <div className="flex items-center space-x-6">
                                   <div className="w-12 h-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                                      <img src={p.image} className="w-full h-full object-cover" />
                                   </div>
                                   <div>
                                      <p className="font-bold text-slate-900 leading-tight mb-1">{p.name}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter line-clamp-1">{p.fabricType} • {Array.isArray(p.availableSizes) ? p.availableSizes.join('/') : p.availableSizes}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="py-8 px-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{p.category}</span>
                             </td>
                             <td className="py-8 px-4 text-center">
                                <span className={`text-[10px] font-bold uppercase ${p.inStock ? 'text-emerald-600' : 'text-rose-500'}`}>{p.inStock ? 'Yes' : 'No'}</span>
                             </td>
                             <td className="py-8 px-4 text-right">
                                <div className="flex flex-col items-end">
                                   <p className="font-bold text-slate-900">BDT {p.price.toLocaleString()}</p>
                                   {p.discountPrice && <p className="text-[9px] font-bold text-amber-600 uppercase">Sale: BDT {p.discountPrice.toLocaleString()}</p>}
                                </div>
                             </td>
                          </tr>
                       ))}
                       {filtered.length === 0 && (
                         <tr>
                            <td colSpan={5} className="py-32 text-center text-slate-400">No matching products in the archive.</td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>

              <div className="mt-20 pt-10 border-t border-slate-100 text-center">
                 <p className="text-[9px] text-slate-400 uppercase tracking-[0.5em] font-bold">Heritage Precision • Inventory Excellence</p>
                 <p className="text-[8px] text-slate-300 mt-4 leading-relaxed">
                   Global Studio Archive • SAVAR Savvy Solutions Suite &copy; 2025
                 </p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCatalogPage;
