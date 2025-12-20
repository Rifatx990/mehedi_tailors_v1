
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.tsx';
import { 
  StarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ChatBubbleBottomCenterTextIcon, 
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ArchiveBoxIcon,
  TagIcon,
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/solid';
import { Review, Offer, Notice } from '../types.ts';

const HomePage: React.FC = () => {
  const { products, banners, reviews, addReview, user, partnerBrands, upcomingProducts, offers, notices } = useStore();
  const navigate = useNavigate();
  
  const featured = products.filter(p => p.isFeatured).slice(0, 4);
  const activeBanners = banners.filter(b => b.isActive);
  const approvedReviews = reviews.filter(r => r.status === 'approved').slice(0, 3);
  const activeOffers = offers.filter(o => o.isActive);
  const activeNotices = notices.filter(n => n.isActive);
  // Fixed: Defined activeUpcoming by filtering upcomingProducts from the store context
  const activeUpcoming = upcomingProducts.filter(p => p.isActive);

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', name: user?.name || '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [homeSearch, setHomeSearch] = useState('');
  const [closedNoticeId, setClosedNoticeId] = useState<string | null>(null);

  useEffect(() => {
    if (activeBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [activeBanners]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearch.trim()) {
        navigate(`/shop?q=${encodeURIComponent(homeSearch)}`);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newReview: Review = {
      id: 'rev-' + Date.now(),
      userName: reviewForm.name || 'Anonymous Patron',
      comment: reviewForm.comment,
      rating: reviewForm.rating,
      date: 'Just now',
      status: 'pending'
    };
    await addReview(newReview);
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setIsReviewFormOpen(false);
    }, 3000);
  };

  return (
    <div className="overflow-x-hidden">
      {/* 0. Notice Bar */}
      {activeNotices.length > 0 && activeNotices[0].id !== closedNoticeId && (
        <div className={`py-3 px-6 text-center relative transition-all duration-500 animate-in slide-in-from-top-full ${
          activeNotices[0].type === 'warning' ? 'bg-red-600 text-white' : 
          activeNotices[0].type === 'promotion' ? 'bg-amber-600 text-white' : 
          'bg-slate-900 text-slate-100'
        }`}>
          <div className="container mx-auto flex items-center justify-center space-x-3 pr-8">
            {activeNotices[0].type === 'warning' ? <ExclamationCircleIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{activeNotices[0].content}</p>
          </div>
          <button 
            onClick={() => setClosedNoticeId(activeNotices[0].id)}
            className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
          >
            <XMarkIcon className="w-5 h-5 opacity-50 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* 1. Cinematic Hero Slider */}
      <section className="relative h-[85vh] md:h-[95vh] overflow-hidden group bg-slate-950">
        {activeBanners.length > 0 ? (
          activeBanners.map((banner, idx) => (
            <div 
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
                idx === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div className={`absolute inset-0 transition-transform duration-[10000ms] ease-linear ${idx === currentBannerIndex ? 'scale-110' : 'scale-100'}`}>
                <img src={banner.imageUrl} alt="" className="w-full h-full object-cover brightness-[0.4]" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20"></div>
              
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6 md:px-12 z-20 text-white">
                  <div className="max-w-4xl">
                    <div className={`transition-all duration-1000 transform ${idx === currentBannerIndex ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                      <div className="flex items-center space-x-4 mb-6 md:mb-8">
                         <span className="w-8 md:w-12 h-[1px] bg-amber-500"></span>
                         <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.6em] text-amber-500">Established 1980</span>
                      </div>
                      <h1 className="text-4xl md:text-[7rem] font-black mb-8 md:mb-10 leading-[1] md:leading-[0.85] serif tracking-tight drop-shadow-2xl">
                        {banner.title}
                      </h1>
                      
                      <form onSubmit={handleSearch} className="mb-10 md:mb-14 relative max-w-xl group">
                         <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                         <input 
                            value={homeSearch}
                            onChange={e => setHomeSearch(e.target.value)}
                            className="w-full bg-white/10 backdrop-blur-3xl border border-white/20 pl-16 pr-6 py-5 md:py-6 rounded-2xl outline-none focus:ring-4 focus:ring-amber-500/20 transition-all font-bold text-base md:text-lg" 
                            placeholder="Find your perfect fit..."
                         />
                         <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-amber-500 text-slate-950 px-6 py-2.5 md:py-3.5 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-white transition-all shadow-xl">Search</button>
                      </form>

                      <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                        <Link to={banner.linkUrl || "/shop"} className="bg-amber-600 hover:bg-amber-700 text-white px-10 md:px-14 py-5 md:py-6 font-black transition-all text-center uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 flex items-center justify-center space-x-4">
                          <span>Explore Catalog</span>
                          <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                        <Link to="/custom-tailoring" className="bg-white/5 backdrop-blur-xl hover:bg-white/10 text-white border border-white/20 px-10 md:px-14 py-5 md:py-6 font-bold transition-all text-center uppercase tracking-[0.3em] text-[10px]">Private Consultation</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-500">Initializing Cinematic Core...</div>
        )}
      </section>

      {/* 2. Featured Collections */}
      <section className="py-20 md:py-40 bg-white">
        <div className="container mx-auto px-6 mb-16 md:mb-24">
            <div className="flex items-center space-x-4 mb-6">
               <span className="w-12 h-px bg-amber-600"></span>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-600">Premium Selection</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold serif tracking-tight text-slate-950">Bespoke Highlights</h2>
        </div>
        <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {featured.map(product => (
            <Link key={product.id} to={`/product/${product.id}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 mb-6 md:mb-8 rounded-[2rem] transition-all duration-700 group-hover:shadow-2xl border border-slate-50">
                <img src={product.image} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" alt={product.name} referrerPolicy="no-referrer" />
              </div>
              <p className="text-[9px] text-amber-600 uppercase tracking-[0.3em] font-black mb-2">{product.category}</p>
              <h4 className="text-xl md:text-2xl font-bold serif text-slate-900 mb-2">{product.name}</h4>
              <p className="font-black text-sm">BDT {product.price.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Artisan Offers: The Vault of Deals */}
      {activeOffers.length > 0 && (
        <section className="py-20 md:py-32 bg-slate-950 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
           <div className="container mx-auto px-6 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                 <div>
                    <div className="flex items-center space-x-3 text-amber-500 mb-4">
                       <TagIcon className="w-5 h-5" />
                       <span className="text-[10px] font-black uppercase tracking-[0.4em]">Seasonal Advantages</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold serif text-white tracking-tight">Artisan Offers</h2>
                 </div>
                 <Link to="/shop" className="text-amber-500 font-black uppercase tracking-widest text-[10px] border-b-2 border-amber-500/20 pb-1 hover:border-amber-500 transition-all">View All Promotions</Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 {activeOffers.map(offer => (
                    <Link key={offer.id} to={offer.linkUrl || "/shop"} className="group bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 overflow-hidden flex flex-col md:flex-row hover:bg-white/10 transition-all duration-500">
                       <div className="md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden">
                          <img src={offer.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                       </div>
                       <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-between">
                          <div>
                             <span className="bg-amber-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block mb-6 shadow-xl">{offer.discountTag}</span>
                             <h3 className="text-2xl md:text-3xl font-bold serif text-white mb-4">{offer.title}</h3>
                             <p className="text-slate-400 text-sm leading-relaxed mb-8">{offer.description}</p>
                          </div>
                          <div className="flex items-center space-x-3 text-amber-500 group-hover:translate-x-2 transition-transform">
                             <span className="text-[10px] font-black uppercase tracking-widest">Claim This Benefit</span>
                             <ArrowRightIcon className="w-4 h-4" />
                          </div>
                       </div>
                    </Link>
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* 4. Upcoming Products */}
      {activeUpcoming.length > 0 && (
        <section className="py-20 md:py-40 bg-slate-50 border-y border-slate-100">
           <div className="container mx-auto px-6 mb-16 md:mb-20 text-center">
              <div className="inline-flex items-center space-x-3 text-teal-600 mb-6 px-4 py-2 bg-teal-50 rounded-full border border-teal-100">
                 <ClockIcon className="w-4 h-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Horizon Archive</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold serif text-slate-900 tracking-tight">The Future of Fit</h2>
              <p className="text-slate-500 mt-6 max-w-xl mx-auto font-light text-base md:text-lg">Preview upcoming artisan textile launches and seasonal prototypes.</p>
           </div>
           
           <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {activeUpcoming.map(p => (
                 <div key={p.id} className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 shadow-sm border border-slate-100 flex flex-col group hover:shadow-xl transition-all duration-700">
                    <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden mb-8 shadow-inner">
                       <img src={p.image} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt="" />
                       <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-all"></div>
                       <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur px-4 py-1.5 rounded-full text-white text-[8px] font-black uppercase tracking-widest border border-white/10">Expected: {new Date(p.expectedDate).toLocaleDateString(undefined, {month: 'short', year: 'numeric'})}</div>
                    </div>
                    <div className="px-4 pb-4 flex-grow flex flex-col">
                       <h4 className="text-xl md:text-2xl font-bold serif text-slate-900 mb-4">{p.name}</h4>
                       <p className="text-sm text-slate-400 leading-relaxed font-light line-clamp-3 mb-8 italic">"{p.description}"</p>
                       <div className="mt-auto pt-6 border-t border-slate-50">
                          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-teal-600 transition-all active:scale-95">Pre-Order Interest</button>
                       </div>
                    </div>
                 </div>
              ))}
           </div>
        </section>
      )}

      {/* 5. Patron Perspectives */}
      <section className="py-20 md:py-40 bg-white">
        <div className="container mx-auto px-6 text-center mb-16 md:mb-24 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-50 text-amber-600 rounded-[1.8rem] mb-10 shadow-sm border border-slate-100">
            <ChatBubbleBottomCenterTextIcon className="w-8 h-8" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold serif tracking-tight text-slate-950">Patron Voices</h2>
          <p className="text-slate-400 mt-6 text-sm md:text-lg uppercase tracking-[0.3em] font-medium">Authentic stories of bespoke excellence</p>
          <button onClick={() => setIsReviewFormOpen(!isReviewFormOpen)} className="mt-14 bg-slate-950 text-white px-10 md:px-16 py-5 md:py-6 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] hover:bg-amber-600 transition shadow-2xl">
            {isReviewFormOpen ? 'Cancel' : 'Share Your Experience'}
          </button>
        </div>

        {isReviewFormOpen && (
          <div className="container mx-auto px-6 max-w-2xl mb-32 animate-in zoom-in duration-500">
            <div className="bg-slate-50 p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-inner">
               {reviewSubmitted ? (
                 <div className="text-center py-10">
                   <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                   <h3 className="text-2xl font-bold serif">Gratitude Expressed</h3>
                 </div>
               ) : (
                 <form onSubmit={handleReviewSubmit} className="space-y-8">
                   <div className="flex justify-center space-x-2">
                     {[1,2,3,4,5].map(n => (
                       <StarIcon key={n} onClick={() => setReviewForm({...reviewForm, rating: n})} className={`w-8 h-8 md:w-10 md:h-10 cursor-pointer ${reviewForm.rating >= n ? 'text-amber-500' : 'text-slate-200'}`} />
                     ))}
                   </div>
                   <input required value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} className="w-full bg-white border border-slate-100 px-6 py-4 rounded-2xl outline-none font-bold" placeholder="Patron Name" />
                   <textarea required rows={4} value={reviewForm.comment} onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} className="w-full bg-white border border-slate-100 px-6 py-4 rounded-2xl outline-none font-medium text-lg" placeholder="How did we do?..." />
                   <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-[10px]">Publish My Story</button>
                 </form>
               )}
            </div>
          </div>
        )}

        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {approvedReviews.map(review => (
            <div key={review.id} className="bg-slate-50 p-10 md:p-12 rounded-[3rem] border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-2xl transition-all duration-700">
              <div>
                <div className="flex space-x-1 mb-8 text-amber-500">
                  {[...Array(review.rating)].map((_, i) => <StarIcon key={i} className="w-4 h-4" />)}
                </div>
                <p className="text-slate-700 mb-10 leading-relaxed font-light italic text-lg md:text-xl">"{review.comment}"</p>
              </div>
              <div className="flex items-center space-x-4 pt-6 border-t border-slate-100/50">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold">{review.userName.charAt(0)}</div>
                <div>
                   <h4 className="font-black text-slate-900 uppercase text-[10px] tracking-widest">{review.userName}</h4>
                   <p className="text-[9px] text-slate-400 font-bold uppercase">{review.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
