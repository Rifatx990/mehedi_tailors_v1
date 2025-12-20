
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext.tsx';
import { 
  StarIcon, 
  SparklesIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  TagIcon,
  XMarkIcon,
  GiftIcon
} from '@heroicons/react/24/solid';

const HomePage: React.FC = () => {
  const { products, banners, offers, notices, systemConfig, partnerBrands } = useStore();
  const navigate = useNavigate();
  
  const featured = products.filter(p => p.isFeatured).slice(0, 4);
  const activeBanners = banners.filter(b => b.isActive);
  const activeOffers = offers.filter(o => o.isActive);
  const activeNotices = notices.filter(n => n.isActive);
  const activeBrands = partnerBrands.filter(b => b.isActive);

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [homeSearch, setHomeSearch] = useState('');
  const [closedNoticeId, setClosedNoticeId] = useState<string | null>(null);

  useEffect(() => {
    if (activeBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex(prev => (prev + 1) % activeBanners.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [activeBanners]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearch.trim()) navigate(`/shop?q=${encodeURIComponent(homeSearch)}`);
  };

  return (
    <div className="overflow-x-hidden">
      {/* Global Notice Broadcaster */}
      {activeNotices.length > 0 && activeNotices[0].id !== closedNoticeId && (
        <div className={`py-3 px-6 text-center relative transition-all duration-700 animate-in slide-in-from-top-full ${
          activeNotices[0].type === 'warning' ? 'bg-red-600' : 'bg-slate-900'
        } text-white`}>
          <div className="container mx-auto flex items-center justify-center space-x-3">
            <SparklesIcon className="w-4 h-4 text-amber-500" />
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">{activeNotices[0].content}</p>
          </div>
          <button onClick={() => setClosedNoticeId(activeNotices[0].id)} className="absolute right-4 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform">
            <XMarkIcon className="w-5 h-5 opacity-40 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* Cinematic Studio Hero */}
      <section className="relative h-[85vh] md:h-[95vh] overflow-hidden bg-slate-950">
        {activeBanners.length > 0 ? (
          activeBanners.map((banner, idx) => (
            <div key={banner.id} className={`absolute inset-0 transition-opacity duration-[2500ms] ease-in-out ${idx === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className={`absolute inset-0 transition-transform duration-[15000ms] ease-linear ${idx === currentBannerIndex ? 'scale-110' : 'scale-100'}`}>
                <img src={banner.imageUrl} className="w-full h-full object-cover brightness-[0.35]" alt="" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/40"></div>
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6 md:px-12 z-20 text-white">
                  <div className={`max-w-4xl transition-all duration-1000 transform ${idx === currentBannerIndex ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    <div className="flex items-center space-x-4 mb-10">
                       <span className="w-12 h-px bg-amber-500"></span>
                       <span className="text-[10px] font-black uppercase tracking-[0.6em] text-amber-500">Savar's Bespoke Heritage</span>
                    </div>
                    <h1 className="text-5xl md:text-[8rem] font-black mb-12 leading-[0.85] serif tracking-tighter drop-shadow-3xl">
                      {banner.title}
                    </h1>
                    <form onSubmit={handleSearch} className="mb-14 relative max-w-xl group">
                       <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                       <input 
                          value={homeSearch} onChange={e => setHomeSearch(e.target.value)}
                          className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 pl-16 pr-6 py-6 md:py-8 rounded-[2rem] outline-none focus:ring-4 focus:ring-amber-500/10 focus:bg-white/10 transition-all font-bold text-white text-lg" 
                          placeholder="Search Artisan Archive..."
                       />
                       <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-amber-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-slate-950 transition-all shadow-2xl">Locate</button>
                    </form>
                    <div className="flex flex-col sm:flex-row gap-6">
                      <Link to="/shop" className="bg-amber-600 hover:bg-white hover:text-slate-950 text-white px-16 py-6 font-black text-center uppercase tracking-[0.3em] text-[10px] shadow-3xl flex items-center justify-center space-x-4 transition-all active:scale-95">
                        <span>Explore Catalog</span>
                        <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                      <Link to="/custom-tailoring" className="bg-white/5 backdrop-blur-xl hover:bg-white/10 text-white border border-white/10 px-16 py-6 font-bold text-center uppercase tracking-[0.3em] text-[10px] transition-all">Private Consultation</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-mono text-[10px] uppercase tracking-[0.5em]">Establishing Global Media Feed...</div>
        )}
      </section>

      {/* Partner Alliance Marquee */}
      {activeBrands.length > 0 && (
        <section className="py-20 bg-white border-b border-slate-50 overflow-hidden">
           <div className="container mx-auto px-6 mb-12">
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300 text-center">Curated Textile Partnerships</p>
           </div>
           <div className="relative flex overflow-x-hidden group">
              <div className="flex space-x-20 md:space-x-40 animate-marquee whitespace-nowrap py-4">
                 {[...activeBrands, ...activeBrands, ...activeBrands].map((brand, idx) => (
                    <div key={`${brand.id}-${idx}`} className="flex flex-col items-center flex-shrink-0 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all duration-700 cursor-pointer">
                       <img src={brand.logo} alt={brand.name} className="h-8 md:h-12 w-auto object-contain" referrerPolicy="no-referrer" />
                       <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 mt-4">{brand.name}</span>
                    </div>
                 ))}
              </div>
           </div>
        </section>
      )}

      {/* Featured Bespoke Highlights */}
      <section className="py-32 md:py-48 bg-white">
        <div className="container mx-auto px-6 mb-24">
            <div className="flex items-center space-x-4 mb-6">
               <span className="w-12 h-px bg-amber-600"></span>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-600">Limited Ready-to-Wear</span>
            </div>
            <h2 className="text-4xl md:text-7xl font-bold serif tracking-tighter text-slate-950">Bespoke Highlights</h2>
        </div>
        <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {featured.map(product => (
            <Link key={product.id} to={`/product/${product.id}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 mb-8 rounded-[3rem] transition-all duration-700 group-hover:shadow-3xl border border-slate-50">
                <img src={product.image} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" alt={product.name} />
                <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/10 transition-colors duration-500"></div>
              </div>
              <p className="text-[9px] text-amber-600 uppercase tracking-[0.4em] font-black mb-3">{product.category}</p>
              <h4 className="text-2xl font-bold serif text-slate-900 mb-2 tracking-tight">{product.name}</h4>
              <p className="font-black text-sm text-slate-400">BDT {product.price.toLocaleString()}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* High-Contrast Benefits Section */}
      <section className="py-32 md:py-48 bg-slate-950 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
               <div className="max-w-2xl">
                  <div className="flex items-center space-x-3 text-amber-500 mb-4">
                     <TagIcon className="w-6 h-6" />
                     <span className="text-[10px] font-black uppercase tracking-[0.4em]">Atelier Opportunities</span>
                  </div>
                  <h2 className="text-5xl md:text-8xl font-bold serif text-white tracking-tighter leading-[0.9]">Seasonal <br/>Advantages.</h2>
               </div>
               <Link to="/shop" className="text-amber-500 font-black uppercase tracking-widest text-[11px] border-b-2 border-amber-500/20 pb-2 hover:border-amber-500 transition-all flex items-center space-x-3">
                  <span>Explore Promotion Hub</span>
                  <ArrowRightIcon className="w-4 h-4" />
               </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {activeOffers.slice(0, 2).map(offer => (
                  <Link key={offer.id} to={offer.linkUrl || "/shop"} className="group bg-white/5 backdrop-blur-3xl rounded-[3.5rem] border border-white/10 overflow-hidden flex flex-col md:flex-row hover:bg-white/10 transition-all duration-700">
                     <div className="md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden">
                        <img src={offer.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" alt="" />
                     </div>
                     <div className="md:w-3/5 p-12 md:p-16 flex flex-col justify-between text-white">
                        <div>
                           <span className="bg-amber-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest inline-block mb-10 shadow-3xl">{offer.discountTag}</span>
                           <h3 className="text-3xl md:text-4xl font-bold serif mb-6 tracking-tight">{offer.title}</h3>
                           <p className="text-slate-400 text-base leading-relaxed mb-12 font-light italic">"{offer.description}"</p>
                        </div>
                        <div className="flex items-center space-x-4 text-amber-500 group-hover:translate-x-3 transition-transform">
                           <span className="text-[11px] font-black uppercase tracking-widest">Apply To Commission</span>
                           <ArrowRightIcon className="w-5 h-5" />
                        </div>
                     </div>
                  </Link>
               ))}
            </div>
         </div>
      </section>

      {/* Global Artisan Gift Engine */}
      {systemConfig.giftCardsEnabled && (
        <section className="py-32 md:py-56 bg-white">
           <div className="container mx-auto px-6">
              <div className="bg-slate-900 rounded-[4rem] p-12 md:p-32 text-white flex flex-col lg:flex-row items-center justify-between gap-24 relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(217,119,6,0.1),transparent)] opacity-50"></div>
                 <div className="max-w-xl relative z-10">
                    <div className="flex items-center space-x-4 text-amber-500 mb-10">
                       <GiftIcon className="w-8 h-8" />
                       <span className="text-[11px] font-black uppercase tracking-[0.5em]">Artisan Liquidity</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-bold serif mb-10 leading-[0.9] tracking-tighter">The Gift of <br/><span className="text-amber-500">Perfect Precision.</span></h2>
                    <p className="text-slate-400 text-xl leading-relaxed mb-16 font-light">Share the Mehedi bespoke journey. Digital gift credits, synchronized globally, valid for all handcrafted collections.</p>
                    <Link to="/gift-cards" className="inline-flex items-center space-x-6 bg-white text-slate-950 px-16 py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-amber-600 hover:text-white transition-all shadow-3xl active:scale-95">
                       <span>Purchase Credits</span>
                       <ArrowRightIcon className="w-5 h-5" />
                    </Link>
                 </div>
                 <div className="relative z-10 w-full lg:w-1/2 max-w-lg">
                    <div className="aspect-[1.6/1] bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-12 md:p-16 shadow-3xl transform hover:rotate-3 hover:scale-105 transition-all duration-[1500ms] ease-out">
                       <div className="flex justify-between items-start mb-16">
                          <p className="text-[11px] font-black uppercase text-amber-500 tracking-[0.4em]">Mehedi Global Voucher</p>
                          <SparklesIcon className="w-12 h-12 text-amber-600/20" />
                       </div>
                       <p className="text-6xl font-black tracking-tighter mb-4">BDT 10,000</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Validated for Artisan Use Only</p>
                       <div className="mt-16 flex justify-between items-end border-t border-white/5 pt-10">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Savar • Ashulia • Global Reach</p>
                          <div className="w-10 h-10 rounded-2xl bg-amber-600 shadow-xl shadow-amber-600/30"></div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
