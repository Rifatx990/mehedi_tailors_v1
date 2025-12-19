
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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, products, fabrics } = useStore();
  
  const product = useMemo(() => products.find(p => p.id === id), [id, products]);
  
  // Gallery state
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
      <div className="py-32 text-center">
        <h1 className="text-3xl font-bold serif mb-6">Product not found</h1>
        <Link to="/shop" className="text-amber-600 font-bold border-b border-amber-600">Back to Shop</Link>
      </div>
    );
  }

  const isInWishlist = wishlist.includes(product.id);

  const handleAddToCart = () => {
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
        <div className="fixed inset-0 z-[100] bg-slate-900/95 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-8 right-8 text-white/70 hover:text-white transition-all z-20"
          >
            <XMarkIcon className="w-10 h-10" />
          </button>
          <div className="max-w-5xl w-full max-h-[90vh] relative group">
            <img 
              src={activeImage} 
              className="w-full h-full object-contain rounded-lg shadow-2xl animate-in zoom-in duration-500" 
              alt="High Resolution View" 
            />
            {galleryImages.length > 1 && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-4 bg-black/20 backdrop-blur-md p-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                {galleryImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-amber-500 scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <Link to="/shop" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition">
          <ChevronLeftIcon className="w-4 h-4 mr-1" />
          Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="order-2 md:order-1 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:h-[600px] pb-4 md:pb-0">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative flex-shrink-0 w-20 md:w-24 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    activeImage === img ? 'border-amber-600 shadow-xl scale-[1.02]' : 'border-transparent opacity-50 hover:opacity-100 hover:border-slate-200'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`View ${idx + 1}`} />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="order-1 md:order-2 flex-grow aspect-[3/4] bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm relative group cursor-zoom-in" onClick={() => setIsLightboxOpen(true)}>
              <img 
                src={activeImage} 
                className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" 
                alt={product.name} 
              />
              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-500"></div>
              
              <div className="absolute top-8 left-8 bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-xl flex items-center space-x-3">
                 <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Bespoke Ready</span>
              </div>

              <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                <MagnifyingGlassPlusIcon className="w-6 h-6 text-slate-900" />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="mb-2">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold serif mb-4 leading-tight tracking-tighter">{product.name}</h1>
            
            <div className="flex items-center space-x-4 mb-8">
              <span className="text-3xl font-bold text-slate-900">BDT {(product.discountPrice || product.price).toLocaleString()}</span>
              {product.discountPrice && (
                <span className="text-xl text-slate-400 line-through">BDT {product.price.toLocaleString()}</span>
              )}
            </div>

            {/* AI Stylist Feature */}
            <div className="mb-10 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-4">
                  <SparklesIcon className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">Mehedi AI Stylist</span>
                </div>
                {aiTip ? (
                  <p className="text-sm font-light leading-relaxed animate-in fade-in duration-500 italic">"{aiTip}"</p>
                ) : (
                  <div>
                    <p className="text-xs text-slate-400 mb-4 font-medium">Need styling advice for this bespoke material?</p>
                    <button 
                      onClick={getAiStylingTip}
                      disabled={isAiLoading}
                      className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white border-b border-amber-500 pb-1 hover:text-amber-500 transition-all"
                    >
                      {isAiLoading ? "Consulting Archive..." : "Get Styling Advice"}
                    </button>
                  </div>
                )}
              </div>
              <ChatBubbleLeftRightIcon className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5" />
            </div>

            <p className="text-slate-600 leading-relaxed mb-10 text-base font-light">
              {product.description}
            </p>

            {/* Selectors */}
            <div className="space-y-10 mb-12">
              {/* Fabric Type Selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-6">Select Fabric Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {fabrics.map(fabric => (
                    <button
                      key={fabric.id}
                      onClick={() => setSelectedFabric(fabric.name)}
                      className={`group flex flex-col items-center p-3 rounded-2xl border transition-all ${
                        selectedFabric === fabric.name 
                        ? 'border-amber-600 bg-amber-50/50 shadow-lg shadow-amber-600/10' 
                        : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden mb-3">
                        <img src={fabric.image} className={`w-full h-full object-cover transition-transform group-hover:scale-110 ${selectedFabric === fabric.name ? '' : 'grayscale opacity-60'}`} alt="" />
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${selectedFabric === fabric.name ? 'text-amber-600' : 'text-slate-500'}`}>{fabric.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {product.availableSizes.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4">Standard Size Selection</label>
                  <div className="flex flex-wrap gap-3">
                    {product.availableSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${
                          selectedSize === size 
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xl' 
                          : 'border-slate-200 text-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-4 mb-12">
              <div className="flex space-x-4">
                <button 
                  onClick={handleAddToCart}
                  className="flex-grow bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  <span>Add to Bag</span>
                </button>
                <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`px-6 py-5 rounded-2xl border transition-all ${
                    isInWishlist ? 'border-amber-600 bg-amber-50 text-amber-600' : 'border-slate-200 text-slate-400 hover:border-slate-400'
                  }`}
                >
                  {isInWishlist ? <HeartSolidIcon className="w-6 h-6" /> : <HeartIcon className="w-6 h-6" />}
                </button>
              </div>
              <button 
                onClick={handleCustomize}
                className="w-full bg-white border-2 border-slate-900 text-slate-900 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center space-x-3 hover:bg-slate-900 hover:text-white transition-all group"
              >
                <SparklesIcon className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />
                <span>Request Bespoke Fitting</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-8">
              <div className="flex items-center space-x-3 text-slate-500">
                <TruckIcon className="w-5 h-5 text-amber-600" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Swift Delivery</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-500">
                <ShieldCheckIcon className="w-5 h-5 text-amber-600" />
                <span className="text-[9px] font-bold uppercase tracking-widest">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
