
import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import WorkerSidebar from '../../components/worker/WorkerSidebar.tsx';
import { HandRaisedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const WorkerStitchingPage: React.FC = () => {
  const { orders, updateProductionStep } = useStore();
  const tasks = orders.filter(o => o.productionStep === 'Stitching' && o.status === 'In Progress');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <WorkerSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <div className="flex items-center space-x-2 text-teal-600 mb-2 font-bold uppercase tracking-[0.2em] text-[10px]">
              <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></div>
              <span>Station 02: Core Construction</span>
            </div>
            <h1 className="text-4xl font-bold serif">Stitching Floor</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-slate-400">Sewing Units</p>
            <p className="text-3xl font-bold text-slate-900">{tasks.length}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {tasks.length > 0 ? (
            tasks.map(order => (
              <div key={order.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
                <div className="mb-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner group-hover:bg-teal-600 group-hover:text-white transition-all">
                      {order.customerName?.charAt(0)}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">#{order.id}</span>
                  </div>
                  <h3 className="text-2xl font-bold serif text-slate-900">{order.customerName}</h3>
                  <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-[10px] font-bold uppercase text-teal-600 tracking-widest">Tailoring Directives</p>
                    {Object.entries(order.items[0]?.designOptions || {}).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-xs font-medium border-b border-slate-200/50 pb-1">
                        <span className="text-slate-400 capitalize">{key}:</span>
                        <span className="text-slate-900">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => updateProductionStep(order.id, 'Finishing')}
                  className="w-full flex items-center justify-center space-x-3 bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-teal-600 transition-all shadow-xl shadow-slate-200"
                >
                  <span>Pass to Finishing</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
              <HandRaisedIcon className="w-16 h-16 text-slate-100 mx-auto mb-6" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sewing machines are idle.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WorkerStitchingPage;
