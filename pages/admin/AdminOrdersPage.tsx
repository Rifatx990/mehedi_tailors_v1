
import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  TrashIcon, 
  InformationCircleIcon, 
  ArchiveBoxIcon, 
  XMarkIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  CheckIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Order, PaymentStatus, OrderStatus, ProductionStep } from '../../types.ts';

const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, updateProductionStep, updateOrder, removeOrder, allUsers, assignWorker } = useStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentInput, setPaymentInput] = useState<number>(0);

  // Filter State
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12">
          <div className="flex items-center space-x-3 text-amber-600 mb-2">
            <span className="w-8 h-px bg-amber-600"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Atelier Management</span>
          </div>
          <h1 className="text-4xl font-bold serif text-slate-900">Order Pipeline</h1>
        </header>

        {/* Search and Filters */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="relative col-span-1 lg:col-span-2">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by Order ID or Patron Name..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition" />
            </div>
            <div>
              <div className="relative">
                <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition appearance-none font-bold text-[10px] uppercase tracking-widest text-slate-600">
                  <option value="All">All Statuses</option>
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full pl-10 pr-2 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-[10px] font-bold uppercase tracking-widest text-slate-600" />
              </div>
              <div className="relative flex-grow">
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-[10px] font-bold uppercase tracking-widest text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                  <th className="px-8 py-6">Order ID & Patron</th>
                  <th className="px-8 py-6">Artisan Assigned</th>
                  <th className="px-8 py-6">Production Step</th>
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
                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none text-slate-600 cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </td>
                    <td className="px-8 py-8">
                      <select 
                        value={order.productionStep || 'Queue'}
                        onChange={(e) => updateProductionStep(order.id, e.target.value as ProductionStep)}
                        className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest outline-none text-slate-600 cursor-pointer"
                      >
                        {productionSteps.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-8 py-8 text-right space-x-2">
                      <Link to={`/invoice/${order.id}`} className="inline-block p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition shadow-sm"><DocumentTextIcon className="w-5 h-5" /></Link>
                      <button onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-amber-600 transition shadow-sm"><InformationCircleIcon className="w-5 h-5" /></button>
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
             <h3 className="text-xl font-bold serif text-slate-400">Inventory Registry Clear</h3>
          </div>
        )}

        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] p-10 md:p-12 w-full max-w-2xl shadow-2xl relative animate-in zoom-in duration-300">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-3xl font-bold serif mb-6 text-slate-900">Order Reconciliation</h2>
              
              <div className="bg-slate-900 p-8 rounded-[2rem] text-white mb-8 shadow-2xl">
                 <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-50">Contract Valuation</span>
                    <span className="text-xl font-bold">BDT {selectedOrder.total.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-500">Amount Due</span>
                    <span className="text-2xl font-bold text-amber-500">BDT {selectedOrder.dueAmount.toLocaleString()}</span>
                 </div>
              </div>

              {selectedOrder.dueAmount > 0 ? (
                <div className="space-y-6">
                   <input type="number" value={paymentInput} onChange={e => setPaymentInput(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-mono text-lg" placeholder="0.00" />
                   <button onClick={handleRecordPayment} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] shadow-xl hover:bg-emerald-600 transition-all">Update Ledger</button>
                </div>
              ) : (
                <div className="p-8 bg-emerald-50 text-emerald-700 rounded-[2rem] border border-emerald-100 flex flex-col items-center text-center space-y-3">
                   <CheckIcon className="w-12 h-12 bg-emerald-100 p-2 rounded-full mb-2" />
                   <h4 className="text-lg font-bold serif">Contract Settled</h4>
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
