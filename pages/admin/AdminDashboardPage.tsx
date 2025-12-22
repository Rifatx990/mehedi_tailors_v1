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
  PhotoIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  GiftIcon
} from '@heroicons/react/24/outline';

const AdminDashboardPage: React.FC = () => {
  const { orders, products, allUsers, emailLogs, systemConfig, giftCards } = useStore();

  const stats = useMemo(() => ({
    revenue: orders.reduce((acc, curr) => acc + Number(curr.paidAmount || 0), 0),
    outstandingDues: orders.reduce((acc, curr) => acc + Number(curr.dueAmount || 0), 0),
    activeOrders: orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length,
    totalProducts: products.length,
    totalCustomers: allUsers.filter(u => u.role === 'customer').length,
    totalEmails: emailLogs.length,
    totalGiftCards: giftCards.length
  }), [orders, products, allUsers, emailLogs, giftCards]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />

      <main className="flex-grow p-4 md:p-16 overflow-y-auto">
        <header className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <span className="w-8 h-px bg-amber-600"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Master Administration</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold serif text-slate-900 tracking-tight">Operations Hub</h1>
          </div>
          
          <div className="flex items-center space-x-4 bg-white px-6 py-4 rounded-[1.5rem] border border-slate-100 shadow-sm w-full lg:w-auto justify-between lg:justify-start">
             <div className="flex flex-col text-left lg:text-right">
                <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Core Database</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">File-First Architecture OK</span>
             </div>
             <CircleStackIcon className="w-7 h-7 text-emerald-500" />
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-16">
          {[
            { label: 'Realized Revenue', value: `BDT ${stats.revenue.toLocaleString()}`, color: 'bg-emerald-500', icon: CurrencyBangladeshiIcon },
            { label: 'Outstanding Dues', value: `BDT ${stats.outstandingDues.toLocaleString()}`, color: 'bg-amber-500', icon: BanknotesIcon },
            { label: 'Active Pipeline', value: stats.activeOrders, color: 'bg-blue-500', icon: ShoppingBagIcon },
            { label: 'Gift Credits', value: stats.totalGiftCards, color: 'bg-indigo-500', icon: GiftIcon },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
              <div className={`w-12 h-12 ${stat.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>

        <h2 className="text-xl md:text-2xl font-bold serif mb-8 text-slate-900">System Directives</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-16">
          {[
            { label: 'Inventory (CRUD)', to: '/admin/products', icon: TagIcon, color: 'bg-blue-500' },
            { label: 'Order Pipeline', to: '/admin/orders', icon: ShoppingBagIcon, color: 'bg-amber-500' },
            { label: 'Gift Credit System', to: '/admin/gift-cards', icon: GiftIcon, color: 'bg-indigo-500' },
            { label: 'Fabric Vault', to: '/admin/fabrics', icon: SwatchIcon, color: 'bg-emerald-500' },
            { label: 'Label Studio', to: '/admin/labels', icon: PhotoIcon, color: 'bg-indigo-500' },
            { label: 'Staff Directory', to: '/admin/management/workers', icon: UsersIcon, color: 'bg-slate-700' },
            { label: 'System Settings', to: '/admin/settings', icon: WrenchScrewdriverIcon, color: 'bg-rose-500' },
          ].map(tile => (
            <Link 
              key={tile.to} 
              to={tile.to}
              className="group bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition-all duration-300 flex items-center justify-between"
            >
              <div className="flex items-center space-x-6">
                <div className={`w-12 h-12 md:w-14 md:h-14 ${tile.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                   <tile.icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <span className="text-base md:text-lg font-bold text-slate-900 tracking-tight">{tile.label}</span>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-slate-200 group-hover:text-amber-600 transition-colors" />
            </Link>
          ))}
        </div>

        <div className="bg-slate-950 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] text-white relative overflow-hidden group">
           <CircleStackIcon className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 group-hover:scale-110 transition-transform duration-1000" />
           <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold serif mb-4">Core Infrastructure: {systemConfig.dbVersion}</h3>
              <p className="text-slate-400 max-w-2xl leading-relaxed mb-8 font-light text-sm md:text-base">
                Your atelier's data is synchronized with the <strong>database.json</strong> file architecture. This ensures high-fidelity persistence across all administrative nodes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/admin/settings" className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-amber-600 hover:text-white transition shadow-2xl inline-block text-center w-full sm:w-auto">Configure File System</Link>
                <Link to="/admin/gift-cards" className="bg-amber-600 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white hover:text-slate-900 transition shadow-2xl inline-block text-center w-full sm:w-auto">Manage Buy Systems</Link>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;