
import React, { useMemo, useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { Sparkles, TrendingDown, Info } from 'lucide-react';
import { Expense, AppSettings, Category } from '../types';
import { CATEGORY_COLORS, CATEGORIES } from '../constants';
import { generateSpendingInsights } from '../services/geminiService';

interface AnalyticsProps {
  expenses: Expense[];
  settings: AppSettings;
}

const Analytics: React.FC<AnalyticsProps> = ({ expenses, settings }) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Chart Data: Category Breakdown
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  // Chart Data: Last 6 Months Trend
  const monthlyTrendData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        year: d.getFullYear(),
        month: d.getMonth(),
        total: 0
      });
    }

    expenses.forEach(e => {
      const ed = new Date(e.date);
      const mIdx = months.findIndex(m => m.month === ed.getMonth() && m.year === ed.getFullYear());
      if (mIdx !== -1) {
        months[mIdx].total += e.amount;
      }
    });

    return months;
  }, [expenses]);

  // Fetch AI Insights
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
        <p className="text-slate-500 mt-1">Deep dives into your habits.</p>
      </header>

      {/* AI Insights Section */}
      <section className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
        <Sparkles className="absolute top-0 right-0 opacity-10 -mr-10 -mt-10" size={240} />
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Sparkles size={20} className="text-white" />
            </div>
            <h3 className="text-xl font-bold">Personal Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingInsights ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white/10 border border-white/10 p-5 rounded-2xl animate-pulse">
                  <div className="h-4 bg-white/20 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              ))
            ) : insights.length > 0 ? (
              insights.map((insight, i) => (
                <div key={i} className="bg-white/10 border border-white/20 p-5 rounded-2xl backdrop-blur-md">
                  <p className="text-sm leading-relaxed font-medium">{insight}</p>
                </div>
              ))
            ) : (
              <p className="text-sm opacity-80 italic">Add more data to receive personalized patterns.</p>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            Category Split <Info size={16} className="text-slate-300" />
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={200}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                  formatter={(value: number) => [`${settings.currency}${value.toLocaleString()}`, 'Spent']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            {categoryData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[entry.name as Category] }} />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart Trend */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
            Spending Trend <TrendingDown size={16} className="text-slate-300" />
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  formatter={(value: number) => [`${settings.currency}${value.toLocaleString()}`, 'Total Spent']}
                />
                <Bar 
                  dataKey="total" 
                  fill="#6366f1" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                  animationBegin={400}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
