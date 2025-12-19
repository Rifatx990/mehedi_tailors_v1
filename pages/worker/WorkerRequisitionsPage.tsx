
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import WorkerSidebar from '../../components/worker/WorkerSidebar.tsx';
import { BeakerIcon, PlusIcon, XMarkIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { MaterialRequest } from '../../types.ts';

const WorkerRequisitionsPage: React.FC = () => {
  const { materialRequests, addMaterialRequest, workerUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ materialName: '', quantity: '', notes: '' });

  const myRequests = materialRequests.filter(r => r.workerId === workerUser?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerUser) return;

    const newRequest: MaterialRequest = {
      id: 'REQ-' + Math.random().toString(36).substr(2, 9),
      workerId: workerUser.id,
      workerName: workerUser.name,
      materialName: form.materialName,
      quantity: form.quantity,
      status: 'pending',
      date: new Date().toISOString(),
      notes: form.notes
    };

    await addMaterialRequest(newRequest);
    setIsModalOpen(false);
    setForm({ materialName: '', quantity: '', notes: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <WorkerSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold serif">Warehouse Requisitions</h1>
            <p className="text-slate-400 mt-2">Request fabrics, accessories, and tools from central inventory.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-600 text-white px-8 py-4 rounded-[2rem] font-bold uppercase tracking-widest text-[10px] flex items-center space-x-3 shadow-xl shadow-teal-600/20"
          >
            <PlusIcon className="w-5 h-5" />
            <span>New Requisition</span>
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {myRequests.length > 0 ? (
            myRequests.map(req => (
              <div key={req.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group">
                <div className="flex items-center space-x-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${req.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : req.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'}`}>
                    <BeakerIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{req.materialName}</h3>
                    <p className="text-xs text-slate-400">Qty: {req.quantity} • Request ID: {req.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Dated</p>
                    <p className="text-sm font-bold">{new Date(req.date).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${req.status === 'approved' ? 'bg-emerald-500 text-white' : req.status === 'rejected' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                    {req.status}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
               <BeakerIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No active warehouse requests.</p>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-12 w-full max-w-lg shadow-2xl relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><XMarkIcon className="w-8 h-8" /></button>
              <h2 className="text-3xl font-bold serif mb-8">Lodge Requisition</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Material Description</label>
                  <input required value={form.materialName} onChange={e => setForm({...form, materialName: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" placeholder="e.g. Silk Thread #402" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Quantity / Dimension</label>
                  <input required value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none" placeholder="e.g. 2 Spools or 5 Meters" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Usage Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none resize-none" placeholder="Specific project requirements..." />
                </div>
                <button type="submit" className="w-full bg-teal-600 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-teal-600/10 active:scale-95 transition-all">Submit to Warehouse</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkerRequisitionsPage;
