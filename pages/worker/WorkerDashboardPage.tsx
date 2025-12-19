
import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { Link } from 'react-router-dom';
import WorkerSidebar from '../../components/worker/WorkerSidebar.tsx';
import { 
  ScissorsIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const WorkerDashboardPage: React.FC = () => {
  const { orders, workerUser } = useStore();

  const stats = useMemo(() => ({
    assigned: orders.filter(o => o.status === 'In Progress').length,
    completedToday: orders.filter(o => o.status === 'Shipped').length,
    queued: orders.filter(o => o.status === 'Pending').length
  }), [orders]);

  if (!workerUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <WorkerSidebar />

      <main className="flex-grow p-8 md:p-16 overflow-y-auto">
        <header className="mb-12">
          <div className="flex items-center space-x-3 text-teal-600 mb-2">
            <span className="w-8 h-px bg-teal-600"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Master Artisan Dashboard</span>
          </div>
          <h1 className="text-5xl font-bold serif text-slate-900">Welcome, {workerUser.name.split(' ')[0]}</h1>
          <p className="text-slate-400 mt-2">Current Specialization: <span className="font-bold text-slate-600 uppercase tracking-widest text-xs">{workerUser.specialization || 'Master Artisan'}</span></p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            { label: 'Active Jobs', value: stats.assigned, color: 'bg-teal-500', icon: ScissorsIcon },
            { label: 'Pending Queue', value: stats.queued, color: 'bg-amber-500', icon: ClockIcon },
            { label: 'Finished Units', value: stats.completedToday, color: 'bg-emerald-500', icon: CheckCircleIcon },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className={`w-12 h-12 ${stat.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-current/20`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold serif mb-6">Recent Production Activity</h3>
              <div className="space-y-6">
                 {orders.filter(o => o.status === 'In Progress').slice(0, 3).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-bold text-xs">#{order.id.slice(-5)}</div>
                          <div>
                             <p className="text-sm font-bold">{order.customerName}</p>
                             <p className="text-[10px] text-slate-400 uppercase font-bold">{order.productionStep || 'Queue'}</p>
                          </div>
                       </div>
                       <Link to="/worker/tasks" className="text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700">Update Phase</Link>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-800 p-10 rounded-[3rem] shadow-xl text-white relative overflow-hidden group">
              <SparklesIcon className="absolute -bottom-6 -right-6 w-32 h-32 text-white/5 group-hover:scale-110 transition-transform duration-1000" />
              <h3 className="text-xl font-bold serif mb-4 relative z-10">Production Standards</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 relative z-10">Ensure all bespoke pieces undergo high-precision cutting. Fabric grain must be aligned with measurement silhouettes for the perfect Mehedi fit.</p>
              <Link to="/worker/measurements" className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] relative z-10 inline-block">Reference Scale</Link>
           </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboardPage;
