
import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PlusIcon, 
  TrashIcon, 
  XMarkIcon, 
  GiftIcon,
  MagnifyingGlassIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  SparklesIcon,
  TicketIcon,
  Cog6ToothIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { GiftCard } from '../../types.ts';

const AdminGiftCardsPage: React.FC = () => {
  const { giftCards, addGiftCard, updateGiftCard, removeGiftCard, systemConfig, updateSystemConfig } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  const [form, setForm] = useState<Partial<GiftCard>>({
    customerName: '',
    customerEmail: '',
    initialAmount: 0,
    expiryDate: ''
  });

  const [denominations, setDenominations] = useState<string>(
    (systemConfig.giftCardDenominations || [2000, 5000, 10000, 25000]).join(', ')
  );

  const filteredCards = useMemo(() => {
    return giftCards.filter(gc => {
      const matchesSearch = 
        gc.code.toLowerCase().includes(search.toLowerCase()) || 
        gc.customerName.toLowerCase().includes(search.toLowerCase()) ||
        gc.customerEmail.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || 
        (statusFilter === 'Active' && gc.isActive) || 
        (statusFilter === 'Inactive' && !gc.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [giftCards, search, statusFilter]);

  const generateCode = () => {
    return 'MT' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCard: GiftCard = {
      id: 'GC' + Date.now(),
      code: generateCode(),
      balance: form.initialAmount || 0,
      initialAmount: form.initialAmount || 0,
      customerName: form.customerName || 'Walk-in Patron',
      customerEmail: form.customerEmail || '',
      isActive: true,
      expiryDate: form.expiryDate,
      createdAt: new Date().toISOString()
    };
    await addGiftCard(newCard);
    setIsModalOpen(false);
    setForm({ customerName: '', customerEmail: '', initialAmount: 0, expiryDate: '' });
  };

  const handleSaveSettings = () => {
    const newDemos = denominations.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
    updateSystemConfig({ ...systemConfig, giftCardDenominations: newDemos });
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-6 md:p-16">
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <span className="w-8 h-px bg-amber-600"></span>
              <span className="text-[10px] font-black uppercase tracking-widest">Digital Currencies</span>
            </div>
            <h1 className="text-4xl font-bold serif text-slate-900 tracking-tight">Gift Credit Ledger</h1>
            <p className="text-slate-400 mt-2 text-sm font-medium">Currently managing {giftCards.length} issued artisan credits</p>
          </div>
          <div className="flex space-x-4 w-full lg:w-auto">
            <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex-1 lg:flex-none bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2 shadow-sm hover:bg-slate-50 transition-all"
            >
                <Cog6ToothIcon className="w-4 h-4" />
                <span>Configure Buy System</span>
            </button>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 lg:flex-none bg-slate-900 text-white px-10 py-4 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] flex items-center justify-center space-x-3 shadow-2xl hover:bg-amber-600 transition-all active:scale-95"
            >
                <PlusIcon className="w-4 h-4" />
                <span>Issue Manual Credit</span>
            </button>
          </div>
        </header>

        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search by code, patron or email..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition text-sm font-medium shadow-inner" 
              />
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                {(['All', 'Active', 'Inactive'] as const).map(f => (
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

        {filteredCards.length > 0 ? (
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden overflow-x-auto no-scrollbar">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                  <th className="px-10 py-6">Voucher Code</th>
                  <th className="px-10 py-6">Beneficiary</th>
                  <th className="px-10 py-6 text-center">Remaining Balance</th>
                  <th className="px-10 py-6 text-center">Expiry</th>
                  <th className="px-10 py-6 text-center">State</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredCards.map(gc => (
                  <tr key={gc.id} className="hover:bg-slate-50/50 transition group">
                    <td className="px-10 py-8">
                       <span className="font-mono font-black text-slate-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 tracking-wider uppercase text-xs">{gc.code}</span>
                    </td>
                    <td className="px-10 py-8">
                       <p className="font-bold text-slate-900">{gc.customerName}</p>
                       <p className="text-[10px] text-slate-400 font-mono mt-0.5">{gc.customerEmail}</p>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-slate-900">BDT {gc.balance.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-300 font-bold uppercase">Initial: {gc.initialAmount.toLocaleString()}</span>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <span className="text-xs font-bold text-slate-600">{gc.expiryDate ? new Date(gc.expiryDate).toLocaleDateString() : 'Evergreen'}</span>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <button 
                        onClick={() => updateGiftCard({...gc, isActive: !gc.isActive})}
                        className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${gc.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'}`}
                       >
                         {gc.isActive ? 'Active' : 'Disabled'}
                       </button>
                    </td>
                    <td className="px-10 py-8 text-right space-x-2">
                       <button onClick={() => removeGiftCard(gc.id)} className="p-3 text-slate-200 hover:text-red-500 transition-colors">
                          <TrashIcon className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <GiftIcon className="w-20 h-20 text-slate-100 mx-auto mb-6" />
             <h3 className="text-xl font-bold serif text-slate-400">No Gift Credits Found</h3>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-2">Patron currency registry is clear</p>
          </div>
        )}

        {/* SETTINGS MODAL: Denominations */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[250] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
             <div className="bg-white rounded-[3.5rem] p-10 md:p-14 w-full max-w-xl shadow-3xl relative animate-in zoom-in duration-300">
                <button onClick={() => setIsSettingsOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-transform hover:rotate-90"><XMarkIcon className="w-10 h-10" /></button>
                <div className="mb-10 flex items-center space-x-4">
                   <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg">
                      <Cog6ToothIcon className="w-6 h-6" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-bold serif text-slate-900">Buy System Config</h2>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Manage deno availablity on index page</p>
                   </div>
                </div>
                
                <div className="space-y-8">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Available Denominations (CSV)</label>
                      <input 
                        value={denominations} 
                        onChange={e => setDenominations(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none font-bold text-lg tracking-widest text-amber-600 shadow-inner" 
                        placeholder="2000, 5000, 10000, 25000" 
                      />
                      <p className="text-[9px] text-slate-400 mt-3 italic">Separated by commas. These amounts will appear as selectable buttons on the gift card purchase page.</p>
                   </div>
                   
                   <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start space-x-4">
                      <ArrowPathIcon className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                      <p className="text-[10px] text-amber-800 leading-relaxed font-bold italic">
                        Updating these denominations will instantly refresh the consumer interface. All purchases made will automatically generate and persist the codes into the global database.
                      </p>
                   </div>

                   <button 
                     onClick={handleSaveSettings}
                     className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-bold uppercase tracking-[0.2em] text-xs shadow-3xl hover:bg-emerald-600 transition-all active:scale-95"
                   >
                     Commit Buy System Handshake
                   </button>
                </div>
             </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-10 md:p-14 w-full max-w-2xl shadow-3xl relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-slate-950 transition-transform hover:rotate-90 duration-300"><XMarkIcon className="w-10 h-10" /></button>
              
              <div className="flex items-center space-x-5 mb-10 pb-8 border-b border-slate-50">
                 <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <SparklesIcon className="w-10 h-10" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold serif text-slate-900 tracking-tight">Issue Manual Credit</h2>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Manual Bespoke Voucher Provisioning</p>
                 </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Patron Full Name</label>
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input required value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold" placeholder="Walk-in Customer" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Recipient Email</label>
                    <input required type="email" value={form.customerEmail} onChange={e => setForm({...form, customerEmail: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold" placeholder="patron@gmail.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Initial Amount (BDT)</label>
                    <input required type="number" value={form.initialAmount} onChange={e => setForm({...form, initialAmount: parseFloat(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-600/5 transition font-black text-2xl text-slate-900" placeholder="5000" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Voucher Expiry (Optional)</label>
                    <input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold text-xs" />
                  </div>
                </div>

                <div className="p-8 bg-slate-950 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                   <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="text-center sm:text-left">
                         <h4 className="text-white font-bold text-lg">Automated Serialisation</h4>
                         <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">A unique 10-digit secure token will be generated</p>
                      </div>
                      <div className="flex items-center space-x-3 text-amber-500">
                         <TicketIcon className="w-10 h-10 animate-bounce" />
                      </div>
                   </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-bold uppercase tracking-[0.2em] text-xs shadow-3xl hover:bg-amber-600 transition-all active:scale-[0.98]">
                  Commit Credit Issuance & Notify Patron
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminGiftCardsPage;
