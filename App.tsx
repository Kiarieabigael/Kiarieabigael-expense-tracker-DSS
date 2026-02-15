import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  BarChart3, 
  Settings as SettingsIcon,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Expense, Category, AppSettings } from './types';
import { CATEGORIES, DEFAULT_CURRENCY } from './constants';
import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import HistoryView from './components/HistoryView';
import Analytics from './components/Analytics';
import SettingsView from './components/SettingsView';
import BudgetSuggestions from './components/BudgetSuggestions';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('settle_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('settle_settings');
    return saved ? JSON.parse(saved) : {
      isMLPredictionsEnabled: true,
      currency: DEFAULT_CURRENCY,
      monthlyBudget: 50000 // Adjusted default for KSh context
    };
  });

  useEffect(() => {
    localStorage.setItem('settle_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('settle_settings', JSON.stringify(settings));
  }, [settings]);

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const clearAllData = () => {
    setExpenses([]);
    localStorage.removeItem('settle_expenses');
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
        {/* Navigation - Sidebar for desktop, Bottom bar for mobile */}
        <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-64 bg-white border-t md:border-t-0 md:border-r border-slate-200 z-50 flex md:flex-col justify-around md:justify-start px-4 py-2 md:py-8">
          <div className="hidden md:flex items-center gap-3 px-4 mb-10">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Settle</h1>
          </div>

          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem to="/history" icon={<History size={20} />} label="History" />
          <NavItem to="/analytics" icon={<BarChart3 size={20} />} label="Analysis" />
          <NavItem to="/budget" icon={<TrendingUp size={20} />} label="Budget" />
          <NavItem to="/settings" icon={<SettingsIcon size={20} />} label="Privacy" />
          
          <div className="mt-auto hidden md:block px-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <ShieldCheck size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Private Data</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Your data never leaves this browser. Settle uses local storage for complete privacy.
              </p>
            </div>
          </div>
        </nav>

        {/* FAB for Add Expense on Mobile */}
        <NavLink 
          to="/add" 
          className="fixed bottom-20 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all z-40"
        >
          <PlusCircle size={28} />
        </NavLink>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="max-w-5xl mx-auto p-6 md:p-10">
            <Routes>
              <Route path="/" element={<Dashboard expenses={expenses} settings={settings} />} />
              <Route path="/add" element={<AddExpense onAdd={addExpense} settings={settings} />} />
              <Route path="/history" element={<HistoryView expenses={expenses} onDelete={deleteExpense} />} />
              <Route path="/analytics" element={<Analytics expenses={expenses} settings={settings} />} />
              <Route path="/budget" element={<BudgetSuggestions expenses={expenses} settings={settings} />} />
              <Route path="/settings" element={
                <SettingsView 
                  settings={settings} 
                  onUpdate={setSettings} 
                  onClearData={clearAllData} 
                  expenses={expenses}
                />
              } />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all
      ${isActive 
        ? 'text-indigo-600 bg-indigo-50 md:bg-indigo-50 font-medium' 
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}
    `}
  >
    {icon}
    <span className="text-[10px] md:text-sm">{label}</span>
  </NavLink>
);

export default App;