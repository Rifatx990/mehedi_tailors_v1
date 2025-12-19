
import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon, 
  ClipboardDocumentListIcon, 
  ArrowsRightLeftIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user, orders, setUser } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'measurements'>('profile');

  // Protection: Redirect if no user is found
  useEffect(() => {
    // We wait a tiny bit to allow LocalStorage sync to finish
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
    { id: 'measurements', label: 'Saved Measurements', icon: ArrowsRightLeftIcon },
  ];

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <aside className="w-full lg:w-1/4">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold serif">
                  {user.name.charAt(0)}
                </div>
                <h2 className="text-xl font-bold serif">{user.name}</h2>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                      activeTab === tab.id 
                        ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-medium text-sm mt-8 border border-transparent hover:border-red-100"
                >
                  <ArrowsRightLeftIcon className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-grow lg:w-3/4">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 min-h-[600px]">
              
              {activeTab === 'profile' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-2xl font-bold serif mb-8">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                      <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <UserCircleIcon className="w-5 h-5 text-slate-400" />
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                      <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                        <span className="font-medium">{user.email}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Phone Number</label>
                      <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <PhoneIcon className="w-5 h-5 text-slate-400" />
                        <span className="font-medium">{user.phone}</span>
                      </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Default Shipping Address</label>
                      <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <MapPinIcon className="w-5 h-5 text-slate-400 mt-1" />
                        <span className="font-medium">{user.address}</span>
                      </div>
                    </div>
                  </div>
                  <button className="mt-12 bg-slate-900 text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition">
                    Edit Profile
                  </button>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-2xl font-bold serif mb-8">Order History</h3>
                  {orders.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <ShoppingBagIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">You haven't placed any orders yet.</p>
                      <button onClick={() => navigate('/shop')} className="mt-6 text-amber-600 font-bold text-sm uppercase tracking-widest">Start Shopping</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="p-6 border border-slate-100 rounded-2xl hover:shadow-md transition">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order ID: {order.id}</span>
                              <h4 className="font-bold">{new Date(order.date).toLocaleDateString()}</h4>
                            </div>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">{order.items.length} Items</span>
                            <span className="font-bold">BDT {order.total.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'measurements' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold serif">My Measurements</h3>
                    <button className="bg-amber-600 text-white px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-amber-700 transition">
                      Add New
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user.measurements.length === 0 ? (
                      <div className="col-span-2 py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500">No saved measurements found.</p>
                      </div>
                    ) : (
                      user.measurements.map((m) => (
                        <div key={m.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                          <h4 className="font-bold serif text-lg mb-4">{m.label}</h4>
                          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                              <span className="text-slate-500">Neck</span>
                              <span className="font-bold">{m.neck}"</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                              <span className="text-slate-500">Chest</span>
                              <span className="font-bold">{m.chest}"</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                              <span className="text-slate-500">Waist</span>
                              <span className="font-bold">{m.waist}"</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200 pb-1">
                              <span className="text-slate-500">Shoulder</span>
                              <span className="font-bold">{m.shoulder}"</span>
                            </div>
                          </div>
                          <div className="mt-6 flex space-x-2">
                            <button className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition">Edit</button>
                            <span className="text-slate-200">|</span>
                            <button className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition">Delete</button>
                          </div>
                        </div>
                      ))
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
