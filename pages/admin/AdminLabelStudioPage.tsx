
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PrinterIcon, 
  QrCodeIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  CameraIcon,
  XMarkIcon,
  TrashIcon,
  CheckCircleIcon,
  SparklesIcon,
  QueueListIcon
} from '@heroicons/react/24/outline';
import { Product } from '../../types.ts';

interface QueueItem {
  productId: string;
  quantity: number;
}

const AdminLabelStudioPage: React.FC = () => {
  const { products } = useStore();
  const [search, setSearch] = useState('');
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'success'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const addToQueue = (id: string) => {
    setQueue(prev => {
      const exists = prev.find(item => item.productId === id);
      if (exists) return prev.map(item => item.productId === id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { productId: id, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setQueue(prev => prev.map(item => {
      if (item.productId === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(item => item.productId !== id));
  };

  const startScanner = async () => {
    setIsScannerOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Camera access is required for the SKU scanner.");
      setIsScannerOpen(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    }
    setIsScannerOpen(false);
  };

  const simulateScan = (productId: string) => {
    addToQueue(productId);
    setScanStatus('success');
    setTimeout(() => setScanStatus('idle'), 800);
  };

  const getRichQrUrl = (product: Product) => {
    const baseUrl = window.location.origin + `/#/product/${product.id}`;
    // Industrial Standard Minimized JSON for efficient scanning
    const data = JSON.stringify({
      id: product.id,
      p: product.price,
      s: product.availableSizes[0] || 'N/A',
      c: product.colors[0] || 'Multi',
      q: product.fabricType.substring(0, 10),
      u: baseUrl
    });
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}&ecc=M&margin=10`;
  };

  const totalLabels = queue.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        
        <div className="no-print">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <h1 className="text-4xl font-bold serif text-slate-900">Label Studio</h1>
              <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest font-bold">Industrial Batch Production</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={startScanner}
                className="bg-teal-600 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-xl shadow-teal-600/20 active:scale-95 transition-all"
              >
                <CameraIcon className="w-5 h-5" />
                <span>SKU Scanner</span>
              </button>
              <button 
                onClick={() => window.print()}
                disabled={queue.length === 0}
                className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-xl shadow-slate-200 disabled:opacity-50 active:scale-95 transition-all"
              >
                <PrinterIcon className="w-5 h-5" />
                <span>Print Batch ({totalLabels})</span>
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-8 flex items-center px-8">
                <MagnifyingGlassIcon className="w-5 h-5 text-slate-300 mr-4" />
                <input 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter inventory to add to batch..." 
                  className="flex-grow bg-transparent outline-none text-sm font-medium" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group">
                    <img src={product.image} className="w-24 h-32 object-cover rounded-xl mb-4 shadow-inner" />
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{product.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 mb-4">{product.fabricType}</p>
                    <button 
                      onClick={() => addToQueue(product.id)}
                      className="w-full py-3 bg-slate-50 text-slate-900 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all flex items-center justify-center space-x-2"
                    >
                      <PlusIcon className="w-3 h-3" />
                      <span>Queue SKU</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden sticky top-28">
                <div className="bg-slate-900 p-8 text-white">
                   <div className="flex items-center space-x-3 mb-1">
                      <QueueListIcon className="w-5 h-5 text-amber-500" />
                      <h2 className="text-lg font-bold serif">Batch Pipeline</h2>
                   </div>
                   <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{queue.length} Unique SKUs</p>
                </div>
                
                <div className="p-6 max-h-[500px] overflow-y-auto no-scrollbar space-y-4">
                  {queue.length === 0 ? (
                    <div className="py-20 text-center">
                      <QrCodeIcon className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Queue is clear</p>
                    </div>
                  ) : (
                    queue.map(item => {
                      const p = products.find(x => x.id === item.productId);
                      if (!p) return null;
                      return (
                        <div key={item.productId} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group animate-in slide-in-from-right-4">
                           <div className="flex items-center space-x-4">
                              <img src={p.image} className="w-10 h-14 object-cover rounded-lg" />
                              <div>
                                <p className="text-xs font-bold text-slate-900 truncate max-w-[100px]">{p.name}</p>
                                <p className="text-[9px] text-teal-600 font-bold">BDT {p.price.toLocaleString()}</p>
                              </div>
                           </div>
                           <div className="flex items-center space-x-4">
                              <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1">
                                 <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:text-teal-600 transition"><MinusIcon className="w-3 h-3" /></button>
                                 <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                 <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:text-teal-600 transition"><PlusIcon className="w-3 h-3" /></button>
                              </div>
                              <button onClick={() => removeFromQueue(item.productId)} className="text-slate-300 hover:text-red-500 transition"><TrashIcon className="w-4 h-4" /></button>
                           </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {queue.length > 0 && (
                  <div className="p-8 border-t border-slate-100 bg-slate-50/50">
                    <button 
                      onClick={() => setQueue([])}
                      className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition"
                    >
                      Clear Queue
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {isScannerOpen && (
          <div className="fixed inset-0 z-[200] bg-slate-900/95 flex flex-col items-center justify-center p-6 no-print">
            <button onClick={stopScanner} className="absolute top-10 right-10 text-white/50 hover:text-white transition"><XMarkIcon className="w-12 h-12" /></button>
            <div className={`relative w-full max-w-lg aspect-square rounded-[3rem] overflow-hidden border-4 transition-all duration-300 ${scanStatus === 'success' ? 'border-teal-500 scale-105' : 'border-white/20'}`}>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-teal-500/50 rounded-3xl relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-500 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-500 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-500 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-500 rounded-br-xl"></div>
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-teal-500/30 animate-pulse"></div>
                </div>
              </div>
              {scanStatus === 'success' && <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center"><CheckCircleIcon className="w-24 h-24 text-white" /></div>}
            </div>
            <div className="mt-12 text-center text-white">
              <h2 className="text-2xl font-bold serif mb-2">Live SKU Recognition</h2>
              <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">Scan a label to automatically queue it for batch printing.</p>
              <div className="flex flex-wrap justify-center gap-4">
                {products.slice(0, 3).map(p => (
                  <button key={p.id} onClick={() => simulateScan(p.id)} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl text-[9px] font-bold uppercase tracking-widest border border-white/5">Simulate: {p.id}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="hidden print:block">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {queue.map(item => {
              const product = products.find(x => x.id === item.productId);
              if (!product) return null;
              return Array.from({ length: item.quantity }).map((_, idx) => (
                <div 
                  key={`${item.productId}-${idx}`} 
                  className="w-full h-[3.8in] border border-slate-300 p-8 flex items-center justify-between bg-white overflow-hidden relative"
                  style={{ breakInside: 'avoid' }}
                >
                  <div className="flex flex-col h-full justify-between max-w-[55%]">
                    <div>
                      <h2 className="text-xl font-black tracking-tighter text-slate-900 border-b-2 border-slate-900 pb-1 mb-4 inline-block uppercase">Mehedi Bespoke</h2>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2 uppercase">{product.name}</h3>
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Class: <span className="text-slate-900">{product.fabricType}</span></p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Spec: <span className="text-slate-900">{product.availableSizes[0] || 'STD'}</span></p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Tone: <span className="text-slate-900">{product.colors[0] || 'Multi'}</span></p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Retail Value</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tighter">BDT {product.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center w-[40%] h-full border-l border-slate-100 pl-6">
                    <div className="w-full aspect-square p-2 bg-white mb-2 border border-slate-50">
                      <img src={getRichQrUrl(product)} className="w-full h-full" alt="QR" />
                    </div>
                    <p className="text-[8px] font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-full uppercase">SKU: {product.id}</p>
                  </div>
                  <div className="absolute top-0 right-0 h-full w-4 bg-slate-900 flex items-center justify-center">
                    <p className="text-[7px] text-white font-bold uppercase tracking-[0.5em] rotate-90 whitespace-nowrap">ATELIER ASHULIA</p>
                  </div>
                </div>
              ));
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLabelStudioPage;
