
import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  XMarkIcon, 
  BanknotesIcon,
  MagnifyingGlassIcon,
  UserIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  CurrencyBangladeshiIcon,
  PrinterIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import { DueRecord, User } from '../../types.ts';

const AdminDuesPage: React.FC = () => {
  const { dues, addDue, updateDue, removeDue, allUsers, systemConfig } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDue, setEditingDue] = useState<DueRecord | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'pending' | 'settled'>('All');

  const [form, setForm] = useState<Partial<DueRecord>>({
    customerName: '',
    customerEmail: '',
    amount: 0,
    reason: '',
    status: 'pending'
  });

  const filteredDues = useMemo(() => {
    return dues.filter(d => {
      const matchesSearch = 
        d.customerName.toLowerCase().includes(search.toLowerCase()) || 
        d.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
        d.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [dues, search, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if customer email matches an existing user to link IDs
    const matchedUser = allUsers.find(u => u.email.toLowerCase() === form.customerEmail?.toLowerCase());

    const dueData: DueRecord = {
      id: editingDue ? editingDue.id : 'DUE-' + Math.floor(10000 + Math.random() * 90000),
      customerName: form.customerName || 'Unknown Patron',
      customerEmail: form.customerEmail || '',
      userId: matchedUser?.id,
      amount: form.amount || 0,
      reason: form.reason || 'General Bespoke Balance',
      status: form.status || 'pending',
      date: editingDue ? editingDue.date : new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    if (editingDue) {
      // Logic for settledDate handled in StoreContext but can be reinforced here
      await updateDue(dueData);
    } else {
      await addDue(dueData);
    }
    
    setIsModalOpen(false);
    setEditingDue(null);
    setForm({ customerName: '', customerEmail: '', amount: 0, reason: '', status: 'pending' });
  };

  const openEditModal = (d: DueRecord) => {
    setEditingDue(d);
    setForm(d);
    setIsModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const stats = useMemo(() => {
    const outstandingTotal = dues.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0);
    const settledTotal = dues.filter(d => d.status === 'settled').reduce((sum, d) => sum + d.amount, 0);
    const uniqueDueCustomers = new Set(dues.filter(d => d.status === 'pending').map(d => d.customerEmail)).size;
    return { outstandingTotal, settledTotal, uniqueDueCustomers };
  }, [dues]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 no-print">
          <div>
            <div className="flex items-center space-x-3 text-rose-600 mb-2">
              <span className="w-8 h-px bg-rose-600"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Fiscal Recovery</span>
            </div>
            <h1 className="text-4xl font-bold serif text-slate-900 tracking-tight">Due Ledger Report</h1>
            <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-bold">Manage outstanding patron balances</p>
          </div>
          <div className="flex gap-4">
            <button 
                onClick={handlePrint}
                className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] flex items-center space-x-3 shadow-lg hover:bg-slate-50 transition-all active:scale-95"
            >
                <PrinterIcon className="w-4 h-4" />
                <span>Print Ledger</span>
            </button>
            <button 
                onClick={() => { setEditingDue(null); setIsModalOpen(true); }}
                className="bg-slate-900 text-white px-10 py-4 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] flex items-center space-x-3 shadow-2xl hover:bg-amber-600 transition-all active:scale-95"
            >
                <PlusIcon className="w-4 h-4" />
                <span>Establish New Debt</span>
            </button>
          </div>
        </header>

        {/* STATS OVERVIEW - Print Friendly */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm invoice-card-section">
                <CurrencyBangladeshiIcon className="w-8 h-8 text-rose-500 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Outstanding Amount</p>
                <p className="text-3xl font-black text-slate-900">BDT {stats.outstandingTotal.toLocaleString()}</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm invoice-card-section">
                <UserGroupIcon className="w-8 h-8 text-amber-500 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Patrons with Dues</p>
                <p className="text-3xl font-black text-slate-900">{stats.uniqueDueCustomers} Individuals</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm invoice-card-section">
                <CheckCircleIcon className="w-8 h-8 text-emerald-500 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Recovered</p>
                <p className="text-3xl font-black text-slate-900">BDT {stats.settledTotal.toLocaleString()}</p>
            </div>
        </div>

        {/* SEARCH AND FILTERS - Hidden on Print */}
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 space-y-6 no-print">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search ledger by name, email or ref..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition text-sm font-medium" 
              />
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                {(['All', 'pending', 'settled'] as const).map(f => (
                    <button 
                        key={f}
                        onClick={() => setStatusFilter(f)}
                        className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${statusFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
          </div>
        </div>

        {/* TABLE SECTION - Main Ledger */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden overflow-x-auto invoice-card">
          {/* PRINT ONLY HEADER */}
          <div className="hidden print:flex items-center justify-between p-10 bg-slate-900 text-white">
             <div>
                <h2 className="text-2xl font-bold serif tracking-tight">{systemConfig.siteName}</h2>
                <p className="text-[10px] uppercase tracking-[0.4em] mt-1">Official Fiscal Ledger Report</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black uppercase text-slate-400">Date Generated</p>
                <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
             </div>
          </div>

          <table className="w-full text-left min-w-[1000px]">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                <th className="px-10 py-6">Ref & Patron</th>
                <th className="px-10 py-6">Due Date</th>
                <th className="px-10 py-6">Recover Date</th>
                <th className="px-10 py-6">Context / Reason</th>
                <th className="px-10 py-6 text-center">Amount Due</th>
                <th className="px-10 py-6 text-center">Status</th>
                <th className="px-10 py-6 text-right no-print">Directives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDues.map(due => (
                <tr key={due.id} className="hover:bg-slate-50/50 transition group">
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 shadow-inner group-hover:bg-amber-600 group-hover:text-white transition-all no-print">
                        {due.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{due.customerName}</p>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">REF: {due.id}</p>
                        <p className="text-[9px] text-slate-300 font-bold">{due.customerEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-xs font-bold text-slate-600">{new Date(due.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </td>
                  <td className="px-10 py-8">
                    {due.settledDate ? (
                        <p className="text-xs font-bold text-emerald-600">{new Date(due.settledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    ) : (
                        <p className="text-[9px] font-black uppercase text-slate-200">Pending Recovery</p>
                    )}
                  </td>
                  <td className="px-10 py-8">
                    <div className="max-w-xs">
                        <p className="text-xs font-medium text-slate-600 line-clamp-1 italic">"{due.reason}"</p>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className="text-lg font-black text-slate-900">BDT {due.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${due.status === 'settled' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {due.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right space-x-2 no-print">
                    <button 
                        onClick={() => openEditModal(due)}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-amber-600 rounded-xl hover:bg-amber-50 transition-all shadow-sm"
                        title="Update Fiscal Ledger"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => removeDue(due.id)}
                        className="p-3 text-slate-200 hover:text-red-500 transition-colors"
                        title="Purge Record"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDues.length === 0 && (
            <div className="py-32 text-center">
                <BanknotesIcon className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Fiscal registry is clear for this filter</p>
            </div>
          )}

          {/* PRINT ONLY FOOTER */}
          <div className="hidden print:block p-10 border-t border-slate-200 text-center">
             <p className="text-[9px] text-slate-400 uppercase tracking-[0.5em] font-black mb-2">Heritage Precision • Fiscal Excellence</p>
             <p className="text-[8px] text-slate-300">Dhonaid, Ashulia, Savar, Dhaka, Bangladesh • Global Studio Hotline: +8801720267213</p>
          </div>
        </div>

        {/* MODAL SECTION - Establishment/Modification */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 no-print">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-10 md:p-14 w-full max-w-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-950 transition-transform hover:rotate-90 duration-300"><XMarkIcon className="w-10 h-10" /></button>
              
              <div className="flex items-center space-x-5 mb-10 pb-8 border-b border-slate-50">
                 <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <BanknotesIcon className="w-10 h-10" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold serif text-slate-900 tracking-tight">{editingDue ? 'Refine Debt' : 'Establish Debt'}</h2>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Patron Fiscal Responsibility Record</p>
                 </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Patron Name</label>
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input required value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-rose-600/5 transition font-bold" placeholder="Arif Ahmed" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Patron Email (Secure)</label>
                    <input required type="email" value={form.customerEmail} onChange={e => setForm({...form, customerEmail: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-rose-600/5 transition font-bold" placeholder="patron@gmail.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Amount Due (BDT)</label>
                    <input required type="number" value={form.amount} onChange={e => setForm({...form, amount: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-600/5 transition font-black text-2xl text-slate-900" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Settlement Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none appearance-none font-black text-xs uppercase tracking-widest">
                       <option value="pending">Pending Recovery</option>
                       <option value="settled">Fully Settled</option>
                    </select>
                  </div>
                </div>

                <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Context / Contractual Reason</label>
                    <textarea required rows={3} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-[2rem] outline-none focus:ring-4 focus:ring-amber-600/5 transition resize-none font-medium leading-relaxed" placeholder="e.g. Remaining 70% balance for bespoke suit fitting..." />
                </div>

                <div className="p-6 bg-slate-950 rounded-[2rem] border border-white/5 flex items-start space-x-4">
                    <ExclamationCircleIcon className="w-6 h-6 text-amber-500 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white">Automated Governance</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Establishing or modifying this record will trigger an **Industrial Notification** to the patron's email and digital dashboard instantly.</p>
                    </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-bold uppercase tracking-[0.2em] text-xs shadow-3xl hover:bg-rose-600 transition-all active:scale-[0.98]">
                  {editingDue ? 'Commit Fiscal Adjustments' : 'Lodge Formal Debt Record'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDuesPage;
