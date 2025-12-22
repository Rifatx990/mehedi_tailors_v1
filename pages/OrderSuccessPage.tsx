import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  CheckCircleIcon, 
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
        <Link to="/" className="bg-slate-950 text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl">Return to Store</Link>
      </div>
    );
  }

  const orderItems = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="bg-slate-100 min-h-screen py-12 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16 animate-in zoom-in duration-700 no-print">
          <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-5xl font-bold serif mb-4 tracking-tighter">Commission Logged.</h1>
          <p className="text-slate-500">Order <span className="font-mono font-bold text-slate-900">#{order.id}</span> Synchronized.</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-3xl overflow-hidden border border-slate-200 invoice-card">
          <div className="bg-slate-950 p-10 text-white flex flex-col md:flex-row justify-between items-center invoice-header">
            <h2 className="text-3xl font-bold serif uppercase">MEHEDI TAILORS</h2>
            <button onClick={() => window.print()} className="bg-white/10 hover:bg-white text-white hover:text-slate-950 p-4 rounded-xl transition-all no-print">
              <PrinterIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="p-10 md:p-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400">Date</span>
                <p className="text-lg font-bold">{new Date(order.date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400">Coordinates</span>
                <p className="text-lg font-bold leading-tight">{order.address}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-10 mb-10">
              <h3 className="text-[9px] font-black uppercase text-slate-400 mb-8">Manifested Artisan Items</h3>
              <div className="space-y-12">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="pb-10 border-b border-slate-50 last:border-none">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-6">
                        <div className="w-16 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-slate-900">{item.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.quantity} Unit(s) • BDT {item.price.toLocaleString()}</p>
                          {item.isCustomOrder && <span className="inline-block mt-2 bg-amber-600 text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded">Bespoke Artisan Craft</span>}
                        </div>
                      </div>
                      <span className="font-black text-xl text-slate-900 font-mono">BDT {(item.price * item.quantity).toLocaleString()}</span>
                    </div>

                    {item.isCustomOrder && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        {item.measurements && (
                          <div>
                            <p className="text-[9px] font-black uppercase text-amber-700 mb-3">Measurements</p>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                              {Object.entries(item.measurements).filter(([k,v]) => k !== 'id' && k !== 'label' && typeof v === 'number' && v > 0).map(([k,v]) => (
                                <div key={k} className="flex justify-between border-b border-slate-200/50"><span className="text-[8px] uppercase text-slate-400">{k}</span><span className="text-[10px] font-mono font-bold">{v}"</span></div>
                              ))}
                            </div>
                          </div>
                        )}
                        {item.designOptions && (
                          <div>
                            <p className="text-[9px] font-black uppercase text-teal-700 mb-3">Directives</p>
                            <div className="space-y-1">
                              {Object.entries(item.designOptions).map(([k,v]) => (
                                <div key={k} className="flex justify-between bg-white px-3 py-1 rounded border border-slate-200/50"><span className="text-[8px] uppercase text-slate-400">{k}</span><span className="text-[10px] font-bold">{v as string}</span></div>
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

            <div className="bg-slate-50 p-10 rounded-[2.5rem] space-y-4">
               <div className="flex justify-between">
                  <span className="text-slate-400 font-black uppercase text-[9px]">Ledger Total</span>
                  <span className="text-3xl font-black serif text-slate-950">BDT {order.total.toLocaleString()}</span>
               </div>
               {order.dueAmount > 0 && (
                 <div className="mt-4 p-6 bg-amber-600 text-white rounded-2xl flex justify-between items-center shadow-xl shadow-amber-600/20">
                    <span className="text-[10px] font-black uppercase tracking-widest">Remaining Balance Due</span>
                    <span className="text-2xl font-black font-mono">BDT {order.dueAmount.toLocaleString()}</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;