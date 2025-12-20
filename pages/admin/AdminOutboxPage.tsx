
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PaperAirplaneIcon, 
  EnvelopeIcon, 
  ClockIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  ChevronRightIcon,
  XMarkIcon,
  DocumentTextIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { EmailLog } from '../../types.ts';

const AdminOutboxPage: React.FC = () => {
  const { emailLogs, systemConfig } = useStore();
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  const filteredLogs = emailLogs.filter(log => 
    log.to.toLowerCase().includes(search.toLowerCase()) || 
    log.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <span className="w-8 h-px bg-amber-600"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Communications Audit</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold serif text-slate-900 tracking-tight">Atelier Outbox</h1>
            <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-bold">Automated & Manual Dispatches</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search recipients..." 
              className="w-full bg-white border border-slate-100 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition text-sm font-medium shadow-sm"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
           {filteredLogs.length > 0 ? (
             filteredLogs.map(log => (
               <div 
                key={log.id} 
                onClick={() => setSelectedLog(log)}
                className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-6"
               >
                  <div className="flex items-center space-x-6 min-w-0">
                     <div className="w-14 h-14 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <EnvelopeIcon className="w-7 h-7" />
                     </div>
                     <div className="min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 truncate pr-4">{log.subject}</h3>
                        <div className="flex items-center space-x-4 text-slate-400 mt-1">
                           <div className="flex items-center space-x-1 text-[9px] font-black uppercase tracking-wider">
                              <UserIcon className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[150px]">{log.to}</span>
                           </div>
                           <span className="text-slate-200">|</span>
                           <div className="flex items-center space-x-1 text-[9px] font-black uppercase tracking-wider">
                              <ClockIcon className="w-3.5 h-3.5" />
                              <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                     <div className="hidden xl:block max-w-xs overflow-hidden">
                        <div className="flex items-center space-x-2 text-emerald-500 mb-1">
                           <PhotoIcon className="w-3 h-3" />
                           <span className="text-[8px] font-black uppercase tracking-widest">Logo Attached</span>
                        </div>
                        <p className="text-[10px] text-slate-400 italic truncate">"{log.body.substring(0, 60)}..."</p>
                     </div>
                     <div className="flex items-center space-x-4">
                        <span className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm">Dispatched OK</span>
                        <ChevronRightIcon className="w-5 h-5 text-slate-200 group-hover:text-amber-600 transition-colors" />
                     </div>
                  </div>
               </div>
             ))
           ) : (
             <div className="py-32 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-200">
                <PaperAirplaneIcon className="w-20 h-20 text-slate-100 mx-auto mb-6" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Registry is currently empty</p>
             </div>
           )}
        </div>

        {/* Detailed Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
             <div className="bg-white rounded-[3.5rem] w-full max-w-3xl shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
                <button onClick={() => setSelectedLog(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 hover:rotate-90 transition-all duration-300 z-10"><XMarkIcon className="w-8 h-8" /></button>
                
                <div className="bg-slate-950 p-10 md:p-12 text-white">
                   <div className="flex items-center space-x-4 mb-6">
                      <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                         <DocumentTextIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                         <h2 className="text-2xl font-bold serif leading-tight">{selectedLog.subject}</h2>
                         <p className="text-slate-400 text-[9px] uppercase font-black tracking-widest mt-1">Ref ID: {selectedLog.id}</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-white/10">
                      <div>
                         <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Recipient</p>
                         <p className="text-sm font-bold truncate">{selectedLog.to}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Time Stamp</p>
                         <p className="text-sm font-bold">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                      </div>
                   </div>
                </div>

                <div className="p-10 md:p-12">
                   <div className="mb-6 flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <PhotoIcon className="w-4 h-4 text-emerald-500" />
                      <span>Shop Logo Injected as Document Header</span>
                   </div>
                   
                   <div className="bg-white p-8 rounded-[2rem] border border-slate-100 min-h-[250px] shadow-inner overflow-y-auto no-scrollbar">
                      {/* Logo Preview in Log */}
                      <div className="mb-8 pb-8 border-b border-slate-50">
                         <img src={systemConfig.siteLogo} alt="Logo" className="h-10 w-auto opacity-40 grayscale" />
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-medium italic">
                        {selectedLog.body.replace(`[DOCUMENT HEADER: ${systemConfig.siteLogo}]\n\n`, '')}
                      </p>
                   </div>
                   
                   <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex items-center space-x-2 text-emerald-600">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                         <span className="text-[10px] font-bold uppercase tracking-widest">Validated Session Data</span>
                      </div>
                      <button onClick={() => setSelectedLog(null)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg active:scale-95 transition-all">Close Archive</button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOutboxPage;
