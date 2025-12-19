
import React from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { TrashIcon, ChatBubbleBottomCenterTextIcon, HandThumbUpIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

const AdminReviewsPage: React.FC = () => {
  const { reviews, updateReviewStatus, removeReview } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold serif">Patron Voice</h1>
        </header>

        {reviews.length > 0 ? (
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b bg-slate-50/50">
                  <th className="px-10 py-6">Reviewer</th>
                  <th className="px-10 py-6 text-center">Rating</th>
                  <th className="px-10 py-6 text-center">Status</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reviews.map(rev => (
                  <tr key={rev.id} className="hover:bg-slate-50 transition">
                    <td className="px-10 py-8">
                      <p className="font-bold">{rev.userName}</p>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic">"{rev.comment}"</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex justify-center space-x-1 text-amber-500">
                         {[...Array(5)].map((_, i) => (
                           i < rev.rating ? <StarSolid key={i} className="w-4 h-4" /> : <StarIcon key={i} className="w-4 h-4 text-slate-200" />
                         ))}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase ${rev.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{rev.status}</span>
                    </td>
                    <td className="px-10 py-8 text-right space-x-2">
                      {rev.status === 'pending' && <button onClick={() => updateReviewStatus(rev.id, 'approved')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-colors"><HandThumbUpIcon className="w-5 h-5" /></button>}
                      <button onClick={() => removeReview(rev.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><TrashIcon className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
             <ChatBubbleBottomCenterTextIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No reviews logged.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReviewsPage;
