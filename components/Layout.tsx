
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.tsx';
import { 
  ShoppingBagIcon, 
  UserIcon, 
  HeartIcon, 
  MagnifyingGlassIcon, 
  Bars3Icon, 
  XMarkIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  WrenchIcon
} from '@heroicons/react/24/outline';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { cart, user, wishlist, adminUser, workerUser } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const navigate = useNavigate();

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white text-xs py-2 text-center tracking-widest uppercase flex items-center justify-center space-x-4">
        <span>Express Delivery in Dhaka Savar & Ashulia</span>
        {adminUser && (
          <Link to="/admin/dashboard" className="bg-amber-600 px-3 py-0.5 rounded flex items-center space-x-1 font-bold">
            <ShieldCheckIcon className="w-3 h-3" />
            <span>Admin Console</span>
          </Link>
        )}
        {workerUser && (
          <Link to="/worker/dashboard" className="bg-teal-600 px-3 py-0.5 rounded flex items-center space-x-1 font-bold">
            <WrenchIcon className="w-3 h-3" />
            <span>Artisan Hub</span>
          </Link>
        )}
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold tracking-tighter serif text-slate-900">MEHEDI</span>
            <span className="text-xs uppercase tracking-widest text-slate-500 hidden sm:block">Tailors & Fabrics</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8 text-sm font-medium uppercase tracking-wider text-slate-600">
            <Link to="/shop" className="hover:text-amber-600 transition">Shop</Link>
            <Link to="/fabrics" className="hover:text-amber-600 transition">Fabrics</Link>
            <Link to="/custom-tailoring" className="hover:text-amber-600 transition">Bespoke</Link>
            <Link to="/track-order" className="hover:text-amber-600 transition">Track Order</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5">
            <button className="p-2 text-slate-600 hover:text-slate-900 transition">
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
            <Link to="/wishlist" className="p-2 text-slate-600 hover:text-slate-900 transition relative">
              <HeartIcon className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to={user ? "/dashboard" : "/login"} className="p-2 text-slate-600 hover:text-slate-900 transition flex items-center space-x-2">
              <UserIcon className="w-5 h-5" />
              {user && <span className="text-[10px] font-bold uppercase tracking-widest hidden lg:inline">{user.name.split(' ')[0]}</span>}
            </Link>
            <Link to="/cart" className="p-2 text-slate-600 hover:text-slate-900 transition relative">
              <ShoppingBagIcon className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute top-0 right-0 bg-amber-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2">
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col p-8">
          <div className="flex justify-between items-center mb-12">
            <span className="text-2xl font-bold serif">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)}><XMarkIcon className="w-8 h-8" /></button>
          </div>
          <div className="flex flex-col space-y-6 text-2xl serif">
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop Collections</Link>
            <Link to="/fabrics" onClick={() => setMobileMenuOpen(false)}>Fine Fabrics</Link>
            <Link to="/custom-tailoring" onClick={() => setMobileMenuOpen(false)}>Bespoke Tailoring</Link>
            <Link to="/track-order" onClick={() => setMobileMenuOpen(false)}>Track My Order</Link>
            <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>My Wishlist ({wishlist.length})</Link>
            <Link to={user ? "/dashboard" : "/login"} onClick={() => setMobileMenuOpen(false)}>
              {user ? 'My Profile' : 'Sign In'}
            </Link>
            {(adminUser || workerUser) && <div className="h-px bg-slate-100 my-4" />}
            {adminUser && <Link to="/admin/dashboard" className="text-amber-600" onClick={() => setMobileMenuOpen(false)}>Admin Console</Link>}
            {workerUser && <Link to="/worker/dashboard" className="text-teal-600" onClick={() => setMobileMenuOpen(false)}>Artisan Hub</Link>}
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-white text-xl font-bold mb-6 serif tracking-tighter">MEHEDI TAILORS</h3>
            <p className="text-sm leading-relaxed mb-6 opacity-70">
              Dhonaid, Ashulia, Savar, Dhaka, Bangladesh<br />
              +8801720267213<br />
              contact@meheditailors.com
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-amber-600 cursor-pointer transition">F</div>
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-amber-600 cursor-pointer transition">I</div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-widest text-[10px]">Customer Service</h4>
            <ul className="space-y-4 text-xs uppercase tracking-widest opacity-70">
              <li><Link to="/shipping" className="hover:text-white transition">Shipping Policy</Link></li>
              <li><Link to="/returns" className="hover:text-white transition">Returns & Exchanges</Link></li>
              <li><Link to="/size-guide" className="hover:text-white transition">Size Guide</Link></li>
              <li><Link to="/track-order" className="hover:text-white transition">Track Your Order</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-widest text-[10px]">Shop</h4>
            <ul className="space-y-4 text-xs uppercase tracking-widest opacity-70">
              <li><Link to="/shop" className="hover:text-white transition">All Collections</Link></li>
              <li><Link to="/fabrics" className="hover:text-white transition">Fine Fabrics</Link></li>
              <li><Link to="/custom-tailoring" className="hover:text-white transition">Bespoke Fitting</Link></li>
              <li><Link to="/gift-cards" className="hover:text-white transition">Gift Credits</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-6 uppercase tracking-widest text-[10px]">Newsletter</h4>
            <p className="text-xs mb-6 leading-loose opacity-70">Early access to new fabrics and seasonal collections.</p>
            {subscribed ? (
              <div className="flex items-center space-x-2 text-amber-600 animate-in zoom-in">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-widest">You're on the list!</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex">
                <input 
                  required
                  type="email" 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your Email" 
                  className="bg-white/5 border-none px-4 py-3 text-xs w-full focus:ring-1 focus:ring-amber-600 text-white placeholder:text-slate-500 rounded-l-xl" 
                />
                <button type="submit" className="bg-amber-600 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition rounded-r-xl">Join</button>
              </form>
            )}
          </div>
        </div>
        <div className="container mx-auto px-4 mt-16 pt-8 border-t border-white/5 text-center text-[10px] tracking-[0.3em] opacity-30">
          &copy; {new Date().getFullYear()} MEHEDI TAILORS AND FABRICS. BESPOKE EXCELLENCE.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
