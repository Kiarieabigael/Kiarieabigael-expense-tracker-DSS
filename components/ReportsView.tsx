
import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Calendar, Sparkles, TrendingUp, ShieldCheck, Download, ChevronRight } from 'lucide-react';
import { Expense, Income, AppSettings, FinancialReport } from '../types';
import { generateFinancialReport } from '../services/geminiService';

interface ReportsViewProps {
  expenses: Expense[];
  incomes: Income[];
  settings: AppSettings;
}

const ReportsView: React.FC<ReportsViewProps> = ({ expenses, incomes, settings }) => {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'Monthly' | 'Annual'>('Monthly');

  const reportPeriod = useMemo(() => {
    const now = new Date();
    return view === 'Monthly' 
      ? now.toLocaleString('default', { month: 'long', year: 'numeric' })
      : now.getFullYear().toString() + " Annual";
  }, [view]);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      const now = new Date();
      
      const filteredExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return view === 'Monthly' 
          ? d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          : d.getFullYear() === now.getFullYear();
      });

      const filteredIncomes = incomes.filter(i => {
        const d = new Date(i.date);
        return view === 'Monthly' 
          ? d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          : d.getFullYear() === now.getFullYear();
      });

      const res = await generateFinancialReport(reportPeriod, filteredExpenses, filteredIncomes, settings.currency);
      setReport(res);
      setLoading(false);
    };

    if (expenses.length > 0 || incomes.length > 0) {
      fetchReport();
    }
  }, [view, expenses, incomes, reportPeriod, settings.currency]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Reports</h2>
          <p className="text-slate-500 mt-1">Automated financial summaries for {view.toLowerCase()} activity.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => setView('Monthly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'Monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setView('Annual')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'Annual' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Annual
          </button>
        </div>
      </header>

      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-medium animate-pulse">Our AI assistant is synthesizing your {view.toLowerCase()} report...</p>
        </div>
      ) : report ? (
        <div className="space-y-8">
          {/* Main Card */}
          <section className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden relative">
            <div className="p-8 md:p-12 space-y-10">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    <Sparkles size={12} /> Financial Overview
                  </div>
                  <h3 className="text-4xl font-bold text-slate-900">{report.period} Report</h3>
                  <p className="text-slate-500 max-w-xl leading-relaxed">{report.summary}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className={`text-sm font-bold px-3 py-1 rounded-lg ${report.metrics.surplus >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {report.metrics.surplus >= 0 ? 'Surplus' : 'Deficit'}
                  </span>
                  <p className="text-3xl font-bold text-slate-900">{settings.currency}{Math.abs(report.metrics.surplus).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-slate-50">
                <Metric label="Total Income" value={`${settings.currency}${report.metrics.totalIncome.toLocaleString()}`} />
                <Metric label="Total Expenses" value={`${settings.currency}${report.metrics.totalExpenses.toLocaleString()}`} />
                <Metric label="Est. Savings" value={`${settings.currency}${report.metrics.savings.toLocaleString()}`} />
                <Metric label="Est. Investments" value={`${settings.currency}${report.metrics.investments.toLocaleString()}`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp size={16} className="text-indigo-500" /> Spending Distribution
                  </h4>
                  <div className="space-y-4">
                    {report.topCategories.map(cat => (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-700">{cat.category}</span>
                          <span className="text-slate-500">{settings.currency}{cat.amount.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${(cat.amount / report.metrics.totalExpenses) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-2xl text-white relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                    <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={16} /> Advisor Recommendation
                    </h4>
                    <p className="text-sm leading-relaxed text-slate-300 italic">"{report.aiAdvice}"</p>
                    <div className="pt-4 flex gap-4">
                       <button className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">Learn more about MMFs</button>
                       <button className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">Compare SACCOs</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-6 flex justify-between items-center px-8 border-t border-slate-100">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Report ID: {crypto.randomUUID().slice(0, 8)}</p>
               <button className="flex items-center gap-2 text-indigo-600 font-bold text-xs hover:bg-white px-4 py-2 rounded-lg transition-all border border-transparent hover:border-indigo-100">
                  <Download size={14} /> Download PDF (Local)
               </button>
            </div>
          </section>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-3xl border border-slate-100 shadow-sm text-center">
          <p className="text-slate-400 font-medium">No financial data available for this {view.toLowerCase()} period.</p>
        </div>
      )}
    </div>
  );
};

const Metric = ({ label, value }: { label: string, value: string }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-xl font-bold text-slate-800">{value}</p>
  </div>
);

export default ReportsView;
