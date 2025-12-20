
import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilSquareIcon, 
  XMarkIcon, 
  TicketIcon,
  CalendarDaysIcon,
  UsersIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Coupon } from '../../types.ts';

const AdminCouponsPage: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, removeCoupon } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [form, setForm] = useState<Partial<Coupon>>({
    code: '',
    discountPercent: 10,
    isActive: true,
    usageLimit: null,
    usageCount: 0,
    expiryDate: ''
  });

  const [isUnlimited, setIsUnlimited] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const couponData: Coupon = {
      id: editingCoupon ? editingCoupon.id : 'C-' + Date.now(),
      code: form.code?.toUpperCase() || '',
      discountPercent: form.discountPercent || 0,
      isActive: form.isActive ?? true,
      usageLimit: isUnlimited ? null : (form.usageLimit || 0),
      usageCount: editingCoupon ? editingCoupon.usageCount : 0,
      expiryDate: form.expiryDate || undefined
    };
    
    if (editingCoupon) await updateCoupon(couponData);
    else await addCoupon(couponData);
    
    setIsModalOpen(false);
    setEditingCoupon(null);
    setForm({ code: '', discountPercent: 10, isActive: true, usageLimit: null, usageCount: 0, expiryDate: '' });
    setIsUnlimited(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm(coupon);
    setIsUnlimited(coupon.usageLimit === null);
    setIsModalOpen(true);
  };

  const isExpired = (expiry?: string) => {
    if (!expiry) return false;
    return new Date(expiry) < new Date();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-4 md:p-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <TicketIcon className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Promotion Logic</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold serif text-slate-900 tracking-tight">Voucher Management</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest font-medium">{coupons.length} Strategy variants in ledger</p>
          </div>
          <button 
            onClick={() => { setEditingCoupon(null); setForm({ code:'', discountPercent:10, isActive:true, usageLimit: null, usageCount: 0, expiryDate: '' }); setIsUnlimited(true); setIsModalOpen(true); }}
            className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] flex items-center justify-center space-x-3 shadow-2xl hover:bg-amber-600 transition-all active:scale-95"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Generate New Voucher</span>
          </button>
        </header>

        {coupons.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[1000px]">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                    <th className="px-10 py-6">Voucher Code</th>
                    <th className="px-10 py-6">Discount</th>
                    <th className="px-10 py-6">Usage Stats</th>
                    <th className="px-10 py-6">Expiration</th>
                    <th className="px-10 py-6 text-center">Status</th>
                    <th className="px-10 py-6 text-right">Directives</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {coupons.map(coupon => {
                    const expired = isExpired(coupon.expiryDate);
                    const limitReached = coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit;
                    
                    return (
                      <tr key={coupon.id} className="hover:bg-slate-50/50 transition group">
                        <td className="px-10 py-8">
                           <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${coupon.isActive && !expired && !limitReached ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                 <TicketIcon className="w-5 h-5" />
                              </div>
                              <span className="font-mono font-black text-slate-900 tracking-wider text-lg">{coupon.code}</span>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           <span className="text-xl font-black text-emerald-600">{coupon.discountPercent}% OFF</span>
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex flex-col">
                              <div className="flex items-center space-x-2 text-slate-900 font-bold">
                                 <UsersIcon className="w-4 h-4 text-slate-300" />
                                 <span>{coupon.usageCount} Redemptions</span>
                              </div>
                              <p className="text-[9px] text-slate-400 uppercase font-black mt-1">
                                 Limit: {coupon.usageLimit === null ? '∞ Unlimited' : `${coupon.usageLimit} Max`}
                                 {coupon.usageLimit !== null && ` (${coupon.usageLimit - coupon.usageCount} Remaining)`}
                              </p>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col">
                            <div className={`flex items-center space-x-2 font-bold text-sm ${expired ? 'text-red-500' : 'text-slate-600'}`}>
                               <CalendarDaysIcon className="w-4 h-4 opacity-40" />
                               <span>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Evergreen'}</span>
                            </div>
                            {expired && <span className="text-[8px] font-black uppercase text-red-400 mt-1">Terminated</span>}
                          </div>
                        </td>
                        <td className="px-10 py-8 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${coupon.isActive && !expired && !limitReached ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            {expired ? 'Expired' : limitReached ? 'Limit Reached' : coupon.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-10 py-8 text-right space-x-2">
                          <button onClick={() => openEditModal(coupon)} className="p-3 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all shadow-sm">
                            <PencilSquareIcon className="w-5 h-5" />
                          </button>
                          <button onClick={() => removeCoupon(coupon.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {coupons.map(coupon => {
                const expired = isExpired(coupon.expiryDate);
                const limitReached = coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit;
                const remaining = coupon.usageLimit === null ? '∞' : (coupon.usageLimit - coupon.usageCount);

                return (
                  <div key={coupon.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center ${coupon.isActive && !expired && !limitReached ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                          <TicketIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-mono font-black text-slate-900 tracking-widest text-lg">{coupon.code}</p>
                          <p className="text-xl font-black text-emerald-600">{coupon.discountPercent}% OFF</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${coupon.isActive && !expired && !limitReached ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {expired ? 'Expired' : limitReached ? 'Limit' : coupon.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Used</p>
                        <p className="text-sm font-black text-slate-900">{coupon.usageCount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Remaining</p>
                        <p className="text-sm font-black text-slate-900">{remaining}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 bg-white p-2 rounded-lg border border-slate-50">
                       <ClockIcon className="w-4 h-4 text-slate-300" />
                       <span>Expires: {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'Never'}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                       <button onClick={() => openEditModal(coupon)} className="flex-1 flex items-center justify-center space-x-2 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl">
                         <PencilSquareIcon className="w-4 h-4" />
                         <span>Modify</span>
                       </button>
                       <button onClick={() => removeCoupon(coupon.id)} className="p-4 bg-red-50 text-red-400 rounded-xl border border-red-100">
                         <TrashIcon className="w-5 h-5" />
                       </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
             <TicketIcon className="w-20 h-20 text-slate-100 mx-auto mb-6" />
             <h3 className="text-xl font-bold serif text-slate-400 tracking-tight">No Promotional Vouchers Found</h3>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-2">Generate your first strategy to drive sales volume.</p>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-8 md:p-14 w-full max-w-2xl shadow-3xl relative animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-950 transition-transform hover:rotate-90 duration-300">
                <XMarkIcon className="w-10 h-10" />
              </button>
              
              <div className="flex items-center space-x-5 mb-10 pb-8 border-b border-slate-50">
                 <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                    <TicketIcon className="w-10 h-10" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold serif text-slate-900 tracking-tight">{editingCoupon ? 'Modify Strategy' : 'Archive New Voucher'}</h2>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Campaign Logic & Usage Policies</p>
                 </div>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Redemption Code</label>
                    <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-black text-lg tracking-widest" placeholder="EID2025" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Discount Magnitude (%)</label>
                    <input required type="number" min="1" max="100" value={form.discountPercent} onChange={e => setForm({...form, discountPercent: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-600/5 transition font-black text-2xl text-slate-900" />
                  </div>
                </div>

                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div>
                         <h4 className="text-slate-900 font-bold text-base flex items-center space-x-2">
                            <UsersIcon className="w-5 h-5 text-amber-600" />
                            <span>Frequency Policy</span>
                         </h4>
                         <p className="text-[9px] font-black uppercase text-slate-400 mt-1">Define redemption capacity</p>
                      </div>
                      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                         <button type="button" onClick={() => setIsUnlimited(true)} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${isUnlimited ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Unlimited</button>
                         <button type="button" onClick={() => setIsUnlimited(false)} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${!isUnlimited ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Limited</button>
                      </div>
                   </div>

                   {!isUnlimited && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Maximum Redemptions (Total)</label>
                         <div className="relative">
                            <UsersIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input required type="number" min="1" value={form.usageLimit || ''} onChange={e => setForm({...form, usageLimit: parseInt(e.target.value)})} className="w-full bg-white border border-slate-200 pl-12 pr-6 py-5 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/10 transition font-bold" placeholder="e.g. 50" />
                         </div>
                      </div>
                   )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Validity Terminus (Expiry)</label>
                    <div className="relative">
                       <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                       <input type="date" value={form.expiryDate?.split('T')[0] || ''} onChange={e => setForm({...form, expiryDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})} className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-5 rounded-2xl outline-none font-bold text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 ml-2">Deployment Status</label>
                    <div className="flex h-[66px] items-center px-6 bg-slate-900 rounded-2xl shadow-xl border border-white/5">
                        <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-6 h-6 accent-amber-600 rounded-lg cursor-pointer" />
                        <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-white">Live Dispatches</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start space-x-4">
                    <ExclamationCircleIcon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-900">Database Consistency</p>
                        <p className="text-[10px] text-blue-700 leading-relaxed mt-1">Voucher configurations are written directly to the virtual artisan ledger. All updates are synchronized across the global interface.</p>
                    </div>
                </div>

                <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-bold uppercase tracking-[0.2em] text-xs shadow-3xl hover:bg-emerald-600 transition-all active:scale-[0.98]">
                  {editingCoupon ? 'Commit Strategic Adjustments' : 'Deploy Global Promotion Strategy'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCouponsPage;
