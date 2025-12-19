
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  TrashIcon, 
  PencilSquareIcon, 
  XMarkIcon, 
  UserGroupIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  MapPinIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { User } from '../../types.ts';

const AdminManagementCustomerPage: React.FC = () => {
  const { allUsers, updateAnyUser, removeUser, orders } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState<Partial<User>>({
    name: '', email: '', phone: '', address: '', role: 'customer'
  });

  const customers = allUsers.filter(u => u.role === 'customer' || !u.role);
  const filteredCustomers = customers.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getCustomerMetrics = (email: string) => {
    const customerOrders = orders.filter(o => o.customerEmail === email);
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
    return { count: customerOrders.length, spent: totalSpent };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData: User = {
      ...editingUser!,
      name: form.name || '',
      email: form.email || '',
      phone: form.phone || '',
      address: form.address || '',
      role: 'customer'
    };

    await updateAnyUser(userData);
    setIsModalOpen(false);
    setEditingUser(null);
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
        <header className="mb-12">
          <h1 className="text-4xl font-bold serif text-slate-900">Patron Directory</h1>
          <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest">Manage customer relationships and profiles</p>
        </header>

        <div className="mb-8 relative max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..." 
            className="w-full bg-white border border-slate-100 pl-12 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition" 
          />
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                <th className="px-10 py-6">Customer</th>
                <th className="px-10 py-6">Orders & Value</th>
                <th className="px-10 py-6">Location</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map(u => {
                const metrics = getCustomerMetrics(u.email);
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition group">
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center font-bold text-xs group-hover:bg-amber-600 group-hover:text-white transition-all">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                           <ShoppingBagIcon className="w-4 h-4 text-slate-300" />
                           <span className="text-xs font-bold text-slate-600">{metrics.count}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Total Spent</span>
                           <span className="text-xs font-bold text-slate-900">BDT {metrics.spent.toLocaleString()}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-2 text-slate-400">
                         <MapPinIcon className="w-4 h-4" />
                         <span className="text-xs font-medium truncate max-w-[150px]">{u.address}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right space-x-2">
                      <button onClick={() => openEditModal(u)} className="p-2.5 text-slate-300 hover:text-amber-600 transition hover:bg-amber-50 rounded-xl"><PencilSquareIcon className="w-5 h-5" /></button>
                      <button onClick={() => setDeleteConfirmId(u.id)} className="p-2.5 text-slate-300 hover:text-red-500 transition hover:bg-red-50 rounded-xl"><TrashIcon className="w-5 h-5" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="py-32 text-center">
              <UserGroupIcon className="w-16 h-16 text-slate-100 mx-auto mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Patron database is empty</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
             <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center animate-in zoom-in">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h3 className="text-2xl font-bold serif mb-2 text-slate-900">Delete Profile?</h3>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed">Deleting this patron's profile will remove their measurement history and contact records. Order history will remain archived but anonymized.</p>
                <div className="flex flex-col space-y-3">
                   <button onClick={handleDelete} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-red-600/20">Confirm Permanent Delete</button>
                   <button onClick={() => setDeleteConfirmId(null)} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Cancel</button>
                </div>
             </div>
          </div>
        )}

        {isModalOpen && editingUser && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 md:p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-3xl font-bold serif mb-8">Edit Patron Profile</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Email</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Phone</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Default Address</label>
                  <textarea rows={3} value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none resize-none" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl active:scale-[0.98] transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminManagementCustomerPage;
