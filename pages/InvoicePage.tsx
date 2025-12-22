import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.tsx';
import { 
  PrinterIcon, 
  ArrowLeftIcon, 
  ScissorsIcon, 
  DocumentTextIcon
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Commissioned</span>
                <p className="text-sm font-bold text-slate-900">{new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Settlement</span>
                <p className="text-sm font-bold text-slate-900">{order.paymentMethod}</p>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${order.paymentStatus === 'Fully Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{order.paymentStatus}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Patron</span>
                <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                <p className="text-[10px] text-slate-500">{order.customerEmail}</p>
              </div>
            </div>

            <div className="mb-10">
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 flex items-center space-x-2 border-b pb-2">
                  <ScissorsIcon className="w-3 h-3" />
                  <span>Artisan Line Items</span>
               </h3>
               <div className="space-y-8">
                  {items.map((item, idx) => (
                    <div key={idx} className="pb-8 border-b border-slate-50 last:border-none">
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-4">
                             <div className="w-12 h-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                             </div>
                             <div>
                                <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className="text-[9px] font-black uppercase text-slate-400">{item.quantity} Unit(s)</span>
                                   {item.isCustomOrder && <span className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase px-2 py-0.5 rounded">Bespoke</span>}
                                </div>
                             </div>
                          </div>
                          <span className="font-mono font-black text-sm text-slate-900">BDT {(item.price * item.quantity).toLocaleString()}</span>
                       </div>

                       {/* Bespoke Details Block */}
                       {item.isCustomOrder && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            <div>
                               <h5 className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-3 border-b border-amber-200 pb-1">Measurements (Inches)</h5>
                               <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                  {item.measurements && Object.entries(item.measurements).filter(([k,v]) => k !== 'id' && k !== 'label' && typeof v === 'number' && v > 0).map(([k,v]) => (
                                    <div key={k} className="flex justify-between items-center text-[10px]">
                                       <span className="uppercase font-bold text-slate-400">{k}</span>
                                       <span className="font-black font-mono text-slate-900">{v}"</span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div className="md:border-l border-slate-200 md:pl-6 mt-4 md:mt-0">
                               <h5 className="text-[9px] font-black uppercase tracking-widest text-teal-700 mb-3 border-b border-teal-200 pb-1">Technical Directives</h5>
                               <div className="space-y-1">
                                 {item.designOptions && Object.entries(item.designOptions).map(([k,v]) => (
                                    <div key={k} className="flex justify-between items-center text-[10px]">
                                       <span className="uppercase font-bold text-slate-400">{k}</span>
                                       <span className="font-black text-slate-900">{v as string}</span>
                                    </div>
                                 ))}
                                 {item.bespokeType && (
                                    <div className="flex justify-between items-center text-[10px] pt-1">
                                       <span className="uppercase font-bold text-slate-400">Priority</span>
                                       <span className={`font-black ${item.bespokeType === 'Urgent' ? 'text-rose-600' : 'text-slate-900'}`}>{item.bespokeType}</span>
                                    </div>
                                 )}
                               </div>
                            </div>
                            {item.bespokeNote && (
                                <div className="col-span-full mt-3 pt-3 border-t border-slate-200">
                                    <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Artisan Note</p>
                                    <p className="text-xs text-slate-600 italic leading-relaxed">"{item.bespokeNote}"</p>
                                </div>
                            )}
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] space-y-3 border border-slate-100">
               <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Subtotal Valuation</span>
                  <span className="font-bold text-slate-900">BDT {order.subtotal.toLocaleString()}</span>
               </div>
               {order.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span className="font-bold uppercase text-[10px]">Promotional Credit</span>
                    <span className="font-bold">-BDT {order.discountAmount.toLocaleString()}</span>
                  </div>
               )}
               <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <span className="text-slate-900 font-black uppercase text-[11px]">Total Contract Value</span>
                  <span className="text-2xl font-black serif text-slate-900">BDT {order.total.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center text-emerald-700 pt-2">
                  <span className="font-bold uppercase text-[10px]">Amount Settled</span>
                  <span className="font-bold text-lg font-mono">BDT {order.paidAmount.toLocaleString()}</span>
               </div>
               {order.dueAmount > 0 && (
                 <div className="mt-4 p-4 bg-rose-600 text-white rounded-xl flex justify-between items-center shadow-lg">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Balance Remaining</span>
                    <span className="text-xl font-black font-mono">BDT {order.dueAmount.toLocaleString()}</span>
                 </div>
               )}
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-bold">Thank you for choosing artisan heritage</p>
                <p className="text-[8px] text-slate-300 mt-2">© 2025 Mehedi Tailors & Fabrics. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;