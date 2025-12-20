
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.tsx';
import { GoogleGenAI } from "@google/genai";
import { 
  HeartIcon, 
  ShoppingBagIcon, 
  ChevronLeftIcon,
  ShieldCheckIcon,
  TruckIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassPlusIcon,
  XMarkIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, products, fabrics } = useStore();
  
  const product = useMemo(() => products.find(p => p.id === id), [id, products]);
  
  const [activeImage, setActiveImage] = useState(product?.image || '');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product?.availableSizes?.[0] || '');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '');
  const [selectedFabric, setSelectedFabric] = useState(product?.fabricType || (fabrics.length > 0 ? fabrics[0].name : ''));
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
    }
  }, [product]);

  const getAiStylingTip = async () => {
    if (!product) return;
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `As a professional high-end fashion stylist for Mehedi Tailors & Fabrics, give me a concise 2-sentence styling advice for the "${product.name}" made of ${selectedFabric || product.fabricType}. Suggest what to pair it with and for what occasion it is best suited.`,
      });
      setAiTip(response.text || "Perfect for any elegant occasion, pair this with matching accessories for a complete bespoke look.");
    } catch (error) {
      console.error("Gemini failed:", error);
      setAiTip("Pair this exquisite piece with neutral tones to let the fabric texture shine. Best for evening celebrations.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="py-32 text-center bg-white min-h-screen">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
           <ExclamationCircleIcon className="w-12 h-12 text-slate-300" />
        </div>
        <h1 className="text-3xl font-bold serif mb-6">Artisan Piece Not Found</h1>
        <Link to="/shop" className="text-amber-600 font-bold border-b border-amber-600 pb-1 text-xs uppercase tracking-widest">Back to Collection</Link>
      </div>
    );
  }

  const isInWishlist = wishlist.includes(product.id);
  const isOutOfStock = !product.inStock || product.stockCount <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart({
      id: `cart-${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      image: product.image,
      quantity: 1,
      isCustomOrder: false,
      price: product.discountPrice || product.price,
      selectedSize,
      selectedColor,
      selectedFabric
    });
    navigate('/cart');
  };

  const handleCustomize = () => {
    navigate('/custom-tailoring', { state: { garmentType: product.name, fabricType: selectedFabric } });
  };

  const galleryImages = product.images || [product.image];

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button onClick={() => setIsLightboxOpen(false)} className="absolute top-8 right-8 text-white/70 hover:text-white transition-all z-20">
            <XMarkIcon className="w-10 h-10" />
          </button>
          <div className="max-w-5xl w-full max-h-[90vh] relative group p-4">
            <img src={activeImage} className="w-full h-full object-contain rounded-3xl shadow-3xl animate-in zoom-in duration-500" alt="High Resolution View" />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <Link to="/shop" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 mb-10 transition">
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Back to Artisan Catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-6">
            <div className="order-2 md:order-1 flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto no-scrollbar md:h-[600px] pb-4 md:pb-0">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative flex-shrink-0 w-20 md:w-28 aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all duration-500 ${activeImage === img ? 'border-amber-600 shadow-2xl scale-[1.05]' : 'border-slate-50 opacity-40 hover:opacity-100 hover:border-slate-200'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`View ${idx + 1}`} />
                </button>
              ))}
            </div>

            <div className="order-1 md:order-2 flex-grow aspect-[3/4] bg-slate-100 rounded-[3rem] overflow-hidden shadow-sm relative group cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
              <img src={activeImage} className={`w-full h-full object-cover transition duration-1000 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-80' : ''}`} alt={product.name} />
              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-500"></div>
              <div className="absolute top-8 left-8 bg-white/95 backdrop-blur px-8 py-3 rounded-2xl shadow-2xl flex items-center space-x-3">
                 <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-600 animate-pulse'}`}></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">{isOutOfStock ? 'Limited Archive' : 'Ready to Tailor'}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">
                {product.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-[3.5rem] font-bold serif mb-6 leading-tight tracking-tight text-slate-900">{product.name}</h1>
            
            <div className="flex items-center space-x-6 mb-10">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">BDT {(product.discountPrice || product.price).toLocaleString()}</span>
              {product.discountPrice && (
                <span className="text-2xl text-slate-300 line-through font-light">BDT {product.price.toLocaleString()}</span>
              )}
            </div>

            {/* Real-time Inventory Insight */}
            <div className={`mb-10 p-6 rounded-[2rem] border transition-all ${isOutOfStock ? 'bg-rose-50 border-rose-100 text-rose-600' : product.stockCount < 5 ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
               <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${isOutOfStock ? 'bg-rose-100' : product.stockCount < 5 ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                     <ShoppingBagIcon className="w-6 h-6" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest">{isOutOfStock ? 'Currently Unavailable' : 'Inventory Availability'}</p>
                     <p className="text-lg font-black">{isOutOfStock ? 'Dispatched to patrons' : `${product.stockCount} Handcrafted Pieces Remaining`}</p>
                  </div>
               </div>
            </div>

            {/* AI Stylist Feature */}
            <div className="mb-10 bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-3xl">
              <div className="relative z-10">
                <div className="flex items-center space-x-3 text-amber-500 mb-6">
                  <SparklesIcon className="w-6 h-6 animate-spin-slow" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Atelier Styling Intelligence</span>
                </div>
                {aiTip ? (
                  <p className="text-base font-light leading-relaxed animate-in fade-in duration-700 italic border-l-2 border-amber-600/30 pl-6">"{aiTip}"</p>
                ) : (
                  <div>
                    <p className="text-xs text-slate-400 mb-6 leading-relaxed">Seek artisan advice on how to integrate this material into your seasonal wardrobe.</p>
                    <button 
                      onClick={getAiStylingTip}
                      disabled={isAiLoading}
                      className="inline-flex items-center space-x-3 text-[11px] font-black uppercase tracking-[0.2em] text-white border-b-2 border-amber-500/20 pb-1 hover:border-amber-500 transition-all"
                    >
                      {isAiLoading ? "Consulting Registry..." : "Fetch Styling Insight"}
                    </button>
                  </div>
                )}
              </div>
              <ChatBubbleLeftRightIcon className="absolute -bottom-10 -right-10 w-40 h-40 text-white/5" />
            </div>

            <p className="text-slate-500 leading-relaxed mb-12 text-lg font-light italic">
              "{product.description}"
            </p>

            {/* Selectors */}
            <div className="space-y-12 mb-16">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">1. Select Textile Basis</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {fabrics.map(fabric => (
                    <button
                      key={fabric.id}
                      onClick={() => setSelectedFabric(fabric.name)}
                      className={`group flex flex-col items-center p-4 rounded-[2rem] border-2 transition-all ${selectedFabric === fabric.name ? 'border-slate-900 bg-slate-50 shadow-xl' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                    >
                      <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 shadow-sm">
                        <img src={fabric.image} className={`w-full h-full object-cover transition-transform group-hover:scale-110 ${selectedFabric === fabric.name ? '' : 'grayscale opacity-40'}`} alt="" />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${selectedFabric === fabric.name ? 'text-slate-900' : 'text-slate-400'}`}>{fabric.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {product.availableSizes.length > 0 && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">2. Calibrate Dimension</label>
                  <div className="flex flex-wrap gap-4">
                    {product.availableSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[64px] h-16 rounded-2xl border-2 font-black text-sm uppercase transition-all flex items-center justify-center ${selectedSize === size ? 'bg-slate-900 text-white border-slate-900 shadow-2xl scale-110' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-6 mb-16">
              <div className="flex space-x-4">
                <button 
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-grow py-6 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center space-x-4 transition-all shadow-2xl active:scale-95 ${isOutOfStock ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  <ShoppingBagIcon className="w-6 h-6" />
                  <span>{isOutOfStock ? 'Sold Out' : 'Commit to Cart'}</span>
                </button>
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-20 rounded-[1.8rem] border-2 transition-all flex items-center justify-center ${isInWishlist ? 'border-amber-600 bg-amber-50 text-amber-600' : 'border-slate-100 text-slate-300 hover:border-slate-300'}`}
                >
                  {isInWishlist ? <HeartSolidIcon className="w-8 h-8" /> : <HeartIcon className="w-8 h-8" />}
                </button>
              </div>
              <button 
                onClick={handleCustomize}
                className="w-full bg-white border-2 border-slate-900 text-slate-900 py-6 rounded-[1.8rem] font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center space-x-4 hover:bg-slate-900 hover:text-white transition-all group"
              >
                <SparklesIcon className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
                <span>Initiate Bespoke Personalization</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-slate-50 pt-12">
              <div className="flex items-center space-x-4 text-slate-400">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"><TruckIcon className="w-5 h-5 text-amber-600" /></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Savar Express</span>
              </div>
              <div className="flex items-center space-x-4 text-slate-400">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center"><ShieldCheckIcon className="w-5 h-5 text-amber-600" /></div>
                <span className="text-[10px] font-black uppercase tracking-widest">Atelier Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
