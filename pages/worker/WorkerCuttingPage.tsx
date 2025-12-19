
import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import WorkerSidebar from '../../components/worker/WorkerSidebar.tsx';
import { ScissorsIcon, ArchiveBoxIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const WorkerCuttingPage: React.FC = () => {
  const { orders, updateProductionStep } = useStore();
  const tasks = orders.filter(o => (o.productionStep === 'Queue' || o.productionStep === 'Cutting') && o.status === 'In Progress');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <WorkerSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center space-x-2 text-teal-600 mb-2 font-bold uppercase tracking-[0.2em] text-[10px]">
              <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></div>
              <span>Station 01: Drafting & Cutting</span>
            </div>
            <h1 className="text-4xl font-bold serif">Cutting Deck</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-slate-400">Total Workload</p>
            <p className="text-3xl font-bold text-slate-900">{tasks.length}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {tasks.length > 0 ? (
            tasks.map(order => (
              <div key={order.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all duration-500">
                <div className="flex items-center space-x-8">
                  <div className="w-20 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 p-1">
                    <img src={order.items[0]?.image} className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100">#{order.id}</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">{order.customerName}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Fabric: <span className="text-slate-900">{order.items[0]?.selectedFabric || 'Premium'}</span></p>
                       <span className="text-slate-200">|</span>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Color: <span className="text-slate-900">{order.items[0]?.selectedColor || 'N/A'}</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => updateProductionStep(order.id, 'Stitching')}
                    className="flex items-center space-x-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-teal-600 transition-all shadow-xl shadow-slate-200 group-hover:scale-[1.02]"
                  >
                    <span>Send to Stitching</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <ScissorsIcon className="w-16 h-16 text-slate-100 mx-auto mb-6" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No garments ready for cutting.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkerCuttingPage;
