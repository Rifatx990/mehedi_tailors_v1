import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext.tsx';
import AdminSidebar from '../../components/admin/AdminSidebar.tsx';
import { 
  PrinterIcon, 
  CalendarDaysIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CurrencyBangladeshiIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

type ReportView = 'Daily' | 'Monthly' | 'Yearly';

const AdminReportsPage: React.FC = () => {
  const { orders, systemConfig } = useStore();
  const [view, setView] = useState<ReportView>('Daily');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const reportData = useMemo(() => {
    return orders.filter(o => {
      const orderDate = new Date(o.date);
      const target = new Date(targetDate);
      if (view === 'Daily') {
        return orderDate.toDateString() === target.toDateString();
      } else if (view === 'Monthly') {
        return orderDate.getMonth() === target.getMonth() && orderDate.getFullYear() === target.getFullYear();
      } else {
        return orderDate.getFullYear() === target.getFullYear();
      }
    });
  }, [orders, view, targetDate]);

  const stats = useMemo(() => ({
    totalSales: reportData.length,
    // FIX: Cast to Number to prevent string concatenation
    realizedRevenue: reportData.reduce((acc, curr) => acc + Number(curr.paidAmount || 0), 0),
    outstandingDues: reportData.reduce((acc, curr) => acc + Number(curr.dueAmount || 0), 0),
    grandTotal: reportData.reduce((acc, curr) => acc + Number(curr.total || 0), 0),
  }), [reportData]);

  const formatDateLabel = () => {
    const d = new Date(targetDate);
    if (view === 'Daily') return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    if (view === 'Monthly') return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    return d.getFullYear().toString();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-grow p-8 md:p-16">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 no-print">
          <div>
            <h1 className="text-4xl font-bold serif text-slate-900">Fiscal Intelligence</h1>
            <p className="text-slate-400 mt-1 text-sm uppercase tracking-widest font-bold">Revenue & Sales Performance</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center space-x-2 shadow-xl hover:bg-amber-600 transition"
          >
            <PrinterIcon className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </header>

        {/* Report Controls - Hidden in print */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 mb-10 no-print">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              {(['Daily', 'Monthly', 'Yearly'] as ReportView[]).map(v => (
                <button 
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {v}
                </button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <input 
                type={view === 'Daily' ? 'date' : view === 'Monthly' ? 'month' : 'number'}
                value={view === 'Yearly' ? new Date(targetDate).getFullYear() : targetDate.substring(0, view === 'Monthly' ? 7 : 10)}
                onChange={(e) => {
                  let val = e.target.value;
                  if (view === 'Yearly') {
                    val = `${val}-01-01`;
                  } else if (view === 'Monthly') {
                    val = `${val}-01`;
                  }
                  setTargetDate(new Date(val).toISOString());
                }}
                className="bg-slate-50 border border-slate-100 px-6 py-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-amber-600/10"
              />
            </div>
          </div>
        </div>

        {/* The Actual Report */}
        <div className="invoice-card bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
           <div className="bg-slate-900 p-10 text-white flex justify-between items-center invoice-header">
              <div>
                 <h2 className="text-2xl font-bold serif tracking-tight">{systemConfig.siteName || 'MEHEDI TAILORS'}</h2>
                 <p className="text-slate-400 text-[10px] uppercase tracking-[0.4em] mt-1">Official Sales Audit</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] uppercase tracking-widest font-bold text-amber-500">Audit Period</p>
                 <p className="text-xl font-bold">{formatDateLabel()}</p>
              </div>
           </div>

           <div className="p-8 md:p-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 invoice-card-section">
                    <CurrencyBangladeshiIcon className="w-8 h-8 text-emerald-600 mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Realized Revenue</p>
                    <p className="text-3xl font-bold text-slate-900">BDT {stats.realizedRevenue.toLocaleString()}</p>
                 </div>
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 invoice-card-section">
                    <BanknotesIcon className="w-8 h-8 text-amber-600 mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Outstanding Dues</p>
                    <p className="text-3xl font-bold text-slate-900">BDT {stats.outstandingDues.toLocaleString()}</p>
                 </div>
                 <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 invoice-card-section">
                    <CalendarDaysIcon className="w-8 h-8 text-blue-600 mb-4" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Sales Volume</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalSales} Transactions</p>
                 </div>
              </div>

              <div className="mb-10">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center space-x-2">
                    <DocumentChartBarIcon className="w-5 h-5" />
                    <span>Transaction Ledger</span>
                 </h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b-2 border-slate-900">
                          <tr>
                             <th className="py-4 px-2">Order Ref</th>
                             <th className="py-4 px-2">Patron Identity</th>
                             <th className="py-4 px-2">Timestamp</th>
                             <th className="py-4 px-2">Load</th>
                             <th className="py-4 px-2 text-right">Settled</th>
                             <th className="py-4 px-2 text-right">Net Value</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {reportData.map(order => (
                             <tr key={order.id} className="text-xs md:text-sm">
                                <td className="py-5 px-2 font-mono text-xs font-bold text-slate-900">#{order.id}</td>
                                <td className="py-5 px-2 font-bold">{order.customerName}</td>
                                <td className="py-5 px-2 text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                                <td className="py-5 px-2 font-medium">{order.items.length} Units</td>
                                <td className="py-5 px-2 text-right font-black text-emerald-600">BDT {Number(order.paidAmount || 0).toLocaleString()}</td>
                                <td className="py-5 px-2 text-right font-black text-slate-900">BDT {Number(order.total || 0).toLocaleString()}</td>
                             </tr>
                          ))}
                          {reportData.length === 0 && (
                            <tr>
                               <td colSpan={6} className="py-32 text-center text-slate-300 italic font-medium">No transactions synchronized for this period.</td>
                            </tr>
                          )}
                       </tbody>
                       <tfoot className="border-t-4 border-slate-900">
                          <tr className="font-black">
                             <td colSpan={4} className="py-8 px-2 text-right uppercase tracking-[0.2em] text-[10px] text-slate-400">Ledger Recapitulation</td>
                             <td className="py-8 px-2 text-right text-xl text-emerald-700">BDT {stats.realizedRevenue.toLocaleString()}</td>
                             <td className="py-8 px-2 text-right text-xl text-slate-900">BDT {stats.grandTotal.toLocaleString()}</td>
                          </tr>
                       </tfoot>
                    </table>
                 </div>
              </div>

              <div className="mt-20 pt-10 border-t border-slate-100 text-center">
                 <p className="text-[9px] text-slate-400 uppercase tracking-[0.5em] font-black mb-2">Heritage Precision • Fiscal Integrity</p>
                 <p className="text-[8px] text-slate-300 leading-relaxed">
                   Global Studio Archive Report • Generated on {new Date().toLocaleString()} by Mehedi ERP Core.
                 </p>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminReportsPage;