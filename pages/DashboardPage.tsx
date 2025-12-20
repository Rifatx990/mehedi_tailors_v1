
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserCircleIcon, 
  ClipboardDocumentListIcon, 
  ArrowsRightLeftIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ShoppingBagIcon,
  WrenchScrewdriverIcon,
  BellIcon,
  CheckCircleIcon,
  TrashIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  // Added ScissorsIcon to fix "Cannot find name 'ScissorsIcon'" error
  ScissorsIcon
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user, orders, setUser, allUsers, notifications, markNotificationRead, clearNotifications } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'measurements' | 'notifications'>('profile');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user && !localStorage.getItem('mt_user')) {
        navigate('/login');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mt_user');
    navigate('/');
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: UserCircleIcon },
    { id: 'orders', label: 'Order History', icon: ClipboardDocumentListIcon },
    { id: 'measurements', label: 'Artisan Fit Archive', icon: ArrowsRightLeftIcon },
    { id: 'notifications', label: 'Atelier Notices', icon: BellIcon, badge: notifications.filter(n => !n.isRead && n.userId === user.id).length },
  ];

  const myOrders = orders.filter(o => o.customerEmail === user.email);
  const myNotifications = notifications.filter(n => n.userId === user.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <aside className="w-full lg:w-1/4">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4 text-3xl font-bold serif shadow-inner">
                  {user.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold serif">{user.name}</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Valued Patron</p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-bold text-[10px] uppercase tracking-widest ${
                      activeTab === tab.id 
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge && tab.badge > 0 ? (
                      <span className={`text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center ${activeTab === tab.id ? 'bg-amber-600 text-white' : 'bg-red-500 text-white'}`}>
                        {tab.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-[10px] uppercase tracking-widest mt-8 border border-transparent hover:border-red-100"
                >
                  <ArrowsRightLeftIcon className="w-5 h-5" />
                  <span>Terminate Session</span>
                </button>
              </nav>
            </div>
          </aside>

          <main className="flex-grow lg:w-3/4">
            <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-slate-100 min-h-[700px]">
              
              {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-2xl font-bold serif mb-10">Artisan Account</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Full Legal Name</label>
                      <div className="flex items-center space-x-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <UserCircleIcon className="w-6 h-6 text-slate-400" />
                        <span className="font-bold text-slate-900">{user.name}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Secure Email</label>
                      <div className="flex items-center space-x-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <EnvelopeIcon className="w-6 h-6 text-slate-400" />
                        <span className="font-bold text-slate-900">{user.email}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Contact Mobile</label>
                      <div className="flex items-center space-x-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <PhoneIcon className="w-6 h-6 text-slate-400" />
                        <span className="font-bold text-slate-900">{user.phone}</span>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Delivery Headquarters</label>
                      <div className="flex items-start space-x-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                        <MapPinIcon className="w-6 h-6 text-slate-400 mt-1" />
                        <span className="font-bold text-slate-900">{user.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-2xl font-bold serif mb-10">Bespoke History</h3>
                  {myOrders.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                      <ShoppingBagIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No artisan commissions found.</p>
                      <Link to="/shop" className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest inline-block shadow-xl">Initiate First Commission</Link>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {myOrders.map((order) => {
                        return (
                          <div key={order.id} className="p-10 border border-slate-100 rounded-[3rem] hover:shadow-xl transition-all duration-500 group">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 pb-6 border-b border-slate-50">
                              <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Archive #{order.id}</span>
                                <h4 className="text-2xl font-bold serif mt-1">{new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</h4>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`px-5 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm ${
                                  order.status === 'Delivered' ? 'bg-emerald-500 text-white' : 'bg-amber-600 text-white'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Investment Total</p>
                                  <p className="text-3xl font-bold text-slate-900 tracking-tighter">BDT {order.total.toLocaleString()}</p>
                                </div>
                                
                                <div className="flex space-x-3">
                                   <Link to={`/invoice/${order.id}`} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-amber-600 transition shadow-xl flex items-center space-x-2">
                                      <DocumentTextIcon className="w-4 h-4" />
                                      <span>Artisan Invoice</span>
                                   </Link>
                                   <Link to={`/track-order`} className="bg-slate-50 text-slate-400 px-8 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 transition border border-slate-100">
                                      Monitor Progress
                                   </Link>
                                </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-bold serif">Atelier Notices</h3>
                    {myNotifications.length > 0 && (
                      <button onClick={clearNotifications} className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition">Mark Archive as Read</button>
                    )}
                  </div>
                  
                  {myNotifications.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                      <BellIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Registry is currently clear.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myNotifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => markNotificationRead(notif.id)}
                          className={`p-8 rounded-[2.5rem] border transition-all flex items-start space-x-8 group cursor-pointer ${
                            notif.isRead 
                              ? 'bg-white border-slate-100 opacity-60' 
                              : 'bg-amber-50/50 border-amber-100 shadow-md translate-x-1'
                          }`}
                        >
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${
                            notif.type === 'sale' ? 'bg-rose-50 text-rose-500' : 
                            notif.type === 'restock' ? 'bg-emerald-50 text-emerald-500' : 
                            'bg-amber-100 text-amber-600'
                          }`}>
                            <BellIcon className="w-6 h-6" />
                          </div>
                          
                          <div className="flex-grow">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-lg font-bold text-slate-900">{notif.title}</h4>
                              <span className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">{new Date(notif.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">{notif.message}</p>
                            
                            <div className="mt-6 flex items-center space-x-6">
                              {notif.link && (
                                <Link 
                                  to={notif.link}
                                  className="text-[9px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 flex items-center space-x-1"
                                >
                                  <span>Inspect Ledger</span>
                                  <ChevronRightIcon className="w-3 h-3" />
                                </Link>
                              )}
                              {!notif.isRead && (
                                <button className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600">Acknowledge</button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'measurements' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                   <div className="flex justify-between items-center mb-10">
                      <h3 className="text-2xl font-bold serif">Artisan Fit Archive</h3>
                      <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl">Calibrate New Fit</button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {user.measurements && user.measurements.length > 0 ? (
                        user.measurements.map(m => (
                          <div key={m.id} className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner group">
                             <h4 className="text-xl font-bold serif mb-6 text-slate-900">{m.label}</h4>
                             <div className="grid grid-cols-2 gap-6">
                                {Object.entries(m).filter(([k,v]) => k !== 'id' && k !== 'label' && typeof v === 'number').map(([k,v]) => (
                                  <div key={k} className="flex justify-between border-b border-slate-200 pb-1">
                                     <span className="text-[10px] font-bold uppercase text-slate-400">{k}</span>
                                     <span className="text-sm font-bold font-mono text-slate-900">{v}"</span>
                                  </div>
                                ))}
                             </div>
                             <div className="mt-8 flex space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-[9px] font-bold uppercase text-amber-600 tracking-widest">Update Silhouette</button>
                                <button className="text-[9px] font-bold uppercase text-red-400 tracking-widest">Discard Record</button>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-2 py-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                           <ScissorsIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No fit profiles calibrated.</p>
                        </div>
                      )}
                   </div>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
