
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

  const advanceAmount = Math.ceil(total * 0.3);
  const dueAmount = total - advanceAmount;

  const currentPaymentRequirement = paymentType === 'full' ? total : advanceAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setIsProcessing(true);

    setTimeout(() => {
      const newOrder = {
        id: `MT-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString(),
        status: 'Pending' as const,
        productionStep: 'Queue' as const,
        paymentStatus: (paymentType === 'full' ? 'Fully Paid' : 'Partially Paid') as any,
        total: total,
        subtotal: subtotal,
        discountAmount: discountAmount,
        paidAmount: currentPaymentRequirement,
        dueAmount: paymentType === 'full' ? 0 : dueAmount,
        items: [...cart],
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'SSLCommerz',
        address: `${formData.address}, ${formData.area}, ${formData.city}`,
        customerName: formData.name,
        customerEmail: formData.email
      };

      placeOrder(newOrder);
      setIsProcessing(false);
      navigate(`/order-success/${newOrder.id}`);
    }, 1500);
  };

  if (cart.length === 0) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-3xl font-bold serif mb-6">Your bag is empty</h2>
        <Link to="/shop" className="text-amber-600 font-bold underline">Go Shopping</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-2xl font-bold serif">Securing Bespoke Order...</h2>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-6xl">
        <Link to="/cart" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition">
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back to Bag
        </Link>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold serif mb-8">1. Logistics Identity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Full Legal Name</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-600/20 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Secure Email</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-600/20 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Contact Mobile</label>
                  <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-600/20 outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Delivery Coordinates</label>
                  <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-600/20 outline-none" />
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold serif mb-8">2. Settlement Structure</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <button 
                  type="button" 
                  onClick={() => setPaymentType('full')} 
                  className={`p-6 border-2 rounded-2xl text-left transition ${paymentType === 'full' ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <WalletIcon className="w-6 h-6 mb-3 text-slate-900" />
                  <h4 className="font-bold">Full Settlement</h4>
                  <p className="text-xs text-slate-400 mt-1">Clear the total BDT {total.toLocaleString()} now.</p>
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentType('advance')} 
                  className={`p-6 border-2 rounded-2xl text-left transition ${paymentType === 'advance' ? 'border-amber-600 bg-amber-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <ReceiptPercentIcon className="w-6 h-6 mb-3 text-amber-600" />
                  <h4 className="font-bold">30% Artisan Advance</h4>
                  <p className="text-xs text-slate-400 mt-1">Pay BDT {advanceAmount.toLocaleString()} to trigger production.</p>
                </button>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setPaymentMethod('sslcommerz')} className={`flex-1 p-4 border-2 rounded-xl flex items-center justify-center space-x-2 transition ${paymentMethod === 'sslcommerz' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100'}`}>
                   <CreditCardIcon className="w-5 h-5" />
                   <span className="text-xs font-bold uppercase">Digital Pay</span>
                </button>
                <button type="button" onClick={() => setPaymentMethod('cod')} className={`flex-1 p-4 border-2 rounded-xl flex items-center justify-center space-x-2 transition ${paymentMethod === 'cod' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-100'}`}>
                   <BanknotesIcon className="w-5 h-5" />
                   <span className="text-xs font-bold uppercase">Cash (Advance Required)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl sticky top-28">
              <h2 className="text-2xl font-bold serif mb-8 border-b border-white/10 pb-6">Ledger Summary</h2>
              <div className="space-y-4 mb-10 text-sm">
                <div className="flex justify-between">
                   <span className="text-slate-400">Inventory Subtotal</span>
                   <span>BDT {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                   <div className="flex justify-between text-emerald-400">
                      <span>Promotional Credit</span>
                      <span>-BDT {discountAmount.toLocaleString()}</span>
                   </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-4">
                   <span className="font-bold">Contract Valuation</span>
                   <span className="font-bold">BDT {total.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-8">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-2">Current Requirement</p>
                 <p className="text-4xl font-bold">BDT {currentPaymentRequirement.toLocaleString()}</p>
                 {paymentType === 'advance' && (
                    <p className="text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-widest italic">Balance BDT {dueAmount.toLocaleString()} due on calibration fitting.</p>
                 )}
              </div>
              
              <button type="submit" className="w-full bg-amber-600 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-amber-700 transition shadow-xl shadow-amber-600/20 flex items-center justify-center space-x-3">
                <span>Finalize Contract</span>
                <ShieldCheckIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
