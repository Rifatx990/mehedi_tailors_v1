
import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="py-24 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-bold serif mb-12">Terms of Service</h1>
        <div className="prose prose-slate lg:prose-lg max-w-none space-y-8 text-slate-600">
          <section>
            <h2 className="text-2xl font-bold serif text-slate-900 mb-4">1. Bespoke Contract</h2>
            <p>
              By placing an order for "Custom Tailoring" or "Bespoke Fitting," you enter into a specialized contract for handcrafted production. Once fabric has been cut according to your measurements, the order cannot be cancelled or fully refunded.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold serif text-slate-900 mb-4">2. Measurement Accuracy</h2>
            <p>
              Customers are responsible for the accuracy of measurements provided via the digital interface. Mehedi Tailors & Fabrics is not liable for fit issues resulting from incorrect self-measurement. We highly recommend visiting our Ashulia studio for professional calibration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold serif text-slate-900 mb-4">3. Production Timelines</h2>
            <p>
              Standard bespoke production requires 7 to 14 business days. During peak seasons (e.g., Eid), timelines may extend. We will notify you of any artisan delays.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold serif text-slate-900 mb-4">4. Fabric Variation</h2>
            <p>
              Hand-woven fabrics like Jamdani may have slight natural irregularities or color variations from the digital swatches. These are marks of authentic craftsmanship and do not constitute defects.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
