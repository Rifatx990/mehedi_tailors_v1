import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { dbService } from '../services/DatabaseService.ts';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  ChevronLeftIcon,
  ShieldCheckIcon,
  WalletIcon,
  ReceiptPercentIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';

const CheckoutPage: React.FC = () => {
  const { cart, placeOrder, user, syncToServer } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'sslcommerz' | 'bkash'>('cod');
  const [paymentType, setPaymentType] = useState<'full' | 'advance'>('full');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const cartState = location.state || {};
  const discountAmount = cartState.discountAmount || 0;
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const delivery = subtotal > 5000 ? 0 : 150;
  const total = subtotal - discountAmount + delivery;

  const advanceAmount = Math.ceil(total * 0.3);
  const dueAmount = total - advanceAmount;

  const currentPaymentRequirement = paymentType === 'full' ? total : advanceAmount;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: 'Dhaka',
    area: ''
  });

  // Handle bKash Callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bkashStatus = params.get('bkash_status');
    const paymentID = params.get('paymentID');
    const orderId = localStorage.getItem('last_bkash_order_id');

    if (bkashStatus === 'execute' && paymentID && orderId) {
       setIsProcessing(true);
       dbService.executeBkashPayment(paymentID, orderId)
         .then(res => {
            if (res.success) {
               syncToServer().then(() => {
                  navigate(`/order-success/${orderId}`);
               });
            } else {
               throw new Error("bKash execution failed");
            }
         })
         .catch(err => {
            setErrorMessage(err.message);
            setIsProcessing(false);
         });
    }

    const error = params.get('error');
    if (error === 'payment_failed') setErrorMessage('The payment transaction was rejected by the bank or provider.');
    if (error === 'validation_failed') setErrorMessage('Security verification handshake failed.');
  }, [location, navigate, syncToServer]);

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
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'bkash' ? 'bKash Digital' : 'SSLCommerz Digital',
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
        const response: any = await dbService.initPayment(newOrder);
        if (response.url) {
            window.location.href = response.url;
        } else {
            throw new Error("SSLCommerz handshake rejected.");
        }
      } catch (err: any) {
        setErrorMessage(err.message);
        setIsProcessing(false);
      }
    } else if (paymentMethod === 'bkash') {
       try {
          localStorage.setItem('last_bkash_order_id', orderId);
          const response: any = await dbService.createBkashPayment(newOrder);
          if (response.bkashURL) {
             window.location.href = response.bkashURL;
          } else {
             throw new Error("bKash handshake rejected.");
          }
       } catch (err: any) {
          setErrorMessage(err.message);
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

  if (cart.length === 0) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-20">
      {isProcessing && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-8"></div>
          <h2 className="text-3xl font-bold serif text-white">Establishing Secure Gateway...</h2>
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
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold serif mb-10 flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-sm">1</div>
                 <span>Logistics Registry</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Legal Identity (Full Name)</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Secure Email Identity</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Contact Mobile</label>
                  <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none font-bold" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Artisan Handover Coordinates (Address)</label>
                  <input required name="address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 outline-none font-bold" />
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold serif mb-10 flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-sm">2</div>
                 <span>Fiscal Strategy</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <button 
                  type="button" 
                  onClick={() => setPaymentType('full')} 
                  className={`p-8 border-2 rounded-[2.5rem] text-left transition-all ${paymentType === 'full' ? 'border-slate-950 bg-slate-50' : 'border-slate-100'}`}
                >
                  <WalletIcon className="w-8 h-8 mb-4" />
                  <h4 className="font-black text-lg text-slate-900">Full Settlement</h4>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mt-2">Clear BDT {total.toLocaleString()} now.</p>
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentType('advance')} 
                  className={`p-8 border-2 rounded-[2.5rem] text-left transition-all ${paymentType === 'advance' ? 'border-amber-600 bg-amber-50' : 'border-slate-100'}`}
                >
                  <ReceiptPercentIcon className="w-8 h-8 mb-4" />
                  <h4 className="font-black text-lg text-slate-900">30% Artisan Advance</h4>
                  <p className="text-[10px] font-bold uppercase text-slate-400 mt-2">BDT {advanceAmount.toLocaleString()} to trigger production.</p>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('bkash')} 
                    className={`p-5 border-2 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all ${paymentMethod === 'bkash' ? 'border-rose-600 bg-rose-50 shadow-lg' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                  >
                     <DevicePhoneMobileIcon className="w-6 h-6" />
                     <span className="text-[10px] font-black uppercase tracking-widest">bKash Pay</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('sslcommerz')} 
                    className={`p-5 border-2 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all ${paymentMethod === 'sslcommerz' ? 'border-amber-600 bg-amber-50 shadow-lg' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                  >
                     <CreditCardIcon className="w-6 h-6" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Cards/Internet</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('cod')} 
                    className={`p-5 border-2 rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all ${paymentMethod === 'cod' ? 'border-slate-950 bg-slate-950 text-white shadow-lg' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                  >
                     <BanknotesIcon className="w-6 h-6" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Cash Delivery</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-slate-900 text-white p-12 rounded-[4rem] shadow-2xl sticky top-28 border border-white/5 overflow-hidden">
              <h2 className="text-2xl font-bold serif mb-10 border-b border-white/10 pb-8">Ledger Summary</h2>
              <div className="space-y-6 mb-12">
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Contract Valuation</span>
                    <span className="font-black text-2xl tracking-tighter">BDT {total.toLocaleString()}</span>
                 </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 mb-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-3">Requirement Today</p>
                 <p className="text-5xl font-black tracking-tighter">BDT {currentPaymentRequirement.toLocaleString()}</p>
              </div>
              
              <button 
                type="submit" 
                className="w-full py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-2xl bg-amber-600 text-white hover:bg-amber-700 flex items-center justify-center space-x-4"
              >
                <span>Authorize Secure Payment</span>
                <ArrowPathIcon className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;