
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { PlusIcon, TrashIcon, PencilSquareIcon, XMarkIcon, TicketIcon } from '@heroicons/react/24/outline';
import { Coupon } from '../../types.ts';

const AdminCouponsPage: React.FC = () => {
  const { coupons, addCoupon, updateCoupon, removeCoupon } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [form, setForm] = useState({ code: '', discountPercent: 10, isActive: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const couponData: Coupon = {
      id: editingCoupon ? editingCoupon.id : 'C-' + Date.now(),
      code: form.code.toUpperCase(),
      discountPercent: form.discountPercent,
      isActive: form.isActive
    };
    if (editingCoupon) await updateCoupon(couponData);
    else await addCoupon(couponData);
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold serif">Promotional Engine</h1>
          <button 
            onClick={() => { setEditingCoupon(null); setForm({ code:'', discountPercent:10, isActive:true }); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-xl"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </header>

        {coupons.length > 0 ? (
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                  <th className="px-10 py-6">Code</th>
                  <th className="px-10 py-6 text-center">Reduction</th>
                  <th className="px-10 py-6 text-center">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-slate-50 transition">
                    <td className="px-10 py-8 font-mono text-lg font-bold">{coupon.code}</td>
                    <td className="px-10 py-8 text-center font-bold text-emerald-600">{coupon.discountPercent}% OFF</td>
                    <td className="px-10 py-8 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase ${coupon.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{coupon.isActive ? 'Active' : 'Disabled'}</span>
                    </td>
                    <td className="px-10 py-8 text-right space-x-2">
                      <button onClick={() => { setEditingCoupon(coupon); setForm(coupon); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-amber-600"><PencilSquareIcon className="w-5 h-5" /></button>
                      <button onClick={() => removeCoupon(coupon.id)} className="p-2 text-slate-400 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <TicketIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No vouchers active.</p>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-3xl font-bold serif mb-8">{editingCoupon ? 'Modify' : 'Archive'} Voucher</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Voucher Code</label>
                  <input required value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" placeholder="FESTIVAL20" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Discount Percentage</label>
                  <input required type="number" min="1" max="100" value={form.discountPercent} onChange={e => setForm({...form, discountPercent: parseInt(e.target.value)})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" />
                </div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="w-5 h-5 accent-amber-600" />
                  <span className="text-sm font-bold text-slate-700">Set as Active</span>
                </label>
                <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl">Deploy Voucher</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminCouponsPage;
