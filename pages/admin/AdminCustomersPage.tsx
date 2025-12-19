
import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { TrashIcon, UsersIcon } from '@heroicons/react/24/outline';

const AdminCustomersPage: React.FC = () => {
  const { allUsers, removeUser } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold serif">Patron Directory</h1>
        </header>

        {allUsers.length > 0 ? (
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                  <th className="px-10 py-6">Patron</th>
                  <th className="px-10 py-6">Email</th>
                  <th className="px-10 py-6">Phone</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-10 py-8 font-bold text-slate-900">{u.name}</td>
                    <td className="px-10 py-8 text-slate-500 font-medium">{u.email}</td>
                    <td className="px-10 py-8 text-slate-400 text-xs">{u.phone}</td>
                    <td className="px-10 py-8 text-right space-x-2">
                      <button onClick={() => removeUser(u.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <UsersIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Patron directory clear.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCustomersPage;
