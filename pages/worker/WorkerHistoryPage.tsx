
import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import WorkerSidebar from '../../components/worker/WorkerSidebar.tsx';
import { ArchiveBoxIcon, CheckBadgeIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const WorkerHistoryPage: React.FC = () => {
  const { orders } = useStore();
  const completedJobs = orders.filter(o => o.productionStep === 'Ready' || o.status === 'Shipped' || o.status === 'Delivered');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <WorkerSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold serif">Craftsmanship Archive</h1>
          <p className="text-slate-400 mt-2">Historical record of all successfully completed bespoke garments.</p>
        </header>

        {completedJobs.length > 0 ? (
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                  <th className="px-10 py-6">Order</th>
                  <th className="px-10 py-6">Patron</th>
                  <th className="px-10 py-6">Handed Over</th>
                  <th className="px-10 py-6 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {completedJobs.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-10 py-8">
                       <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                             <ShoppingBagIcon className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="font-bold">#{order.id}</p>
                             <p className="text-[10px] text-slate-400 uppercase font-bold">{order.items[0]?.name}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-sm font-bold">{order.customerName}</td>
                    <td className="px-10 py-8 text-xs text-slate-400">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-10 py-8 text-right">
                       <div className="inline-flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                          <CheckBadgeIcon className="w-4 h-4" />
                          <span>Mehedi Certified</span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <ArchiveBoxIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <h3 className="text-xl font-bold serif text-slate-400">Archive Empty</h3>
             <p className="text-slate-400 mt-2">Complete your first job to see it listed here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkerHistoryPage;
