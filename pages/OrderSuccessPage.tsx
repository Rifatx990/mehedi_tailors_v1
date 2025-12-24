import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  CheckCircleIcon, 
  PrinterIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ScissorsIcon,
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams();
  const { orders } = useStore();
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="py-32 text-center bg-slate-50 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold serif mb-6 text-slate-400 tracking-tighter">Order Ledger Missing</h1>
        <p className="text-slate-500 mb-10">Searching the global artisan archive...</p>
        <Link to="/" className="bg-slate-950 text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl">Return to Store</Link>
      </div>
    );
  }

  const orderItems = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="bg-slate-100 min-h-screen py-12 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16 animate-in zoom-in duration-700 no-print">
          <div className="relative inline-block">
            <CheckCircleIcon className="w-20 h-20 text-emerald-500 mx-auto mb-4" />
            <ShieldCheckIcon className="w-8 h-8 text-white bg-emerald-500 rounded-full absolute -top-1 -right-1 border-4 border-white shadow-lg" />
          </div>
          <h1 className="text-5xl font-bold serif mb-4 tracking-tighter">Commission Logged.</h1>
          <p className="text-slate-500">Handshake verified for order <span className="font-mono font-bold text-slate-900">#{order.id}</span>.</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-3xl overflow-hidden border border-slate-200 invoice-card">
          <div className="bg-slate-950 p-10 text-white flex flex-col md:flex-row justify-between items-center invoice-header relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold serif uppercase tracking-tighter">MEHEDI TAILORS</h2>
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Verified Artisan Contract
              </p>
            </div>
            <button onClick={() => window.print()} className="bg-white/10 hover:bg-white text-white hover:text-slate-950 p-4 rounded-xl transition-all no-print relative z-10">
              <PrinterIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="p-10 md:p-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
              <div className="space-y-6">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Patron Coordinates</span>
                  <p className="text-lg font-bold leading-tight mt-1">{order.customerName}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{order.address}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Dispatch Protocol</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {order.paymentMethod.includes('bKash') ? (
                      <DevicePhoneMobileIcon className="w-4 h-4 text-rose-600" />
                    ) : order.paymentMethod.includes('SSL') ? (
                      <CreditCardIcon className="w-4 h-4 text-amber-600" />
                    ) : null}
                    <p className="text-sm font-bold text-slate-900">{order.paymentMethod}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6 text-left md:text-right">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Ledger Timestamp</span>
                  <p className="text-lg font-bold">{new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                {order.sslTranId && (
                  <div>
                    <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">SSLCommerz Auth ID</span>
                    <p className="text-sm font-mono font-bold text-slate-900">{order.sslTranId}</p>
                  </div>
                )}
                {order.bkashTrxId && (
                  <div>
                    <span className="text-[9px] font-black uppercase text-rose-600 tracking-widest">bKash TrxID</span>
                    <p className="text-sm font-mono font-bold text-slate-900">{order.bkashTrxId}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-10 mb-10">
              <h3 className="text-[9px] font-black uppercase text-slate-400 mb-8 flex items-center gap-2">
                <ScissorsIcon className="w-4 h-4" />
                <span>Manifested Artisan Items</span>
              </h3>
              <div className="space-y-8">
                {orderItems.map((item, idx) => (
                  <div key={idx} className="pb-8 border-b border-slate-50 last:border-none flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                        <div className="w-16 h-20 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 shadow-sm">
                          <img src={item.image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-slate-900">{item.name}</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.quantity} Unit(s) • BDT {item.price.toLocaleString()}</p>
                        </div>
                    </div>
                    <span className="font-black text-xl text-slate-900 font-mono">BDT {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-10 rounded-[3rem] space-y-6 border border-slate-100 shadow-inner">
               <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Contract Valuation</span>
                  <span className="text-3xl font-black serif text-slate-950">BDT {order.total.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center text-emerald-600 pt-4 border-t border-slate-200/50">
                  <span className="text-[10px] font-black uppercase tracking-widest">Settled Today</span>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono">BDT {order.paidAmount.toLocaleString()}</span>
                    <p className="text-[8px] font-bold uppercase tracking-widest mt-1">Verified via Global Digital Gateway</p>
                  </div>
               </div>
               {order.dueAmount > 0 && (
                 <div className="mt-6 p-6 bg-amber-600 text-white rounded-2xl flex justify-between items-center shadow-xl shadow-amber-600/20">
                    <div>
                       <span className="text-[9px] font-black uppercase tracking-widest opacity-80 block mb-1">Balance Payable on Fitting</span>
                       <span className="text-2xl font-black font-mono">BDT {order.dueAmount.toLocaleString()}</span>
                    </div>
                    <CreditCardIcon className="w-10 h-10 opacity-20" />
                 </div>
               )}
            </div>
            
            <div className="mt-16 text-center no-print">
               <Link to="/shop" className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center gap-2">
                 Explore New Fabrics
                 <AdjustmentsHorizontalIcon className="w-4 h-4" />
               </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;