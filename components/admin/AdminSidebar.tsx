
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext.tsx';
import { 
  ChartBarIcon, 
  ShoppingBagIcon, 
  TagIcon, 
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
  IdentificationIcon,
  PaperAirplaneIcon,
  Bars3Icon,
  PaintBrushIcon,
  BanknotesIcon,
  SparklesIcon,
  ClockIcon,
  GiftIcon,
  MegaphoneIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

const AdminSidebar: React.FC = () => {
  const { setAdminUser, reviews, materialRequests, dues } = useStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const pendingReviews = reviews.filter(r => r.status === 'pending').length;
  const pendingRequisitions = materialRequests.filter(r => r.status === 'pending').length;
  const activeDues = dues.filter(d => d.status === 'pending').length;

  const handleLogout = () => {
    setAdminUser(null);
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Overview', icon: ChartBarIcon },
    { to: '/admin/reports', label: 'Sales Reports', icon: DocumentChartBarIcon },
    { to: '/admin/orders', label: 'Order Pipeline', icon: ShoppingBagIcon },
    { to: '/admin/dues', label: 'Due Ledger', icon: BanknotesIcon, badge: activeDues },
    { to: '/admin/gift-cards', label: 'Gift Credit Ledger', icon: GiftIcon },
    { type: 'separator', label: 'Inventory' },
    { to: '/admin/products', label: 'Inventory (CRUD)', icon: TagIcon },
    { to: '/admin/upcoming', label: 'Upcoming Models', icon: ClockIcon },
    { to: '/admin/bespoke-services', label: 'Customization CRUD', icon: SparklesIcon },
    { to: '/admin/catalog', label: 'Product Catalog', icon: IdentificationIcon },
    { to: '/admin/labels', label: 'Label Studio', icon: QrCodeIcon },
    { to: '/admin/fabrics', label: 'Fabric Vault', icon: SwatchIcon },
    { to: '/admin/categories', label: 'Categories', icon: Squares2X2Icon },
    { type: 'separator', label: 'Marketing' },
    { to: '/admin/branding', label: 'Branding Studio', icon: PaintBrushIcon },
    { to: '/admin/offers', label: 'Promotion Offers', icon: TagIcon },
    { to: '/admin/notices', label: 'Notices & Ticker', icon: MegaphoneIcon },
    { to: '/admin/partners', label: 'Partner Brands', icon: BriefcaseIcon },
    { to: '/admin/banners', label: 'Hero Pictures', icon: PhotoIcon },
    { to: '/admin/coupons', label: 'Coupons', icon: TicketIcon },
    { type: 'separator', label: 'Management' },
    { to: '/admin/outbox', label: 'Mail Logs', icon: PaperAirplaneIcon },
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
    <>
      <div className="md:hidden flex items-center justify-between p-6 bg-slate-950 text-white sticky top-0 z-[60] shadow-xl no-print">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold serif tracking-tighter">MEHEDI</h2>
          <span className="text-[8px] bg-amber-600 px-2 py-0.5 rounded font-black uppercase">Admin</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 bg-white/10 rounded-lg">
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] md:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full bg-slate-950 text-white flex flex-col p-8 shadow-2xl z-[80] overflow-y-auto no-scrollbar border-r border-white/5 transition-transform duration-500 ease-out md:translate-x-0 md:sticky md:w-72 ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-12">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold serif tracking-tighter">MEHEDI</h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-amber-500 font-bold mt-1">Atelier Control</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 hover:bg-white/10 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
        </div>

        <nav className="flex-grow space-y-1">
          {navItems.map((item, idx) => {
            if (item.type === 'separator') return <div key={idx} className="pt-6 pb-2"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600 px-5">{item.label}</p></div>;
            return (
              <NavLink key={item.to} to={item.to!} onClick={() => setIsOpen(false)} className={({ isActive }) => `w-full flex items-center justify-between px-5 py-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-amber-600 text-white shadow-xl shadow-amber-600/20 translate-x-1' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                <div className="flex items-center space-x-4"><item.icon className="w-4.5 h-4.5" /><span className="font-bold text-[9px] uppercase tracking-widest">{item.label}</span></div>
                {item.badge ? <span className="bg-white text-amber-600 text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg">{item.badge}</span> : null}
              </NavLink>
            );
          })}
        </nav>

        <button onClick={handleLogout} className="mt-8 flex items-center space-x-3 px-5 py-4 text-red-400 hover:text-red-300 transition-all text-[10px] font-bold uppercase tracking-widest group">
          <XMarkIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          <span>Terminate</span>
        </button>
      </aside>
    </>
  );
};

export default AdminSidebar;
