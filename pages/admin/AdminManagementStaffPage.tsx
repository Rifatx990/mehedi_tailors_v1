
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  XMarkIcon, 
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { User } from '../../types.ts';

const AdminManagementStaffPage: React.FC = () => {
  const { allUsers, registerNewUser, updateAnyUser, removeUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState<Partial<User>>({
    name: '', email: '', phone: '', address: 'Atelier Ashulia', role: 'admin', password: ''
  });

  const admins = allUsers.filter(u => u.role === 'admin');
  const filteredAdmins = admins.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData: User = {
      id: editingUser ? editingUser.id : 'adm-' + Date.now(),
      name: form.name || '',
      email: form.email || '',
      phone: form.phone || '',
      address: form.address || '',
      measurements: [],
      role: 'admin',
      password: form.password || 'staff123'
    };

    if (editingUser) await updateAnyUser(userData);
    else await registerNewUser(userData);
    
    setIsModalOpen(false);
    setEditingUser(null);
    setForm({ name: '', email: '', phone: '', address: 'Atelier Ashulia', role: 'admin', password: '' });
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setForm(u);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold serif text-slate-900">Administrative Staff</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest">Global system controllers</p>
          </div>
          <button 
            onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-xl"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Onboard Admin</span>
          </button>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                <th className="px-10 py-6">Administrator</th>
                <th className="px-10 py-6">Credentials</th>
                <th className="px-10 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAdmins.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-10 py-8 font-bold">{u.name}</td>
                  <td className="px-10 py-8 text-sm text-slate-500">{u.email}</td>
                  <td className="px-10 py-8 text-center">
                    <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">Active</span>
                  </td>
                  <td className="px-10 py-8 text-right space-x-2">
                    <button onClick={() => openEditModal(u)} className="p-2 text-slate-300 hover:text-amber-600 transition"><PencilSquareIcon className="w-5 h-5" /></button>
                    <button onClick={() => removeUser(u.id)} className="p-2 text-slate-300 hover:text-red-500 transition"><TrashIcon className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 md:p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-3xl font-bold serif mb-8">{editingUser ? 'Update' : 'Onboard'} Admin</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Email</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Access Password</label>
                  <input required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" placeholder="••••••••" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl">Grant Access</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminManagementStaffPage;
