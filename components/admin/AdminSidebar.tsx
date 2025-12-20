
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext.tsx';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  TagIcon, 
  UsersIcon, 
  XMarkIcon,
  TicketIcon,
  Squares2X2Icon,
  ChatBubbleLeftEllipsisIcon,
  PhotoIcon,
  ChatBubbleBottomCenterTextIcon,
  SwatchIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  QrCodeIcon,
  Cog6ToothIcon,
  BeakerIcon,
  DocumentChartBarIcon,
  BriefcaseIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const AdminSidebar: React.FC = () => {
  const { setAdminUser, reviews, materialRequests } = useStore();
  const navigate = useNavigate();
  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const pendingRequisitions = materialRequests.filter(r => r.status === 'pending').length;

  const handleLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('mt_admin');
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Overview', icon: ChartBarIcon },
    { to: '/admin/reports', label: 'Sales Reports', icon: DocumentChartBarIcon },
    { to: '/admin/orders', label: 'Order Pipeline', icon: ShoppingBagIcon },
    { type: 'separator', label: 'Inventory' },
    { to: '/admin/products', label: 'Inventory (CRUD)', icon: TagIcon },
    { to: '/admin/catalog', label: 'Product Catalog', icon: IdentificationIcon },
    { to: '/admin/labels', label: 'Label Studio', icon: QrCodeIcon },
    { to: '/admin/fabrics', label: 'Fabric Vault', icon: SwatchIcon },
    { to: '/admin/categories', label: 'Categories', icon: Squares2X2Icon },
    { type: 'separator', label: 'Marketing' },
    { to: '/admin/partners', label: 'Partner Brands', icon: BriefcaseIcon },
    { to: '/admin/banners', label: 'Hero Pictures', icon: PhotoIcon },
    { to: '/admin/coupons', label: 'Coupons', icon: TicketIcon },
    { type: 'separator', label: 'Management' },
    { to: '/admin/requisitions', label: 'Material Requests', icon: BeakerIcon, badge: pendingRequisitions },
    { to: '/admin/management/admins', label: 'Admin Staff', icon: ShieldCheckIcon },
    { to: '/admin/management/workers', label: 'Artisan Team', icon: WrenchScrewdriverIcon },
    { to: '/admin/management/customers', label: 'Patron Directory', icon: UserGroupIcon },
    { type: 'separator', label: 'Feedback' },
    { to: '/admin/appeals', label: 'Appeals', icon: ChatBubbleLeftEllipsisIcon },
    { to: '/admin/reviews', label: 'Reviews', icon: ChatBubbleBottomCenterTextIcon, badge: pendingReviews },
    { type: 'separator', label: 'Configuration' },
    { to: '/admin/settings', label: 'System Settings', icon: Cog6ToothIcon },
  ];

  return (
    <aside className="w-full md:w-72 bg-slate-900 text-white flex flex-col p-8 sticky top-0 h-screen shadow-2xl z-20 overflow-y-auto no-scrollbar no-print">
      <div className="mb-12 text-center md:text-left">
        <h2 className="text-3xl font-bold serif tracking-tighter">MEHEDI</h2>
        <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500 font-bold mt-1">Atelier Control</p>
      </div>
      <nav className="flex-grow space-y-1">
        {navItems.map((item, idx) => {
          if (item.type === 'separator') {
            return (
              <div key={idx} className="pt-6 pb-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 px-5">{item.label}</p>
              </div>
            );
          }
          return (
            <NavLink 
              key={item.to} 
              to={item.to!} 
              className={({ isActive }) => `w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/20 translate-x-1' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center space-x-4">
                <item.icon className="w-5 h-5" />
                <span className="font-bold text-[10px] uppercase tracking-widest">{item.label}</span>
              </div>
              {item.badge ? <span className="bg-white text-amber-600 text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg">{item.badge}</span> : null}
            </NavLink>
          );
        })}
      </nav>
      <button onClick={handleLogout} className="mt-8 flex items-center space-x-3 px-5 py-4 text-red-400 hover:text-red-300 transition-all text-[10px] font-bold uppercase tracking-widest group">
        <XMarkIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        <span>Kill Session</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;
