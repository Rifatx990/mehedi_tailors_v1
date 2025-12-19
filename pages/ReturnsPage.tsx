
import React from 'react';

const ReturnsPage: React.FC = () => {
  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-bold serif mb-12">Returns & Exchanges</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold serif text-slate-900 mb-4">Bespoke & Custom Orders</h2>
            <p className="text-slate-600 leading-relaxed">
              Because bespoke garments are handcrafted to your specific measurements and design choices, 
              <strong> we do not accept returns or offer refunds</strong> on these items. 
              However, your satisfaction is our priority. If the fit is not as expected, we offer:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-bold mb-2">Free Alterations</h4>
                <p className="text-sm text-slate-500">Bring your garment to our Ashulia studio within 14 days for complimentary fitting adjustments.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h4 className="font-bold mb-2">Remake Guarantee</h4>
                <p className="text-sm text-slate-500">If a critical error was made in production, we will remake the item from scratch at no cost.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold serif text-slate-900 mb-4">Ready-to-Wear & Fabrics</h2>
            <p className="text-slate-600 leading-relaxed">
              Unused fabrics (not yet cut) and ready-to-wear apparel in original condition can be 
              returned or exchanged within <strong>7 days</strong> of delivery.
            </p>
            <ul className="list-disc pl-5 mt-4 text-slate-600 space-y-2 text-sm">
              <li>Items must have all original tags attached.</li>
              <li>Fabric must not have been cut, washed, or damaged.</li>
              <li>Return shipping costs are the responsibility of the customer.</li>
            </ul>
          </section>

          <section className="bg-amber-50 p-8 rounded-3xl border border-amber-100">
            <h3 className="text-xl font-bold serif mb-4 text-amber-900">How to initiate a return?</h3>
            <p className="text-amber-800 text-sm mb-6">
              Please contact our support team via WhatsApp at +8801720267213 or email returns@meheditailors.com 
              with your Order ID and photos of the item.
            </p>
            <button className="bg-amber-600 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-amber-700 transition">
              Contact Support
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;
