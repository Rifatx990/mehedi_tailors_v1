import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.tsx';
import { 
  PrinterIcon, 
  ArrowLeftIcon, 
  ScissorsIcon, 
  DocumentTextIcon,
  FlagIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  ShieldCheckIcon
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
            <button onClick={() => navigate(-1)} className="w-full bg-slate-900 text-white py-4 rounded-full font-bold uppercase tracking-widest text-[10px]">Return</button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="bg-slate-100 min-h-screen py-8 no-scrollbar print:bg-white print:p-0">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6 no-print">
          <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900">
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button onClick={() => window.print()} className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-bold uppercase shadow-xl hover:bg-amber-600">
            <PrinterIcon className="w-4 h-4" />
            <span>Print Ledger</span>
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 invoice-card">
          <div className="bg-slate-900 p-10 text-white flex flex-col md:flex-row justify-between items-center invoice-header rounded-2xl">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold serif tracking-tighter uppercase">{systemConfig.siteName || 'MEHEDI TAILORS'}</h2>
              <p className="text-slate-400 text-[8px] uppercase tracking-[0.4em]">Official Artisan Ledger</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest font-bold text-amber-500">Contract Reference</p>
              <p className="text-xl md:text-2xl font-mono font-bold">#{order.id}</p>
            </div>
          </div>

          <div className="p-10 invoice-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 pb-10 border-b border-slate-100">
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Patron</span>
                  <p className="text-sm font-bold text-slate-900">{order.customerName}</p>
                  <p className="text-[10px] text-slate-500">{order.address}</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Settlement Method</span>
                  <div className="flex items-center space-x-2">
                     <p className="text-sm font-bold text-slate-900">{order.paymentMethod}</p>
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${order.paymentStatus === 'Fully Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{order.paymentStatus}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 text-left md:text-right">
                {order.sslTranId && (
                   <div>
                      <span className="text-[9px] font-bold uppercase text-emerald-600">SSLCommerz ID</span>
                      <p className="text-xs font-mono font-bold">{order.sslTranId}</p>
                   </div>
                )}
                {order.bkashTrxId && (
                   <div>
                      <span className="text-[9px] font-bold uppercase text-rose-600">bKash TrxID</span>
                      <p className="text-xs font-mono font-bold">{order.bkashTrxId}</p>
                   </div>
                )}
                <div>
                   <span className="text-[9px] font-bold uppercase text-slate-400">Ledger Entry</span>
                   <p className="text-sm font-bold">{new Date(order.date).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="mb-10">
               <h3 className="text-[10px] font-black uppercase text-slate-400 mb-6 flex items-center space-x-2 border-b pb-2">
                  <ScissorsIcon className="w-3 h-3" />
                  <span>Artisan Line Items</span>
               </h3>
               <div className="space-y-6">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                       <div className="flex items-center space-x-4">
                          <img src={item.image} className="w-12 h-16 object-cover rounded-lg border border-slate-100" />
                          <div>
                             <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                             <p className="text-[9px] text-slate-400 uppercase font-black">{item.quantity} Unit(s) @ {item.price.toLocaleString()}</p>
                          </div>
                       </div>
                       <span className="font-mono font-bold">BDT {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-4 border border-slate-100 shadow-inner">
               <div className="flex justify-between items-center border-t-2 border-slate-200 pt-4">
                  <span className="text-slate-900 font-black uppercase text-[12px] tracking-[0.2em]">Net Contract Value</span>
                  <span className="text-3xl font-black serif text-slate-900 tracking-tighter">BDT {Number(order.total).toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center text-emerald-700">
                  <span className="font-bold uppercase text-[11px] tracking-widest">Amount Realized</span>
                  <span className="font-bold text-2xl font-mono">BDT {Number(order.paidAmount).toLocaleString()}</span>
               </div>
               {Number(order.dueAmount) > 0 && (
                 <div className="mt-6 p-6 bg-rose-600 text-white rounded-2xl flex justify-between items-center shadow-xl">
                    <div>
                       <span className="text-[10px] font-black uppercase opacity-80 block mb-1">Outstanding Balance</span>
                       <span className="text-3xl font-black font-mono">BDT {Number(order.dueAmount).toLocaleString()}</span>
                    </div>
                    <BanknotesIcon className="w-12 h-12 opacity-20" />
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