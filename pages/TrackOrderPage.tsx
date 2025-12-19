
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { MagnifyingGlassIcon, CheckIcon, ExclamationCircleIcon, ClockIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { Order, ProductionStep, OrderStatus } from '../types.ts';

const TrackOrderPage: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const { orders, allUsers } = useStore();
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(false);
    
    // Simulate lookup delay
    setTimeout(() => {
      const order = orders.find(o => o.id.toLowerCase() === searchId.toLowerCase().trim());
      setFoundOrder(order || null);
      setHasSearched(true);
      setLoading(false);
    }, 800);
  };

  const getTimeline = (order: Order) => {
    const steps = [
      { name: 'Order Placed', completed: true, date: new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) },
      { 
        name: 'Fabric Cutting', 
        completed: ['Cutting', 'Stitching', 'Finishing', 'Ready'].includes(order.productionStep || '') || order.status === 'Shipped' || order.status === 'Delivered',
        active: order.productionStep === 'Cutting'
      },
      { 
        name: 'Artisan Stitching', 
        completed: ['Stitching', 'Finishing', 'Ready'].includes(order.productionStep || '') || order.status === 'Shipped' || order.status === 'Delivered',
        active: order.productionStep === 'Stitching'
      },
      { 
        name: 'Quality Inspection', 
        completed: order.productionStep === 'Ready' || order.status === 'Shipped' || order.status === 'Delivered',
        active: order.productionStep === 'Finishing'
      },
      { 
        name: 'Dispatched / Ready', 
        completed: order.status === 'Shipped' || order.status === 'Delivered',
        active: order.productionStep === 'Ready' || order.status === 'Shipped'
      },
      { 
        name: 'Delivered', 
        completed: order.status === 'Delivered',
        active: order.status === 'Delivered'
      }
    ];
    return steps;
  };

  const assignedWorker = foundOrder?.assignedWorkerId 
    ? allUsers.find(u => u.id === foundOrder.assignedWorkerId) 
    : null;

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold serif mb-4">Track Your Garment</h1>
          <p className="text-slate-500">Monitor the artisan journey of your bespoke pieces.</p>
        </header>

        <form onSubmit={handleTrack} className="mb-16">
          <div className="relative group">
            <input 
              required
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-12 py-6 text-lg focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 outline-none transition shadow-sm font-mono"
              placeholder="Enter Order ID (e.g. MT-77821)"
            />
            <MagnifyingGlassIcon className="w-6 h-6 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-amber-600 transition-colors" />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-amber-600 transition shadow-xl"
            >
              {loading ? 'Searching...' : 'Locate Order'}
            </button>
          </div>
        </form>

        {hasSearched && foundOrder && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-8">
            <div className="bg-slate-50 rounded-[3rem] p-10 md:p-12 border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 rounded-full -translate-y-12 translate-x-12"></div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6 relative z-10">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Current Lifecycle Phase</h3>
                  <div className="flex items-center space-x-2">
                    <p className="text-3xl font-bold serif text-slate-900">{foundOrder.status === 'Delivered' ? 'Completed' : (foundOrder.productionStep || 'Processing')}</p>
                    <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="text-left sm:text-right bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Tracking Number</h3>
                  <p className="text-sm font-bold font-mono text-slate-900">#{foundOrder.id}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-0 relative z-10">
                {getTimeline(foundOrder).map((step, idx, arr) => (
                  <div key={idx} className="flex items-start space-x-6 relative group">
                    {idx !== arr.length - 1 && (
                      <div className={`absolute left-[15px] top-8 w-0.5 h-12 transition-colors duration-700 ${step.completed ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-500 border-2 ${
                      step.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                      step.active ? 'bg-white border-amber-600 text-amber-600 ring-4 ring-amber-600/10' :
                      'bg-white border-slate-200 text-slate-300'
                    }`}>
                      {step.completed ? <CheckIcon className="w-5 h-5" /> : idx + 1}
                    </div>
                    <div className="flex-grow pb-10">
                      <div className="flex items-center space-x-3">
                         <h4 className={`font-bold transition-colors ${step.completed ? 'text-slate-900' : step.active ? 'text-amber-600' : 'text-slate-400'}`}>{step.name}</h4>
                         {step.active && <span className="bg-amber-100 text-amber-700 text-[8px] font-bold uppercase px-2 py-0.5 rounded tracking-widest animate-pulse">In Progress</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">{step.completed ? (step.date || 'Handled') : step.active ? 'Current Station' : 'Pending'}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200 flex items-center space-x-4 text-slate-500">
                <ClockIcon className="w-5 h-5 text-amber-600" />
                <p className="text-xs italic">Last artisan log updated on {new Date(foundOrder.date).toLocaleDateString()}.</p>
              </div>
            </div>

            {/* Artisan Info Card */}
            {assignedWorker && (
              <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform duration-700"></div>
                 <div className="flex items-center space-x-6 relative z-10">
                    <div className="w-20 h-20 bg-amber-600 rounded-[1.5rem] flex items-center justify-center text-3xl font-bold serif shadow-xl">
                       {assignedWorker.name.charAt(0)}
                    </div>
                    <div>
                       <div className="flex items-center space-x-2 text-amber-500 mb-1">
                          <WrenchScrewdriverIcon className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Certified Master Artisan</span>
                       </div>
                       <h3 className="text-2xl font-bold serif">{assignedWorker.name}</h3>
                       <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">{assignedWorker.specialization || 'Master Tailor'}</p>
                    </div>
                 </div>
                 <p className="mt-6 text-sm text-slate-300 italic font-light border-l-2 border-amber-600/30 pl-4">
                    "Crafting your order with {assignedWorker.experience || 'premium'} expertise in our Savar workshop."
                 </p>
              </div>
            )}
          </div>
        )}

        {hasSearched && !foundOrder && (
          <div className="text-center py-16 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationCircleIcon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold serif text-slate-900 mb-2">Order Not Recognized</h2>
            <p className="text-slate-500 max-w-xs mx-auto mb-8">We couldn't find an order matching <span className="font-mono font-bold text-slate-900">"{searchId}"</span> in our atelier records.</p>
            <button onClick={() => setHasSearched(false)} className="text-amber-600 font-bold uppercase tracking-widest text-[10px] border-b-2 border-amber-600/20 hover:border-amber-600 transition-all pb-1">Refine ID</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
