
import React, { useMemo, useState, useEffect } from 'react';
import { Lightbulb, AlertTriangle, ShieldCheck, ChevronRight, Sparkles, TrendingUp, Wallet } from 'lucide-react';
import { Expense, Income, AppSettings, Category, FinancialHealth, InvestmentAdvice } from '../types';
import { CATEGORIES, CATEGORY_COLORS } from '../constants';
import { generateInvestmentDSS } from '../services/geminiService';

interface BudgetSuggestionsProps {
  expenses: Expense[];
  incomes: Income[];
  settings: AppSettings;
}

const BudgetSuggestions: React.FC<BudgetSuggestionsProps> = ({ expenses, incomes, settings }) => {
  const [dssData, setDssData] = useState<{ health: FinancialHealth, investments: InvestmentAdvice[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const totalMonthlyIncome = useMemo(() => {
    const now = new Date();
    return incomes
      .filter(i => {
        const d = new Date(i.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, i) => sum + i.amount, 0);
  }, [incomes]);

  const totalMonthlyExpenses = useMemo(() => {
    const now = new Date();
    return expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  useEffect(() => {
    const fetchDSS = async () => {
      setLoading(true);
      const res = await generateInvestmentDSS(totalMonthlyIncome, totalMonthlyExpenses, settings.currency);
      setDssData(res);
      setLoading(false);
    };
    if (totalMonthlyIncome > 0 || totalMonthlyExpenses > 0) {
      fetchDSS();
    }
  }, [totalMonthlyIncome, totalMonthlyExpenses, settings.currency]);

  const emergencyFundTarget = totalMonthlyExpenses * 3;
  const currentSurplus = totalMonthlyIncome - totalMonthlyExpenses;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Financial Planner</h2>
        <p className="text-slate-500 mt-1">AI-driven advisor for the Kenyan market.</p>
      </header>

      {/* Financial Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm col-span-1">
          <div className="flex items-center gap-2 mb-4 text-indigo-600">
            <ShieldCheck size={20} />
            <h3 className="font-bold">Emergency Fund</h3>
          </div>
          <p className="text-xs text-slate-400 mb-2">Target (3 months expenses)</p>
          <p className="text-2xl font-bold text-slate-900">{settings.currency} {emergencyFundTarget.toLocaleString()}</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
             <div 
               className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
               style={{ width: `${Math.min((currentSurplus > 0 ? (currentSurplus / emergencyFundTarget) * 100 : 0), 100)}%` }}
             />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold">Progress from current surplus: {Math.round((currentSurplus > 0 ? (currentSurplus / emergencyFundTarget) * 100 : 0))}%</p>
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-100 col-span-2 relative overflow-hidden">
          <Sparkles className="absolute top-0 right-0 opacity-10 -mr-8 -mt-8" size={160} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={20} className="text-amber-300" />
              <h3 className="font-bold">Advisor's Take</h3>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
            ) : (
              <p className="text-sm font-medium leading-relaxed italic opacity-90">
                "{dssData?.health.recommendation || 'Record your income and expenses to receive personalized localized advice.'}"
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-white/10 flex gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold opacity-60">Savings Rate</p>
                <p className="text-lg font-bold">{dssData?.health.savingsRate || 0}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold opacity-60">Status</p>
                <p className="text-lg font-bold">{dssData?.health.emergencyFundStatus || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Localized Investments */}
        <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" /> Kenyan Investment Options
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Localized DSS</span>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="p-6 animate-pulse flex gap-4">
                   <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                   <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                      <div className="h-3 bg-slate-50 rounded w-full"></div>
                   </div>
                </div>
              ))
            ) : dssData?.investments.map((inv, i) => (
              <div key={i} className="p-6 space-y-3 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      inv.level === 'Low' ? 'bg-emerald-50 text-emerald-600' :
                      inv.level === 'Medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {inv.level} Risk
                    </div>
                    <h4 className="font-bold text-slate-800">{inv.option}</h4>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{inv.description}</p>
                {inv.riskWarning && (
                  <div className="flex items-start gap-2 text-[11px] text-rose-500 bg-rose-50/50 p-2 rounded-lg font-medium">
                    <AlertTriangle size={12} className="mt-0.5" />
                    <span>{inv.riskWarning}</span>
                  </div>
                )}
              </div>
            ))}
            {!dssData && !loading && (
              <div className="py-20 text-center px-10">
                <p className="text-slate-400 text-sm">Add your income and expenses to see localized Kenyan investment recommendations tailored to your behavior.</p>
              </div>
            )}
          </div>
        </section>

        <div className="space-y-6">
          <section className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
             <div className="absolute bottom-0 right-0 bg-indigo-500/10 w-32 h-32 rounded-full -mb-10 -mr-10"></div>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-indigo-400" /> DSS Methodology
            </h3>
            <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
              <p>Our Decision Support System uses the <strong>Gemini 3</strong> model to analyze your actual spending behavior against standard financial benchmarks.</p>
              <ul className="space-y-2 text-xs">
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div> Recommendations are advisory only.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div> Past returns do not guarantee future results.</li>
                <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5"></div> We prioritize liquid funds (MMF) for your first KSh 50k - 100k surplus to secure your emergency buffer.</li>
              </ul>
            </div>
          </section>

          <section className="bg-amber-50 border border-amber-100 rounded-3xl p-8">
            <div className="flex items-center gap-3 text-amber-600 mb-4">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">Important Warning</h3>
            </div>
            <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
              High-risk investments like Crypto or Day-Trading are optional. They should only be funded using capital you are prepared to lose entirely. Never invest your emergency fund or money for essential bills into high-risk assets.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BudgetSuggestions;
