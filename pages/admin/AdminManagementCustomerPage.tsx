
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
  ExclamationTriangleIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  UserPlusIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { User } from '../../types.ts';

const AdminManagementCustomerPage: React.FC = () => {
  const { allUsers, updateAnyUser, removeUser, orders, sendEmail, systemConfig } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [targetEmail, setTargetEmail] = useState('');
  const [targetName, setTargetName] = useState('');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState<Partial<User>>({
    name: '', email: '', phone: '', address: '', role: 'customer'
  });

  const [emailForm, setEmailForm] = useState({ subject: '', body: '' });
  const [isSending, setIsSending] = useState(false);

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

  const handleSendManualEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail) return;
    setIsSending(true);
    setTimeout(async () => {
      await sendEmail(targetEmail, emailForm.subject, emailForm.body);
      setIsSending(false);
      setIsEmailModalOpen(false);
      setEmailForm({ subject: '', body: '' });
      setTargetEmail('');
      setTargetName('');
    }, 1000);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setForm(u);
    setIsModalOpen(true);
  };

  const openEmailModal = (u?: User) => {
    if (u) {
        setTargetEmail(u.email);
        setTargetName(u.name);
        setEmailForm({ subject: 'Update regarding your Bespoke Fit', body: `Salaam ${u.name.split(' ')[0]},\n\n` });
    } else {
        setTargetEmail('');
        setTargetName('Guest Inquirer');
        setEmailForm({ subject: 'Inquiry response from Mehedi Tailors', body: `Greetings,\n\n` });
    }
    setIsEmailModalOpen(true);
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
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold serif text-slate-900">Patron Directory</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest">Global relationship management</p>
          </div>
          <button 
            onClick={() => openEmailModal()}
            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-3 shadow-2xl hover:bg-amber-600 transition-all active:scale-95"
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            <span>Global Outreach</span>
          </button>
        </header>

        <div className="mb-8 relative max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patron ledger..." 
            className="w-full bg-white border border-slate-100 pl-12 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition shadow-sm" 
          />
        </div>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
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
                    <td className="px-10 py-8 text-right space-x-1">
                      <button onClick={() => openEmailModal(u)} title="Contact Patron" className="p-2.5 text-slate-300 hover:text-teal-600 transition hover:bg-teal-50 rounded-xl"><EnvelopeIcon className="w-5 h-5" /></button>
                      <button onClick={() => openEditModal(u)} title="Edit Profile" className="p-2.5 text-slate-300 hover:text-amber-600 transition hover:bg-amber-50 rounded-xl"><PencilSquareIcon className="w-5 h-5" /></button>
                      <button onClick={() => setDeleteConfirmId(u.id)} title="Remove" className="p-2.5 text-slate-300 hover:text-red-500 transition hover:bg-red-50 rounded-xl"><TrashIcon className="w-5 h-5" /></button>
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

        {/* Improved Communication Modal */}
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-[120] bg-slate-900/70 backdrop-blur-xl flex items-center justify-center p-4">
             <form onSubmit={handleSendManualEmail} className="bg-white rounded-[4rem] p-10 md:p-14 w-full max-w-2xl shadow-[0_60px_120px_-30px_rgba(0,0,0,0.5)] relative animate-in zoom-in duration-500">
                <button type="button" onClick={() => setIsEmailModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-950 transition-transform hover:rotate-90 duration-300"><XMarkIcon className="w-10 h-10" /></button>
                
                <div className="flex items-center space-x-4 mb-10 pb-10 border-b border-slate-100">
                   <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                      <GlobeAltIcon className="w-8 h-8" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-bold serif text-slate-950 tracking-tight">Artisan Dispatch</h2>
                      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Communication Suite v4.0</p>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-2">Recipient Email</label>
                            <input 
                                required 
                                type="email"
                                value={targetEmail} 
                                onChange={e => setTargetEmail(e.target.value)} 
                                className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold text-sm"
                                placeholder="name@patron.com"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-2">Recipient Name</label>
                            <input 
                                value={targetName} 
                                onChange={e => setTargetName(e.target.value)} 
                                className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold text-sm"
                                placeholder="Arif Ahmed"
                            />
                        </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-2">Official Subject</label>
                      <input required value={emailForm.subject} onChange={e => setEmailForm({...emailForm, subject: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold text-lg" />
                   </div>

                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 ml-2">Message Body</label>
                      <textarea required rows={8} value={emailForm.body} onChange={e => setEmailForm({...emailForm, body: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-amber-600/5 transition resize-none font-medium text-base leading-relaxed" />
                   </div>

                   <div className="bg-slate-950 p-6 rounded-[2rem] flex items-center justify-between border border-white/5">
                        <div className="flex items-center space-x-3">
                            <img src={systemConfig.documentLogo || systemConfig.siteLogo} className="h-8 w-auto grayscale opacity-40 brightness-200" alt="Logo Header" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Shop Logo Injected</span>
                        </div>
                        <button 
                            disabled={isSending}
                            className="bg-amber-600 text-white px-10 py-4 rounded-[1.2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-amber-700 flex items-center space-x-3 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSending ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                <PaperAirplaneIcon className="w-4 h-4" />
                                <span>Lodge Dispatch</span>
                                </>
                            )}
                        </button>
                   </div>
                </div>
             </form>
          </div>
        )}

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
