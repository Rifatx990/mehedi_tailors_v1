
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import WorkerSidebar from '../../components/worker/WorkerSidebar.tsx';
import { UserCircleIcon, IdentificationIcon, AcademicCapIcon, MapPinIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';

const WorkerProfilePage: React.FC = () => {
  const { workerUser, updateAnyUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...workerUser });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.id) {
       await updateAnyUser(form as any);
       setIsEditing(false);
    }
  };

  if (!workerUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <WorkerSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold serif">Artisan Credentials</h1>
            <p className="text-slate-400 mt-2">Personal records and professional specialization tracking.</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-xl"
          >
            {isEditing ? 'Discard' : 'Edit Profile'}
          </button>
        </header>

        <div className="max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-12">
           <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-48 h-48 bg-teal-600 rounded-[3rem] shadow-2xl flex items-center justify-center text-white text-6xl font-bold serif border-8 border-white mb-8">
                 {workerUser.name.charAt(0)}
              </div>
              <div className="text-center space-y-4">
                 <h2 className="text-2xl font-bold text-slate-900">{workerUser.name}</h2>
                 <div className="inline-block px-6 py-2 bg-teal-50 text-teal-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-teal-100">
                    {workerUser.specialization || 'Artisan'}
                 </div>
                 <p className="text-xs text-slate-400">Joined Mehedi: {workerUser.joinDate || 'Jan 2024'}</p>
              </div>
           </div>

           <div className="lg:col-span-8">
              <div className="bg-white p-12 rounded-[3.5rem] shadow-sm border border-slate-100">
                 <form onSubmit={handleSave} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Artisan Name</label>
                          <div className="relative">
                             <IdentificationIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                             <input 
                              disabled={!isEditing} 
                              value={form.name} 
                              onChange={e => setForm({...form, name: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-4 focus:ring-teal-600/5 transition outline-none disabled:opacity-60 font-bold" 
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Professional Focus</label>
                          <div className="relative">
                             <AcademicCapIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                             <select 
                              disabled={!isEditing} 
                              value={form.specialization} 
                              onChange={e => setForm({...form, specialization: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 focus:ring-4 focus:ring-teal-600/5 transition outline-none disabled:opacity-60 font-bold appearance-none"
                             >
                                <option>Master Stitcher</option>
                                <option>Draper</option>
                                <option>Embroidery Artist</option>
                                <option>Quality Control</option>
                                <option>Cutting Specialist</option>
                             </select>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Contact Mobile</label>
                       <div className="relative">
                          <DevicePhoneMobileIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input 
                            disabled={!isEditing} 
                            value={form.phone} 
                            onChange={e => setForm({...form, phone: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 transition outline-none font-bold" 
                          />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Staff Quarters / Address</label>
                       <div className="relative">
                          <MapPinIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input 
                            disabled={!isEditing} 
                            value={form.address} 
                            onChange={e => setForm({...form, address: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 py-4 transition outline-none font-bold" 
                          />
                       </div>
                    </div>

                    {isEditing && (
                       <button type="submit" className="w-full bg-teal-600 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl shadow-teal-600/10 animate-in fade-in duration-300">
                          Update Global Credentials
                       </button>
                    )}
                 </form>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerProfilePage;
