
import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { Link } from 'react-router-dom';
import WorkerSidebar from '../../components/worker/WorkerSidebar.tsx';
import { ScissorsIcon, ArchiveBoxIcon, CheckIcon, RocketLaunchIcon, DocumentTextIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { ProductionStep } from '../../types.ts';

const WorkerTasksPage: React.FC = () => {
  const { orders, updateProductionStep, workerUser } = useStore();
  
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
      <main className="flex-grow p-4 md:p-16">
        <header className="mb-12">
          <div className="flex items-center space-x-3 text-teal-600 mb-2">
            <span className="w-8 h-px bg-teal-600"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Workshop Floor</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold serif text-slate-900 tracking-tight">Active Workorders</h1>
          <p className="text-slate-400 mt-1 text-xs uppercase tracking-widest font-bold">{assignedOrders.length} Tasks assigned to your station</p>
        </header>

        {assignedOrders.length > 0 ? (
          <div className="space-y-6">
            {assignedOrders.map(order => (
              <div key={order.id} className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col xl:flex-row xl:items-center justify-between gap-8 group hover:shadow-xl transition-all duration-500">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                    {order.items[0]?.image && <img src={order.items[0].image} className="w-full h-full object-cover" alt="Garment" />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-1 block">Workorder #{order.id}</span>
                    <h3 className="text-xl font-bold serif text-slate-900 truncate pr-4">{order.customerName}</h3>
                    <Link to={`/invoice/${order.id}`} className="text-[9px] font-black uppercase text-amber-600 hover:text-amber-700 mt-3 inline-flex items-center space-x-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 transition-all">
                       <DocumentTextIcon className="w-3.5 h-3.5" />
                       <span>Open Technical Specs</span>
                    </Link>
                  </div>
                </div>

                {/* Responsive Stepper Container */}
                <div className="flex-grow max-w-full overflow-x-auto no-scrollbar py-4 px-2 xl:max-w-2xl xl:px-6">
                  <div className="flex justify-between min-w-[500px] mb-6 relative">
                    {/* Progress Bar Background */}
                    <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 rounded-full z-0"></div>
                    <div 
                      className="absolute top-5 left-0 h-1 bg-teal-600 transition-all duration-1000 z-0" 
                      style={{ width: `${(steps.indexOf(order.productionStep || 'Queue') / (steps.length - 1)) * 100}%` }}
                    />
                    
                    {steps.map((step, idx) => {
                      const isCompleted = steps.indexOf(order.productionStep || 'Queue') > idx;
                      const isActive = order.productionStep === step;
                      return (
                        <div key={step} className="flex flex-col items-center relative z-10">
                          <button 
                            onClick={() => updateProductionStep(order.id, step)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 transform ${
                              isActive 
                              ? 'bg-teal-600 text-white shadow-xl ring-8 ring-teal-50 scale-110' 
                              : isCompleted
                              ? 'bg-emerald-500 text-white shadow-lg'
                              : 'bg-white border-2 border-slate-100 text-slate-200 hover:border-teal-400 hover:text-teal-400'
                            }`}
                          >
                            {isCompleted ? <CheckIcon className="w-5 h-5 font-black" /> : <span className="text-[10px] font-black">{idx + 1}</span>}
                          </button>
                          <span className={`text-[9px] font-black uppercase tracking-[0.2em] mt-3 whitespace-nowrap ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0 justify-end md:justify-start">
                   {order.productionStep === 'Finishing' ? (
                      <button onClick={() => handleHandover(order.id)} className="w-full md:w-auto p-5 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition shadow-2xl animate-pulse flex items-center justify-center space-x-3">
                         <RocketLaunchIcon className="w-6 h-6" />
                         <span className="md:hidden font-bold uppercase tracking-widest text-[10px]">Mark as Ready</span>
                      </button>
                   ) : (
                      <div className="w-full md:w-auto p-5 bg-slate-900 text-white rounded-2xl flex items-center justify-center space-x-3 opacity-20">
                         <ScissorsIcon className="w-6 h-6" />
                         <span className="md:hidden font-bold uppercase tracking-widest text-[10px]">Processing...</span>
                      </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
             <ArchiveBoxIcon className="w-16 h-16 text-slate-100 mx-auto mb-6" />
             <h3 className="text-xl font-bold serif text-slate-400">Station Queue Clear</h3>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-2">Pat yourself on the back, artisan.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkerTasksPage;
