
import React, { useMemo, useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, Legend
} from 'recharts';
import { Sparkles, TrendingDown, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Expense, Income, AppSettings, Category } from '../types';
import { CATEGORY_COLORS, CATEGORIES } from '../constants';
import { generateSpendingInsights } from '../services/geminiService';

interface AnalyticsProps {
  expenses: Expense[];
  incomes: Income[];
  settings: AppSettings;
}

const Analytics: React.FC<AnalyticsProps> = ({ expenses, incomes, settings }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const historicalTrendData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        expenses: 0,
        income: 0,
        savings: 0
      });
    }

    expenses.forEach(e => {
      const ed = new Date(e.date);
      const mIdx = months.findIndex(m => m.month === ed.getMonth() && m.year === ed.getFullYear());
      if (mIdx !== -1) months[mIdx].expenses += e.amount;
    });

    incomes.forEach(i => {
      const id = new Date(i.date);
      const mIdx = months.findIndex(m => m.month === id.getMonth() && m.year === id.getFullYear());
      if (mIdx !== -1) months[mIdx].income += i.amount;
    });

    months.forEach(m => { m.savings = Math.max(0, m.income - m.expenses); });

    return months;
  }, [expenses, incomes]);

  useEffect(() => {
    if (expenses.length < 3) return;
    const fetchInsights = async () => {
      setIsLoadingInsights(true);
      const res = await generateSpendingInsights(expenses, settings.monthlyBudget);
      setInsights(res);
      setIsLoadingInsights(false);
    };
    fetchInsights();
  }, [expenses, settings.monthlyBudget]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header>
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Spending Analysis</h2>
        <p className="text-slate-500 mt-1">Deep dives into your financial patterns.</p>
      </header>

      {/* Income vs Expenses Trend Line */}
      <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800">Income vs Expenses (6 Months)</h3>
          <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1 text-emerald-500"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Income</div>
            <div className="flex items-center gap-1 text-indigo-500"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Expenses</div>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalTrendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expenses" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">Category Split</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Savings Momentum</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalTrendData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="savings" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
