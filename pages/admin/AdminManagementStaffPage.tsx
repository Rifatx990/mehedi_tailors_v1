
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
    name: '', email: '', phone: '', address: 'Atelier Ashulia', role: 'admin'
  });

  const admins = allUsers.filter(u => u.role === 'admin' || u.email === 'admin@meheditailors.com');
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
      role: 'admin'
    };

    if (editingUser) await updateAnyUser(userData);
    else await registerNewUser(userData);
    
    setIsModalOpen(false);
    setEditingUser(null);
    setForm({ name: '', email: '', phone: '', address: 'Atelier Ashulia', role: 'admin' });
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setForm(u);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await removeUser(deleteConfirmId);
      setDeleteConfirmId(null);
    }
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
            onClick={() => { setEditingUser(null); setForm({ name:'', email:'', phone:'', address:'Atelier Ashulia', role:'admin' }); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-xl shadow-slate-200"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Onboard Admin</span>
          </button>
        </header>

        <div className="mb-8 relative max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search staff members..." 
            className="w-full bg-white border border-slate-100 pl-12 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition" 
          />
        </div>

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
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-bold serif text-lg shadow-inner">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Master Admin</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-medium text-slate-600">{u.email}</p>
                    <p className="text-xs text-slate-400">{u.phone}</p>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className="inline-flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-100">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span>Active Access</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right space-x-2">
                    <button onClick={() => openEditModal(u)} className="p-2.5 text-slate-300 hover:text-amber-600 transition hover:bg-amber-50 rounded-xl"><PencilSquareIcon className="w-5 h-5" /></button>
                    <button onClick={() => setDeleteConfirmId(u.id)} className="p-2.5 text-slate-300 hover:text-red-500 transition hover:bg-red-50 rounded-xl"><TrashIcon className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredAdmins.length === 0 && (
            <div className="py-20 text-center">
              <ShieldCheckIcon className="w-16 h-16 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No staff matching search</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
             <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold serif mb-2 text-slate-900">Revoke Access?</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">This will immediately terminate the staff member's session and delete their system credentials.</p>
                <div className="flex flex-col space-y-3">
                   <button onClick={handleDelete} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20">Confirm Deletion</button>
                   <button onClick={() => setDeleteConfirmId(null)} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Cancel</button>
                </div>
             </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 md:p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-3xl font-bold serif mb-8">{editingUser ? 'Update' : 'Onboard'} Admin</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Full Identity</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/10 transition" placeholder="Mehedi Admin" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Secure Email</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/10 transition" placeholder="staff@meheditailors.com" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Contact Mobile</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/10 transition" placeholder="+880 1XXX-XXXXXX" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl active:scale-[0.98] transition-all">Grant System Permissions</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminManagementStaffPage;
