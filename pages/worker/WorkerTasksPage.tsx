
import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import WorkerSidebar from '../../components/worker/WorkerSidebar.tsx';
import { ScissorsIcon, ArchiveBoxIcon, CheckIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { ProductionStep } from '../../types.ts';

const WorkerTasksPage: React.FC = () => {
  const { orders, updateProductionStep, updateOrderStatus, workerUser } = useStore();
  
  // Filter for orders specifically assigned to this worker
  const assignedOrders = orders.filter(o => 
    o.assignedWorkerId === workerUser?.id && 
    (o.status === 'In Progress' || o.status === 'Pending')
  );

  const steps: ProductionStep[] = ['Queue', 'Cutting', 'Stitching', 'Finishing', 'Ready'];

  const handleHandover = async (orderId: string) => {
    if (window.confirm("Finalize this craft? It will be sent to the Ready Bay for Quality Inspection.")) {
        await updateProductionStep(orderId, 'Ready');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <WorkerSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold serif">Production Queue</h1>
          <p className="text-slate-400 mt-2">Live task tracking for your current craftsmanship cycle.</p>
        </header>

        {assignedOrders.length > 0 ? (
          <div className="space-y-6">
            {assignedOrders.map(order => (
              <div key={order.id} className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                    {order.items[0]?.image && <img src={order.items[0].image} className="w-full h-full object-cover" alt="Garment" />}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1 block">Order #{order.id}</span>
                    <h3 className="text-xl font-bold serif">{order.customerName}</h3>
                    <p className="text-xs text-slate-400 mt-1">{order.items.length} artisan items assigned</p>
                  </div>
                </div>

                <div className="flex-grow max-w-2xl px-6">
                  <div className="flex justify-between mb-4">
                    {steps.map((step, idx) => (
                      <div key={step} className="flex flex-col items-center">
                        <button 
                          onClick={() => updateProductionStep(order.id, step)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            order.productionStep === step 
                            ? 'bg-teal-600 text-white shadow-lg ring-4 ring-teal-50' 
                            : steps.indexOf(order.productionStep || 'Queue') > idx
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {steps.indexOf(order.productionStep || 'Queue') > idx ? <CheckIcon className="w-5 h-5" /> : idx + 1}
                        </button>
                        <span className={`text-[8px] font-bold uppercase tracking-widest mt-2 ${order.productionStep === step ? 'text-teal-600' : 'text-slate-400'}`}>{step}</span>
                      </div>
                    ))}
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full relative overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-teal-600 transition-all duration-700" 
                      style={{ width: `${(steps.indexOf(order.productionStep || 'Queue') / (steps.length - 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                   <div className="text-right">
                      <p className="text-[9px] font-bold uppercase text-slate-400">Current Phase</p>
                      <p className="text-sm font-bold text-slate-900">{order.productionStep || 'Queue'}</p>
                   </div>
                   
                   {order.productionStep === 'Finishing' ? (
                      <button 
                        onClick={() => handleHandover(order.id)}
                        className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition shadow-xl animate-bounce"
                        title="Submit for Handover"
                      >
                         <RocketLaunchIcon className="w-5 h-5" />
                      </button>
                   ) : (
                      <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-teal-600 transition shadow-xl">
                         <ScissorsIcon className="w-5 h-5" />
                      </button>
                   )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <ArchiveBoxIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <h3 className="text-xl font-bold serif text-slate-400">Queue Clear</h3>
             <p className="text-slate-400 max-w-xs mx-auto mt-2">Enjoy your break, artisan. No jobs are currently assigned to your station.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkerTasksPage;
