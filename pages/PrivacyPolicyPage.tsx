
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="py-24 bg-white min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-5xl font-bold serif mb-12">Privacy Policy</h1>
        <div className="prose prose-slate lg:prose-lg max-w-none space-y-8 text-slate-600">
          <p className="text-lg leading-relaxed">
            At Mehedi Tailors & Fabrics, accessible from meheditailors.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Mehedi Tailors & Fabrics and how we use it.
          </p>

          <section>
            <h2 className="text-2xl font-bold serif text-slate-900 mb-4">Measurement Data Collection</h2>
            <p>
              We collect and store your anatomical measurements to provide bespoke tailoring services. This data is used exclusively for garment production and fitting optimization. We do not share your physical profile with third-party marketing entities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold serif text-slate-900 mb-4">Transaction Security</h2>
            <p>
              All financial transactions are processed through secure gateways (SSLCommerz). Mehedi Tailors & Fabrics does not store your credit card details or bank login credentials on our local servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold serif text-slate-900 mb-4">Communication</h2>
            <p>
              We may use your email address and phone number to send order status updates, artisan notes, and promotional offers. You may opt-out of marketing communications at any time via your account dashboard.
            </p>
          </section>

          <section className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
            <h3 className="text-xl font-bold serif mb-4">Contact Information</h3>
            <p className="text-sm">If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong>privacy@meheditailors.com</strong>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
