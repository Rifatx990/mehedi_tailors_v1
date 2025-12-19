
import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';

const AdminAppealsPage: React.FC = () => {
  const { productRequests } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold serif">Sartorial Appeals</h1>
        </header>

        {productRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {productRequests.map(req => (
              <div key={req.id} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold serif mb-2 text-slate-900">{req.productTitle}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-4">Request from {req.userName}</p>
                <p className="text-sm text-slate-500 leading-relaxed mb-6 italic">"{req.description}"</p>
                <div className="flex justify-between items-center border-t border-slate-50 pt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <span>{new Date(req.date).toLocaleDateString()}</span>
                  <span className="text-slate-900 group-hover:text-amber-600 transition-colors">{req.email}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <ChatBubbleLeftEllipsisIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No client appeals active.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminAppealsPage;
