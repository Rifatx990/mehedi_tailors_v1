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

  // Ensure items are parsed if stringified
  const orderItems = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="bg-slate-100 min-h-screen py-4 md:py-8 no-scrollbar print:bg-white print:p-0">
      <style>
        {`
          @media print {
            @page { size: A4; margin: 0mm; }
            body { background: white; margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .no-print { display: none !important; }
            .invoice-card { box-shadow: none !important; border: none !important; border-radius: 0 !important; width: 210mm !important; margin: 0 auto !important; padding: 10mm !important; font-size: 10pt !important; }
            .invoice-header { padding: 5mm !important; margin-bottom: 5mm !important; }
            .line-item { margin-bottom: 3mm !important; padding-bottom: 3mm !important; border-bottom: 1px solid #f1f5f9 !important; page-break-inside: avoid; }
            .spec-box { padding: 4mm !important; margin-top: 2mm !important; border-radius: 4mm !important; font-size: 9pt !important; }
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
                <p className="text-sm font-bold text-slate-900 truncate">{order.customerName}</p>
                <p className="text-[8px] text-slate-400 font-medium truncate">{order.address}</p>
              </div>
            </div>

            <div className="mb-6">
               <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6 flex items-center space-x-2">
                  <ScissorsIcon className="w-3 h-3" />
                  <span>Artisan Line Items & Specifications</span>
               </h3>
               <div className="space-y-8">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="line-item">
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-4">
                             <div className="w-10 h-14 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 no-print">
                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                             </div>
                             <div>
                                <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                                <div className="flex items-center gap-2">
                                   <span className="text-[8px] font-black uppercase text-slate-400">{item.quantity} Unit(s)</span>
                                   {item.isCustomOrder && <span className="bg-amber-100 text-amber-700 text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">Bespoke</span>}
                                </div>
                             </div>
                          </div>
                          <span className="font-mono font-black text-sm text-slate-900">BDT {(item.price * item.quantity).toLocaleString()}</span>
                       </div>

                       {item.isCustomOrder && (
                         <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 spec-box">
                            <div>
                               <h5 className="text-[8px] font-black uppercase tracking-widest text-amber-700 mb-2">Silhouette (Inches)</h5>
                               <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                                  {item.measurements && Object.entries(item.measurements).filter(([k,v]) => k !== 'id' && k !== 'label' && typeof v === 'number' && v > 0).map(([k,v]) => (
                                    <div key={k} className="flex justify-between items-center border-b border-slate-200/50">
                                       <span className="text-[7px] uppercase font-bold text-slate-400">{k}</span>
                                       <span className="text-[9px] font-black font-mono text-slate-900">{v}"</span>
                                    </div>
                                  ))}
                               </div>
                            </div>
                            <div className="border-l border-slate-200 pl-4">
                               <h5 className="text-[8px] font-black uppercase tracking-widest text-teal-700 mb-2">Technical Details</h5>
                               <div className="grid grid-cols-1 gap-0.5">
                                 {item.designOptions && Object.entries(item.designOptions).map(([k,v]) => (
                                    <div key={k} className="flex justify-between items-center bg-white px-2 py-0.5 rounded border border-slate-200/50">
                                       <span className="text-[7px] uppercase font-bold text-slate-400">{k}</span>
                                       <span className="text-[8px] font-black text-slate-900">{v as string}</span>
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
            <div className="bg-slate-50 p-6 rounded-xl space-y-2 border border-slate-100 totals-box">
               <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                     <span className="text-slate-400 font-bold uppercase text-[8px]">Contract Valuation</span>
                     <span className="text-xl font-black serif text-slate-900">BDT {order.total.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-emerald-600 font-bold uppercase text-[8px]">Amount Settled</span>
                     <span className="text-lg font-bold text-emerald-700 font-mono">BDT {order.paidAmount.toLocaleString()}</span>
                  </div>
               </div>
               {order.dueAmount > 0 && (
                 <div className="mt-2 p-3 bg-rose-600 text-white rounded-lg flex justify-between items-center shadow-lg">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">Balance Remaining</span>
                    <span className="text-xl font-black font-mono">BDT {order.dueAmount.toLocaleString()}</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;