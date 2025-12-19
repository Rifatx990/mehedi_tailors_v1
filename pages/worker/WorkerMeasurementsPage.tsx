
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import WorkerSidebar from '../../components/worker/WorkerSidebar.tsx';
import { ScaleIcon, UserCircleIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const WorkerMeasurementsPage: React.FC = () => {
  const { orders } = useStore();
  const bespokeJobs = orders.filter(o => o.items.some(i => i.isCustomOrder));
  const [selectedJob, setSelectedJob] = useState<string | null>(bespokeJobs[0]?.id || null);

  const activeJob = bespokeJobs.find(o => o.id === selectedJob);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <WorkerSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold serif">Measurement Scale</h1>
          <p className="text-slate-400 mt-2">Precise silhouettes for assigned bespoke contracts.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           {/* Job List */}
           <div className="lg:col-span-4 space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4 mb-4">Active Bespoke Contracts</h3>
              {bespokeJobs.map(job => (
                 <button 
                  key={job.id}
                  onClick={() => setSelectedJob(job.id)}
                  className={`w-full text-left p-6 rounded-[2rem] border transition-all ${selectedJob === job.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white border-slate-100 hover:border-teal-400 text-slate-600'}`}
                 >
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">#{job.id}</span>
                       <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase ${selectedJob === job.id ? 'bg-teal-500 text-white' : 'bg-teal-50 text-teal-600'}`}>{job.productionStep}</span>
                    </div>
                    <p className="font-bold">{job.customerName}</p>
                    <p className="text-[10px] mt-1 opacity-60">{job.items.find(i => i.isCustomOrder)?.name}</p>
                 </button>
              ))}
           </div>

           {/* Detailed View */}
           <div className="lg:col-span-8">
              {activeJob ? (
                 <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-slate-100 animate-in fade-in zoom-in duration-500">
                    <div className="flex items-center space-x-4 mb-12">
                       <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                          <UserCircleIcon className="w-10 h-10" />
                       </div>
                       <div>
                          <h2 className="text-3xl font-bold serif">{activeJob.customerName}</h2>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Technical Data Sheet</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                       {Object.entries(activeJob.items.find(i => i.isCustomOrder)?.measurements || {}).filter(([k]) => k !== 'label' && k !== 'id').map(([key, val]) => (
                          <div key={key} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center group hover:bg-white hover:shadow-lg hover:border-teal-100 transition-all">
                             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">{key}</p>
                             <p className="text-4xl font-bold text-slate-900 font-mono">{val}<span className="text-lg ml-1 font-light text-slate-300">"</span></p>
                          </div>
                       ))}
                    </div>

                    <div className="mt-12 p-10 bg-teal-50 rounded-[2.5rem] border border-teal-100">
                       <h4 className="flex items-center space-x-2 text-teal-700 font-bold uppercase tracking-widest text-xs mb-6">
                          <ClipboardDocumentListIcon className="w-5 h-5" />
                          <span>Design Directives</span>
                       </h4>
                       <div className="grid grid-cols-2 gap-8">
                          {Object.entries(activeJob.items.find(i => i.isCustomOrder)?.designOptions || {}).map(([key, val]) => (
                             <div key={key} className="flex justify-between border-b border-teal-100 pb-3">
                                <span className="text-[10px] font-bold uppercase text-teal-800 opacity-60">{key}</span>
                                <span className="text-sm font-bold text-teal-900">{val}</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="h-full flex flex-col items-center justify-center py-20 bg-slate-100/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <ScaleIcon className="w-16 h-16 text-slate-300 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Select a bespoke job to view scale</p>
                 </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerMeasurementsPage;
