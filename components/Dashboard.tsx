
import React, { useMemo } from 'react';
import { TrendingUp, CreditCard, Wallet, AlertCircle, ArrowRight, ArrowUpCircle, Sparkles, Shield } from 'lucide-react';
import { Expense, Income, AppSettings, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Link } from 'react-router-dom';

interface DashboardProps {
  expenses: Expense[];
  incomes: Income[];
  settings: AppSettings;
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, incomes, settings }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [expenses, currentMonth, currentYear]);

  const currentMonthIncomes = useMemo(() => {
    return incomes.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [incomes, currentMonth, currentYear]);

  const totalSpent = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [currentMonthExpenses]);

  const totalIncome = useMemo(() => {
    return currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
  }, [currentMonthIncomes]);

  const surplus = totalIncome - totalSpent;
  const budgetPercentage = Math.min((totalSpent / settings.monthlyBudget) * 100, 100);

  const topCategories = useMemo(() => {
    const totals: Record<string, number> = {};
    currentMonthExpenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  }, [currentMonthExpenses]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Overview</h2>
          <p className="text-slate-500 mt-1">Peace of mind starts with awareness.</p>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <SummaryCard 
          title="Income" 
          value={`${settings.currency}${totalIncome.toLocaleString()}`} 
          icon={<ArrowUpCircle className="text-emerald-500" />}
          color="bg-white"
        />
        <SummaryCard 
          title="Expenses" 
          value={`${settings.currency}${totalSpent.toLocaleString()}`} 
          icon={<CreditCard className="text-rose-500" />}
          color="bg-white"
        />
        <SummaryCard 
          title="Surplus" 
          value={`${settings.currency}${surplus.toLocaleString()}`} 
          icon={<Wallet className={surplus >= 0 ? "text-indigo-500" : "text-rose-600"} />}
          color="bg-white"
          subtitle={surplus < 0 ? "Deficit detected" : "Ready to save"}
        />
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Budget Usage</p>
              <h3 className="text-2xl font-bold text-slate-900">{Math.round(budgetPercentage)}%</h3>
            </div>
            <div className={`p-2 rounded-lg ${totalSpent > settings.monthlyBudget ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${totalSpent > settings.monthlyBudget ? 'bg-rose-500' : 'bg-indigo-500'}`}
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Analysis Banner */}
      <div className={`${settings.isAIFeaturesEnabled ? 'bg-indigo-600' : 'bg-slate-800'} rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-100`}>
        {settings.isAIFeaturesEnabled ? (
          <>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Your Financial DSS is ready.</h3>
              <p className="text-indigo-100 text-sm">Based on your {settings.currency} {surplus.toLocaleString()} surplus, we have investment advice for you.</p>
            </div>
            <Link to="/budget" className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2">
              <Sparkles size={18} /> View Advisory
            </Link>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">Privacy-First Mode Active</h3>
              <p className="text-slate-400 text-sm">AI analysis is disabled. Your data stays 100% offline.</p>
            </div>
            <Link to="/settings" className="bg-white/10 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/20">
              <Shield size={18} /> Manage AI
            </Link>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Categories */}
        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Top Categories</h3>
            <Link to="/analytics" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
              See analysis <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-6">
            {topCategories.length > 0 ? topCategories.map(([cat, amount]) => (
              <div key={cat} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{cat}</span>
                  <span className="text-slate-500 font-semibold">{settings.currency}{amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      backgroundColor: CATEGORY_COLORS[cat as Category],
                      width: `${(amount / totalSpent) * 100}%`
                    }}
                  />
                </div>
              </div>
            )) : (
              <p className="text-slate-400 text-sm text-center py-10">No spending data for this month yet.</p>
            )}
          </div>
        </section>

        {/* Recent Activity Mini */}
        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
            <Link to="/history" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {expenses.slice(0, 5).map(e => (
              <div key={e.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div 
                  className="w-2 h-10 rounded-full" 
                  style={{ backgroundColor: CATEGORY_COLORS[e.category] }} 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{e.description}</p>
                  <p className="text-[11px] text-slate-400 uppercase font-medium tracking-wider">{e.category}</p>
                </div>
                <p className="text-sm font-bold text-slate-700">-{settings.currency}{e.amount.toLocaleString()}</p>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-10">Start by adding an expense.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon, color, subtitle }) => (
  <div className={`${color} p-6 rounded-2xl border border-slate-100 shadow-sm`}>
    <div className="flex justify-between items-start mb-4">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
    </div>
    <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    {subtitle && <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${subtitle.includes('Deficit') ? 'text-rose-500' : 'text-emerald-500'}`}>{subtitle}</p>}
  </div>
);

export default Dashboard;
