
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  CheckCircleIcon, 
  ArrowDownTrayIcon, 
  PrinterIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ScissorsIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams();
  const { orders, systemConfig } = useStore();
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="py-32 text-center bg-slate-50 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold serif mb-6 text-slate-400 tracking-tighter">Order Ledger Missing</h1>
        <p className="text-slate-500 mb-10">We couldn't locate this artisan commission in the world archive.</p>
        <Link to="/" className="bg-slate-950 text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl">Return to Store</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen py-12 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16 animate-in zoom-in duration-700 no-print">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center shadow-inner">
               <CheckCircleIcon className="w-16 h-16 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold serif mb-4 tracking-tighter">Commission Logged.</h1>
          <p className="text-slate-500 text-lg">Order <span className="text-slate-900 font-bold font-mono bg-slate-200 px-2 py-0.5 rounded">#{order.id}</span> is now synchronized with the world ledger.</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-3xl overflow-hidden border border-slate-200 invoice-card animate-in slide-in-from-bottom-10 duration-1000">
          <div className="bg-slate-950 p-10 md:p-16 text-white flex flex-col md:flex-row justify-between items-start md:items-center space-y-10 md:space-y-0 invoice-header">
            <div>
              <h2 className="text-3xl font-bold serif tracking-tighter mb-1 uppercase">MEHEDI TAILORS</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Official Artisan Invoice</p>
            </div>
            <div className="flex space-x-4 no-print">
              <button onClick={() => window.print()} className="bg-white/10 hover:bg-white text-white hover:text-slate-950 p-5 rounded-2xl transition-all shadow-2xl">
                <PrinterIcon className="w-7 h-7" />
              </button>
            </div>
          </div>

          <div className="p-10 md:p-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-400">
                  <CalendarDaysIcon className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Archive Date</span>
                </div>
                <p className="text-xl font-bold text-slate-900">{new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-400">
                  <MapPinIcon className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Shipment Coordinates</span>
                </div>
                <p className="text-xl font-bold text-slate-900 leading-tight">{order.address}</p>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{order.customerName}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-16 mb-20">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-12 flex items-center space-x-3">
                 <ScissorsIcon className="w-5 h-5" />
                 <span>Manifested Items</span>
              </h3>
              <div className="space-y-16">
                {order.items.map((item, idx) => (
                  <div key={idx} className="pb-16 border-b border-slate-50 last:border-none last:pb-0">
                    <div className="flex justify-between items-start mb-10">
                      <div className="flex items-center space-x-10">
                        <div className="w-20 h-28 bg-slate-50 rounded-2xl overflow-hidden no-print shadow-inner border border-slate-100 flex-shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <h4 className="font-bold text-2xl text-slate-900 leading-tight">{item.name}</h4>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                             {item.quantity} Unit(s) • BDT {item.price.toLocaleString()} per piece
                          </p>
                          {item.isCustomOrder && <span className="inline-block mt-4 bg-amber-600 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg shadow-xl shadow-amber-600/20">Bespoke Artisan Craft</span>}
                        </div>
                      </div>
                      <span className="font-black text-2xl text-slate-900 font-mono tracking-tighter">BDT {(item.price * item.quantity).toLocaleString()}</span>
                    </div>

                    {item.isCustomOrder && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 shadow-inner">
                        {item.measurements && Object.keys(item.measurements).length > 0 && (
                          <div>
                            <h5 className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-amber-700 mb-6">
                              <ScissorsIcon className="w-4 h-4" />
                              <span>Measurement Silhouette</span>
                            </h5>
                            <div className="grid grid-cols-2 gap-x-10 gap-y-3">
                              {Object.entries(item.measurements).filter(([k, v]) => k !== 'id' && k !== 'label' && typeof v === 'number' && v > 0).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                                  <span className="text-[9px] uppercase font-black text-slate-400">{key}</span>
                                  <span className="text-xs font-black font-mono text-slate-900">{val}"</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {item.designOptions && (
                          <div>
                            <h5 className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-teal-700 mb-6">
                              <AdjustmentsHorizontalIcon className="w-4 h-4" />
                              <span>Technical Directives</span>
                            </h5>
                            <div className="space-y-3">
                              {Object.entries(item.designOptions).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center bg-white px-5 py-3 rounded-2xl border border-slate-200/50 shadow-sm">
                                  <span className="text-[9px] uppercase font-black text-slate-400">{key}</span>
                                  <span className="text-[11px] font-black text-slate-900">{val as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-10 md:p-14 rounded-[3rem] space-y-6 border border-slate-100 shadow-inner">
               <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Net Settlement Method</span>
                  <span className="font-black text-slate-950 uppercase tracking-widest text-xs">{order.paymentMethod}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">World Ledger Total</span>
                  <span className="text-4xl font-black serif text-slate-950 tracking-tighter">BDT {order.total.toLocaleString()}</span>
               </div>
               {order.dueAmount > 0 && (
                 <div className="mt-8 p-8 bg-amber-600 text-white rounded-[2rem] flex flex-col sm:flex-row justify-between items-center shadow-3xl shadow-amber-600/30 gap-6">
                    <div className="text-center sm:text-left">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Remaining Artisan Balance</p>
                        <p className="text-sm font-bold uppercase mt-1">Due on Pickup/Fitting</p>
                    </div>
                    <span className="text-4xl font-black font-mono tracking-tighter">BDT {order.dueAmount.toLocaleString()}</span>
                 </div>
               )}
            </div>

            <div className="mt-20 text-center no-print">
               <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed mb-12">Artisan production has been initiated. Status updates will be broadcasted to <span className="text-slate-950 font-black">{order.customerEmail}</span> as we progress.</p>
               <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <Link to="/dashboard" className="bg-slate-950 text-white px-16 py-6 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-3xl active:scale-95 transition-all">Monitor Life-Cycle</Link>
                  <Link to="/shop" className="bg-white border-2 border-slate-950 text-slate-950 px-16 py-6 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-slate-950 hover:text-white transition-all">Explore More</Link>
               </div>
            </div>
            
            <div className="hidden print:block mt-24 pt-10 border-t border-slate-100 text-center">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.5em]">{systemConfig.siteName} • Heritage Bespoke Solutions &copy; 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
