import React from 'react';
import { Link } from 'react-router-dom';
import { InformationCircleIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const PaymentCancelPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-24 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg text-center">
        <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
               <InformationCircleIcon className="w-12 h-12" />
            </div>
            
            <h1 className="text-4xl font-bold serif text-slate-900 mb-4 tracking-tighter">Auth Cancelled</h1>
            <p className="text-slate-500 mb-12 leading-relaxed">
              The digital handshake was terminated by the user. Your bag items are preserved for future commission.
            </p>
            
            <div className="space-y-4">
              <Link 
                to="/checkout" 
                className="block w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-amber-600 transition-all active:scale-95"
              >
                Restart Checkout
              </Link>
              <Link 
                to="/shop" 
                className="block w-full bg-slate-100 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all flex items-center justify-center space-x-2"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                <span>Continue Exploring</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;