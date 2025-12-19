
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { TrashIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

const AdminCategoriesPage: React.FC = () => {
  const { categories, addCategory, removeCategory } = useStore();
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(newName.trim()){
      addCategory(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12 text-left">
          <h1 className="text-4xl font-bold serif">Classification Control</h1>
          <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest">Organize your atelier collections</p>
        </header>

        <div className="max-w-4xl space-y-12">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold serif mb-8">Add New Category</h3>
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                placeholder="e.g. Winter Edition" 
                className="flex-grow bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition" 
              />
              <button type="submit" className="bg-slate-900 text-white px-10 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl">Create</button>
            </form>
          </div>

          {categories.length > 0 ? (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group transition hover:bg-white hover:shadow-md">
                    <span className="font-bold text-slate-700 tracking-tight">{cat}</span>
                    <button onClick={() => removeCategory(cat)} className="p-2 text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
               <ArchiveBoxIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No categories defined.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCategoriesPage;
