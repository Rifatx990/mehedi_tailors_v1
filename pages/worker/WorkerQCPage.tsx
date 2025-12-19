
import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import WorkerSidebar from '../../components/worker/WorkerSidebar.tsx';
import { CheckBadgeIcon, ShoppingBagIcon, SparklesIcon } from '@heroicons/react/24/outline';

const WorkerQCPage: React.FC = () => {
  const { orders, updateOrderStatus } = useStore();
  const tasks = orders.filter(o => o.productionStep === 'Ready' && o.status !== 'Shipped' && o.status !== 'Delivered');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <WorkerSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center space-x-2 text-teal-600 mb-2 font-bold uppercase tracking-[0.2em] text-[10px]">
              <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></div>
              <span>Station 04: Inspection & Handover</span>
            </div>
            <h1 className="text-4xl font-bold serif">QC & Ready Bay</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-slate-400">Pending Dispatch</p>
            <p className="text-3xl font-bold text-slate-900">{tasks.length}</p>
          </div>
        </header>

        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
          {tasks.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                  <th className="px-10 py-6">Garment</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6 text-right">Handover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition group">
                    <td className="px-10 py-8">
                       <div className="flex items-center space-x-6">
                          <div className="w-12 h-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                             <img src={order.items[0]?.image} className="w-full h-full object-cover" />
                          </div>
                          <div>
                             <p className="font-bold text-slate-900">{order.customerName}</p>
                             <p className="text-[9px] text-teal-600 font-bold uppercase tracking-widest">Order ID: #{order.id}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="inline-flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-100">
                          <SparklesIcon className="w-3 h-3" />
                          <span>Quality Passed</span>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <button 
                        onClick={() => updateOrderStatus(order.id, 'Shipped')}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all shadow-xl shadow-slate-200"
                       >
                          Dispatch to Logistics
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-32 text-center">
              <CheckBadgeIcon className="w-16 h-16 text-slate-100 mx-auto mb-6" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Ready bay is currently empty.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkerQCPage;
