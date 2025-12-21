import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.tsx';
import { 
  PrinterIcon, 
  ArrowLeftIcon, 
  CalendarDaysIcon, 
  MapPinIcon, 
  ScissorsIcon, 
  AdjustmentsHorizontalIcon,
  CheckBadgeIcon,
  ClockIcon,
  CreditCardIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const InvoicePage: React.FC = () => {
  const { orderId } = useParams();
  const { orders, user, adminUser, workerUser, systemConfig } = useStore();
  const navigate = useNavigate();
  const order = orders.find(o => o.id === orderId);

  const canView = adminUser || workerUser || (user && order?.customerEmail === user.email);

  if (!canView || !order) {
    return (
      <div className="py-32 px-6 text-center bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="max-w-sm">
            <h1 className="text-3xl font-bold serif mb-4">Unauthorized Access</h1>
            <p className="text-slate-500 mb-8">Authentication required to view this artisan record.</p>
            <button onClick={() => navigate(-1)} className="w-full bg-slate-900 text-white py-4 rounded-full font-bold uppercase tracking-widest text-[10px]">Return</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-6 md:py-10 no-scrollbar">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6 no-print">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-amber-600 transition">
            <PrinterIcon className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[30px] shadow-2xl overflow-hidden border border-slate-200 invoice-card">
          {/* Header Section */}
          <div className="bg-slate-900 p-6 md:p-12 text-white flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 invoice-header">
            <div className="flex flex-col">
              {systemConfig.documentLogo || systemConfig.siteLogo ? (
                <img 
                  src={systemConfig.documentLogo || systemConfig.siteLogo} 
                  alt="Logo" 
                  className="h-10 md:h-12 w-auto object-contain mr-auto mb-3" 
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              ) : (
                <h2 className="text-2xl font-bold serif tracking-tighter uppercase">MEHEDI TAILORS</h2>
              )}
              <p className="text-slate-400 text-[8px] md:text-[9px] uppercase tracking-[0.4em] mt-1">Bespoke Production Ledger</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[9px] uppercase tracking-widest font-bold text-amber-500">Document Ref</p>
              <p className="text-xl md:text-2xl font-mono font-bold">#{order.id}</p>
            </div>
          </div>

          <div className="p-6 md:p-12">
            {/* Meta Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12 pb-8 md:pb-12 border-b border-slate-100">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Order Placed</span>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="flex items-center space-x-2 text-slate-400">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-medium uppercase">{new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400">
                  <CreditCardIcon className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Settlement Method</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{order.paymentMethod}</p>
                <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${order.paymentStatus === 'Fully Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                   {order.paymentStatus}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-400">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Patron Identity</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                <p className="text-[10px] text-slate-500 italic leading-tight">{order.address}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8 md:mb-12">
               <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 md:mb-8 flex items-center space-x-2">
                  <ScissorsIcon className="w-4 h-4" />
                  <span>Artisan Line Items & Specifications</span>
               </h3>
               <div className="space-y-8 md:space-y-10">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="pb-8 md:pb-10 border-b border-slate-50 last:border-none last:pb-0">
                       <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                          <div className="flex items-center space-x-4 md:space-x-6">
                             <div className="w-14 h-16 md:w-16 md:h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 no-print shadow-sm">
                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                             </div>
                             <div>
                                <h4 className="font-bold text-lg md:text-xl text-slate-900 leading-tight">{item.name}</h4>
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Qty: {item.quantity}</span>
                                   <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-200"></span>
                                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Unit: BDT {item.price.toLocaleString()}</span>
                                   {item.isCustomOrder && <span className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Bespoke</span>}
                                </div>
                             </div>
                          </div>
                          <div className="text-left sm:text-right">
                             <p className="text-[9px] font-bold text-slate-300 uppercase mb-1">Subtotal</p>
                             <span className="font-mono font-black text-lg text-slate-900">BDT {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                       </div>

                       {item.isCustomOrder && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 mt-4 shadow-inner">
                            <div>
                               <h5 className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-amber-700 mb-4">
                                  <InformationCircleIcon className="w-4 h-4" />
                                  <span>Physical Scale (Inches)</span>
                               </h5>
                               <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                  {item.measurements && Object.entries(item.measurements).filter(([k,v]) => k !== 'id' && k !== 'label' && typeof v === 'number' && v > 0).map(([k,v]) => (
                                    <div key={k} className="flex justify-between items-center border-b border-slate-200/50 pb-1">
                                       <span className="text-[9px] uppercase font-bold text-slate-400">{k}</span>
                                       <span className="text-xs font-black font-mono text-slate-900">{v}"</span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div>
                               <h5 className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-teal-700 mb-4">
                                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                                  <span>Tailoring Directives</span>
                               </h5>
                               <div className="grid grid-cols-1 gap-2">
                                  {item.designOptions && Object.entries(item.designOptions).map(([k,v]) => (
                                    <div key={k} className="flex justify-between items-center bg-white px-4 py-2 rounded-xl border border-slate-200/50 shadow-sm">
                                       <span className="text-[9px] uppercase font-bold text-slate-400">{k}</span>
                                       <span className="text-[10px] font-black text-slate-900">{v as string}</span>
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

            {/* Totals Section */}
            <div className="bg-slate-50 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] space-y-4 border border-slate-100 invoice-footer">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Production Status</span>
                  <div className="flex items-center space-x-2">
                     <div className={`w-2 h-2 rounded-full ${order.status === 'Delivered' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                     <span className="font-black text-slate-900 uppercase tracking-widest text-[10px] md:text-[11px]">{order.status}</span>
                  </div>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Artisan station</span>
                  <span className="font-black text-slate-600 uppercase tracking-widest text-[10px]">{order.productionStep || 'Central Queue'}</span>
               </div>
               <div className="pt-6 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Net Transaction Total</span>
                     <span className="text-2xl md:text-3xl font-black serif text-slate-900 tracking-tighter">BDT {order.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-emerald-600 font-bold uppercase tracking-widest text-[10px]">Realized Settlement</span>
                     <span className="text-lg md:text-xl font-bold text-emerald-700 font-mono">BDT {order.paidAmount.toLocaleString()}</span>
                  </div>
               </div>
               {order.dueAmount > 0 && (
                 <div className="mt-6 p-4 md:p-6 bg-amber-600 text-white rounded-[1.5rem] md:rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-xl shadow-amber-600/20 ring-4 ring-amber-600/10 gap-2">
                    <div>
                        <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] opacity-80">Remaining Balance</p>
                        <p className="text-[9px] md:text-[10px] font-bold uppercase mt-1">Collectible at Fitting</p>
                    </div>
                    <span className="text-2xl md:text-3xl font-black font-mono">BDT {order.dueAmount.toLocaleString()}</span>
                 </div>
               )}
            </div>

            <div className="mt-8 md:mt-12 pt-8 border-t border-slate-100 text-center">
               <p className="text-[8px] text-slate-400 uppercase tracking-[0.5em] font-black">Heritage Precision • Digital Sovereignty</p>
               <p className="text-[7px] text-slate-300 mt-4 leading-relaxed max-w-sm mx-auto">
                 Official Document generated by Mehedi Tailors & Fabrics Admin Core.<br />
                 Dhonaid, Ashulia, Savar, Dhaka • Hotline: +8801720267213
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;