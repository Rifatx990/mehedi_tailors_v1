
import React from 'react';

const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-bold serif mb-12">Shipping Policy</h1>
        
        <div className="prose prose-slate lg:prose-lg max-w-none space-y-12">
          <section>
            <h2 className="text-2xl font-bold serif text-slate-900 mb-4">Local Delivery (Dhaka, Savar & Ashulia)</h2>
            <p className="text-slate-600 leading-relaxed">
              We provide express delivery to our local patrons in Dhaka City, Savar, and Ashulia. 
              Ready-to-wear items are typically delivered within 24-48 hours. 
              Bespoke orders require 7-10 days for handcrafted production before shipment.
            </p>
            <ul className="list-disc pl-5 mt-4 text-slate-600 space-y-2">
              <li>Inside Savar/Ashulia: BDT 60 (Free on orders over BDT 2,000)</li>
              <li>Inside Dhaka City: BDT 100 (Free on orders over BDT 5,000)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold serif text-slate-900 mb-4">Nationwide Shipping</h2>
            <p className="text-slate-600 leading-relaxed">
              For customers outside Dhaka, we use reliable courier services (SA Poribohon, Sundarban, or Pathao). 
              Delivery typically takes 3-5 business days after the production period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold serif text-slate-900 mb-4">International Shipping</h2>
            <p className="text-slate-600 leading-relaxed">
              Mehedi Tailors ships worldwide via DHL and FedEx. Shipping costs are calculated at checkout 
              based on the weight of the fabrics and the destination country. Customs duties and taxes 
              are the responsibility of the recipient.
            </p>
          </section>

          <section className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h3 className="text-xl font-bold serif mb-4">Order Tracking</h3>
            <p className="text-slate-600">
              Once your order is dispatched, you will receive an SMS and email with your tracking number. 
              You can also track your bespoke production progress via our <a href="#/track-order" className="text-amber-600 font-bold">Tracking Portal</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicyPage;
