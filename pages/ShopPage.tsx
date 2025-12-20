
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.tsx';
import { 
  ArrowsUpDownIcon, 
  MagnifyingGlassIcon, 
  XMarkIcon, 
  EyeIcon, 
  ShoppingBagIcon, 
  SparklesIcon, 
  TicketIcon, 
  BoltIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Category, Product, ProductRequest } from '../types.ts';

const ITEMS_PER_PAGE = 12;

const ShopPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Latest');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [appealForm, setAppealForm] = useState({ name: '', email: '', productTitle: '', description: '' });
  const [appealSent, setAppealSent] = useState(false);

  const { toggleWishlist, wishlist, addToCart, addProductRequest, products } = useStore();
  const navigate = useNavigate();

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = a.discountPrice || a.price;
      const priceB = b.discountPrice || b.price;
      if (sortBy === 'Price: Low to High') return priceA - priceB;
      if (sortBy === 'Price: High to Low') return priceB - priceA;
      return 0;
    });
  }, [filteredProducts, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (e: React.MouseEvent | null, product: Product) => {
    if (e) e.stopPropagation();
    if (!product.inStock || product.stockCount <= 0) return;

    addToCart({
      id: `cart-${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      image: product.image,
      quantity: 1,
      isCustomOrder: false,
      price: product.discountPrice || product.price,
      selectedSize: product.availableSizes?.[0],
      selectedColor: product.colors?.[0]
    });
  };

  const handleCustomize = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    let type = 'Shirt';
    if (product.name.toLowerCase().includes('suit')) type = 'Suit';
    if (product.name.toLowerCase().includes('panjabi')) type = 'Panjabi';
    if (product.category === Category.WOMEN) type = 'Kamiz';
    
    navigate('/custom-tailoring', { state: { garmentType: type } });
  };

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
  };

  const handleAppealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const request: ProductRequest = {
      id: `REQ-${Date.now()}`,
      userName: appealForm.name,
      email: appealForm.email,
      productTitle: appealForm.productTitle,
      description: appealForm.description,
      date: new Date().toISOString()
    };
    addProductRequest(request);
    setAppealSent(true);
    setTimeout(() => {
      setAppealSent(false);
      setAppealForm({ name: '', email: '', productTitle: '', description: '' });
    }, 5000);
  };

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
          <div>
            <h1 className="text-5xl font-bold serif mb-4">The Collection</h1>
            <p className="text-slate-500 text-lg font-light">Finely curated apparel and premium textiles.</p>
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <select 
                className="appearance-none bg-slate-50 border border-slate-100 px-10 py-3 pr-12 rounded-full font-medium text-sm focus:outline-none focus:ring-1 focus:ring-amber-600 cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option>Latest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
              <ArrowsUpDownIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="mb-8 relative max-w-2xl group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search our catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition-all duration-200 shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600">
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex overflow-x-auto pb-4 mb-12 no-scrollbar space-x-4">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`px-8 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === 'All' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            All Categories
          </button>
          {Object.values(Category).map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {paginatedProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => handleProductClick(product.id)}
              className="group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 mb-6 rounded-3xl">
                <img 
                  src={product.image} 
                  className={`w-full h-full object-cover transition duration-700 group-hover:scale-110 ${(!product.inStock || product.stockCount <= 0) ? 'grayscale opacity-60' : ''}`} 
                  alt={product.name} 
                />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-500"></div>
                
                {/* Out of Stock Overlay */}
                {(!product.inStock || product.stockCount <= 0) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-slate-900/80 backdrop-blur-md px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                      Sold Out
                    </div>
                  </div>
                )}

                {/* Remaining Stock Badge */}
                {product.inStock && product.stockCount > 0 && product.stockCount < 10 && (
                   <div className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                      Only {product.stockCount} Left
                   </div>
                )}
                
                <div className="absolute top-4 right-4 flex flex-col space-y-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-600 hover:text-white transition"
                  >
                    <svg className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-amber-600 text-amber-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-600 hover:text-white transition"
                  >
                    <EyeIcon className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                
                <div className="absolute bottom-6 left-6 right-6 flex flex-col space-y-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-10">
                  <button 
                    disabled={!product.inStock || product.stockCount <= 0}
                    onClick={(e) => handleAddToCart(e, product)}
                    className={`py-4 text-[9px] font-black uppercase tracking-widest transition shadow-xl rounded-2xl ${(!product.inStock || product.stockCount <= 0) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                  >
                    {(!product.inStock || product.stockCount <= 0) ? 'Out of Stock' : 'Add to Bag'}
                  </button>
                  <button 
                    onClick={(e) => handleCustomize(e, product)}
                    className="bg-white/90 backdrop-blur text-slate-900 py-4 text-[9px] font-black uppercase tracking-widest hover:bg-white transition border border-slate-200 rounded-2xl"
                  >
                    Customize
                  </button>
                </div>
              </div>
              <div className="text-center px-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-600 mb-2 font-bold">{product.category}</p>
                <h3 className="text-lg font-bold serif mb-2 text-slate-900 tracking-tight leading-snug">{product.name}</h3>
                <div className="flex justify-center items-center space-x-3 text-sm font-bold">
                  {product.discountPrice ? (
                    <>
                      <span className="text-slate-900">BDT {product.discountPrice.toLocaleString()}</span>
                      <span className="text-slate-300 line-through font-normal">BDT {product.price.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="text-slate-900">BDT {product.price.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-24 flex justify-center items-center space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-3 rounded-full border border-slate-200 transition-all ${
                currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-900 hover:text-white hover:border-slate-900'
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-12 h-12 rounded-full font-bold text-xs transition-all ${
                      currentPage === pageNum
                        ? 'bg-slate-900 text-white shadow-xl'
                        : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-3 rounded-full border border-slate-200 transition-all ${
                currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-900 hover:text-white hover:border-slate-900'
              }`}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {sortedProducts.length === 0 && (
          <div className="py-20 text-center animate-in fade-in zoom-in duration-300">
            <div className="text-6xl mb-6 grayscale opacity-30">🧵</div>
            <h2 className="text-2xl font-bold serif mb-2 text-slate-400">No pieces found</h2>
            <p className="text-slate-500 max-w-md mx-auto">Try refining your search or exploring a different category.</p>
          </div>
        )}

        <section className="mt-40 border-t border-slate-100 pt-32 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <div className="flex items-center space-x-3 text-amber-600 mb-6">
                 <span className="w-8 h-px bg-amber-600"></span>
                 <span className="text-xs font-black uppercase tracking-[0.3em]">Artisan's Collaboration</span>
              </div>
              <h2 className="text-5xl font-bold serif mb-8 leading-tight">Visionary requests.<br/>Tailored by Mehedi.</h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-lg font-light">
                Seek a specific textile? Or perhaps you've envisioned a model not yet in our archive? Submit your sartorial appeal below.
              </p>
            </div>

            <div className="bg-slate-50 p-10 md:p-16 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              {appealSent ? (
                <div className="text-center py-12 animate-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                     <EyeIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold serif mb-4 text-slate-900">Appeal Acknowledged</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">We will reach out to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleAppealSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input required value={appealForm.name} onChange={e => setAppealForm({...appealForm, name: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 transition-all font-bold text-sm" placeholder="Patron Name" />
                    <input required type="email" value={appealForm.email} onChange={e => setAppealForm({...appealForm, email: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 transition-all font-bold text-sm" placeholder="Secure Email" />
                  </div>
                  <input required value={appealForm.productTitle} onChange={e => setAppealForm({...appealForm, productTitle: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 transition-all font-bold text-sm" placeholder="Desired Creation" />
                  <textarea required rows={4} value={appealForm.description} onChange={e => setAppealForm({...appealForm, description: e.target.value})} className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 transition-all resize-none font-medium text-sm" placeholder="Describe specifications..." />
                  <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-[0.98]">
                    Lodge Sartorial Appeal
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>

      {quickViewProduct && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300" onClick={() => setQuickViewProduct(null)}>
           <div 
             className="bg-white rounded-[3.5rem] w-full max-w-5xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in slide-in-from-bottom-10 duration-500"
             onClick={e => e.stopPropagation()}
           >
              <div className="md:w-1/2 h-80 md:h-auto relative overflow-hidden bg-slate-100 group">
                 <img 
                    src={quickViewProduct.image} 
                    className={`w-full h-full object-cover transition duration-1000 group-hover:scale-110 ${(!quickViewProduct.inStock || quickViewProduct.stockCount <= 0) ? 'grayscale opacity-60' : ''}`} 
                    alt={quickViewProduct.name} 
                 />
                 {(!quickViewProduct.inStock || quickViewProduct.stockCount <= 0) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Currently Unavailable</span>
                    </div>
                 )}
              </div>
              <div className="md:w-1/2 p-10 md:p-16 overflow-y-auto relative flex flex-col no-scrollbar">
                 <button onClick={() => setQuickViewProduct(null)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 hover:rotate-90 transition-all duration-300">
                   <XMarkIcon className="w-10 h-10" />
                 </button>
                 <div className="mb-8">
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600 mb-2 block">{quickViewProduct.category}</span>
                   <h2 className="text-4xl font-bold serif text-slate-900 mb-4 tracking-tight leading-tight">{quickViewProduct.name}</h2>
                   <div className="flex items-center space-x-4">
                     <p className="text-3xl font-black text-slate-900 tracking-tighter">BDT {(quickViewProduct.discountPrice || quickViewProduct.price).toLocaleString()}</p>
                   </div>
                   {quickViewProduct.inStock && (
                      <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center space-x-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                         <span>{quickViewProduct.stockCount} Pieces Available in Inventory</span>
                      </p>
                   )}
                 </div>
                 <p className="text-slate-500 leading-relaxed mb-10 font-light text-base border-l-2 border-slate-100 pl-6 italic">
                   "{quickViewProduct.description}"
                 </p>
                 <div className="mt-auto space-y-4">
                    <button 
                      disabled={!quickViewProduct.inStock || quickViewProduct.stockCount <= 0}
                      onClick={() => { handleAddToCart(null, quickViewProduct); setQuickViewProduct(null); }}
                      className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl transition-all active:scale-[0.98] ${(!quickViewProduct.inStock || quickViewProduct.stockCount <= 0) ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                      {(!quickViewProduct.inStock || quickViewProduct.stockCount <= 0) ? 'Archive Only' : 'Instant Purchase'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ShopPage;
