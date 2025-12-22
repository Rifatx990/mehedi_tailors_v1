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
  InformationCircleIcon,
  PencilSquareIcon,
  FlagIcon
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
    <div className="bg-slate-100 min-h-screen py-4 md:py-8 no-scrollbar print:bg-white print:p-0">
      <style>
        {`
          @media print {
            @page { size: A4; margin: 5mm; }
            body { background: white; margin: 0; padding: 0; }
            .no-print { display: none !important; }
            .invoice-card { 
              box-shadow: none !important; 
              border: 1px solid #e2e8f0 !important; 
              border-radius: 0 !important;
              width: 100% !important;
              max-height: 287mm !important; /* Force fit on one A4 page */
              overflow: hidden !important;
            }
            .invoice-header { padding: 1.5rem !important; }
            .invoice-content { padding: 1.5rem !important; }
            .line-item { margin-bottom: 1rem !important; padding-bottom: 1rem !important; }
            .spec-box { padding: 1rem !important; margin-top: 0.5rem !important; gap: 1rem !important; }
            .totals-box { padding: 1.5rem !important; margin-top: 1rem !important; }
            h1, h2, h3, h4 { margin-bottom: 0.5rem !important; }
            p { margin-bottom: 0.25rem !important; }
            .text-3xl { font-size: 1.5rem !important; }
            .text-4xl { font-size: 1.875rem !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `}
      </style>

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6 no-print">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-amber-600 transition">
            <PrinterIcon className="w-4 h-4" />
            <span>Print Ledger (1 Page)</span>
          </button>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[30px] shadow-2xl overflow-hidden border border-slate-200 invoice-card">
          {/* Header Section */}
          <div className="bg-slate-900 p-6 md:p-10 text-white flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0 invoice-header">
            <div className="flex flex-col">
              {systemConfig.documentLogo || systemConfig.siteLogo ? (
                <img 
                  src={systemConfig.documentLogo || systemConfig.siteLogo} 
                  alt="Logo" 
                  className="h-10 md:h-12 w-auto object-contain mr-auto mb-2" 
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              ) : (
                <h2 className="text-2xl font-bold serif tracking-tighter uppercase">MEHEDI TAILORS</h2>
              )}
              <p className="text-slate-400 text-[8px] uppercase tracking-[0.4em]">Official Artisan Ledger</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[9px] uppercase tracking-widest font-bold text-amber-500">Contract Ref</p>
              <p className="text-xl md:text-2xl font-mono font-bold">#{order.id}</p>
            </div>
          </div>

          <div className="p-6 md:p-10 invoice-content">
            {/* Meta Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-slate-400">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Commissioned</span>
                </div>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-slate-400">
                  <CreditCardIcon className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Settlement Method</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{order.paymentMethod}</p>
                <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${order.paymentStatus === 'Fully Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                   {order.paymentStatus}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-slate-400">
                  <MapPinIcon className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Patron Identity</span>
                </div>
                <p className="text-sm font-bold text-slate-900 leading-tight">{order.customerName}</p>
                <p className="text-[9px] text-slate-400 italic leading-tight truncate">{order.address}</p>
              </div>
            </div>

            {/* Bespoke Header Details (Delivery & Type) */}
            {(order.bespokeType || order.deliveryDate) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {order.bespokeType && (
                        <div>
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Priority Class</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <FlagIcon className={`w-3 h-3 ${order.bespokeType === 'Urgent' ? 'text-rose-600' : 'text-amber-600'}`} />
                                <span className={`text-xs font-black uppercase ${order.bespokeType === 'Urgent' ? 'text-rose-600' : 'text-slate-900'}`}>{order.bespokeType}</span>
                            </div>
                        </div>
                    )}
                    {order.deliveryDate && (
                        <div>
                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Handover Target</p>
                            <div className="flex items-center space-x-2 mt-1 font-bold text-xs text-slate-900">
                                <ClockIcon className="w-3 h-3 text-emerald-600" />
                                <span>{new Date(order.deliveryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Line Items */}
            <div className="mb-8">
               <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 flex items-center space-x-2">
                  <ScissorsIcon className="w-4 h-4" />
                  <span>Artisan Line Items & Specifications</span>
               </h3>
               <div className="space-y-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="pb-6 border-b border-slate-50 last:border-none last:pb-0 line-item">
                       <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                          <div className="flex items-center space-x-4">
                             <div className="w-12 h-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 no-print shadow-sm">
                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                             </div>
                             <div>
                                <h4 className="font-bold text-base md:text-lg text-slate-900 leading-tight">{item.name}</h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Qty: {item.quantity}</span>
                                   <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">BDT {item.price.toLocaleString()}</span>
                                   {item.isCustomOrder && <span className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Bespoke Craft</span>}
                                </div>
                             </div>
                          </div>
                          <div className="text-left sm:text-right">
                             <span className="font-mono font-black text-lg text-slate-900">BDT {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                       </div>

                       {(item.isCustomOrder) && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 mt-2 shadow-inner spec-box">
                            <div>
                               <h5 className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-amber-700 mb-3">
                                  <InformationCircleIcon className="w-3.5 h-3.5" />
                                  <span>Physical Scale (Inches)</span>
                               </h5>
                               <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                  {item.measurements && Object.entries(item.measurements).filter(([k,v]) => k !== 'id' && k !== 'label' && typeof v === 'number' && v > 0).map(([k,v]) => (
                                    <div key={k} className="flex justify-between items-center border-b border-slate-200/50 pb-0.5">
                                       <span className="text-[8px] uppercase font-bold text-slate-400">{k}</span>
                                       <span className="text-[10px] font-black font-mono text-slate-900">{v}"</span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div>
                               <h5 className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-teal-700 mb-3">
                                  <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" />
                                  <span>Directives & Notes</span>
                               </h5>
                               <div className="space-y-3">
                                  <div className="grid grid-cols-1 gap-1">
                                     {item.designOptions && Object.entries(item.designOptions).map(([k,v]) => (
                                        <div key={k} className="flex justify-between items-center bg-white px-3 py-1 rounded-lg border border-slate-200/50 shadow-sm">
                                           <span className="text-[8px] uppercase font-bold text-slate-400">{k}</span>
                                           <span className="text-[9px] font-black text-slate-900">{v as string}</span>
                                        </div>
                                     ))}
                                  </div>
                                  
                                  {(item.bespokeNote || order.bespokeNote) && (
                                     <div className="mt-2 bg-white p-3 rounded-xl border border-amber-100 shadow-sm relative">
                                        <PencilSquareIcon className="absolute top-2 right-2 w-3 h-3 text-amber-500 opacity-30" />
                                        <p className="text-[8px] font-black uppercase text-amber-600 tracking-widest mb-1">Artisan Directives</p>
                                        <p className="text-[10px] text-slate-700 italic font-medium leading-relaxed">
                                          "{item.bespokeNote || order.bespokeNote}"
                                        </p>
                                     </div>
                                  )}
                               </div>
                            </div>
                         </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>

            {/* Totals Section */}
            <div className="bg-slate-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] space-y-3 border border-slate-100 totals-box">
               <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Lifecycle Status</span>
                  <span className="font-black text-slate-900 uppercase tracking-widest text-[10px]">{order.status}</span>
               </div>
               <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Net Valuation</span>
                     <span className="text-2xl font-black serif text-slate-900 tracking-tighter">BDT {order.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-emerald-600 font-bold uppercase tracking-widest text-[9px]">Realized Settlement</span>
                     <span className="text-lg font-bold text-emerald-700 font-mono">BDT {order.paidAmount.toLocaleString()}</span>
                  </div>
               </div>
               {order.dueAmount > 0 && (
                 <div className="mt-4 p-4 bg-amber-600 text-white rounded-2xl flex justify-between items-center shadow-lg">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">Remaining Artisan Balance</p>
                        <p className="text-[9px] font-bold uppercase mt-0.5">Due at Calibration</p>
                    </div>
                    <span className="text-2xl font-black font-mono">BDT {order.dueAmount.toLocaleString()}</span>
                 </div>
               )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
               <p className="text-[8px] text-slate-400 uppercase tracking-[0.5em] font-black">Heritage Precision • Digital Sovereignty</p>
               <p className="text-[7px] text-slate-300 mt-2">
                 Official Document • Ashulia, Savar • +8801720267213
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;