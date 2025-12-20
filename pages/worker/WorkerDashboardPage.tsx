
import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { Link } from 'react-router-dom';
import WorkerSidebar from '../../components/worker/WorkerSidebar.tsx';
import { 
  ScissorsIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const WorkerDashboardPage: React.FC = () => {
  const { orders, workerUser } = useStore();

  const stats = useMemo(() => ({
    assigned: orders.filter(o => o.assignedWorkerId === workerUser?.id && o.status === 'In Progress').length,
    completedToday: orders.filter(o => o.assignedWorkerId === workerUser?.id && (o.productionStep === 'Ready' || o.status === 'Shipped')).length,
    queued: orders.filter(o => o.assignedWorkerId === workerUser?.id && o.status === 'Pending').length
  }), [orders, workerUser]);

  if (!workerUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <WorkerSidebar />

      <main className="flex-grow p-4 md:p-16 overflow-y-auto">
        <header className="mb-12">
          <div className="flex items-center space-x-3 text-teal-600 mb-2">
            <span className="w-8 h-px bg-teal-600"></span>
            <span className="text-[10px] font-black uppercase tracking-widest">Artisan Operation Centre</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold serif text-slate-900">Salaam, {workerUser.name.split(' ')[0]}</h1>
          <p className="text-slate-400 mt-2 text-sm">Designated Role: <span className="font-black text-slate-600 uppercase tracking-[0.2em] text-[10px] bg-white px-3 py-1 rounded-full border border-slate-100 ml-2">{workerUser.specialization || 'Master Artisan'}</span></p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-16">
          {[
            { label: 'Active Jobs', value: stats.assigned, color: 'bg-teal-500', icon: ScissorsIcon },
            { label: 'Pending Queue', value: stats.queued, color: 'bg-amber-500', icon: ClockIcon },
            { label: 'Ready for QC', value: stats.completedToday, color: 'bg-emerald-500', icon: CheckCircleIcon },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group">
              <div className={`w-12 h-12 ${stat.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 font-mono">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold serif mb-8 text-slate-900">Urgent Production Activity</h3>
              <div className="space-y-4">
                 {orders.filter(o => o.assignedWorkerId === workerUser.id && o.status === 'In Progress').slice(0, 3).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 group transition-all hover:bg-white hover:shadow-lg">
                       <div className="flex items-center space-x-4 min-w-0">
                          <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0">#{order.id.slice(-4)}</div>
                          <div className="min-w-0">
                             <p className="text-sm font-bold text-slate-900 truncate">{order.customerName}</p>
                             <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{order.productionStep || 'Queue'}</p>
                          </div>
                       </div>
                       <Link to="/worker/tasks" className="p-2 bg-white text-teal-600 rounded-lg shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-all">
                          <ChevronRightIcon className="w-4 h-4" />
                       </Link>
                    </div>
                 ))}
                 {stats.assigned === 0 && (
                   <p className="text-center py-10 text-slate-400 text-xs italic font-medium">No active tasks found in your station.</p>
                 )}
              </div>
           </div>

           <div className="bg-slate-900 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
              <SparklesIcon className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform duration-1000" />
              <div className="relative z-10">
                <h3 className="text-xl font-bold serif mb-4">Artisan Excellence Standards</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 font-light">Ensure all bespoke pieces undergo high-precision cutting. Fabric grain must be aligned with measurement silhouettes for the perfect Mehedi fit. Check the Scale Archive before starting a new silhouette.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/worker/measurements" className="bg-teal-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl text-center shadow-teal-600/20 active:scale-95 transition-all">Reference Scale Archive</Link>
                </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboardPage;
