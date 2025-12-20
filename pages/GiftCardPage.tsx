
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.tsx';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, GiftIcon } from '@heroicons/react/24/outline';

const GiftCardPage: React.FC = () => {
  const { addToCart, systemConfig } = useStore();
  const amounts = systemConfig.giftCardDenominations || [2000, 5000, 10000, 25000];
  const [amount, setAmount] = useState(amounts[0] || 5000);
  const navigate = useNavigate();

  const handleBuy = () => {
    addToCart({
      id: `gc-${Date.now()}`,
      productId: 'gift-card',
      name: `Bespoke Credits Gift Card - BDT ${amount}`,
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop',
      quantity: 1,
      isCustomOrder: false,
      price: amount
    });
    navigate('/cart');
  };

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600 mb-4 block">Give the Gift of Style</span>
            <h1 className="text-6xl font-bold serif mb-8 leading-tight">Mehedi Bespoke Gift Credits</h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-10">
              The ultimate gift for the person who appreciates a perfect fit. 
              Our digital gift cards can be used for any bespoke tailoring service or premium fabrics. 
              Delivered instantly via email.
            </p>

            <div className="mb-12">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Select Amount (BDT)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {amounts.map(a => (
                  <button
                    key={a}
                    onClick={() => setAmount(a)}
                    className={`py-4 rounded-2xl border font-bold transition-all ${amount === a ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'}`}
                  >
                    {a.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleBuy}
              className="w-full bg-amber-600 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-amber-700 transition shadow-xl shadow-amber-100 flex items-center justify-center space-x-3"
            >
              <span>Purchase Gift Card</span>
              <GiftIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <div className="aspect-video bg-slate-900 rounded-[30px] p-12 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
              {/* Card Design */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
              
              <div className="flex justify-between items-start z-10">
                <div>
                  <h3 className="text-2xl font-bold serif tracking-tighter">MEHEDI TAILORS</h3>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mt-1">Bespoke Excellence</p>
                </div>
                <SparklesIcon className="w-10 h-10 text-amber-500" />
              </div>

              <div className="z-10">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-1">Gift Amount</p>
                <p className="text-4xl font-bold">BDT {amount.toLocaleString()}</p>
              </div>

              <div className="flex justify-between items-end z-10">
                <div className="flex space-x-2">
                  <div className="w-8 h-5 bg-white/10 rounded"></div>
                  <div className="w-8 h-5 bg-white/10 rounded"></div>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">BESPOKE • FABRICS • CRAFTSMANSHIP</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardPage;
