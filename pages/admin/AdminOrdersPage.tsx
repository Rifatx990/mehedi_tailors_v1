
import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  TrashIcon, 
  InformationCircleIcon, 
  ArchiveBoxIcon, 
  XMarkIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
  TruckIcon,
  HandThumbUpIcon
} from '@heroicons/react/24/outline';
import { Order, PaymentStatus, OrderStatus, ProductionStep } from '../../types.ts';

const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, updateProductionStep, updateOrder, removeOrder, allUsers, assignWorker } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentInput, setPaymentInput] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const workers = allUsers.filter(u => u.role === 'worker');

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
      let matchesDate = true;
      if (startDate || endDate) {
        const orderDate = new Date(order.date).getTime();
        if (startDate && orderDate < new Date(startDate).getTime()) matchesDate = false;
        if (endDate && orderDate > new Date(endDate).getTime() + 86400000) matchesDate = false;
      }
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, startDate, endDate]);

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

  const statusOptions: OrderStatus[] = ['Pending', 'In Progress', 'Shipped', 'Delivered', 'Cancelled'];
  const productionSteps: ProductionStep[] = ['Queue', 'Cutting', 'Stitching', 'Finishing', 'Ready'];

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'Delivered': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Cancelled': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Shipped': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-amber-600 bg-amber-50 border-amber-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-4 md:p-16">
        <header className="mb-12">
          <div className="flex items-center space-x-3 text-amber-600 mb-2">
            <span className="w-8 h-px bg-amber-600"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Atelier Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold serif text-slate-900 tracking-tight">Order Pipeline</h1>
          <p className="text-slate-400 mt-1 text-xs uppercase tracking-widest font-bold">{filteredOrders.length} Commissions in view</p>
        </header>

        {/* Responsive Filter Container */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="relative col-span-1 lg:col-span-2">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Order ID or Patron..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition text-sm" />
            </div>
            <div>
              <div className="relative">
                <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none font-bold text-[10px] uppercase tracking-widest text-slate-600">
                  <option value="All">All Statuses</option>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-[9px] font-black uppercase tracking-widest text-slate-600 flex-1" />
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-[9px] font-black uppercase tracking-widest text-slate-600 flex-1" />
            </div>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                    <th className="px-8 py-6">ID & Patron</th>
                    <th className="px-8 py-6">Artisan</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6">Phase</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition group">
                      <td className="px-8 py-8">
                         <div className="flex flex-col">
                            <span className="font-mono text-xs font-bold text-slate-900">#{order.id}</span>
                            <span className="text-sm font-bold text-slate-600 mt-1">{order.customerName}</span>
                         </div>
                      </td>
                      <td className="px-8 py-8">
                        <select 
                          value={order.assignedWorkerId || ''}
                          onChange={(e) => assignWorker(order.id, e.target.value)}
                          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none text-slate-600 cursor-pointer"
                        >
                          <option value="">Unassigned</option>
                          {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                      </td>
                      <td className="px-8 py-8">
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className={`border rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer ${getStatusColor(order.status)}`}
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-8 py-8">
                        <select 
                          value={order.productionStep || 'Queue'}
                          onChange={(e) => updateProductionStep(order.id, e.target.value as ProductionStep)}
                          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none text-slate-600 cursor-pointer"
                        >
                          {productionSteps.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-8 py-8 text-right space-x-2">
                        {/* Dynamic Quick Action Buttons */}
                        {order.status === 'Shipped' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'Delivered')}
                            className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 group animate-in slide-in-from-right-2"
                            title="Mark as Delivered"
                          >
                             <CheckBadgeIcon className="w-5 h-5" />
                             <span className="text-[9px] font-black uppercase tracking-widest">Deliver</span>
                          </button>
                        )}
                        
                        {order.status === 'In Progress' && order.productionStep === 'Ready' && (
                           <button 
                             onClick={() => updateOrderStatus(order.id, 'Shipped')}
                             className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 group animate-in slide-in-from-right-2"
                             title="Dispatch for Shipping"
                           >
                              <TruckIcon className="w-5 h-5" />
                              <span className="text-[9px] font-black uppercase tracking-widest">Dispatch</span>
                           </button>
                        )}

                        <Link to={`/invoice/${order.id}`} className="inline-block p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition shadow-sm" title="View Invoice"><DocumentTextIcon className="w-5 h-5" /></Link>
                        <button onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-amber-600 transition shadow-sm" title="Reconcile Ledger"><InformationCircleIcon className="w-5 h-5" /></button>
                        <button onClick={() => removeOrder(order.id)} className="p-3 text-slate-300 hover:text-red-500 transition" title="Discard"><TrashIcon className="w-5 h-5" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile/Tablet Adaptive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                   <div className="flex justify-between items-start">
                      <div>
                         <p className="font-mono text-xs font-black text-slate-900">#{order.id}</p>
                         <h3 className="font-bold text-lg text-slate-600 mt-1">{order.customerName}</h3>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}
                        >
                          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        
                        {/* Mobile Quick Actions */}
                        {order.status === 'Shipped' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'Delivered')}
                            className="flex items-center space-x-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-full shadow-lg shadow-emerald-600/20"
                          >
                             <CheckBadgeIcon className="w-3.5 h-3.5" />
                             <span className="text-[7px] font-black uppercase">Fulfill Order</span>
                          </button>
                        )}
                      </div>
                   </div>

                   <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                         <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Assigned Artisan</label>
                         <select 
                            value={order.assignedWorkerId || ''}
                            onChange={(e) => assignWorker(order.id, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none text-slate-600"
                          >
                            <option value="">Unassigned</option>
                            {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-bold uppercase text-slate-400 ml-1">Production Phase</label>
                         <select 
                            value={order.productionStep || 'Queue'}
                            onChange={(e) => updateProductionStep(order.id, e.target.value as ProductionStep)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none text-slate-600"
                          >
                            {productionSteps.map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Link to={`/invoice/${order.id}`} className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition"><DocumentTextIcon className="w-5 h-5" /></Link>
                        <button onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-amber-600 transition"><InformationCircleIcon className="w-5 h-5" /></button>
                      </div>
                      <button onClick={() => removeOrder(order.id)} className="text-red-300 hover:text-red-500 font-bold uppercase text-[9px] tracking-widest pr-2">Discard</button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <ArchiveBoxIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <h3 className="text-xl font-bold serif text-slate-400">Order Registry Empty</h3>
          </div>
        )}

        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 w-full max-w-2xl shadow-2xl relative animate-in zoom-in duration-300 max-h-[95vh] overflow-y-auto no-scrollbar">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 md:top-8 md:right-8 text-slate-400 hover:text-slate-900 transition-transform hover:rotate-90"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-2xl md:text-3xl font-bold serif mb-6 text-slate-900 pr-10">Order Reconciliation</h2>
              
              <div className="bg-slate-950 p-8 rounded-[2rem] md:rounded-[2.5rem] text-white mb-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
                 <div className="relative z-10 flex justify-between items-center pb-6 border-b border-white/10 mb-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Valuation</span>
                    <span className="text-2xl font-bold font-mono">BDT {selectedOrder.total.toLocaleString()}</span>
                 </div>
                 <div className="relative z-10 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Amount Due</span>
                    <span className="text-3xl font-bold text-amber-500 font-mono">BDT {selectedOrder.dueAmount.toLocaleString()}</span>
                 </div>
              </div>

              {selectedOrder.dueAmount > 0 ? (
                <div className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Receive Payment Credit</label>
                      <input type="number" value={paymentInput} onChange={e => setPaymentInput(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-amber-600/5 transition font-mono text-2xl text-center font-black text-slate-900" placeholder="0.00" />
                   </div>
                   <button onClick={handleRecordPayment} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-emerald-600 transition-all active:scale-95">Update Fiscal Ledger</button>
                </div>
              ) : (
                <div className="p-10 bg-emerald-50 text-emerald-700 rounded-[2.5rem] border border-emerald-100 flex flex-col items-center text-center space-y-4">
                   <div className="w-20 h-20 bg-emerald-100 rounded-[1.5rem] flex items-center justify-center mb-2 shadow-inner">
                      <CheckIcon className="w-10 h-10" />
                   </div>
                   <h4 className="text-xl font-bold serif">Ledger Fully Reconciled</h4>
                   <p className="text-xs font-medium uppercase tracking-widest opacity-60">All commissions for this contract have been settled.</p>
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
