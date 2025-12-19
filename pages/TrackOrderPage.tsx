
import React, { useState } from 'react';
import { MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';

const TrackOrderPage: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTrackingData({
        id: orderId,
        status: 'Stitching',
        lastUpdate: '2024-05-20',
        steps: [
          { name: 'Order Placed', completed: true, date: 'May 15' },
          { name: 'Fabric Cutting', completed: true, date: 'May 17' },
          { name: 'Stitching', completed: false, date: 'In Progress' },
          { name: 'Quality Check', completed: false, date: '--' },
          { name: 'Ready for Pickup', completed: false, date: '--' },
        ]
      });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-5xl font-bold serif mb-4 text-center">Track Your Order</h1>
        <p className="text-slate-500 text-center mb-12">Enter your Order ID to see your garment's journey.</p>

        <form onSubmit={handleTrack} className="mb-16">
          <div className="relative group">
            <input 
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-3xl px-12 py-6 text-lg focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition shadow-sm"
              placeholder="e.g. MT-123456"
            />
            <MagnifyingGlassIcon className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </div>
        </form>

        {trackingData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-slate-50 rounded-[40px] p-8 md:p-12 border border-slate-100">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Status</h3>
                  <p className="text-2xl font-bold serif text-amber-600">{trackingData.status}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Order ID</h3>
                  <p className="text-lg font-bold">{trackingData.id}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-8">
                {trackingData.steps.map((step: any, idx: number) => (
                  <div key={idx} className="flex items-start space-x-6 relative">
                    {idx !== trackingData.steps.length - 1 && (
                      <div className={`absolute left-[15px] top-8 w-0.5 h-12 ${step.completed ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${step.completed ? 'bg-green-500 text-white' : 'bg-white border-2 border-slate-200 text-slate-300'}`}>
                      {step.completed ? <CheckIcon className="w-5 h-5" /> : <div className="w-2 h-2 bg-current rounded-full"></div>}
                    </div>
                    <div className="flex-grow pb-8">
                      <h4 className={`font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>{step.name}</h4>
                      <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
