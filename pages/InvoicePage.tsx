
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  PrinterIcon, 
  ArrowLeftIcon, 
  CalendarDaysIcon, 
  MapPinIcon, 
  ScissorsIcon, 
  AdjustmentsHorizontalIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const InvoicePage: React.FC = () => {
  const { orderId } = useParams();
  const { orders, user, adminUser, workerUser, systemConfig } = useStore();
  const navigate = useNavigate();
  const order = orders.find(o => o.id === orderId);

  // Authentication: Only admin, assigned worker, or the order owner can view the invoice
  const canView = adminUser || workerUser || (user && order?.customerEmail === user.email);

  if (!canView || !order) {
    return (
      <div className="py-32 text-center bg-slate-50 min-h-screen">
        <h1 className="text-3xl font-bold serif mb-6">Unauthorized Access</h1>
        <p className="text-slate-500 mb-8">You do not have the credentials to view this artisan record.</p>
        <button onClick={() => navigate(-1)} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[10px]">Return to Previous</button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-100 min-h-screen py-10 md:py-20 no-scrollbar">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8 no-print">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Return</span>
          </button>
          <button onClick={handlePrint} className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-amber-600 transition">
            <PrinterIcon className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>

        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 invoice-card">
          <div className="bg-slate-900 p-12 text-white flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 invoice-header">
            <div className="flex flex-col">
              {systemConfig.documentLogo ? (
                <img 
                  src={systemConfig.documentLogo} 
                  alt="Logo" 
                  className="h-16 w-auto object-contain mr-auto mb-4" 
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              ) : (
                <h2 className="text-3xl font-bold serif tracking-tighter">MEHEDI TAILORS</h2>
              )}
              <p className="text-slate-400 text-[10px] uppercase tracking-[0.4em] mt-1">Bespoke Production Ledger</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest font-bold text-amber-500">Invoice ID</p>
              <p className="text-2xl font-mono font-bold">#{order.id}</p>
            </div>
          </div>

          <div className="p-10 md:p-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-400">
                  <CalendarDaysIcon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Order Established</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-400">
                  <MapPinIcon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Logistics Coordinates</span>
                </div>
                <p className="text-lg font-bold text-slate-900">{order.customerName}</p>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{order.address}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-12 mb-12">
               <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-8">Artisan Line Items</h3>
               <div className="space-y-12">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="pb-10 border-b border-slate-100 last:border-none last:pb-0">
                       <div className="flex justify-between items-start mb-8">
                          <div className="flex items-center space-x-6">
                             <div className="w-16 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 no-print">
                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                             </div>
                             <div>
                                <h4 className="font-bold text-xl text-slate-900">{item.name}</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                                   Qty: {item.quantity} • Unit Price: BDT {item.price.toLocaleString()}
                                </p>
                             </div>
                          </div>
                          <span className="font-mono font-bold text-xl text-slate-900">BDT {(item.price * item.quantity).toLocaleString()}</span>
                       </div>

                       {item.isCustomOrder && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                            <div>
                               <h5 className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-6">
                                  <span className="w-5 h-5 flex items-center justify-center">✂️</span>
                                  <span>Measurement Silhouette</span>
                               </h5>
                               <div className="grid grid-cols-2 gap-4">
                                  {item.measurements && Object.entries(item.measurements).filter(([k,v]) => k !== 'id' && k !== 'label' && typeof v === 'number' && v > 0).map(([k,v]) => (
                                    <div key={k} className="flex justify-between items-center border-b border-slate-200 pb-1">
                                       <span className="text-[9px] uppercase font-bold text-slate-400">{k}</span>
                                       <span className="text-xs font-bold font-mono text-slate-900">{v}"</span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div>
                               <h5 className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-teal-700 mb-6">
                                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                                  <span>Artisan Directives</span>
                               </h5>
                               <div className="grid grid-cols-1 gap-3">
                                  {item.designOptions && Object.entries(item.designOptions).map(([k,v]) => (
                                    <div key={k} className="flex justify-between items-center bg-white px-4 py-2 rounded-xl border border-slate-200">
                                       <span className="text-[9px] uppercase font-bold text-slate-400">{k}</span>
                                       <span className="text-[10px] font-bold text-slate-900">{v as string}</span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-50 p-10 rounded-[3rem] space-y-4 border border-slate-100 invoice-footer">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Payment Method</span>
                  <span className="font-bold text-slate-900 uppercase tracking-widest text-xs">{order.paymentMethod}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Current Status</span>
                  <div className="flex items-center space-x-2">
                    <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-700 uppercase tracking-widest text-xs">{order.paymentStatus}</span>
                  </div>
               </div>
               <div className="flex justify-between items-center pt-6 border-t border-slate-200">
                  <span className="text-slate-900 font-bold uppercase tracking-widest text-xs">Contract Valuation</span>
                  <span className="text-4xl font-bold serif text-slate-900 tracking-tighter">BDT {order.total.toLocaleString()}</span>
               </div>
               {order.dueAmount > 0 && (
                 <div className="mt-4 p-6 bg-amber-600 text-white rounded-[1.5rem] flex justify-between items-center shadow-xl shadow-amber-600/20">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Balance to Clear</span>
                    <span className="text-2xl font-bold font-mono">BDT {order.dueAmount.toLocaleString()}</span>
                 </div>
               )}
            </div>

            <div className="mt-16 pt-10 border-t border-slate-100 text-center">
               <p className="text-[9px] text-slate-400 uppercase tracking-[0.5em] font-bold">Heritage Precision • Digital Excellence</p>
               <p className="text-[8px] text-slate-300 mt-4 leading-relaxed">
                 Mehedi Tailors & Fabrics • Dhonaid, Ashulia, Savar, Dhaka, Bangladesh<br />
                 Global Studio Hotline: +8801720267213 • contact@meheditailors.com
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
