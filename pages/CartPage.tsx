
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrashIcon, 
  MinusIcon, 
  PlusIcon, 
  ShieldCheckIcon, 
  TicketIcon, 
  XMarkIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, coupons } = useStore();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<null | { code: string, percent: number }>(null);
  const [couponError, setCouponError] = useState('');
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.percent / 100) : 0;
  const delivery = subtotal > 5000 ? 0 : 150;
  const total = subtotal - discountAmount + delivery;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    
    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    
    if (!coupon) {
      setCouponError('This voucher code does not exist in our archive.');
      return;
    }

    if (!coupon.isActive) {
      setCouponError('This voucher has been deactivated by the atelier.');
      return;
    }

    // Check Expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      setCouponError('This voucher term has expired.');
      return;
    }

    // Check Usage Limit
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      setCouponError('This voucher has reached its maximum redemption capacity.');
      return;
    }

    setAppliedCoupon({ code: coupon.code, percent: coupon.discountPercent });
    setCouponCode('');
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { appliedCoupon, discountAmount } });
  };

  if (cart.length === 0) {
    return (
      <div className="py-32 container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold serif mb-6">Your Bag is Empty</h1>
        <p className="text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">Looks like you haven't added anything to your bag yet. Explore our bespoke collections to find the perfect fit.</p>
        <Link to="/shop" className="bg-slate-900 text-white px-12 py-5 font-bold uppercase tracking-widest hover:bg-slate-800 transition shadow-xl text-xs">
          Discover Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold serif mb-12 tracking-tight">Your Shopping Bag</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 relative group border border-transparent hover:border-slate-100 transition-all duration-500">
                <div className="w-full sm:w-40 aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
                  <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={item.name} />
                </div>
                <div className="flex-grow flex flex-col justify-between py-2">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold serif tracking-tight text-slate-900">{item.name}</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2 font-bold">
                          {item.isCustomOrder ? 'Bespoke Artisan Item' : 'Standard Ready-to-Wear'}
                        </p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-all">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex gap-3 mt-4">
                      {item.selectedSize && <span className="bg-slate-50 text-slate-500 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-slate-100">{item.selectedSize}</span>}
                      {item.selectedColor && <span className="bg-slate-50 text-slate-500 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-slate-100">{item.selectedColor}</span>}
                      {item.isCustomOrder && <span className="bg-amber-50 text-amber-700 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-amber-100">Tailored Fitting</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-8">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-100 p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-slate-900 hover:text-white transition shadow-sm"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="font-bold w-10 text-center text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 rounded-xl bg-white flex items-center justify-center hover:bg-slate-900 hover:text-white transition shadow-sm"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      BDT {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6 sticky top-28">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold serif mb-10 tracking-tight">Cart Totals</h2>
              <div className="space-y-4 text-sm mb-10 border-b border-slate-50 pb-10">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                  <span className="font-bold text-slate-900">BDT {subtotal.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-amber-600 font-bold">
                    <span className="uppercase tracking-widest text-[10px]">Discount ({appliedCoupon.code})</span>
                    <span>-BDT {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Logistics</span>
                  <span className="font-bold text-slate-900">{delivery === 0 ? 'COMPLIMENTARY' : `BDT ${delivery}`}</span>
                </div>
              </div>
              
              <div className="mb-10 flex justify-between items-center">
                <span className="text-lg font-bold uppercase tracking-widest text-slate-400 text-[10px]">Grand Total</span>
                <span className="text-4xl font-bold text-slate-900 tracking-tighter">BDT {total.toLocaleString()}</span>
              </div>
              
              <button onClick={handleCheckout} className="group w-full bg-slate-900 text-white py-6 rounded-[2rem] font-bold uppercase tracking-widest text-xs shadow-2xl shadow-slate-900/10 hover:bg-slate-800 transition-all flex items-center justify-center space-x-3">
                <span>Secure Checkout</span>
                <ShieldCheckIcon className="w-5 h-5 group-hover:scale-110 transition-all" />
              </button>
            </div>

            {/* Promo Code Card */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center space-x-2 mb-6">
                <TicketIcon className="w-5 h-5 text-amber-600" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Promotion Code</h3>
              </div>
              {appliedCoupon ? (
                <div className="flex justify-between items-center bg-amber-50 p-4 rounded-xl border border-amber-100 animate-in zoom-in">
                  <span className="text-amber-800 font-bold text-xs">{appliedCoupon.code} Applied</span>
                  <button onClick={() => setAppliedCoupon(null)} className="text-amber-400 hover:text-amber-800"><XMarkIcon className="w-5 h-5" /></button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    placeholder="EID2025" 
                    className="flex-grow bg-slate-50 border border-slate-100 px-5 py-3 rounded-xl outline-none text-xs font-bold uppercase tracking-widest"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  />
                  <button type="submit" className="bg-slate-100 px-6 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-slate-200 transition">Apply</button>
                </form>
              )}
              {couponError && (
                <div className="flex items-center space-x-2 text-red-500 mt-3 animate-in fade-in slide-in-from-top-1">
                  <ExclamationTriangleIcon className="w-3 h-3" />
                  <p className="text-[9px] font-black uppercase tracking-widest">{couponError}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
