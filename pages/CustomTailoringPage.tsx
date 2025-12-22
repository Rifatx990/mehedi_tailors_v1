import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { 
  SparklesIcon, 
  ChevronRightIcon, 
  ChevronLeftIcon, 
  CheckCircleIcon,
  SwatchIcon,
  AdjustmentsHorizontalIcon,
  ChatBubbleLeftRightIcon,
  ScissorsIcon,
  CalendarDaysIcon,
  ClockIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { BespokeType } from '../types.ts';

const CustomTailoringPage: React.FC = () => {
  const { addToCart, fabrics, bespokeServices } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [garmentType, setGarmentType] = useState('Shirt');
  const [selectedFabric, setSelectedFabric] = useState(fabrics[0]?.id || '');
  const [selectedColor, setSelectedColor] = useState('Navy');
  const [bespokeType, setBespokeType] = useState<BespokeType>('Normal');
  const [bespokeNote, setBespokeNote] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  
  const [designOptions, setDesignOptions] = useState({
    collar: 'Classic',
    cuff: 'Single Button',
    pocket: 'Standard',
    fit: 'Slim Fit'
  });
  const [measurements, setMeasurements] = useState({
    neck: 0,
    chest: 0,
    waist: 0,
    shoulder: 0,
    sleeveLength: 0,
    length: 0,
    label: 'Default'
  });

  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const activeServices = bespokeServices.filter(s => s.isActive);

  useEffect(() => {
    if (location.state && (location.state as any).garmentType) {
      setGarmentType((location.state as any).garmentType);
    }
    // Default delivery date: 10 days from now
    const date = new Date();
    date.setDate(date.getDate() + 10);
    setDeliveryDate(date.toISOString().split('T')[0]);
  }, [location.state]);

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const getAiDesignAdvice = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `As a master tailor at Mehedi Tailors, suggest a design for a bespoke ${garmentType}. The customer has selected ${selectedColor} fabric. Recommend a collar type, cuff style, and an occasion for this look. Keep it to 2 elegant sentences.`;
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiSuggestion(response.text || "For this piece, we recommend a Mandarin collar for a regal look, best paired with clean-cut trousers for wedding festivities.");
    } catch (e) {
      setAiSuggestion("A spread collar with double cuffs would elevate this garment, making it ideal for formal evening galas.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleComplete = () => {
    const currentFabric = fabrics.find(f => f.id === selectedFabric);
    const service = activeServices.find(s => s.name === garmentType);
    
    const customItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: 'custom-garment',
      name: `Bespoke ${garmentType} - ${currentFabric?.name || 'Artisan Fabric'}`,
      image: currentFabric?.image || 'https://picsum.photos/seed/bespoke/600/800',
      quantity: 1,
      isCustomOrder: true,
      measurements: measurements,
      designOptions: designOptions,
      selectedFabric: currentFabric?.name,
      selectedColor: selectedColor,
      price: service?.basePrice || 2500,
      bespokeNote,
      bespokeType,
      deliveryDate
    };
    addToCart(customItem);
    navigate('/cart');
  };

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row">
          
          {/* Progress Sidebar */}
          <div className="bg-slate-900 md:w-80 p-12 text-white flex flex-col">
            <div className="mb-12">
              <h1 className="text-3xl font-bold serif tracking-tight">Bespoke Journey</h1>
              <p className="text-slate-400 text-xs uppercase tracking-widest mt-2">Crafting Excellence</p>
            </div>
            
            <div className="flex-grow space-y-8">
              {[
                { s: 1, l: 'Garment Style' },
                { s: 2, l: 'Fabric & Color' },
                { s: 3, l: 'Design Details' },
                { s: 4, l: 'Handover Specs' },
                { s: 5, l: 'Final Review' }
              ].map(item => (
                <div key={item.s} className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step >= item.s ? 'bg-amber-600 border-amber-600' : 'border-slate-700 text-slate-500'}`}>
                    {step > item.s ? <CheckCircleIcon className="w-5 h-5" /> : item.s}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= item.s ? 'text-white' : 'text-slate-600'}`}>{item.l}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-white/5 p-6 rounded-2xl border border-white/10 hidden md:block">
              <div className="flex items-center space-x-2 text-amber-500 mb-2">
                <SparklesIcon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Heritage Quality</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed italic">"Every stitch is a promise of precision and heritage."</p>
            </div>
          </div>

          {/* Main Form Area */}
          <div className="flex-grow p-10 md:p-16 relative">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-3xl font-bold serif mb-2">Select Your Canvas</h2>
                <p className="text-slate-400 text-sm mb-10">Choose the garment type you wish to customize.</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeServices.map(service => (
                    <button
                      key={service.id}
                      onClick={() => { setGarmentType(service.name); handleNext(); }}
                      className={`p-10 border-2 rounded-[2.5rem] transition flex flex-col items-center space-y-4 group ${garmentType === service.name ? 'border-amber-600 bg-amber-50 shadow-xl shadow-amber-600/10 scale-[1.02]' : 'border-slate-50 hover:border-slate-200 bg-slate-50/50'}`}
                    >
                      <div className="text-5xl group-hover:scale-110 transition-transform">{service.icon}</div>
                      <div className="text-center">
                        <span className="font-bold text-slate-900 block">{service.name}</span>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">From BDT {service.basePrice.toLocaleString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-3xl font-bold serif mb-2">Select Material</h2>
                <p className="text-slate-400 text-sm mb-10">Premium fabrics sourced from world-class mills.</p>
                
                <div className="mb-10">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Available Fabrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {fabrics.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFabric(f.id)}
                        className={`p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center ${selectedFabric === f.id ? 'border-amber-600 bg-amber-50 shadow-lg' : 'border-slate-50 bg-slate-50 opacity-60'}`}
                      >
                        <img src={f.image} className="w-full aspect-square object-cover rounded-2xl mb-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900">{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Color Palette</h3>
                  <div className="flex flex-wrap gap-3">
                    {['Navy', 'Charcoal', 'Ivory', 'Deep Maroon', 'Emerald', 'Black', 'Sky Blue'].map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-6 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all ${selectedColor === color ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-3xl font-bold serif mb-2">Design Nuances</h2>
                <p className="text-slate-400 text-sm mb-10">Personalize the technical details of your {garmentType}.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3">Collar Style</label>
                      <select 
                        value={designOptions.collar}
                        onChange={e => setDesignOptions({...designOptions, collar: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-600/10"
                      >
                        <option>Classic Point</option>
                        <option>Mandarin</option>
                        <option>Wide Spread</option>
                        <option>Button Down</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3">Cuff Detail</label>
                      <select 
                        value={designOptions.cuff}
                        onChange={e => setDesignOptions({...designOptions, cuff: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-600/10"
                      >
                        <option>Single Button</option>
                        <option>French Cuff</option>
                        <option>Double Button</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3">Pocket Layout</label>
                      <select 
                        value={designOptions.pocket}
                        onChange={e => setDesignOptions({...designOptions, pocket: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-amber-600/10"
                      >
                        <option>No Pocket</option>
                        <option>Single Left</option>
                        <option>Dual Flap</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3">Silhouette Fit</label>
                      <div className="flex gap-2">
                        {['Slim Fit', 'Regular', 'Relaxed'].map(fit => (
                          <button
                            key={fit}
                            onClick={() => setDesignOptions({...designOptions, fit})}
                            className={`flex-1 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${designOptions.fit === fit ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-300'}`}
                          >
                            {fit}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Design Button */}
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center space-x-2 text-amber-500 mb-4">
                      <SparklesIcon className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Mehedi AI Consultant</span>
                    </div>
                    {aiSuggestion ? (
                      <p className="text-sm italic font-light animate-in fade-in duration-700">"{aiSuggestion}"</p>
                    ) : (
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <p className="text-xs text-slate-400 max-w-sm">Not sure about the details? Let our AI Stylist suggest the perfect technical options for your {garmentType}.</p>
                        <button 
                          onClick={getAiDesignAdvice}
                          disabled={isAiLoading}
                          className="bg-amber-600 text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-amber-700 transition shadow-lg shadow-amber-600/20 whitespace-nowrap"
                        >
                          {isAiLoading ? "Consulting..." : "Suggest Design"}
                        </button>
                      </div>
                    )}
                  </div>
                  <ChatBubbleLeftRightIcon className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform duration-1000" />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-3xl font-bold serif mb-2">Handover Specifications</h2>
                <p className="text-slate-400 text-sm mb-10">Calibrate delivery priority and artisan directives.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4 flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4" />
                        <span>Commission Priority</span>
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                         {(['Normal', 'Express', 'Urgent'] as BespokeType[]).map(type => (
                           <button
                             key={type}
                             onClick={() => setBespokeType(type)}
                             className={`py-4 rounded-2xl font-bold uppercase text-[9px] tracking-widest border transition-all ${bespokeType === type ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                           >
                             {type}
                           </button>
                         ))}
                      </div>
                      <p className="text-[8px] text-slate-400 mt-2 italic">*Urgent & Express may incur artisan overtime surcharges.</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4 flex items-center space-x-2">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span>Target Delivery Date</span>
                      </label>
                      <input 
                        type="date" 
                        value={deliveryDate}
                        onChange={e => setDeliveryDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-amber-600/10" 
                      />
                    </div>
                  </div>

                  <div className="space-y-8">
                     <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4 flex items-center space-x-2">
                          <PencilSquareIcon className="w-4 h-4" />
                          <span>Artisan Directives (Notes)</span>
                        </label>
                        <textarea 
                          value={bespokeNote}
                          onChange={e => setBespokeNote(e.target.value)}
                          rows={6}
                          placeholder="e.g. Include hidden interior pocket for watch, extra long sleeves (+0.5 inch)..."
                          className="w-full bg-slate-50 border border-slate-100 px-6 py-5 rounded-[2rem] outline-none focus:ring-2 focus:ring-amber-600/10 resize-none font-medium text-sm leading-relaxed"
                        />
                     </div>
                  </div>
                </div>

                <div className="mt-12 p-8 bg-teal-50 rounded-[2.5rem] border border-teal-100 flex items-start space-x-6">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-2xl flex-shrink-0">📜</div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm">Direct Atelier Protocol</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Your special notes are printed directly on the artisan's cutting sheet. Precise directives ensure your unique vision is captured in every stitch.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-3xl font-bold serif mb-2">Verification</h2>
                <p className="text-slate-400 text-sm mb-10">Review your bespoke contract details before processing.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-6">Artisan Choices</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs text-slate-400 font-bold uppercase">Garment</span>
                        <span className="text-sm font-bold text-slate-900">{garmentType}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs text-slate-400 font-bold uppercase">Fabric</span>
                        <span className="text-sm font-bold text-slate-900">{fabrics.find(f => f.id === selectedFabric)?.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-2">
                        <span className="text-xs text-slate-400 font-bold uppercase">Priority</span>
                        <span className={`text-sm font-black ${bespokeType === 'Urgent' ? 'text-rose-600' : 'text-slate-900'}`}>{bespokeType}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-xs text-slate-400 font-bold uppercase">Handover</span>
                        <span className="text-sm font-bold text-slate-900">{new Date(deliveryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-6">Design Features</h3>
                    <div className="space-y-4">
                      {Object.entries(designOptions).filter(([k]) => k !== 'fit').map(([key, val]) => (
                        <div key={key} className="flex justify-between border-b border-slate-200 pb-2 last:border-none">
                          <span className="text-xs text-slate-400 font-bold uppercase">{key}</span>
                          <span className="text-sm font-bold text-slate-900">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-10 bg-slate-900 rounded-[3rem] text-white flex justify-between items-center shadow-2xl">
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Contract Valuation</p>
                     <p className="text-4xl font-bold tracking-tighter text-amber-500">
                        BDT {(activeServices.find(s => s.name === garmentType)?.basePrice || 2500).toLocaleString()}
                     </p>
                   </div>
                   <CheckCircleIcon className="w-16 h-16 text-white/10" />
                </div>
              </div>
            )}

            <div className="mt-16 pt-10 border-t border-slate-100 flex justify-between items-center">
              {step > 1 ? (
                <button 
                  onClick={handlePrev} 
                  className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}
              
              <div className="flex space-x-4">
                {step < 5 ? (
                  <button 
                    onClick={handleNext} 
                    className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-slate-800 transition shadow-xl shadow-slate-200 flex items-center space-x-2"
                  >
                    <span>Continue</span>
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={handleComplete} 
                    className="bg-amber-600 text-white px-16 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-amber-700 transition shadow-2xl shadow-amber-600/30 flex items-center space-x-3"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Lodge Bespoke Order</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomTailoringPage;