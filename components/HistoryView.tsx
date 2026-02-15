
import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Trash2, ChevronDown } from 'lucide-react';
import { Expense, Category } from '../types';
import { CATEGORIES, CATEGORY_COLORS } from '../constants';

interface HistoryViewProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ expenses, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [dateRange, setDateRange] = useState<'All' | 'Today' | 'Week' | 'Month'>('All');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
      
      let matchesDate = true;
      if (dateRange !== 'All') {
        const d = new Date(e.date);
        const now = new Date();
        if (dateRange === 'Today') {
          matchesDate = d.toDateString() === now.toDateString();
        } else if (dateRange === 'Week') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchesDate = d >= sevenDaysAgo;
        } else if (dateRange === 'Month') {
          matchesDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
      }
      
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [expenses, searchTerm, categoryFilter, dateRange]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">History</h2>
          <p className="text-slate-500 mt-1">Reflect on your past decisions.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
          <span className="font-bold text-slate-800">{filteredExpenses.length}</span> entries found
        </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterSelect 
            value={categoryFilter} 
            onChange={(val) => setCategoryFilter(val as any)} 
            options={['All', ...CATEGORIES]} 
            icon={<Filter size={16} />} 
          />
          <FilterSelect 
            value={dateRange} 
            onChange={(val) => setDateRange(val as any)} 
            options={['All', 'Today', 'Week', 'Month']} 
            icon={<Calendar size={16} />} 
          />
        </div>
      </div>

      {/* Expenses Table/List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="col-span-2">Date</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-3 text-center">Category</div>
          <div className="col-span-2 text-right">Amount</div>
          <div className="col-span-1"></div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredExpenses.length > 0 ? filteredExpenses.map(e => (
            <div key={e.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-6 items-center hover:bg-slate-50/50 transition-colors group">
              <div className="col-span-2 text-xs md:text-sm font-medium text-slate-500">
                {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="col-span-4 font-semibold text-slate-800">
                {e.description}
              </div>
              <div className="col-span-3 flex justify-start md:justify-center">
                <span 
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: CATEGORY_COLORS[e.category] }}
                >
                  {e.category}
                </span>
              </div>
              <div className="col-span-2 text-right text-base md:text-lg font-bold text-slate-800">
                -${e.amount.toLocaleString()}
              </div>
              <div className="col-span-1 text-right">
                <button 
                  onClick={() => onDelete(e.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  title="Delete entry"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center space-y-2">
              <p className="text-slate-400 font-medium">No transactions found matching your criteria.</p>
              <button 
                onClick={() => { setSearchTerm(''); setCategoryFilter('All'); setDateRange('All'); }}
                className="text-xs text-indigo-600 font-bold uppercase tracking-wider hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface FilterSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  icon: React.ReactNode;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ value, onChange, options, icon }) => (
  <div className="relative inline-block">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
      {icon}
    </div>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:border-slate-300 transition-all"
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
  </div>
);

export default HistoryView;
