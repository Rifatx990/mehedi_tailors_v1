import React from 'react';
import { Link } from 'react-router-dom';
import { XCircleIcon, ArrowLeftIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

const PaymentFailPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-24 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg text-center">
        <div className="bg-white rounded-[3.5rem] p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
               <ShieldExclamationIcon className="w-12 h-12" />
            </div>
            
            <h1 className="text-4xl font-bold serif text-slate-900 mb-4 tracking-tighter">Transaction Rejected</h1>
            <p className="text-slate-500 mb-12 leading-relaxed">
              The payment attempt was declined by your bank or the service provider. No funds were captured for this commission.
            </p>
            
            <div className="space-y-4">
              <Link 
                to="/checkout" 
                className="block w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-amber-600 transition-all active:scale-95"
              >
                Retry Authorized Payment
              </Link>
              <Link 
                to="/cart" 
                className="block w-full bg-slate-100 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-200 transition-all flex items-center justify-center space-x-2"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Return to Bag</span>
              </Link>
            </div>
          </div>
        </div>
        
        <p className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Artisan Integrity • Secure Banking Network</p>
      </div>
    </div>
  );
};

export default PaymentFailPage;