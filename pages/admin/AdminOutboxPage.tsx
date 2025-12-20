
import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { PaperAirplaneIcon, EnvelopeIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';

const AdminOutboxPage: React.FC = () => {
  const { emailLogs } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12">
          <div className="flex items-center space-x-3 text-amber-600 mb-2">
            <span className="w-8 h-px bg-amber-600"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Communications Audit</span>
          </div>
          <h1 className="text-5xl font-bold serif text-slate-900 tracking-tight">Atelier Outbox</h1>
          <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-bold">System Automated Dispatch History</p>
        </header>

        <div className="grid grid-cols-1 gap-6">
           {emailLogs.length > 0 ? (
             emailLogs.map(log => (
               <div key={log.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                     <div className="flex items-center space-x-5">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                           <EnvelopeIcon className="w-6 h-6" />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-slate-900">{log.subject}</h3>
                           <div className="flex items-center space-x-3 text-slate-400 mt-1">
                              <div className="flex items-center space-x-1 text-[10px] font-bold uppercase">
                                 <UserIcon className="w-3 h-3" />
                                 <span>To: {log.to}</span>
                              </div>
                              <span className="text-slate-200">|</span>
                              <div className="flex items-center space-x-1 text-[10px] font-bold uppercase">
                                 <ClockIcon className="w-3 h-3" />
                                 <span>{new Date(log.timestamp).toLocaleString()}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                     <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-widest self-start lg:self-center">Dispatch Success</span>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                     <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line italic">"{log.body}"</p>
                  </div>
               </div>
             ))
           ) : (
             <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                <PaperAirplaneIcon className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Outbox is currently empty</p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
};

export default AdminOutboxPage;
