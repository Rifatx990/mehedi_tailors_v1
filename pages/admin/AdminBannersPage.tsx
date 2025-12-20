
import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PlusIcon, 
  TrashIcon, 
  PhotoIcon, 
  XMarkIcon, 
  CheckCircleIcon, 
  NoSymbolIcon, 
  PencilSquareIcon, 
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  PlayIcon,
  CloudArrowUpIcon,
  GlobeAltIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import { Banner } from '../../types.ts';

const AdminBannersPage: React.FC = () => {
  const { banners, addBanner, updateBanner, removeBanner } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ title: '', subtitle: '', imageUrl: '', linkUrl: '', isActive: true });

  const normalizeUrl = (url: string) => {
    if (!url) return '';
    let processed = url.trim();
    if (processed.includes('imgur.com') && !processed.includes('i.imgur.com')) {
      const match = processed.match(/imgur\.com\/(?:gallery\/|a\/|r\/[^\/]+\/)?([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        return `https://i.imgur.com/${match[1]}.png`;
      }
    }
    return processed;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bannerData: Banner = {
      id: editingBanner ? editingBanner.id : 'B-' + Date.now(),
      title: form.title,
      subtitle: form.subtitle,
      imageUrl: imageSource === 'url' ? normalizeUrl(form.imageUrl) : form.imageUrl,
      linkUrl: form.linkUrl,
      isActive: form.isActive
    };
    if (editingBanner) await updateBanner(bannerData);
    else await addBanner(bannerData);
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const activeCount = banners.filter(b => b.isActive).length;

  const openAddModal = () => {
    setEditingBanner(null);
    setForm({ title:'', subtitle:'', imageUrl:'', linkUrl:'', isActive:true });
    setImageSource('upload');
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setForm(banner);
    setImageSource(banner.imageUrl.startsWith('data:') ? 'upload' : 'url');
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-6 md:p-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center space-x-3 text-amber-600 mb-2">
              <span className="w-8 h-px bg-amber-600"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Banner Show System</span>
            </div>
            <h1 className="text-4xl font-bold serif text-slate-900 tracking-tight">Hero Configuration</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest font-medium">Currently {activeCount} artisan assets in rotation</p>
          </div>
          <div className="flex space-x-4">
            <button 
                onClick={() => setIsPreviewOpen(true)}
                className="bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] flex items-center space-x-3 shadow-lg hover:bg-slate-50 transition-all active:scale-95"
            >
                <PlayIcon className="w-4 h-4" />
                <span>Live View System</span>
            </button>
            <button 
                onClick={openAddModal}
                className="bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-2xl shadow-slate-900/10 hover:bg-amber-600 transition-all active:scale-95"
            >
                <PlusIcon className="w-4 h-4" />
                <span>Archive New Hero</span>
            </button>
          </div>
        </header>

        {banners.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {banners.map(banner => (
              <div key={banner.id} className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 group transition-all hover:shadow-2xl hover:-translate-y-1 duration-500">
                <div className="aspect-[21/9] relative overflow-hidden bg-slate-100">
                  <img src={banner.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-[2000ms]" alt="" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors duration-500"></div>
                  
                  <div className="absolute top-6 right-6 flex space-x-3">
                    <button 
                      onClick={() => updateBanner({...banner, isActive: !banner.isActive})} 
                      className={`p-3 rounded-2xl shadow-2xl transition-all ${banner.isActive ? 'bg-emerald-500 text-white' : 'bg-white/90 backdrop-blur text-slate-400 hover:text-slate-900'}`}
                    >
                      {banner.isActive ? <CheckCircleIcon className="w-5 h-5" /> : <NoSymbolIcon className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={() => openEditModal(banner)}
                        className="p-3 bg-white/90 backdrop-blur text-slate-600 rounded-2xl shadow-2xl hover:text-amber-600 transition-all"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-8 right-8 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 mb-1">{banner.isActive ? 'Active Showcase' : 'Archived'}</p>
                    <h3 className="text-2xl font-bold serif line-clamp-1 drop-shadow-md">{banner.title}</h3>
                  </div>
                </div>
                
                <div className="p-8 flex justify-between items-center bg-white border-t border-slate-50">
                  <div className="flex-grow pr-8 min-w-0">
                    <p className="text-xs text-slate-400 line-clamp-1 italic font-medium">"{banner.subtitle}"</p>
                    <div className="flex items-center space-x-2 mt-2 text-slate-300">
                       <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                       <span className="text-[9px] font-mono truncate">{banner.linkUrl || 'No Direct Link'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { if(window.confirm('Discard this hero slide?')) removeBanner(banner.id) }} 
                    className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm flex-shrink-0"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
             <PhotoIcon className="w-16 h-16 text-slate-100 mx-auto mb-6" />
             <h3 className="text-xl font-bold serif text-slate-400 tracking-tight">Atelier Gallery is Empty</h3>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mt-2">Add your first cinematic asset to transform the homepage.</p>
          </div>
        )}

        {/* Hero System Preview Modal */}
        {isPreviewOpen && (
            <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-3xl flex flex-col p-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-8 px-4">
                    <div>
                        <h2 className="text-white text-2xl font-bold serif">Hero System Preview</h2>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Real-time simulation of index page</p>
                    </div>
                    <button onClick={() => setIsPreviewOpen(false)} className="p-4 bg-white/10 hover:bg-white text-white hover:text-slate-950 rounded-full transition-all">
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                </div>
                <div className="flex-grow rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-3xl bg-slate-900 relative">
                    <iframe 
                        src={window.location.origin + window.location.pathname} 
                        className="w-full h-full border-none pointer-events-none" 
                        title="Live Preview"
                    />
                    <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none">
                        <div className="bg-amber-600/10 text-amber-500 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-amber-600/20 backdrop-blur-md">Interactive Visual Test</div>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.5em]">Press ESC or Close to Return to Dashboard</p>
                </div>
            </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto no-scrollbar">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-10 md:p-12 w-full max-w-4xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] relative animate-in zoom-in duration-300">
              <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-transform hover:rotate-90 duration-300"><XMarkIcon className="w-8 h-8" /></button>
              
              <div className="flex items-center space-x-4 mb-10">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold serif text-slate-900">{editingBanner ? 'Modify Showpiece' : 'Register New Showpiece'}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Cinematic Homepage Assets</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Main Narrative Header</label>
                    <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-amber-600/5 transition font-bold" placeholder="e.g. Masterpieces in Silk" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Supporting Subtitle</label>
                    <textarea rows={4} value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-[1.5rem] outline-none resize-none font-medium text-sm leading-relaxed" placeholder="Crafting heritage since 1980 with surgical precision..." />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 ml-1">Destination URL</label>
                    <input value={form.linkUrl} onChange={e => setForm({...form, linkUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-[1.5rem] outline-none font-mono text-xs" placeholder="/shop" />
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block ml-1">Artisan Media Asset</label>
                       <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                          <button type="button" onClick={() => setImageSource('upload')} className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 text-[10px] font-bold uppercase ${imageSource === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                             <CloudArrowUpIcon className="w-3.5 h-3.5" />
                             <span>Upload</span>
                          </button>
                          <button type="button" onClick={() => setImageSource('url')} className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 text-[10px] font-bold uppercase ${imageSource === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                             <GlobeAltIcon className="w-3.5 h-3.5" />
                             <span>URL</span>
                          </button>
                       </div>
                    </div>

                    {imageSource === 'upload' ? (
                       <div 
                         onClick={() => fileInputRef.current?.click()} 
                         className={`w-full aspect-video border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden relative group ${form.imageUrl ? 'border-emerald-500 bg-emerald-50/5 shadow-inner' : 'border-slate-200 bg-slate-50 hover:border-amber-600 hover:bg-white'}`}
                       >
                         {form.imageUrl && imageSource === 'upload' ? (
                           <div className="relative w-full h-full p-2">
                              <img src={form.imageUrl} className="w-full h-full object-cover rounded-[1.8rem] shadow-2xl" alt="Preview" />
                              <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <span className="bg-white text-slate-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">Replace Asset</span>
                              </div>
                           </div>
                         ) : (
                           <div className="text-center">
                             <PhotoIcon className="w-16 h-16 text-slate-200 mb-4 mx-auto group-hover:scale-110 transition-transform" />
                             <p className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">Drop Artisan Image or Click</p>
                             <p className="text-[9px] text-slate-300 mt-2 uppercase font-bold tracking-widest">Recommended size: 1920 x 800px</p>
                           </div>
                         )}
                         <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                       </div>
                    ) : (
                       <div className="space-y-4">
                          <div className="relative group">
                             <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-amber-600 transition-colors" />
                             <input 
                               value={form.imageUrl} 
                               onChange={e => setForm({...form, imageUrl: e.target.value})} 
                               className="w-full bg-slate-50 border border-slate-100 pl-12 pr-6 py-5 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-amber-600/5 transition font-mono text-xs shadow-inner" 
                               placeholder="https://i.imgur.com/..." 
                             />
                          </div>
                          {form.imageUrl && (
                            <div className="w-full aspect-video rounded-[2rem] border border-slate-100 bg-slate-50 overflow-hidden relative shadow-inner">
                               <img 
                                 src={form.imageUrl} 
                                 className="w-full h-full object-cover" 
                                 referrerPolicy="no-referrer"
                                 onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/1200x800?text=Invalid+Image+Stream'} 
                               />
                            </div>
                          )}
                       </div>
                    )}
                  </div>

                  <div className="bg-slate-950 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-2xl">
                     <div className="pl-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white">Live Showcase</h4>
                        <p className="text-[9px] text-slate-500 uppercase font-black mt-1">Activate slide on index page</p>
                     </div>
                     <button 
                        type="button"
                        onClick={() => setForm({...form, isActive: !form.isActive})}
                        className={`w-14 h-8 rounded-full transition-all relative shrink-0 ${form.isActive ? 'bg-amber-600' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-xl ${form.isActive ? 'left-7' : 'left-1'}`}></div>
                      </button>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-slate-100">
                 <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-bold uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-amber-600 active:scale-[0.99] transition-all">
                   Commit Global Banner Configuration
                 </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminBannersPage;
