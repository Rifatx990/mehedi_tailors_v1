
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

  const canView = adminUser || workerUser || (user && order?.customerEmail === user.email);

  if (!canView || !order) {
    return (
      <div className="py-32 text-center bg-slate-50 min-h-screen">
        <h1 className="text-3xl font-bold serif mb-6">Unauthorized Access</h1>
        <p className="text-slate-500 mb-8">Authentication required to view this artisan record.</p>
        <button onClick={() => navigate(-1)} className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[10px]">Return</button>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-10 no-scrollbar">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6 no-print">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Return</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-amber-600 transition">
            <PrinterIcon className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>

        <div className="bg-white rounded-[30px] shadow-2xl overflow-hidden border border-slate-200 invoice-card">
          <div className="bg-slate-900 p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 invoice-header">
            <div className="flex flex-col">
              {systemConfig.documentLogo ? (
                <img 
                  src={systemConfig.documentLogo} 
                  alt="Logo" 
                  className="h-12 w-auto object-contain mr-auto mb-3" 
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              ) : (
                <h2 className="text-2xl font-bold serif tracking-tighter">MEHEDI TAILORS</h2>
              )}
              <p className="text-slate-400 text-[9px] uppercase tracking-[0.4em] mt-1">Bespoke Production Ledger</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest font-bold text-amber-500">Invoice ID</p>
              <p className="text-xl font-mono font-bold">#{order.id}</p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Established</span>
                </div>
                <p className="text-base font-bold text-slate-900">{new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="space-y-2 text-right md:text-left">
                <div className="flex items-center space-x-2 text-slate-400 md:justify-start justify-end">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Patron</span>
                </div>
                <p className="text-base font-bold text-slate-900">{order.customerName}</p>
                <p className="text-xs font-medium text-slate-500 truncate">{order.address}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-8 mb-8">
               <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-6">Artisan Line Items</h3>
               <div className="space-y-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="pb-6 border-b border-slate-50 last:border-none last:pb-0">
                       <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-4">
                             <div className="w-12 h-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 no-print">
                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                             </div>
                             <div>
                                <h4 className="font-bold text-lg text-slate-900 leading-tight">{item.name}</h4>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                                   Qty: {item.quantity} • Unit: BDT {item.price.toLocaleString()}
                                </p>
                             </div>
                          </div>
                          <span className="font-mono font-bold text-base text-slate-900">BDT {(item.price * item.quantity).toLocaleString()}</span>
                       </div>

                       {item.isCustomOrder && (
                         <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100 mt-4">
                            <div>
                               <h5 className="text-[8px] font-bold uppercase tracking-widest text-amber-700 mb-3">Measurement Scale</h5>
                               <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                  {item.measurements && Object.entries(item.measurements).filter(([k,v]) => k !== 'id' && k !== 'label' && typeof v === 'number' && v > 0).map(([k,v]) => (
                                    <div key={k} className="flex justify-between items-center border-b border-slate-200/50">
                                       <span className="text-[8px] uppercase font-bold text-slate-400">{k}</span>
                                       <span className="text-[10px] font-bold font-mono text-slate-900">{v}"</span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div>
                               <h5 className="text-[8px] font-bold uppercase tracking-widest text-teal-700 mb-3">Directives</h5>
                               <div className="grid grid-cols-1 gap-1">
                                  {item.designOptions && Object.entries(item.designOptions).map(([k,v]) => (
                                    <div key={k} className="flex justify-between items-center bg-white px-3 py-1 rounded-lg border border-slate-200/50">
                                       <span className="text-[8px] uppercase font-bold text-slate-400">{k}</span>
                                       <span className="text-[9px] font-bold text-slate-900">{v as string}</span>
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

            <div className="bg-slate-50 p-6 rounded-3xl space-y-2 border border-slate-100 invoice-footer">
               <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Settlement Method</span>
                  <span className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">{order.paymentMethod}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Status</span>
                  <span className="font-bold text-emerald-700 uppercase tracking-widest text-[10px]">{order.paymentStatus}</span>
               </div>
               <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <span className="text-slate-900 font-bold uppercase tracking-widest text-[10px]">Net Contract Total</span>
                  <span className="text-2xl font-bold serif text-slate-900 tracking-tighter">BDT {order.total.toLocaleString()}</span>
               </div>
               {order.dueAmount > 0 && (
                 <div className="mt-3 p-4 bg-amber-600 text-white rounded-2xl flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest">Balance Outstanding</span>
                    <span className="text-xl font-bold font-mono">BDT {order.dueAmount.toLocaleString()}</span>
                 </div>
               )}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 text-center">
               <p className="text-[8px] text-slate-400 uppercase tracking-[0.4em] font-bold">Heritage Precision • Digital Excellence</p>
               <p className="text-[7px] text-slate-300 mt-2 leading-relaxed">
                 Mehedi Tailors & Fabrics • Dhonaid, Ashulia, Savar, Dhaka, Bangladesh<br />
                 Global Studio Hotline: +8801720267213
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
