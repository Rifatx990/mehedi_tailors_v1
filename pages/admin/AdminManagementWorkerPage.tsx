
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  XMarkIcon, 
  WrenchScrewdriverIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { User } from '../../types.ts';

const AdminManagementWorkerPage: React.FC = () => {
  const { allUsers, registerNewUser, updateAnyUser, removeUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState<Partial<User>>({
    name: '', email: '', phone: '', specialization: 'Master Stitcher', experience: '5+ Years', role: 'worker'
  });

  const workers = allUsers.filter(u => u.role === 'worker');
  const filteredWorkers = workers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData: User = {
      id: editingUser ? editingUser.id : 'wrk-' + Date.now(),
      name: form.name || '',
      email: form.email || '',
      phone: form.phone || '',
      address: 'Staff Quarters, Savar',
      measurements: [],
      role: 'worker',
      specialization: form.specialization,
      experience: form.experience,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };

    if (editingUser) await updateAnyUser(userData);
    else await registerNewUser(userData);
    
    setIsModalOpen(false);
    setEditingUser(null);
    setForm({ name: '', email: '', phone: '', specialization: 'Master Stitcher', experience: '5+ Years', role: 'worker' });
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
            <h1 className="text-4xl font-bold serif text-slate-900">Artisan Workforce</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest">Master craftsmen and technicians</p>
          </div>
          <button 
            onClick={() => { setEditingUser(null); setForm({ name:'', email:'', phone:'', specialization:'Master Stitcher', experience:'5+ Years', role:'worker' }); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-xl shadow-slate-200"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Recruit Artisan</span>
          </button>
        </header>

        <div className="mb-8 relative max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search artisans by craft..." 
            className="w-full bg-white border border-slate-100 pl-12 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWorkers.map(u => (
            <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl hover:border-amber-100 transition-all duration-500">
               <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-[1.5rem] flex items-center justify-center font-bold serif text-2xl shadow-inner group-hover:bg-teal-600 group-hover:text-white transition-colors duration-500">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => openEditModal(u)} className="p-2 text-slate-300 hover:text-amber-600 transition"><PencilSquareIcon className="w-5 h-5" /></button>
                    <button onClick={() => setDeleteConfirmId(u.id)} className="p-2 text-slate-300 hover:text-red-500 transition"><TrashIcon className="w-5 h-5" /></button>
                  </div>
               </div>
               
               <h3 className="text-xl font-bold text-slate-900 mb-1">{u.name}</h3>
               <div className="flex items-center space-x-2 text-amber-600 mb-4">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{u.specialization}</span>
               </div>

               <div className="space-y-3 pt-6 border-t border-slate-50">
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-slate-400 font-medium">Expertise</span>
                     <span className="font-bold text-slate-700">{u.experience}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                     <span className="text-slate-400 font-medium">Contact</span>
                     <span className="font-bold text-slate-700">{u.phone}</span>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
             <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold serif mb-2 text-slate-900">Offboard Artisan?</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">Removing this artisan will detach them from any active production tasks. This action is irreversible.</p>
                <div className="flex flex-col space-y-3">
                   <button onClick={handleDelete} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20">Remove from Floor</button>
                   <button onClick={() => setDeleteConfirmId(null)} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Keep Record</button>
                </div>
             </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 md:p-12 w-full max-w-2xl shadow-2xl relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-3xl font-bold serif mb-8">{editingUser ? 'Modify' : 'Recruit'} Artisan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Artisan Name</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" placeholder="Kabir Artisan" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Craft Focus</label>
                    <select value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none">
                       <option>Master Stitcher</option>
                       <option>Pattern Cutter</option>
                       <option>Draper</option>
                       <option>Embroidery Artist</option>
                       <option>Quality Inspector</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Secure Email</label>
                    <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" placeholder="artisan@meheditailors.com" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Professional Experience</label>
                    <input required value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" placeholder="8+ Years" />
                  </div>
                </div>
              </div>
              
              <div className="mb-10">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Primary Mobile</label>
                <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" placeholder="+880 17XXXXXXXX" />
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl transition-all active:scale-[0.98]">Issue Workshop Credentials</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminManagementWorkerPage;
