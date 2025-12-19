
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { 
  CheckCircleIcon, 
  ArrowDownTrayIcon, 
  PrinterIcon,
  CalendarDaysIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams();
  const { orders } = useStore();
  const order = orders.find(o => o.id === orderId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a browser environment, standard "Save as PDF" is triggered by print.
    // We can also simulate a simple text/json download for record keeping if needed,
    // but for invoices, window.print() is the most standard approach.
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
              </div>
            </div>

            {/* Item Table */}
            <div className="border-t border-slate-100 pt-12 mb-12">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Order Items</h3>
              <div className="space-y-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pb-6 border-b border-slate-50 last:border-none last:pb-0">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-16 bg-slate-50 rounded overflow-hidden no-print">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                      <div>
                        <h4 className="font-bold">{item.name}</h4>
                        <p className="text-xs text-slate-400 uppercase tracking-widest">
                          {item.quantity} x BDT {item.price.toLocaleString()}
                          {item.isCustomOrder && <span className="ml-2 text-amber-600">• Bespoke</span>}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold">BDT {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Section */}
            <div className="invoice-footer bg-slate-50 p-8 rounded-3xl space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Payment Status</span>
                <span className="font-bold text-green-600">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Order Total</span>
                <span className="text-2xl font-bold serif">BDT {order.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-12 text-center no-print">
              <p className="text-slate-400 text-sm mb-8">A confirmation email has been sent. You can track your bespoke order from your dashboard.</p>
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
            <div className="hidden print:block mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400 uppercase tracking-widest">
              Mehedi Tailors & Fabrics - Dhonaid, Ashulia, Savar, Dhaka
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;