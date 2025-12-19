
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  ChevronLeftIcon,
  ShieldCheckIcon,
  WalletIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';

const CheckoutPage: React.FC = () => {
  const { cart, placeOrder, user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'sslcommerz'>('sslcommerz');
  const [paymentType, setPaymentType] = useState<'full' | 'advance'>('full');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get state from CartPage if coming from coupon/discount flow
  const cartState = location.state || {};
  const discountAmount = cartState.discountAmount || 0;
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: 'Dhaka',
    area: ''
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const delivery = subtotal > 5000 ? 0 : 150;
  const total = subtotal - discountAmount + delivery;

  // 30% Advance Calculation
  const advanceAmount = Math.ceil(total * 0.3);
  const dueAmount = total - advanceAmount;

  const currentPaymentRequirement = paymentType === 'full' ? total : advanceAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const newOrder = {
        id: `MT-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString(),
        status: 'Pending' as const,
        paymentStatus: paymentType === 'full' ? 'Fully Paid' : 'Partially Paid' as any,
        total: total,
        subtotal: subtotal,
        discountAmount: discountAmount,
        paidAmount: currentPaymentRequirement,
        dueAmount: paymentType === 'full' ? 0 : dueAmount,
        items: [...cart],
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'SSLCommerz (Paid)',
        address: `${formData.address}, ${formData.area}, ${formData.city}`,
        customerName: formData.name,
        customerEmail: formData.email
      };

      placeOrder(newOrder);
      setIsProcessing(false);
      navigate(`/order-success/${newOrder.id}`);
    }, 2000);
  };

  if (cart.length === 0) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20">
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold serif mb-2">Processing Your Order</h2>
          <p className="text-slate-500">Securing your bespoke purchase...</p>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-6xl">
        <Link to="/cart" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition">
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back to Bag
        </Link>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold serif mb-8">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Phone Number</label>
                  <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Delivery Address</label>
                  <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">City</label>
                  <select name="city" value={formData.city} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition">
                    <option>Dhaka</option><option>Savar</option><option>Chittagong</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Area / Zip</label>
                  <input required name="area" value={formData.area} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 outline-none transition" />
                </div>
              </div>
            </div>

            {/* Payment Strategy Selection */}
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold serif mb-2">Payment Option</h2>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-8 font-bold">Choose how you want to clear your dues</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setPaymentType('full')} 
                  className={`p-8 border-2 rounded-[2rem] text-left transition relative overflow-hidden group ${paymentType === 'full' ? 'border-amber-600 bg-amber-50 shadow-md shadow-amber-100' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <WalletIcon className={`w-8 h-8 mb-4 ${paymentType === 'full' ? 'text-amber-600' : 'text-slate-300'}`} />
                  <h4 className="font-bold text-slate-900">Full Payment</h4>
                  <p className="text-xs text-slate-500 mt-1">Pay the total amount BDT {total.toLocaleString()} now.</p>
                  {paymentType === 'full' && <div className="absolute top-4 right-4 w-2 h-2 bg-amber-600 rounded-full animate-ping"></div>}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setPaymentType('advance')} 
                  className={`p-8 border-2 rounded-[2rem] text-left transition relative overflow-hidden group ${paymentType === 'advance' ? 'border-amber-600 bg-amber-50 shadow-md shadow-amber-100' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <ReceiptPercentIcon className={`w-8 h-8 mb-4 ${paymentType === 'advance' ? 'text-amber-600' : 'text-slate-300'}`} />
                  <h4 className="font-bold text-slate-900">30% Advance</h4>
                  <p className="text-xs text-slate-500 mt-1">Pay BDT {advanceAmount.toLocaleString()} to begin bespoke work.</p>
                  <div className="mt-4 bg-amber-600/10 inline-block px-3 py-1 rounded-full text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                    Balance Due Later
                  </div>
                </button>
              </div>

              <div className="mt-10 pt-10 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button type="button" onClick={() => setPaymentMethod('sslcommerz')} className={`p-6 border-2 rounded-2xl flex flex-col items-center space-y-3 transition ${paymentMethod === 'sslcommerz' ? 'border-amber-600 bg-amber-50 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
                  <CreditCardIcon className={`w-8 h-8 ${paymentMethod === 'sslcommerz' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-sm">Online Payment</span>
                </button>
                <button type="button" onClick={() => setPaymentMethod('cod')} className={`p-6 border-2 rounded-2xl flex flex-col items-center space-y-3 transition ${paymentMethod === 'cod' ? 'border-amber-600 bg-amber-50 shadow-sm' : 'border-slate-100 hover:border-slate-200'}`}>
                  <BanknotesIcon className={`w-8 h-8 ${paymentMethod === 'cod' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className="font-bold text-sm">Cash on Delivery</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-lg border border-slate-100 sticky top-28">
              <h2 className="text-2xl font-bold serif mb-8">Checkout Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                   <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Order Value</span>
                   <span className="font-bold">BDT {total.toLocaleString()}</span>
                </div>
                {paymentType === 'advance' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-amber-600 font-bold uppercase tracking-widest text-[10px]">Bespoke Advance (30%)</span>
                      <span className="font-bold text-amber-600">BDT {advanceAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-4 border-t border-slate-50 italic">
                      <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Balance Due on Pickup</span>
                      <span className="font-bold text-slate-400">BDT {dueAmount.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Immediate Payment Due</span>
                <span className="text-4xl font-bold text-slate-900 tracking-tighter">BDT {currentPaymentRequirement.toLocaleString()}</span>
              </div>
              
              <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-bold uppercase tracking-widest hover:bg-slate-800 transition shadow-xl shadow-slate-200 flex items-center justify-center space-x-3 text-xs">
                <span>{paymentMethod === 'sslcommerz' ? `Securely Pay BDT ${currentPaymentRequirement.toLocaleString()}` : 'Confirm Order'}</span>
                <ShieldCheckIcon className="w-5 h-5" />
              </button>
              
              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6 leading-relaxed">
                By completing this order you agree to Mehedi Tailors <br/> bespoke terms of service.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
