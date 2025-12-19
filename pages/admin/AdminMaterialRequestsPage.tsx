
import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  BeakerIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ArchiveBoxIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const AdminMaterialRequestsPage: React.FC = () => {
  const { materialRequests, updateMaterialRequestStatus } = useStore();

  const pendingRequests = materialRequests.filter(r => r.status === 'pending');
  const historyRequests = materialRequests.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12">
          <div className="flex items-center space-x-3 text-amber-600 mb-2">
            <span className="w-8 h-px bg-amber-600"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Warehouse Governance</span>
          </div>
          <h1 className="text-4xl font-bold serif text-slate-900">Resource Requisitions</h1>
        </header>

        <section className="mb-16">
          <h2 className="text-xl font-bold serif mb-6 flex items-center space-x-2">
            <ClockIcon className="w-5 h-5 text-amber-500" />
            <span>Awaiting Approval</span>
          </h2>
          {pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 group hover:shadow-md transition-all">
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                      <BeakerIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{req.materialName}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xs font-bold text-slate-400 uppercase">Qty: {req.quantity}</span>
                        <span className="text-slate-200">|</span>
                        <div className="flex items-center space-x-1 text-[10px] font-bold uppercase text-teal-600">
                          <UserIcon className="w-3 h-3" />
                          <span>{req.workerName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {req.notes && (
                    <div className="flex-grow max-w-md bg-slate-50 p-4 rounded-xl text-xs text-slate-500 italic">
                      "{req.notes}"
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => updateMaterialRequestStatus(req.id, 'approved')}
                      className="flex-1 lg:flex-none flex items-center justify-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/10"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button 
                      onClick={() => updateMaterialRequestStatus(req.id, 'rejected')}
                      className="flex-1 lg:flex-none flex items-center justify-center space-x-2 bg-white border border-slate-200 text-red-500 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-red-50 transition"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
               <CheckCircleIcon className="w-12 h-12 text-slate-100 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No pending requisitions.</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold serif mb-6 text-slate-400">Audit History</h2>
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden opacity-60">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-8 py-4">Item</th>
                  <th className="px-8 py-4">Artisan</th>
                  <th className="px-8 py-4">Decision</th>
                  <th className="px-8 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {historyRequests.map(req => (
                  <tr key={req.id}>
                    <td className="px-8 py-4 font-bold text-slate-700">{req.materialName}</td>
                    <td className="px-8 py-4 text-slate-500">{req.workerName}</td>
                    <td className="px-8 py-4">
                      <span className={`text-[9px] font-bold uppercase ${req.status === 'approved' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right text-xs text-slate-400">{new Date(req.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminMaterialRequestsPage;
