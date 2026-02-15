
import React, { useMemo } from 'react';
import { Lightbulb, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import { Expense, AppSettings, Category } from '../types';
import { CATEGORIES, CATEGORY_COLORS } from '../constants';

interface BudgetSuggestionsProps {
  expenses: Expense[];
  settings: AppSettings;
}

const BudgetSuggestions: React.FC<BudgetSuggestionsProps> = ({ expenses, settings }) => {
  const suggestions = useMemo(() => {
    const totals: Record<string, number> = {};
    const count = new Set(expenses.map(e => {
        const d = new Date(e.date);
        return `${d.getMonth()}-${d.getFullYear()}`;
    })).size || 1;

    expenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });

    return CATEGORIES.map(cat => {
      const avg = (totals[cat] || 0) / count;
      const isRisky = avg > (settings.monthlyBudget * 0.25); // Arbitrary threshold
      return {
        category: cat,
        avgMonthly: avg,
        suggested: Math.ceil(avg * 1.1 / 10) * 10, // Buffer of 10%
        isRisky
      };
    }).sort((a, b) => b.avgMonthly - a.avgMonthly);
  }, [expenses, settings.monthlyBudget]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Budget Planner</h2>
        <p className="text-slate-500 mt-1">Smart recommendations based on your habits.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Lightbulb size={20} className="text-amber-400" /> Suggested Targets
              </h3>
              <span className="text-xs text-slate-400 font-medium">Monthly averages</span>
            </div>
            <div className="divide-y divide-slate-50">
              {suggestions.filter(s => s.avgMonthly > 0).map(s => (
                <div key={s.category} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: CATEGORY_COLORS[s.category as Category] }}>
                      {s.category[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{s.category}</h4>
                      <p className="text-xs text-slate-400">Current avg: {settings.currency}{Math.round(s.avgMonthly)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Target</p>
                      <p className="text-xl font-bold text-slate-900">{settings.currency}{s.suggested}</p>
                    </div>
                    <button className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors">
                      <ChevronRight size={18} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="py-20 text-center px-10">
                  <p className="text-slate-400 text-sm">Add some expenses to see intelligent budget targets tailored to your life.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-rose-50 border border-rose-100 rounded-3xl p-8">
            <div className="flex items-center gap-3 text-rose-600 mb-6">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">Watchlist</h3>
            </div>
            <p className="text-sm text-rose-800/80 leading-relaxed mb-6 font-medium">
              We noticed these categories consume a large portion of your budget. A small reduction here would make the most impact.
            </p>
            <div className="space-y-4">
              {suggestions.filter(s => s.isRisky).map(s => (
                <div key={s.category} className="bg-white p-4 rounded-2xl shadow-sm border border-rose-100 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700">{s.category}</span>
                  <span className="text-rose-600 font-bold text-sm">High Impact</span>
                </div>
              ))}
              {suggestions.filter(s => s.isRisky).length === 0 && (
                <div className="text-emerald-600 flex items-center gap-2 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <ShieldCheck size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Everything looks balanced</span>
                </div>
              )}
            </div>
          </section>

          <section className="bg-slate-900 rounded-3xl p-8 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-indigo-400" /> Assistant Tip
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Budgets aren't restrictions; they're permissions to spend on what truly matters to you. Try setting a buffer of 10% on your usual spending for "fun" categories to avoid feeling deprived.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BudgetSuggestions;
