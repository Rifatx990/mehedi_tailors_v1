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
  const { orders } = useStore();
  const order = orders.find(o => o.id === orderId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  if (!order) {
    return (
      <div className="py-32 text-center">
        <h1 className="text-3xl font-bold serif mb-6">Order not found.</h1>
        <Link to="/" className="text-amber-600 font-bold underline">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12 animate-in zoom-in duration-700 no-print">
          <div className="flex justify-center mb-6">
            <CheckCircleIcon className="w-20 h-20 text-green-500" />
          </div>
          <h1 className="text-5xl font-bold serif mb-4">Shukriya!</h1>
          <p className="text-slate-500 text-lg">Your order <span className="text-slate-900 font-bold">#{order.id}</span> has been successfully placed.</p>
        </div>

        {/* Invoice Card */}
        <div className="invoice-card bg-white rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-8 duration-1000">
          <div className="invoice-header bg-slate-900 p-12 text-white flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
            <div>
              <h2 className="text-2xl font-bold serif tracking-tighter">MEHEDI TAILORS</h2>
              <p className="text-slate-400 text-xs uppercase tracking-[0.3em] mt-1">Invoice Receipt</p>
            </div>
            <div className="flex space-x-3 no-print">
              <button 
                onClick={handlePrint}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition" 
                title="Print Invoice"
              >
                <PrinterIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={handleDownload}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition" 
                title="Download PDF"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-400">
                  <CalendarDaysIcon className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Order Date</span>
                </div>
                <p className="text-lg font-medium">{new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-400">
                  <MapPinIcon className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Shipping To</span>
                </div>
                <p className="text-lg font-medium leading-relaxed">{order.address}</p>
                <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
              </div>
            </div>

            {/* Item Table */}
            <div className="border-t border-slate-100 pt-12 mb-12">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Order Items</h3>
              <div className="space-y-12">
                {order.items.map((item, idx) => (
                  <div key={idx} className="pb-8 border-b border-slate-100 last:border-none last:pb-0">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-6">
                        <div className="w-16 h-20 bg-slate-50 rounded overflow-hidden no-print flex-shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{item.name}</h4>
                          <p className="text-xs text-slate-400 uppercase tracking-widest">
                            {item.quantity} x BDT {item.price.toLocaleString()}
                            {item.isCustomOrder && <span className="ml-2 text-amber-600 font-bold">• Bespoke Craft</span>}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-lg">BDT {(item.price * item.quantity).toLocaleString()}</span>
                    </div>

                    {/* Bespoke Details (Measurements & Design) */}
                    {item.isCustomOrder && (
                      <div className="bg-slate-50 rounded-3xl p-8 mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 border border-slate-100">
                        {/* Measurements Section */}
                        {item.measurements && (
                          <div className="space-y-4">
                            <h5 className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                              <ScissorsIcon className="w-4 h-4" />
                              <span>Measurement Silhouettes</span>
                            </h5>
                            <div className="grid grid-cols-2 gap-4">
                              {/* Fix: Operator '>' cannot be applied to types 'unknown' and 'number'. Added typeof check. */}
                              {Object.entries(item.measurements).filter(([k, v]) => k !== 'id' && k !== 'label' && typeof v === 'number' && v > 0).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center border-b border-slate-200 pb-1">
                                  <span className="text-[10px] uppercase font-medium text-slate-400">{key}</span>
                                  <span className="text-xs font-bold font-mono text-slate-900">{val}"</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Design Options Section */}
                        {item.designOptions && (
                          <div className="space-y-4">
                            <h5 className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-teal-700">
                              <AdjustmentsHorizontalIcon className="w-4 h-4" />
                              <span>Tailoring Directives</span>
                            </h5>
                            <div className="grid grid-cols-1 gap-2">
                              {Object.entries(item.designOptions).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-slate-100">
                                  <span className="text-[9px] uppercase font-bold text-slate-400">{key}</span>
                                  <span className="text-[10px] font-bold text-slate-900">{val as string}</span>
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

            {/* Total Section */}
            <div className="invoice-footer bg-slate-50 p-8 rounded-3xl space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Method</span>
                <span className="font-bold text-slate-900 uppercase tracking-widest text-xs">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 font-medium">Payment Status</span>
                <span className={`font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-widest ${order.paymentStatus === 'Fully Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Grand Total</span>
                <span className="text-3xl font-bold serif text-slate-900">BDT {order.total.toLocaleString()}</span>
              </div>
              {order.dueAmount > 0 && (
                <div className="flex justify-between items-center bg-amber-50 p-4 rounded-2xl border border-amber-100">
                   <span className="text-amber-800 font-bold uppercase tracking-widest text-[10px]">Collectible on Pickup</span>
                   <span className="text-xl font-bold text-amber-800">BDT {order.dueAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="mt-12 text-center no-print">
              <p className="text-slate-400 text-sm mb-8">Your artisan journey has officially begun. We will notify you at <span className="text-slate-900 font-bold">{order.customerEmail}</span> as we progress.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/dashboard" className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition shadow-xl shadow-slate-200">
                  Track My Order
                </Link>
                <Link to="/shop" className="bg-white border border-slate-200 text-slate-900 px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-slate-50 transition">
                  Continue Shopping
                </Link>
              </div>
            </div>
            
            {/* Print Only Footer */}
            <div className="hidden print:block mt-12 pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">
              Mehedi Tailors & Fabrics • Dhonaid, Ashulia, Savar, Dhaka • +8801720267213
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;