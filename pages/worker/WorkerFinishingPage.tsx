
import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import WorkerSidebar from '../../components/worker/WorkerSidebar.tsx';
import { SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const WorkerFinishingPage: React.FC = () => {
  const { orders, updateProductionStep } = useStore();
  const tasks = orders.filter(o => o.productionStep === 'Finishing' && o.status === 'In Progress');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <WorkerSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center space-x-2 text-teal-600 mb-2 font-bold uppercase tracking-[0.2em] text-[10px]">
              <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></div>
              <span>Station 03: Detailing & Pressing</span>
            </div>
            <h1 className="text-4xl font-bold serif">Finishing Studio</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-slate-400">Final Touches</p>
            <p className="text-3xl font-bold text-slate-900">{tasks.length}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.length > 0 ? (
            tasks.map(order => (
              <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
                <div className="mb-8">
                  <div className="relative aspect-[3/4] bg-slate-50 rounded-3xl overflow-hidden mb-6 border border-slate-50">
                    <img src={order.items[0]?.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-80">Patron</p>
                      <h4 className="font-bold text-sm">{order.customerName}</h4>
                    </div>
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-2">Workorder: #{order.id}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[9px] font-bold uppercase rounded-lg border border-amber-100">Bespoke Detail</span>
                    <span className="px-3 py-1 bg-teal-50 text-teal-600 text-[9px] font-bold uppercase rounded-lg border border-teal-100">Pressing Required</span>
                  </div>
                </div>

                <button 
                  onClick={() => updateProductionStep(order.id, 'Ready')}
                  className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-teal-600/20 flex items-center justify-center space-x-2"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Mark as Ready</span>
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <SparklesIcon className="w-16 h-16 text-slate-100 mx-auto mb-6" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">All details have been polished.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkerFinishingPage;
