
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext.tsx';
import { 
  Squares2X2Icon, 
  ScissorsIcon, 
  ScaleIcon, 
  XMarkIcon,
  BeakerIcon,
  ClockIcon,
  HandRaisedIcon,
  SparklesIcon,
  CheckBadgeIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

const WorkerSidebar: React.FC = () => {
  const { setWorkerUser, orders, workerUser } = useStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const getCount = (step: string) => orders.filter(o => o.productionStep === step && (o.status === 'In Progress' || o.status === 'Pending')).length;

  const handleLogout = () => {
    setWorkerUser(null);
    navigate('/login');
  };

  const stations = [
    { to: '/worker/stations/cutting', label: 'Cutting Deck', icon: ScissorsIcon, badge: getCount('Cutting') + getCount('Queue') },
    { to: '/worker/stations/stitching', label: 'Stitching Floor', icon: HandRaisedIcon, badge: getCount('Stitching') },
    { to: '/worker/stations/finishing', label: 'Finishing Studio', icon: SparklesIcon, badge: getCount('Finishing') },
    { to: '/worker/stations/qc', label: 'QC & Ready Bay', icon: CheckBadgeIcon, badge: getCount('Ready') },
  ];

  const resources = [
    { to: '/worker/measurements', label: 'Scale Archive', icon: ScaleIcon },
    { to: '/worker/requisitions', label: 'Material Requests', icon: BeakerIcon },
    { to: '/worker/history', label: 'My Craft History', icon: ClockIcon },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-6 bg-slate-900 text-white sticky top-0 z-[60] shadow-xl no-print">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center font-bold">
            {workerUser?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight">{workerUser?.name.split(' ')[0]}</h2>
            <p className="text-[8px] text-teal-400 font-bold uppercase tracking-widest">{workerUser?.specialization}</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 bg-white/5 rounded-lg">
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full bg-slate-900 text-white flex flex-col p-8 shadow-2xl z-[80] overflow-y-auto no-scrollbar border-r border-slate-800 transition-transform duration-500 ease-out md:translate-x-0 md:sticky md:w-72 ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-10">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold serif tracking-tighter">MEHEDI</h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-teal-400 font-bold mt-1">Production Unit</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 hover:bg-white/10 rounded-full">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8 p-5 bg-white/5 rounded-3xl border border-white/10">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center font-bold text-sm shadow-lg">
              {workerUser?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate text-white">{workerUser?.name}</p>
              <p className="text-[9px] text-teal-400 uppercase tracking-widest truncate font-bold">{workerUser?.specialization}</p>
            </div>
          </div>
          <NavLink to="/worker/profile" onClick={() => setIsOpen(false)} className="block text-center py-2 bg-white/5 rounded-xl text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-all">Profile Settings</NavLink>
        </div>

        <div className="flex-grow space-y-8">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Workstations</p>
            <nav className="space-y-1">
              {stations.map(item => (
                <NavLink 
                  key={item.to} 
                  to={item.to} 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/20 translate-x-1' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-bold text-[10px] uppercase tracking-widest">{item.label}</span>
                  </div>
                  {item.badge > 0 && <span className={`text-[8px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${item.badge > 5 ? 'bg-amber-500 text-white' : 'bg-white text-teal-600'}`}>{item.badge}</span>}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Operations</p>
            <nav className="space-y-1">
              {resources.map(item => (
                <NavLink 
                  key={item.to} 
                  to={item.to} 
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => `w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-teal-600 text-white translate-x-1' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-bold text-[10px] uppercase tracking-widest">{item.label}</span>
                  </div>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 transition-all text-[10px] font-bold uppercase tracking-widest group">
            <XMarkIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>Exit Floor</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default WorkerSidebar;
