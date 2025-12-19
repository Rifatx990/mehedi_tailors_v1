
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { TrashIcon, InformationCircleIcon, ArchiveBoxIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Order, PaymentStatus } from '../../types.ts';

const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, updateOrder, removeOrder } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentInput, setPaymentInput] = useState<number>(0);

  const handleRecordPayment = async () => {
    if (!selectedOrder) return;
    const newPaid = selectedOrder.paidAmount + paymentInput;
    const newDue = Math.max(0, selectedOrder.total - newPaid);
    const newStatus: PaymentStatus = newDue === 0 ? 'Fully Paid' : 'Partially Paid';
    const updated = { ...selectedOrder, paidAmount: newPaid, dueAmount: newDue, paymentStatus: newStatus };
    await updateOrder(updated);
    setSelectedOrder(updated);
    setPaymentInput(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold serif">Order Pipeline</h1>
        </header>

        {orders.length > 0 ? (
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                  <th className="px-10 py-6">Order ID</th>
                  <th className="px-10 py-6">Patron</th>
                  <th className="px-10 py-6">Financials</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-10 py-8 font-mono text-xs font-bold">#{order.id}</td>
                    <td className="px-10 py-8 font-bold">{order.customerName}</td>
                    <td className="px-10 py-8">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">BDT {order.total.toLocaleString()}</span>
                        <span className={`text-[9px] font-bold uppercase ${order.dueAmount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {order.dueAmount > 0 ? `Due: ${order.dueAmount.toLocaleString()}` : 'Cleared'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none"
                      >
                        {['Pending', 'In Progress', 'Shipped', 'Delivered', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-10 py-8 text-right space-x-2">
                      <button onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-amber-600 transition"><InformationCircleIcon className="w-5 h-5" /></button>
                      <button onClick={() => removeOrder(order.id)} className="p-3 text-slate-300 hover:text-red-500 transition"><TrashIcon className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <ArchiveBoxIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <h3 className="text-xl font-bold serif text-slate-400">Pipeline Clear</h3>
          </div>
        )}

        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] p-10 md:p-12 w-full max-w-2xl shadow-2xl relative animate-in zoom-in duration-300">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-3xl font-bold serif mb-6">Order Reconciliation</h2>
              
              <div className="bg-slate-900 p-8 rounded-[2rem] text-white mb-8">
                 <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-50">Grand Total</span>
                    <span className="text-xl font-bold">BDT {selectedOrder.total.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Outstanding Receivable</span>
                    <span className="text-2xl font-bold text-amber-500">BDT {selectedOrder.dueAmount.toLocaleString()}</span>
                 </div>
              </div>

              {selectedOrder.dueAmount > 0 ? (
                <div className="space-y-4">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Record Cash/Bank Receipt</label>
                   <input 
                    type="number" 
                    value={paymentInput} 
                    onChange={e => setPaymentInput(Number(e.target.value))} 
                    className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" 
                    placeholder="Amount to record..." 
                   />
                   <button onClick={handleRecordPayment} className="w-full bg-amber-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg">Process Receipt</button>
                </div>
              ) : (
                <div className="p-6 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center justify-center space-x-3">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <span className="text-xs font-bold uppercase tracking-widest">Financial Obligation Fully Met</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOrdersPage;
