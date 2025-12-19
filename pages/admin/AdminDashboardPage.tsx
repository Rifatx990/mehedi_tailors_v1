
import React, { useMemo } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  ShoppingBagIcon, 
  TagIcon, 
  UsersIcon, 
  CurrencyBangladeshiIcon,
  BanknotesIcon,
  WrenchScrewdriverIcon,
  ArrowRightIcon,
  SwatchIcon,
  TicketIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const AdminDashboardPage: React.FC = () => {
  const { orders, products, allUsers, resetSystemData } = useStore();

  const stats = useMemo(() => ({
    revenue: orders.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0),
    outstandingDues: orders.reduce((acc, curr) => acc + (curr.dueAmount || 0), 0),
    activeOrders: orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length,
    totalProducts: products.length,
    totalCustomers: allUsers.length
  }), [orders, products, allUsers]);

  const navTiles = [
    { label: 'Inventory', to: '/admin/products', icon: TagIcon, color: 'bg-blue-500' },
    { label: 'Order Pipeline', to: '/admin/orders', icon: ShoppingBagIcon, color: 'bg-amber-500' },
    { label: 'Fabric Vault', to: '/admin/fabrics', icon: SwatchIcon, color: 'bg-emerald-500' },
    { label: 'Coupons', to: '/admin/coupons', icon: TicketIcon, color: 'bg-rose-500' },
    { label: 'Banners', to: '/admin/banners', icon: PhotoIcon, color: 'bg-indigo-500' },
    { label: 'Customers', to: '/admin/customers', icon: UsersIcon, color: 'bg-slate-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />

      <main className="flex-grow p-8 md:p-16 overflow-y-auto">
        <header className="mb-12">
          <div className="flex items-center space-x-3 text-amber-600 mb-2">
            <span className="w-8 h-px bg-amber-600"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Master Administration</span>
          </div>
          <h1 className="text-5xl font-bold serif text-slate-900">Operations Hub</h1>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            { label: 'Realized Revenue', value: `BDT ${stats.revenue.toLocaleString()}`, color: 'bg-emerald-500', icon: CurrencyBangladeshiIcon },
            { label: 'Market Dues', value: `BDT ${stats.outstandingDues.toLocaleString()}`, color: 'bg-amber-500', icon: BanknotesIcon },
            { label: 'Active Pipeline', value: stats.activeOrders, color: 'bg-blue-500', icon: ShoppingBagIcon },
            { label: 'Patron Count', value: stats.totalCustomers, color: 'bg-slate-900', icon: UsersIcon },
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

        <h2 className="text-2xl font-bold serif mb-8">Direct Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {navTiles.map(tile => (
            <Link 
              key={tile.to} 
              to={tile.to}
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center space-x-6">
                <div className={`w-14 h-14 ${tile.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                   <tile.icon className="w-7 h-7" />
                </div>
                <span className="text-lg font-bold text-slate-900">{tile.label}</span>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-slate-300 group-hover:text-amber-600 transition-colors" />
            </Link>
          ))}
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
           <div className="flex items-center space-x-3 text-slate-400 mb-6">
              <WrenchScrewdriverIcon className="w-6 h-6" />
              <h3 className="text-lg font-bold serif">System Maintenance</h3>
           </div>
           <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-md">
                 <h4 className="font-bold text-slate-900 mb-2">Re-seed Database</h4>
                 <p className="text-xs text-slate-500 leading-relaxed">If your lists are showing as empty despite having data, use this tool to restore factory default sample data and clear local cache conflicts.</p>
              </div>
              <button 
                onClick={() => { if(window.confirm('Restore default factory data? This will overwrite existing records.')) resetSystemData(); }}
                className="bg-amber-600 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:bg-amber-700 transition"
              >
                Restore Defaults
              </button>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
