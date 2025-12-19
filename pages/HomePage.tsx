
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowRightIcon, StarIcon, ChevronLeftIcon, ChevronRightIcon, ChatBubbleBottomCenterTextIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { Review } from '../types';

const HomePage: React.FC = () => {
  const { products, banners, reviews, addReview, user } = useStore();
  const featured = products.filter(p => p.isFeatured);
  const activeBanners = banners.filter(b => b.isActive);
  const approvedReviews = reviews.filter(r => r.status === 'approved');
  
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', name: user?.name || '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (activeBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeBanners]);

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
    <div>
      {/* Dynamic Banner Slider */}
      {activeBanners.length > 0 ? (
        <section className="relative h-[85vh] overflow-hidden group">
          {activeBanners.map((banner, idx) => (
            <div 
              key={banner.id}
              className={`absolute inset-0 transition-all duration-1000 transform ${idx === currentBannerIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}
            >
              <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover brightness-[0.6]" />
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4 z-10 text-white">
                  <div className="max-w-3xl">
                    <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight serif tracking-tighter animate-in fade-in slide-in-from-left duration-1000">
                      {banner.title}
                    </h1>
                    <p className="text-xl mb-12 text-slate-100 font-light max-w-lg leading-relaxed animate-in fade-in slide-in-from-left duration-700">
                      {banner.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      <Link to={banner.linkUrl || "/shop"} className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-5 font-bold transition-all text-center uppercase tracking-widest text-xs shadow-2xl shadow-amber-600/30">
                        Explore Collection
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {activeBanners.length > 1 && (
            <>
              <button onClick={prevBanner} className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all">
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              <button onClick={nextBanner} className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRightIcon className="w-6 h-6" />
              </button>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-2">
                {activeBanners.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentBannerIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentBannerIndex ? 'bg-amber-600 w-8' : 'bg-white/50'}`}></button>
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        /* Fallback Hero */
        <section className="relative h-[85vh] flex items-center">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1594932224828-b4b059b6f6f9?q=80&w=2080&auto=format&fit=crop" alt="Hero" className="w-full h-full object-cover brightness-[0.65]" />
          </div>
          <div className="container mx-auto px-4 relative z-10 text-white">
            <div className="max-w-2xl">
              <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight serif tracking-tighter">The Art of <br/>Bespoke Fitting.</h1>
              <p className="text-xl mb-12 text-slate-100 font-light max-w-lg leading-relaxed">Heritage precision. Artisan tailoring and premium fabrics sourced globally.</p>
              <Link to="/shop" className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-5 font-bold transition-all text-center uppercase tracking-widest text-xs shadow-2xl shadow-amber-600/30">Explore Shop</Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 mb-20 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
               <span className="w-8 h-px bg-amber-600"></span>
               <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-600">Season's Best</span>
            </div>
            <h2 className="text-5xl font-bold serif tracking-tight">Masterpiece Collection</h2>
          </div>
          <Link to="/shop" className="text-slate-900 font-bold border-b-2 border-slate-900 pb-1 hover:text-amber-600 hover:border-amber-600 transition-all mt-6 md:mt-0 uppercase tracking-widest text-xs">View Entire Archive</Link>
        </div>
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {featured.map(product => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-50 mb-6 rounded-2xl transition-all duration-500 group-hover:shadow-2xl">
                <img src={product.image} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" alt={product.name} />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-500"></div>
                <Link to={`/product/${product.id}`} className="absolute bottom-6 left-6 right-6 bg-white text-slate-900 py-4 text-center text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 shadow-xl">
                  Inspect Item
                </Link>
              </div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">{product.category}</p>
              <h4 className="text-xl font-bold serif mb-2 text-slate-900">{product.name}</h4>
              <div className="flex items-center space-x-3 font-bold">
                {product.discountPrice ? (
                  <>
                    <span className="text-amber-700">BDT {product.discountPrice.toLocaleString()}</span>
                    <span className="text-slate-300 line-through text-sm">BDT {product.price.toLocaleString()}</span>
                  </>
                ) : (
                  <span className="text-slate-900">BDT {product.price.toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center mb-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-600 mb-4 block">Testimonials</span>
          <h2 className="text-5xl font-bold serif tracking-tight">Our Patron's Voice</h2>
          <button 
            onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
            className="mt-8 bg-slate-900 text-white px-10 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition shadow-xl"
          >
            {isReviewFormOpen ? 'Cancel Review' : 'Share Your Experience'}
          </button>
        </div>

        {isReviewFormOpen && (
          <div className="container mx-auto px-4 max-w-2xl mb-24 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
              {reviewSubmitted ? (
                <div className="text-center py-10">
                  <CheckCircleIcon className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold serif mb-2">Review Submitted</h3>
                  <p className="text-slate-500">Thank you for your voice. Our team will review and publish it shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  <div className="flex justify-center space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button 
                        key={num} 
                        type="button" 
                        onClick={() => setReviewForm({...reviewForm, rating: num})}
                        className={`p-2 transition-all ${reviewForm.rating >= num ? 'text-amber-500 scale-110' : 'text-slate-200'}`}
                      >
                        <StarIcon className="w-8 h-8" />
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Your Name</label>
                    <input 
                      required
                      value={reviewForm.name}
                      onChange={e => setReviewForm({...reviewForm, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition"
                      placeholder="e.g. Arif Ahmed"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Your Experience</label>
                    <textarea 
                      required
                      rows={4}
                      value={reviewForm.comment}
                      onChange={e => setReviewForm({...reviewForm, comment: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-amber-600/5 transition resize-none"
                      placeholder="Describe your bespoke journey..."
                    />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition">
                    Publish My Review
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
          {approvedReviews.length > 0 ? (
            approvedReviews.map(review => (
              <div key={review.id} className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 group">
                <div className="flex space-x-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-amber-500" />
                  ))}
                </div>
                <p className="text-slate-600 mb-10 leading-relaxed font-light italic">"{review.comment}"</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold serif text-xl group-hover:bg-amber-600 transition-colors">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">{review.userName}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{review.date}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-20 bg-white/50 rounded-[3rem] border border-dashed border-slate-200">
               <ChatBubbleBottomCenterTextIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No patron reviews published yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
