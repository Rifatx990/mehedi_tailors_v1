import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { dbService } from '../services/DatabaseService';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  ChevronLeftIcon,
  ShieldCheckIcon,
  WalletIcon,
  ReceiptPercentIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const CheckoutPage: React.FC = () => {
  const { cart, placeOrder, user } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'sslcommerz'>('cod');
  const [paymentType, setPaymentType] = useState<'full' | 'advance'>('full');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const cartState = location.state || {};
  const discountAmount = cartState.discountAmount || 0;
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    if (error === 'payment_failed') setErrorMessage('The payment transaction was rejected by the bank or provider. Please try a different method.');
    if (error === 'payment_cancelled') setErrorMessage('Digital authorization was cancelled. You can retry or choose Cash on Delivery.');
    if (error === 'validation_failed') setErrorMessage('Security verification handshake failed. Please contact our support hotline.');
  }, [location]);

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
    setErrorMessage('');

    const bespokeItem = cart.find(i => i.isCustomOrder);
    const orderId = `MT-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
        id: orderId,
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
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'SSLCommerz Digital',
        address: `${formData.address}, ${formData.area}, ${formData.city}`,
        customerName: formData.name,
        customerEmail: formData.email,
        phone: formData.phone,
        bespokeNote: bespokeItem?.bespokeNote,
        bespokeType: bespokeItem?.bespokeType,
        deliveryDate: bespokeItem?.deliveryDate
    };

    if (paymentMethod === 'sslcommerz') {
      try {
        const response = await dbService.initPayment(newOrder);
        if (response.url) {
            window.location.href = response.url;
        } else {
            throw new Error("Handshake rejected by SSLCommerz gateway.");
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to establish secure payment session.");
        setIsProcessing(false);
      }
    } else {
      setTimeout(async () => {
        await placeOrder(newOrder);
        setIsProcessing(false);
        navigate(`/order-success/${newOrder.id}`);
      }, 1500);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-3xl font-bold serif mb-6 text-slate-400">Your bag is empty</h2>
        <Link to="/shop" className="bg-slate-900 text-white px-10 py-3.5 rounded-full font-bold uppercase tracking-widest text-[10px]">Return to Collection</Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_50px_rgba(217,119,6,0.2)]"></div>
          <h2 className="text-3xl font-bold serif text-white tracking-tighter">Establishing Secure Gateway...</h2>
          <p className="text-amber-500/60 mt-3 text-xs uppercase tracking-[0.4em] font-black">Authorized Artisan Handshake in Progress</p>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-6xl">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <Link to="/cart" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 mb-6 transition">
                    <ChevronLeftIcon className="w-4 h-4 mr-1" />
                    Modify Bag
                </Link>
                <h1 className="text-5xl font-bold serif text-slate-900 tracking-tight">Checkout</h1>
            </div>
            {errorMessage && (
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-start space-x-5 text-rose-600 animate-in slide-in-from-top-4 shadow-xl shadow-rose-600/5 max-w-md">
                    <ExclamationCircleIcon className="w-8 h-8 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">Authorization Failed</p>
                        <p className="text-sm font-medium leading-relaxed">{errorMessage}</p>
                    </div>
                </div>
            )}
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-10">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
              <h2 className="text-2xl font-bold serif mb-10 flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-sm">1</div>
                 <span>Logistics Registry</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Legal Identity (Full Name)</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 outline-none transition font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Secure Email Identity</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 outline-none transition font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Contact Mobile</label>
                  <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 outline-none transition font-bold" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Artisan Handover Coordinates (Address)</label>
                  <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 outline-none transition font-bold" />
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
              <h2 className="text-2xl font-bold serif mb-10 flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-sm">2</div>
                 <span>Fiscal Strategy</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <button 
                  type="button" 
                  onClick={() => setPaymentType('full')} 
                  className={`p-8 border-2 rounded-[2.5rem] text-left transition-all duration-500 relative overflow-hidden group/btn ${paymentType === 'full' ? 'border-slate-950 bg-slate-50 shadow-2xl scale-[1.02]' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <WalletIcon className={`w-8 h-8 mb-4 transition-colors ${paymentType === 'full' ? 'text-slate-950' : 'text-slate-200'}`} />
                  <h4 className="font-black text-lg text-slate-900">Full Settlement</h4>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mt-2 tracking-widest">Clear BDT {total.toLocaleString()} now.</p>
                  {paymentType === 'full' && <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentType('advance')} 
                  className={`p-8 border-2 rounded-[2.5rem] text-left transition-all duration-500 relative overflow-hidden group/btn ${paymentType === 'advance' ? 'border-amber-600 bg-amber-50 shadow-2xl scale-[1.02]' : 'border-slate-100 hover:border-slate-300'}`}
                >
                  <ReceiptPercentIcon className={`w-8 h-8 mb-4 transition-colors ${paymentType === 'advance' ? 'text-amber-600' : 'text-slate-200'}`} />
                  <h4 className="font-black text-lg text-slate-900">30% Artisan Advance</h4>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mt-2 tracking-widest">BDT {advanceAmount.toLocaleString()} to trigger production.</p>
                  {paymentType === 'advance' && <div className="absolute top-4 right-4 w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>}
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('sslcommerz')} 
                    className={`flex-grow p-5 border-2 rounded-2xl flex items-center justify-center space-x-3 transition-all duration-500 ${paymentMethod === 'sslcommerz' ? 'border-amber-600 bg-amber-50 shadow-lg' : 'border-slate-50 bg-slate-50 hover:bg-slate-100 text-slate-400'}`}
                  >
                     <CreditCardIcon className="w-5 h-5" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Digital Authorized Pay</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('cod')} 
                    className={`flex-grow p-5 border-2 rounded-2xl flex items-center justify-center space-x-3 transition-all duration-500 ${paymentMethod === 'cod' ? 'border-slate-950 bg-slate-950 text-white shadow-lg' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                  >
                     <BanknotesIcon className="w-5 h-5" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Cash (On Delivery)</span>
                  </button>
                </div>

                {paymentMethod === 'sslcommerz' && (
                  <div className="p-6 bg-slate-950 rounded-[2rem] border border-white/5 flex items-start space-x-5 animate-in zoom-in duration-500 shadow-2xl">
                    <ShieldCheckIcon className="w-8 h-8 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-black uppercase text-white tracking-[0.3em]">Authorized by SSLCommerz</p>
                      <p className="text-xs text-slate-400 leading-relaxed mt-2 font-light italic">You will be redirected to the secure portal to complete your transaction via Global Visa/Mastercard, bKash, Rocket, or Nagad.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] sticky top-28 border border-white/5 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-600/5 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
              
              <h2 className="text-2xl font-bold serif mb-10 border-b border-white/10 pb-8 tracking-tight">Ledger Summary</h2>
              <div className="space-y-6 mb-12 text-sm">
                <div className="flex justify-between items-center">
                   <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Inventory Subtotal</span>
                   <span className="font-mono text-base">BDT {subtotal.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                   <div className="flex justify-between items-center text-emerald-400">
                      <span className="font-bold uppercase tracking-widest text-[10px]">Strategic Credit</span>
                      <span className="font-mono text-base">-BDT {discountAmount.toLocaleString()}</span>
                   </div>
                )}
                <div className="flex justify-between items-center pt-6 border-t border-white/10">
                   <span className="font-black uppercase tracking-[0.2em] text-[11px] text-white">Contract Valuation</span>
                   <span className="font-black text-2xl text-white tracking-tighter">BDT {total.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 mb-10 shadow-inner group">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-3">Requirement Today</p>
                 <p className="text-5xl font-black tracking-tighter transition-all group-hover:scale-105 duration-700">BDT {paymentType === 'full' ? total.toLocaleString() : advanceAmount.toLocaleString()}</p>
                 {paymentType === 'advance' && (
                    <p className="text-[10px] text-slate-500 mt-5 font-bold uppercase tracking-widest border-t border-white/5 pt-4">Balance BDT {dueAmount.toLocaleString()} due on Calibration fitting.</p>
                 )}
              </div>
              
              <button 
                type="submit" 
                className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-2xl flex items-center justify-center space-x-4 active:scale-[0.98] ${paymentMethod === 'sslcommerz' ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20' : 'bg-white text-slate-900 hover:bg-amber-600 hover:text-white shadow-white/5'}`}
              >
                <span>{paymentMethod === 'sslcommerz' ? 'Authorize Secure Payment' : 'Finalize Artisan Contract'}</span>
                <ArrowPathIcon className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="mt-10 flex items-center justify-center space-x-6 grayscale opacity-40">
                  <ShieldCheckIcon className="w-8 h-8" />
                  <CreditCardIcon className="w-8 h-8" />
                  <InformationCircleIcon className="w-8 h-8" />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;