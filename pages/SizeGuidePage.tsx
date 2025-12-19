
import React, { useState } from 'react';

const SizeGuidePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'men' | 'women'>('men');

  const menSizes = [
    { label: 'S', neck: '14.5"', chest: '38"', sleeve: '32"', shoulder: '17"' },
    { label: 'M', neck: '15.5"', chest: '40"', sleeve: '33"', shoulder: '18"' },
    { label: 'L', neck: '16.5"', chest: '42"', sleeve: '34"', shoulder: '19"' },
    { label: 'XL', neck: '17.5"', chest: '44"', sleeve: '35"', shoulder: '20"' },
    { label: 'XXL', neck: '18.5"', chest: '46"', sleeve: '36"', shoulder: '21"' },
  ];

  const womenSizes = [
    { label: 'XS', bust: '32"', waist: '26"', hip: '35"' },
    { label: 'S', bust: '34"', waist: '28"', hip: '37"' },
    { label: 'M', bust: '36"', waist: '30"', hip: '39"' },
    { label: 'L', bust: '38"', waist: '32"', hip: '41"' },
    { label: 'XL', bust: '40"', waist: '34"', hip: '43"' },
  ];

  return (
    <div className="py-20 bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-bold serif mb-4 text-center">Size Guide</h1>
        <p className="text-slate-500 text-center mb-12">Standard measurements for our ready-to-wear collections.</p>

        <div className="bg-white rounded-[40px] shadow-xl overflow-hidden border border-slate-100">
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab('men')}
              className={`flex-1 py-6 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'men' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
            >
              Men's Collections
            </button>
            <button 
              onClick={() => setActiveTab('women')}
              className={`flex-1 py-6 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'women' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900'}`}
            >
              Women's Collections
            </button>
          </div>

          <div className="p-8 md:p-12 overflow-x-auto">
            {activeTab === 'men' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Size</th>
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Neck</th>
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Chest</th>
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Sleeve</th>
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Shoulder</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {menSizes.map(s => (
                    <tr key={s.label} className="border-b border-slate-50 last:border-none">
                      <td className="py-6 font-bold text-slate-900">{s.label}</td>
                      <td className="py-6">{s.neck}</td>
                      <td className="py-6">{s.chest}</td>
                      <td className="py-6">{s.sleeve}</td>
                      <td className="py-6">{s.shoulder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Size</th>
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Bust</th>
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Waist</th>
                    <th className="py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Hip</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600">
                  {womenSizes.map(s => (
                    <tr key={s.label} className="border-b border-slate-50 last:border-none">
                      <td className="py-6 font-bold text-slate-900">{s.label}</td>
                      <td className="py-6">{s.bust}</td>
                      <td className="py-6">{s.waist}</td>
                      <td className="py-6">{s.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-8">Not finding your size? Our bespoke service ensures a perfect fit.</p>
          <a href="#/custom-tailoring" className="inline-block bg-amber-600 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-amber-700 transition shadow-lg shadow-amber-100">
            Switch to Bespoke
          </a>
        </div>
      </div>
    </div>
  );
};

export default SizeGuidePage;
