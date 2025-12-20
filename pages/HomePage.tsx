
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext.tsx';
import { 
  StarIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ChatBubbleBottomCenterTextIcon, 
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/solid';
import { Review } from '../types.ts';

const HomePage: React.FC = () => {
  const { products, banners, reviews, addReview, user, partnerBrands } = useStore();
  const featured = products.filter(p => p.isFeatured);
  const activeBanners = banners.filter(b => b.isActive);
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  const activePartners = partnerBrands.filter(b => b.isActive);
  
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', name: user?.name || '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Auto-play hero slider logic
  useEffect(() => {
    if (activeBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [activeBanners]);

  // Auto-play partner slider logic
  useEffect(() => {
    if (activePartners.length > 1) {
      const interval = setInterval(() => {
        setCurrentPartnerIndex(prev => (prev + 1) % activePartners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activePartners]);

  const nextBanner = () => setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
  const prevBanner = () => setCurrentBannerIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);

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
      setReviewForm({ rating: 5, comment: '', name: user?.name || '' });
    }, 3000);
  };

  return (
    <div className="overflow-x-hidden">
      {/* 1. Cinematic Hero Slider "Banner Show System" */}
      <section className="relative h-[90vh] overflow-hidden group bg-slate-950">
        {activeBanners.length > 0 ? (
          activeBanners.map((banner, idx) => (
            <div 
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
                idx === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Image with Ken Burns Effect */}
              <div className={`absolute inset-0 transition-transform duration-[10000ms] ease-linear ${idx === currentBannerIndex ? 'scale-110' : 'scale-100'}`}>
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title} 
                  className="w-full h-full object-cover brightness-[0.45]" 
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30"></div>
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6 md:px-12 z-20 text-white">
                  <div className="max-w-4xl">
                    <div className={`transition-all duration-1000 transform ${idx === currentBannerIndex ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                      <div className="flex items-center space-x-4 mb-8">
                         <span className="w-12 h-[1px] bg-amber-500"></span>
                         <span className="text-[11px] font-black uppercase tracking-[0.6em] text-amber-500">Established 1980</span>
                      </div>
                      <h1 className="text-6xl md:text-9xl font-bold mb-10 leading-[0.9] serif tracking-tighter drop-shadow-2xl">
                        {banner.title.split(' ').map((word, i) => (
                          <span key={i} className="inline-block mr-4">{word}</span>
                        ))}
                      </h1>
                      <p className="text-lg md:text-2xl mb-14 text-slate-300 font-light max-w-2xl leading-relaxed italic border-l-2 border-amber-600/40 pl-8">
                        {banner.subtitle}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-6">
                        <Link 
                          to={banner.linkUrl || "/shop"} 
                          className="bg-amber-600 hover:bg-amber-700 text-white px-14 py-6 font-bold transition-all text-center uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-amber-600/30 active:scale-95 flex items-center justify-center space-x-4"
                        >
                          <span>Discover Collection</span>
                          <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                        <Link 
                          to="/custom-tailoring" 
                          className="bg-white/5 backdrop-blur-xl hover:bg-white/10 text-white border border-white/20 px-14 py-6 font-bold transition-all text-center uppercase tracking-[0.3em] text-[10px] active:scale-95"
                        >
                          Private Consultation
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
             <div className="text-center">
                <div className="w-16 h-16 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">Loading The Atelier...</p>
             </div>
          </div>
        )}
        
        {/* Cinematic Controls */}
        {activeBanners.length > 1 && (
          <>
            <div className="absolute left-10 bottom-12 flex flex-col space-y-4 z-30">
               <button onClick={prevBanner} className="p-4 bg-white/5 hover:bg-amber-600 rounded-full text-white transition-all border border-white/10 backdrop-blur-md">
                 <ChevronLeftIcon className="w-5 h-5" />
               </button>
               <button onClick={nextBanner} className="p-4 bg-white/5 hover:bg-amber-600 rounded-full text-white transition-all border border-white/10 backdrop-blur-md">
                 <ChevronRightIcon className="w-5 h-5" />
               </button>
            </div>
            
            {/* Progress Counter */}
            <div className="absolute right-12 bottom-12 z-30 flex items-end space-x-4 text-white">
               <span className="text-5xl font-bold serif text-amber-500">0{currentBannerIndex + 1}</span>
               <div className="h-10 w-px bg-white/20 mb-2"></div>
               <span className="text-sm font-bold text-slate-500 mb-2">0{activeBanners.length}</span>
            </div>

            {/* Horizontal Timeline */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-30">
               <div 
                className="h-full bg-amber-600 transition-all duration-[8000ms] ease-linear" 
                key={currentBannerIndex} 
                style={{ width: '100%' }}
               ></div>
            </div>
          </>
        )}
      </section>

      {/* 2. Featured Artisanal Works */}
      <section className="py-40 bg-white">
        <div className="container mx-auto px-6 mb-24 flex flex-col md:flex-row md:items-end justify-between gap-12">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-4 mb-6">
               <span className="w-12 h-px bg-amber-600"></span>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-600">Masterpiece Selection</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold serif tracking-tight text-slate-950">Curated Silhouettes</h2>
            <p className="text-slate-500 mt-6 text-lg leading-relaxed font-light">Explore our archive of garments crafted with surgical precision and the world's finest textiles.</p>
          </div>
          <Link to="/shop" className="group flex items-center space-x-4 text-slate-950 font-black uppercase tracking-widest text-[11px] pb-4 border-b-2 border-slate-950">
             <span>View All Collections</span>
             <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {featured.map(product => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 mb-10 rounded-[2.5rem] transition-all duration-700 group-hover:shadow-[0_60px_100px_-30px_rgba(0,0,0,0.2)]">
                <img src={product.image} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" alt={product.name} referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/20 transition-all duration-700"></div>
                
                <Link 
                  to={`/product/${product.id}`} 
                  className="absolute bottom-10 left-10 right-10 bg-white text-slate-950 py-5 text-center text-[10px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all transform translate-y-8 group-hover:translate-y-0 shadow-3xl rounded-2xl"
                >
                  View Artisan Details
                </Link>
              </div>
              <div className="px-2">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] text-amber-600 uppercase tracking-[0.3em] font-black">{product.category}</p>
                  <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                </div>
                <h4 className="text-2xl font-bold serif text-slate-900 group-hover:text-amber-700 transition-colors mb-4 leading-tight">{product.name}</h4>
                <div className="flex items-center space-x-4 font-black text-sm">
                  {product.discountPrice ? (
                    <>
                      <span className="text-slate-950">BDT {product.discountPrice.toLocaleString()}</span>
                      <span className="text-slate-300 line-through">BDT {product.price.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="text-slate-950">BDT {product.price.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Textile Partners (Artisan Collaborations) - SLIDER VERSION */}
      {activePartners.length > 0 && (
        <section className="py-40 bg-slate-950 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
           
           {/* Geometric background elements */}
           <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-600/5 rounded-full blur-[120px]"></div>
           <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-600/5 rounded-full blur-[120px]"></div>

           <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-32">
                 <div className="flex items-center justify-center space-x-3 text-amber-500 mb-6">
                    <SparklesIcon className="w-5 h-5" />
                    <span className="text-[11px] font-black uppercase tracking-[0.6em]">Global Textile Authority</span>
                 </div>
                 <h2 className="text-5xl md:text-6xl font-bold serif text-white tracking-tight">Artisan Collaborations</h2>
                 <p className="text-slate-500 mt-6 max-w-xl mx-auto font-light text-lg leading-relaxed italic">"Directly sourcing unparalleled textiles from the world's most prestigious mills to define our bespoke legacy."</p>
              </div>
              
              <div className="relative h-[250px] md:h-[400px] flex items-center justify-center">
                 {activePartners.map((brand, idx) => (
                    <div 
                      key={brand.id} 
                      className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-[1500ms] ease-in-out ${
                        idx === currentPartnerIndex 
                          ? 'opacity-100 scale-100 translate-y-0' 
                          : 'opacity-0 scale-90 translate-y-12 pointer-events-none'
                      }`}
                    >
                       <div className="bg-white/5 backdrop-blur-3xl rounded-[4rem] p-12 md:p-24 border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] group hover:border-white/10 transition-colors">
                          <img 
                            src={brand.logo} 
                            alt={brand.name} 
                            className="max-h-[120px] md:max-h-[220px] w-auto object-contain filter brightness-200 contrast-125 grayscale-[0.5] hover:grayscale-0 transition-all duration-1000" 
                            referrerPolicy="no-referrer"
                          />
                       </div>
                       <div className="mt-12 text-center">
                          <p className="text-white font-bold serif text-3xl md:text-4xl tracking-tight mb-2">{brand.name}</p>
                          <div className="flex items-center justify-center space-x-3">
                             <div className="h-px w-8 bg-amber-600"></div>
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600">Official Partner</span>
                             <div className="h-px w-8 bg-amber-600"></div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              {/* Slider Navigation Dots */}
              {activePartners.length > 1 && (
                <div className="mt-24 flex justify-center space-x-3">
                  {activePartners.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentPartnerIndex(idx)}
                      className={`h-1.5 transition-all duration-700 rounded-full ${idx === currentPartnerIndex ? 'w-12 bg-amber-600' : 'w-3 bg-white/20 hover:bg-white/40'}`}
                      aria-label={`Go to partner ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
           </div>
        </section>
      )}

      {/* 4. The Patron's Voice */}
      <section className="py-40 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-6 text-center mb-24 relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 text-[180px] font-black text-slate-200/40 select-none serif -z-10">Voice</div>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white text-amber-600 rounded-[2rem] mb-10 shadow-xl border border-slate-100">
            <ChatBubbleBottomCenterTextIcon className="w-8 h-8" />
          </div>
          <h2 className="text-5xl md:text-7xl font-bold serif tracking-tight text-slate-950">Patron Perspectives</h2>
          <p className="text-slate-400 mt-6 text-lg uppercase tracking-[0.3em] font-medium">Stories of fits, fabrics, and artisan excellence</p>
          
          <button 
            onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
            className="mt-14 bg-slate-950 text-white px-16 py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] hover:bg-amber-600 transition shadow-2xl active:scale-95"
          >
            {isReviewFormOpen ? 'Cancel Feedback' : 'Share Your Experience'}
          </button>
        </div>

        {isReviewFormOpen && (
          <div className="container mx-auto px-6 max-w-3xl mb-32 animate-in fade-in slide-in-from-top-10 duration-700">
            <div className="bg-white p-16 rounded-[4rem] shadow-3xl border border-slate-100 relative">
              <div className="absolute -top-6 -left-6 w-12 h-12 bg-amber-500 rounded-2xl rotate-12"></div>
              {reviewSubmitted ? (
                <div className="text-center py-16">
                  <CheckCircleIcon className="w-20 h-20 text-emerald-500 mx-auto mb-8" />
                  <h3 className="text-4xl font-bold serif mb-4 text-slate-950">Gratitude Expressed</h3>
                  <p className="text-slate-500 text-lg leading-relaxed">Your testimonial is a stitch in our heritage. We will publish it to our wall shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-12">
                  <div className="flex justify-center space-x-4">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button 
                        key={num} 
                        type="button" 
                        onClick={() => setReviewForm({...reviewForm, rating: num})}
                        className={`p-3 transition-all hover:scale-125 ${reviewForm.rating >= num ? 'text-amber-500' : 'text-slate-100'}`}
                      >
                        <StarIcon className="w-12 h-12" />
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 block ml-2">Patron Name</label>
                      <input 
                        required
                        value={reviewForm.name}
                        onChange={e => setReviewForm({...reviewForm, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-3xl outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold"
                        placeholder="e.g. Arif Ahmed"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 block ml-2">Sartorial Review</label>
                      <textarea 
                        required
                        rows={5}
                        value={reviewForm.comment}
                        onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 px-8 py-6 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-amber-600/5 transition resize-none font-medium text-lg leading-relaxed"
                        placeholder="Describe your bespoke journey..."
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-950 text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] hover:bg-amber-600 transition shadow-3xl">
                    Publish My Voice
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {approvedReviews.length > 0 ? (
            approvedReviews.map(review => (
              <div key={review.id} className="bg-white p-14 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-3xl transition-all duration-700 group relative flex flex-col justify-between">
                <div>
                  <div className="flex space-x-1 mb-10">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className={`w-5 h-5 ${i < review.rating ? 'text-amber-500' : 'text-slate-100'}`} />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-14 leading-[1.8] font-light italic text-xl">"{review.comment}"</p>
                </div>
                <div className="flex items-center space-x-5 border-t border-slate-50 pt-10">
                  <div className="w-16 h-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center font-bold serif text-2xl group-hover:bg-amber-600 transition-all shadow-xl group-hover:rotate-6">
                    {review.userName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <h4 className="font-black text-slate-950 uppercase tracking-widest text-[11px]">{review.userName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{review.date}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white/50 rounded-[4rem] border border-dashed border-slate-200">
               <ChatBubbleBottomCenterTextIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
               <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[11px]">Archive Awaiting First Voice.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
