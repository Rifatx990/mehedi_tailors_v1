import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.tsx';
import { 
  PrinterIcon, 
  ArrowLeftIcon, 
  ScissorsIcon, 
  DocumentTextIcon,
  FlagIcon,
  CalendarDaysIcon,
  MapPinIcon,
  // Added missing BanknotesIcon import
  BanknotesIcon
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
            <p className="text-slate-500 mb-8">Authentication required to view this record.</p>
            <button onClick={() => navigate(-1)} className="w-full bg-slate-900 text-white py-4 rounded-full font-bold uppercase tracking-widest text-[10px]">Return</button>
        </div>
      </div>
    );
  }

  // Robust parsing for multi-item orders
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="bg-slate-100 min-h-screen py-4 md:py-8 no-scrollbar print:bg-white print:p-0">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6 no-print">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-amber-600 transition">
            <PrinterIcon className="w-4 h-4" />
            <span>Print Ledger</span>
          </button>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[30px] shadow-2xl overflow-hidden border border-slate-200 invoice-card">
          <div className="bg-slate-900 p-6 md:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 invoice-header rounded-2xl">
            <div className="flex flex-col">
              {systemConfig.documentLogo || systemConfig.siteLogo ? (
                <img src={systemConfig.documentLogo || systemConfig.siteLogo} alt="Logo" className="h-10 md:h-12 w-auto object-contain mr-auto mb-2" referrerPolicy="no-referrer" />
              ) : (
                <h2 className="text-2xl font-bold serif tracking-tighter uppercase">MEHEDI TAILORS</h2>
              )}
              <p className="text-slate-400 text-[8px] uppercase tracking-[0.4em]">Official Artisan Ledger</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[9px] uppercase tracking-widest font-bold text-amber-500">Contract Reference</p>
              <p className="text-xl md:text-2xl font-mono font-bold">#{order.id}</p>
            </div>
          </div>

          <div className="p-6 md:p-10 invoice-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Commissioned</span>
                <p className="text-sm font-bold text-slate-900">{new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Settlement</span>
                <div className="flex items-center space-x-2">
                   <p className="text-sm font-bold text-slate-900">{order.paymentMethod}</p>
                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${order.paymentStatus === 'Fully Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{order.paymentStatus}</span>
                </div>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Patron</span>
                <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                <p className="text-[10px] text-slate-500 truncate">{order.address}</p>
              </div>
            </div>

            <div className="mb-10">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8 flex items-center space-x-2 border-b pb-2">
                  <ScissorsIcon className="w-3 h-3" />
                  <span>Artisan Line Items & Technical Specs</span>
               </h3>
               <div className="space-y-10">
                  {items.map((item, idx) => (
                    <div key={idx} className="pb-10 border-b border-slate-50 last:border-none">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center space-x-6">
                             <div className="w-14 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 shadow-sm">
                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                             </div>
                             <div>
                                <h4 className="font-bold text-base text-slate-900">{item.name}</h4>
                                <div className="flex items-center gap-3 mt-1.5">
                                   <span className="text-[10px] font-black uppercase text-slate-400">{item.quantity} Unit(s)</span>
                                   {item.isCustomOrder && <span className="bg-amber-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm">Bespoke Fitting</span>}
                                </div>
                                {item.selectedFabric && <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Textile: {item.selectedFabric}</p>}
                             </div>
                          </div>
                          <span className="font-mono font-black text-lg text-slate-900">BDT {(item.price * item.quantity).toLocaleString()}</span>
                       </div>

                       {/* Bespoke Details Rendering - Now works for every item in queue */}
                       {item.isCustomOrder && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-inner">
                            <div className="space-y-4">
                               <h5 className="text-[9px] font-black uppercase tracking-widest text-amber-700 flex items-center gap-2">
                                  <ScissorsIcon className="w-3 h-3" />
                                  <span>Silhouette Calibration (Inches)</span>
                               </h5>
                               <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                                  {item.measurements && Object.entries(item.measurements).filter(([k,v]) => k !== 'id' && k !== 'label' && typeof v === 'number' && v > 0).map(([k,v]) => (
                                    <div key={k} className="flex justify-between items-center border-b border-slate-200/50 pb-0.5">
                                       <span className="uppercase font-bold text-slate-400 text-[9px]">{k}</span>
                                       <span className="font-black font-mono text-slate-900 text-xs">{v}"</span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div className="md:border-l border-slate-200 md:pl-8 space-y-4">
                               <h5 className="text-[9px] font-black uppercase tracking-widest text-teal-700 flex items-center gap-2">
                                  <FlagIcon className="w-3 h-3" />
                                  <span>Artisan Directives</span>
                               </h5>
                               <div className="space-y-1.5">
                                 {item.designOptions && Object.entries(item.designOptions).map(([k,v]) => (
                                    <div key={k} className="flex justify-between items-center bg-white px-3 py-1 rounded-lg border border-slate-100">
                                       <span className="uppercase font-bold text-slate-400 text-[9px]">{k}</span>
                                       <span className="font-black text-slate-900 text-xs">{v as string}</span>
                                    </div>
                                 ))}
                                 {item.bespokeType && (
                                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100">
                                       <span className="uppercase font-bold text-slate-400 text-[9px]">Priority</span>
                                       <span className={`font-black text-[10px] uppercase tracking-widest ${item.bespokeType === 'Urgent' ? 'text-rose-600' : 'text-slate-900'}`}>{item.bespokeType}</span>
                                    </div>
                                 )}
                                 {item.deliveryDate && (
                                    <div className="flex justify-between items-center">
                                       <span className="uppercase font-bold text-slate-400 text-[9px]">Handover</span>
                                       <span className="font-black text-xs text-slate-900">{new Date(item.deliveryDate).toLocaleDateString()}</span>
                                    </div>
                                 )}
                               </div>
                            </div>
                            {item.bespokeNote && (
                                <div className="col-span-full mt-4 p-5 bg-white rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Technical Note for Workshop</p>
                                    <p className="text-sm text-slate-600 italic leading-relaxed">"{item.bespokeNote}"</p>
                                </div>
                            )}
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-50 p-8 md:p-10 rounded-[2.5rem] space-y-4 border border-slate-100">
               <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">Inventory Subtotal</span>
                  <span className="font-bold text-slate-900">BDT {order.subtotal.toLocaleString()}</span>
               </div>
               {order.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="font-bold uppercase text-[11px] tracking-widest">Strategic Credit</span>
                    <span className="font-bold">-BDT {order.discountAmount.toLocaleString()}</span>
                  </div>
               )}
               <div className="flex justify-between items-center pt-4 border-t-2 border-slate-200">
                  <span className="text-slate-900 font-black uppercase text-[12px] tracking-[0.2em]">Net Contract Value</span>
                  <span className="text-3xl font-black serif text-slate-900 tracking-tighter">BDT {order.total.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center text-emerald-700 pt-2">
                  <span className="font-bold uppercase text-[11px] tracking-widest">Amount Realized</span>
                  <span className="font-bold text-2xl font-mono">BDT {order.paidAmount.toLocaleString()}</span>
               </div>
               {order.dueAmount > 0 && (
                 <div className="mt-6 p-6 bg-rose-600 text-white rounded-2xl flex justify-between items-center shadow-xl shadow-rose-600/20 animate-in zoom-in">
                    <div>
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 block mb-1">Outstanding Balance</span>
                       <span className="text-3xl font-black font-mono tracking-tighter">BDT {order.dueAmount.toLocaleString()}</span>
                    </div>
                    <BanknotesIcon className="w-12 h-12 opacity-20" />
                 </div>
               )}
            </div>
            
            <div className="mt-16 pt-10 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.5em] font-black">Craftsmanship Sustained by Patronage</p>
                <p className="text-[8px] text-slate-300 mt-3 uppercase tracking-widest">© 2025 Mehedi Tailors & Fabrics. Savar, Bangladesh.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;