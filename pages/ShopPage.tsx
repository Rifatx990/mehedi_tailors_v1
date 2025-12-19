
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../constants.tsx';
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
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { Category, Product, ProductRequest } from '../types.ts';

const ITEMS_PER_PAGE = 12;

const ShopPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('Latest');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Custom Appeal Form State
  const [appealForm, setAppealForm] = useState({ name: '', email: '', productTitle: '', description: '' });
  const [appealSent, setAppealSent] = useState(false);

  const { toggleWishlist, wishlist, addToCart, addProductRequest } = useStore();
  const navigate = useNavigate();

  const filteredProducts = PRODUCTS.filter(p => {
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

  // Reset to first page when filters change
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
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-6 md:space-y-0">
          <div>
            <h1 className="text-5xl font-bold serif mb-4">The Collection</h1>
            <p className="text-slate-500 text-lg">Finely curated apparel and premium textiles.</p>
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

        {/* Search Bar */}
        <div className="mb-8 relative max-w-2xl group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search our catalog (e.g. Silk Panjabi, Saree...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600 transition-all duration-200 shadow-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex overflow-x-auto pb-4 mb-12 no-scrollbar space-x-4">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`px-8 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === 'All' ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            All Categories
          </button>
          {Object.values(Category).map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {paginatedProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => handleProductClick(product.id)}
              className="group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 mb-6 rounded-2xl">
                <img 
                  src={product.image} 
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-110" 
                  alt={product.name} 
                />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-500"></div>
                
                <div className="absolute top-4 right-4 flex flex-col space-y-2 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-600 hover:text-white transition"
                    aria-label="Toggle Wishlist"
                  >
                    <svg className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-amber-600 text-amber-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-600 hover:text-white transition"
                    aria-label="Quick View"
                  >
                    <EyeIcon className="w-5 h-5 text-slate-400 hover:text-inherit" />
                  </button>
                </div>
                
                <div className="absolute bottom-6 left-6 right-6 flex flex-col space-y-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 z-10">
                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    className="bg-slate-900 text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition shadow-xl rounded-xl"
                  >
                    Add to Bag
                  </button>
                  <button 
                    onClick={(e) => handleCustomize(e, product)}
                    className="bg-white/90 backdrop-blur text-slate-900 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition border border-slate-200 rounded-xl"
                  >
                    Customize
                  </button>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2 font-bold">{product.category}</p>
                <h3 className="text-lg font-bold serif mb-2 text-slate-900 tracking-tight">{product.name}</h3>
                <div className="flex justify-center items-center space-x-3 text-sm font-bold">
                  {product.discountPrice ? (
                    <>
                      <span className="text-amber-700">BDT {product.discountPrice.toLocaleString()}</span>
                      <span className="text-slate-300 line-through">BDT {product.price.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="text-slate-900">BDT {product.price.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-20 flex justify-center items-center space-x-4">
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
                    className={`w-12 h-12 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                      currentPage === pageNum
                        ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
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

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <div className="py-20 text-center animate-in fade-in zoom-in duration-300">
            <div className="text-6xl mb-6 grayscale opacity-30">🧵</div>
            <h2 className="text-2xl font-bold serif mb-2 text-slate-400">No pieces found</h2>
            <p className="text-slate-500 max-w-md mx-auto">We couldn't find any matches for your current filters. Try refining your search or exploring a different category.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-8 text-amber-600 font-bold uppercase tracking-widest text-xs border-b-2 border-amber-600/30 hover:border-amber-600 transition-all pb-1"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Import Stock / Appeal for New Model Form */}
        <section className="mt-40 border-t border-slate-100 pt-32 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="animate-in slide-in-from-left duration-1000">
              <div className="flex items-center space-x-3 text-amber-600 mb-6">
                 <span className="w-8 h-px bg-amber-600"></span>
                 <span className="text-xs font-bold uppercase tracking-[0.3em]">Artisan's Collaboration</span>
              </div>
              <h2 className="text-5xl font-bold serif mb-8 leading-tight">Visionary requests.<br/>Tailored by Mehedi.</h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-lg">
                Seek a specific textile? Or perhaps you've envisioned a model not yet in our archive? Submit your sartorial appeal below. Our master artisans prioritize client-led innovation.
              </p>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                     <BoltIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest">Rapid Response</h4>
                    <p className="text-xs text-slate-400">All appeals reviewed by our head tailor within 24 hours.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                     <SparklesIcon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest">Exclusive Notification</h4>
                    <p className="text-xs text-slate-400">Receive priority access when your requested model arrives.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-10 md:p-16 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-1000"></div>
              
              {appealSent ? (
                <div className="text-center py-12 animate-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                     <EyeIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold serif mb-4 text-slate-900">Appeal Acknowledged</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">Our atelier team is reviewing your request. We will reach out to you at <span className="text-slate-900 font-bold">{appealForm.email}</span> shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleAppealSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Patron Name</label>
                      <input 
                        required
                        value={appealForm.name}
                        onChange={e => setAppealForm({...appealForm, name: e.target.value})}
                        className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 transition-all placeholder:text-slate-300"
                        placeholder="Arif Ahmed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Secure Email</label>
                      <input 
                        required
                        type="email"
                        value={appealForm.email}
                        onChange={e => setAppealForm({...appealForm, email: e.target.value})}
                        className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 transition-all placeholder:text-slate-300"
                        placeholder="arif@bespoke.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Desired Creation / Model Title</label>
                    <input 
                      required
                      value={appealForm.productTitle}
                      onChange={e => setAppealForm({...appealForm, productTitle: e.target.value})}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 transition-all placeholder:text-slate-300"
                      placeholder="e.g. Midnight Blue Velvet Sherwani with Zari Work"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Appeal Specifications</label>
                    <textarea 
                      required
                      rows={4}
                      value={appealForm.description}
                      onChange={e => setAppealForm({...appealForm, description: e.target.value})}
                      className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-amber-600/5 focus:border-amber-600 transition-all resize-none placeholder:text-slate-300"
                      placeholder="Describe the fabric texture, cut details, or sizing requirements you are seeking..."
                    />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-slate-800 transition shadow-2xl shadow-slate-900/10 active:scale-[0.98]">
                    Lodge Sartorial Appeal
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300" onClick={() => setQuickViewProduct(null)}>
           <div 
             className="bg-white rounded-[3.5rem] w-full max-w-5xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in slide-in-from-bottom-10 duration-500"
             onClick={e => e.stopPropagation()}
           >
              <div className="md:w-1/2 h-80 md:h-auto relative overflow-hidden bg-slate-100 group">
                 <img 
                    src={quickViewProduct.image} 
                    className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" 
                    alt={quickViewProduct.name} 
                 />
                 <div className="absolute top-8 left-8 bg-white/90 backdrop-blur px-5 py-2 rounded-2xl shadow-xl flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-900">Bespoke Quality</span>
                 </div>
              </div>
              <div className="md:w-1/2 p-10 md:p-16 overflow-y-auto relative flex flex-col no-scrollbar">
                 <button 
                   onClick={() => setQuickViewProduct(null)}
                   className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 hover:rotate-90 transition-all duration-300"
                 >
                   <XMarkIcon className="w-10 h-10" />
                 </button>
                 
                 <div className="mb-8">
                   <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600 mb-2 block">{quickViewProduct.category}</span>
                   <h2 className="text-4xl font-bold serif text-slate-900 mb-4 tracking-tight">{quickViewProduct.name}</h2>
                   <div className="flex items-center space-x-4">
                     <p className="text-3xl font-bold text-slate-900 tracking-tighter">BDT {(quickViewProduct.discountPrice || quickViewProduct.price).toLocaleString()}</p>
                     {quickViewProduct.discountPrice && (
                        <p className="text-lg text-slate-300 line-through font-medium">BDT {quickViewProduct.price.toLocaleString()}</p>
                     )}
                   </div>
                 </div>

                 <p className="text-slate-500 leading-relaxed mb-10 font-light text-base border-l-2 border-slate-100 pl-6 italic">
                   "{quickViewProduct.description}"
                 </p>
                 
                 <div className="mt-auto space-y-4">
                    <button 
                      onClick={() => { handleAddToCart(null, quickViewProduct); setQuickViewProduct(null); }}
                      className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                    >
                      Instant Purchase
                    </button>
                    <button 
                      onClick={() => { navigate(`/product/${quickViewProduct.id}`); setQuickViewProduct(null); }}
                      className="w-full bg-white border border-slate-200 text-slate-900 py-5 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-white transition-all active:scale-[0.98]"
                    >
                      Explore Artisan Details
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
