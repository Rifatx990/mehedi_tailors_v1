
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
  LockClosedIcon,
  KeyIcon,
  CheckCircleIcon,
  PlusIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';
import { User } from '../../types.ts';

const AdminManagementCustomerPage: React.FC = () => {
  const { allUsers, registerNewUser, updateAnyUser, removeUser, orders, roastMaliciousUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  
  // Interactive Security Protocol State
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPass: '', confirmPass: '' });
  const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false);

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

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmingUpdate(true);
  };

  const finalizeUpdate = async () => {
    if (form.name) await roastMaliciousUser(form.name);
    if (form.address) await roastMaliciousUser(form.address);

    const userData: User = {
      id: editingUser ? editingUser.id : 'u' + Math.random().toString(36).substr(2, 5),
      name: form.name || '',
      email: form.email || '',
      phone: form.phone || '',
      address: form.address || '',
      role: 'customer',
      measurements: editingUser ? editingUser.measurements : [],
      password: (isUpdatingPassword && passwordForm.newPass) ? passwordForm.newPass : (editingUser?.password || 'welcome123')
    };

    if (editingUser) {
        await updateAnyUser(userData, true); // Notification triggered in context
    } else {
        await registerNewUser(userData);
    }
    
    setIsConfirmingUpdate(false);
    setIsModalOpen(false);
    setEditingUser(null);
    setIsUpdatingPassword(false);
    setPasswordForm({ newPass: '', confirmPass: '' });
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setForm(u);
    setIsUpdatingPassword(false);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-6 md:p-16">
        <header className="mb-10 flex flex-col lg:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-2 text-amber-600 mb-2">
              <UserGroupIcon className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Patron Registry</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold serif text-slate-900 tracking-tight">Artisan Directory</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest font-bold">{customers.length} Registered patrons</p>
          </div>
          <button 
            onClick={() => { setEditingUser(null); setForm({name:'', email:'', phone:'', address:'', role:'customer'}); setIsModalOpen(true); }}
            className="w-full md:w-auto bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] flex items-center justify-center space-x-3 shadow-2xl hover:bg-amber-600 transition-all active:scale-95"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Onboard New Patron</span>
          </button>
        </header>

        <div className="mb-8 relative max-w-md">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter archive..." 
            className="w-full bg-white border border-slate-100 pl-12 pr-6 py-5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-amber-600/5 transition shadow-sm font-medium" 
          />
        </div>

        {/* PC TABLE / MOBILE CARDS HYBRID */}
        <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="hidden lg:block overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                  <th className="px-10 py-6">Customer Profile</th>
                  <th className="px-10 py-6 text-center">Order Count</th>
                  <th className="px-10 py-6 text-center">Net Life Value</th>
                  <th className="px-10 py-6 text-right">Directives</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCustomers.map(u => {
                  const metrics = getCustomerMetrics(u.email);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition group">
                      <td className="px-10 py-8">
                         <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-inner">
                               {u.name.charAt(0)}
                            </div>
                            <div>
                               <p className="font-bold text-slate-900 text-base">{u.name}</p>
                               <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">{u.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-10 py-8 text-center">
                         <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black shadow-inner">{metrics.count} Commissions</span>
                      </td>
                      <td className="px-10 py-8 text-center font-black text-slate-900 text-lg tracking-tighter">
                         BDT {metrics.spent.toLocaleString()}
                      </td>
                      <td className="px-10 py-8 text-right space-x-2">
                         <button onClick={() => openEditModal(u)} className="p-4 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-2xl transition-all shadow-sm"><PencilSquareIcon className="w-5 h-5" /></button>
                         <button onClick={() => setDeleteConfirmId(u.id)} className="p-4 text-slate-200 hover:text-red-500 transition-all"><TrashIcon className="w-5 h-5" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards (Visible below lg) */}
          <div className="lg:hidden divide-y divide-slate-100">
             {filteredCustomers.map(u => {
                const metrics = getCustomerMetrics(u.email);
                return (
                  <div key={u.id} className="p-6 space-y-6">
                     <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center font-bold text-xl">{u.name.charAt(0)}</div>
                        <div className="min-w-0 flex-grow">
                           <h3 className="font-bold text-lg text-slate-900 truncate">{u.name}</h3>
                           <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        </div>
                        <div className="flex flex-col items-end">
                           <p className="text-[10px] font-black uppercase text-amber-600">Spent</p>
                           <p className="text-sm font-black">BDT {metrics.spent.toLocaleString()}</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => openEditModal(u)} className="flex items-center justify-center space-x-2 bg-slate-50 text-slate-600 py-3 rounded-xl font-bold uppercase text-[9px] tracking-widest border border-slate-100">
                           <PencilSquareIcon className="w-4 h-4" />
                           <span>Update</span>
                        </button>
                        <button onClick={() => setDeleteConfirmId(u.id)} className="flex items-center justify-center space-x-2 bg-red-50 text-red-500 py-3 rounded-xl font-bold uppercase text-[9px] tracking-widest border border-red-100">
                           <TrashIcon className="w-4 h-4" />
                           <span>Discard</span>
                        </button>
                     </div>
                  </div>
                );
             })}
          </div>

          {filteredCustomers.length === 0 && (
            <div className="py-32 text-center">
               <UserGroupIcon className="w-16 h-16 text-slate-100 mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Patron archive is currently clear</p>
            </div>
          )}
        </div>

        {/* MODAL: Customer Profiling & Update */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
             <form onSubmit={handleInitialSubmit} className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 w-full max-w-3xl shadow-2xl relative animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
                <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-950 transition-transform hover:rotate-90 duration-300"><XMarkIcon className="w-10 h-10" /></button>
                
                <h2 className="text-3xl font-bold serif mb-10 pb-6 border-b border-slate-50">{editingUser ? 'Synchronize Profiling' : 'Patron Enrollment'}</h2>
                
                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Full Legal Name</label>
                         <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-amber-600/5 transition" />
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Email Identity</label>
                         <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-amber-600/5 transition" />
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Primary Mobile</label>
                         <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-amber-600/5 transition" />
                      </div>
                      <div>
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Delivery Headquarters</label>
                         <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-amber-600/5 transition" />
                      </div>
                   </div>

                   {/* INTERACTIVE SECURITY PROTOCOL SECTION */}
                   <div className="p-8 bg-slate-950 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                      <FingerPrintIcon className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform duration-1000" />
                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                         <div>
                            <h4 className="text-white font-bold text-lg flex items-center space-x-3">
                               <KeyIcon className="w-6 h-6 text-amber-500" />
                               <span>Artisan Key Management</span>
                            </h4>
                            <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1 font-black">Secure authentication update protocol</p>
                         </div>
                         {!isUpdatingPassword ? (
                           <button 
                             type="button" 
                             onClick={() => setIsUpdatingPassword(true)}
                             className="w-full sm:w-auto px-10 py-4 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 hover:bg-white hover:text-slate-900 transition-all shadow-xl"
                           >
                              Unlock Passkey Reset
                           </button>
                         ) : (
                           <div className="flex flex-col gap-3 w-full sm:w-auto animate-in slide-in-from-right-4 duration-500">
                              <input 
                                type="password"
                                value={passwordForm.newPass}
                                onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})}
                                className="bg-white/10 border border-white/20 px-6 py-3 rounded-xl outline-none text-white text-sm font-bold sm:min-w-[240px] focus:ring-2 focus:ring-amber-500/30" 
                                placeholder="Enter New Security Key..."
                              />
                              <div className="flex items-center space-x-2">
                                 <div className="h-1 flex-grow bg-slate-800 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-1000 ${passwordForm.newPass.length > 8 ? 'w-full bg-emerald-500' : 'w-1/2 bg-amber-500'}`}></div>
                                 </div>
                                 <button type="button" onClick={() => setIsUpdatingPassword(false)} className="text-[10px] font-black uppercase text-red-400 hover:text-red-300 px-2 transition">Cancel</button>
                              </div>
                           </div>
                         )}
                      </div>
                   </div>

                   <div className="p-6 bg-amber-50 rounded-[1.8rem] border border-amber-100 flex items-start space-x-5">
                      <ExclamationTriangleIcon className="w-8 h-8 text-amber-600 mt-1 flex-shrink-0" />
                      <p className="text-[11px] text-amber-800 leading-relaxed font-bold italic">
                        Synchronizing these records will trigger an automated **Database Integrity Mail** to the patron's secure email, summarizing all artisan profiling changes and fitting parameters.
                      </p>
                   </div>

                   <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-3xl hover:bg-emerald-600 transition-all active:scale-95">
                      {editingUser ? 'Initiate Record Synchronisation' : 'Lodge New Patron Records'}
                   </button>
                </div>
             </form>
          </div>
        )}

        {/* MODAL: Update Confirmation */}
        {isConfirmingUpdate && (
          <div className="fixed inset-0 z-[150] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
             <div className="bg-white rounded-[3.5rem] p-12 max-w-md w-full text-center shadow-3xl animate-in zoom-in duration-300">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                   <PaperAirplaneIcon className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-bold serif mb-4 text-slate-900 tracking-tight">Handshake Confirmation</h3>
                <p className="text-slate-500 text-sm mb-12 font-medium leading-relaxed">You are about to commit these changes to the Global Artisan Ledger. A summary will be dispatched to <span className="text-slate-900 font-black">{form.email}</span> instantly.</p>
                <div className="flex flex-col space-y-4">
                   <button onClick={finalizeUpdate} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-emerald-600/20 active:scale-95 transition-all">Sign & Commit Registry</button>
                   <button onClick={() => setIsConfirmingUpdate(false)} className="w-full bg-slate-50 text-slate-400 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-100 transition-all">Discard Draft</button>
                </div>
             </div>
          </div>
        )}

        {/* MODAL: Delete Confirmation */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[130] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-4">
             <div className="bg-white p-12 rounded-[3.5rem] max-w-sm w-full text-center shadow-3xl animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10">
                   <ExclamationTriangleIcon className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-bold serif mb-4 text-slate-900">Purge Identity?</h3>
                <p className="text-slate-500 text-sm mb-12 font-medium leading-relaxed">This action Irreversibly removes the patron profile and their historical measurement silhouettes from the atelier archive.</p>
                <div className="flex flex-col space-y-4">
                   <button onClick={async () => { await removeUser(deleteConfirmId); setDeleteConfirmId(null); }} className="w-full bg-red-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-red-600/20 active:scale-95 transition-all">Destroy Records</button>
                   <button onClick={() => setDeleteConfirmId(null)} className="w-full bg-slate-100 text-slate-400 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-200 transition-all">Preserve Identity</button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminManagementCustomerPage;
