
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  BarChart3, 
  Settings as SettingsIcon,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  LogOut,
  ArrowUpCircle,
  FileText
} from 'lucide-react';
import { Expense, Income, Category, AppSettings, User, AuthState } from './types';
import { CATEGORIES, DEFAULT_CURRENCY } from './constants';
import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import AddIncome from './components/AddIncome';
import HistoryView from './components/HistoryView';
import Analytics from './components/Analytics';
import SettingsView from './components/SettingsView';
import BudgetSuggestions from './components/BudgetSuggestions';
import ReportsView from './components/ReportsView';
import Login from './components/Login';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('settle_active_session');
    return saved ? {
      user: JSON.parse(saved),
      isAuthenticated: true,
      isLoading: false
    } : {
      user: null,
      isAuthenticated: false,
      isLoading: false
    };
  });

  // State managed by user ID
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    isMLPredictionsEnabled: true,
    currency: DEFAULT_CURRENCY,
    monthlyBudget: 50000 
  });

  // Load user data on auth change
  useEffect(() => {
    if (auth.user) {
      const savedExpenses = localStorage.getItem(`settle_expenses_${auth.user.id}`);
      const savedIncomes = localStorage.getItem(`settle_incomes_${auth.user.id}`);
      const savedSettings = localStorage.getItem(`settle_settings_${auth.user.id}`);
      
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
      setIncomes(savedIncomes ? JSON.parse(savedIncomes) : []);
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      localStorage.setItem('settle_active_session', JSON.stringify(auth.user));
    } else {
      localStorage.removeItem('settle_active_session');
    }
  }, [auth.user]);

  // Persist user data
  useEffect(() => {
    if (auth.user) {
      localStorage.setItem(`settle_expenses_${auth.user.id}`, JSON.stringify(expenses));
    }
  }, [expenses, auth.user]);

  useEffect(() => {
    if (auth.user) {
      localStorage.setItem(`settle_incomes_${auth.user.id}`, JSON.stringify(incomes));
    }
  }, [incomes, auth.user]);

  useEffect(() => {
    if (auth.user) {
      localStorage.setItem(`settle_settings_${auth.user.id}`, JSON.stringify(settings));
    }
  }, [settings, auth.user]);

  const handleLogin = (user: { id: string, email: string }, provider: 'local' | 'google') => {
    setAuth({
      user: { ...user, authProvider: provider },
      isAuthenticated: true,
      isLoading: false
    });
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false, isLoading: false });
  };

  const addExpense = (expense: Expense) => setExpenses(prev => [expense, ...prev]);
  const addIncome = (income: Income) => setIncomes(prev => [income, ...prev]);
  const deleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));
  
  const clearAllData = () => {
    setExpenses([]);
    setIncomes([]);
    if (auth.user) {
      localStorage.removeItem(`settle_expenses_${auth.user.id}`);
      localStorage.removeItem(`settle_incomes_${auth.user.id}`);
    }
  };

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
        <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-64 bg-white border-t md:border-t-0 md:border-r border-slate-200 z-50 flex md:flex-col justify-around md:justify-start px-4 py-2 md:py-8 shadow-2xl md:shadow-none">
          <div className="hidden md:flex items-center gap-3 px-4 mb-10">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">S</div>
            <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Settle</h1>
          </div>

          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem to="/history" icon={<History size={20} />} label="History" />
          <NavItem to="/analytics" icon={<BarChart3 size={20} />} label="Analysis" />
          <NavItem to="/reports" icon={<FileText size={20} />} label="Reports" />
          <NavItem to="/budget" icon={<TrendingUp size={20} />} label="Planner" />
          <NavItem to="/settings" icon={<SettingsIcon size={20} />} label="Privacy" />
          
          <button onClick={handleLogout} className="mt-4 flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all text-slate-400 hover:text-rose-500 hover:bg-rose-50">
            <LogOut size={20} />
            <span className="text-[10px] md:text-sm">Log out</span>
          </button>
        </nav>

        <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 flex flex-col gap-4 z-40">
          <NavLink to="/add-income" className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-all">
            <ArrowUpCircle size={28} />
          </NavLink>
          <NavLink to="/add" className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all">
            <PlusCircle size={28} />
          </NavLink>
        </div>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="max-w-5xl mx-auto p-6 md:p-10">
            <Routes>
              <Route path="/" element={<Dashboard expenses={expenses} incomes={incomes} settings={settings} />} />
              <Route path="/add" element={<AddExpense onAdd={addExpense} settings={settings} />} />
              <Route path="/add-income" element={<AddIncome onAdd={addIncome} settings={settings} />} />
              <Route path="/history" element={<HistoryView expenses={expenses} onDelete={deleteExpense} />} />
              <Route path="/analytics" element={<Analytics expenses={expenses} incomes={incomes} settings={settings} />} />
              <Route path="/reports" element={<ReportsView expenses={expenses} incomes={incomes} settings={settings} />} />
              <Route path="/budget" element={<BudgetSuggestions expenses={expenses} incomes={incomes} settings={settings} />} />
              <Route path="/settings" element={<SettingsView settings={settings} onUpdate={setSettings} onClearData={clearAllData} expenses={expenses} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <NavLink to={to} className={({ isActive }) => `flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all ${isActive ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
    {icon}
    <span className="text-[10px] md:text-sm">{label}</span>
  </NavLink>
);

export default App;
