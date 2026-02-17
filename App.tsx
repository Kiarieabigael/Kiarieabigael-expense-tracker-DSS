
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
  FileText,
  Sparkles,
  Shield
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
import { verifySession, signSession } from './utils/auth';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // State managed by user ID
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    isMLPredictionsEnabled: true,
    isAIFeaturesEnabled: true,
    hasAcceptedAIDisclosure: false,
    currency: DEFAULT_CURRENCY,
    monthlyBudget: 50000 
  });

  const [showDisclosure, setShowDisclosure] = useState(false);

  // Verification of session on load
  useEffect(() => {
    async function loadSession() {
      const savedSigned = localStorage.getItem('settle_active_session_v2');
      if (savedSigned) {
        const verifiedUser = await verifySession(savedSigned);
        if (verifiedUser) {
          setAuth({
            user: verifiedUser,
            isAuthenticated: true,
            isLoading: false
          });
          return;
        }
      }
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
    loadSession();
  }, []);

  // Load user data on auth change
  useEffect(() => {
    if (auth.user) {
      const savedExpenses = localStorage.getItem(`settle_expenses_${auth.user.id}`);
      const savedIncomes = localStorage.getItem(`settle_incomes_${auth.user.id}`);
      const savedSettings = localStorage.getItem(`settle_settings_${auth.user.id}`);
      
      setExpenses(savedExpenses ? JSON.parse(savedExpenses) : []);
      setIncomes(savedIncomes ? JSON.parse(savedIncomes) : []);
      if (savedSettings) {
        const loaded = JSON.parse(savedSettings);
        setSettings({
          ...settings,
          ...loaded,
          // Ensure new fields exist
          isAIFeaturesEnabled: loaded.isAIFeaturesEnabled ?? true,
          hasAcceptedAIDisclosure: loaded.hasAcceptedAIDisclosure ?? false
        });
      }

      // Persist signed session
      async function persist() {
        const signed = await signSession(auth.user);
        localStorage.setItem('settle_active_session_v2', signed);
      }
      persist();
    } else {
      localStorage.removeItem('settle_active_session_v2');
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

  // Check if we need to show disclosure
  useEffect(() => {
    if (auth.isAuthenticated && !settings.hasAcceptedAIDisclosure) {
      setShowDisclosure(true);
    }
  }, [auth.isAuthenticated, settings.hasAcceptedAIDisclosure]);

  const handleLogin = (user: { id: string, email: string }, provider: 'local') => {
    setAuth({
      user: { ...user, authProvider: provider },
      isAuthenticated: true,
      isLoading: false
    });
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false, isLoading: false });
  };

  const handleAcceptDisclosure = () => {
    setSettings({ ...settings, hasAcceptedAIDisclosure: true });
    setShowDisclosure(false);
  };

  const handleOptOutAI = () => {
    setSettings({ ...settings, isAIFeaturesEnabled: false, hasAcceptedAIDisclosure: true });
    setShowDisclosure(false);
  };

  const addExpense = (expense: Expense) => setExpenses(prev => [expense, ...prev]);
  const addIncome = (income: Income) => setIncomes(prev => [income, ...prev]);
  const deleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));
  
  const handleImport = (data: { expenses: Expense[], incomes: Income[], settings: AppSettings }) => {
    if (data.expenses) setExpenses(data.expenses);
    if (data.incomes) setIncomes(data.incomes);
    if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
  };

  const clearAllData = () => {
    setExpenses([]);
    setIncomes([]);
    if (auth.user) {
      localStorage.removeItem(`settle_expenses_${auth.user.id}`);
      localStorage.removeItem(`settle_incomes_${auth.user.id}`);
    }
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
        {/* Navigation */}
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

        {/* Global Action Buttons */}
        <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 flex flex-col gap-4 z-40">
          <NavLink to="/add-income" className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-all">
            <ArrowUpCircle size={28} />
          </NavLink>
          <NavLink to="/add" className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all">
            <PlusCircle size={28} />
          </NavLink>
        </div>

        {/* Main Content */}
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
              <Route path="/settings" element={<SettingsView settings={settings} expenses={expenses} incomes={incomes} onUpdate={setSettings} onClearData={clearAllData} onImport={handleImport} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        {/* AI Disclosure Modal */}
        {showDisclosure && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] max-w-lg w-full p-10 md:p-12 shadow-2xl space-y-8 animate-in zoom-in duration-500">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center">
                  <Sparkles size={40} />
                </div>
              </div>
              
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Financial Intelligence</h2>
                <p className="text-slate-500 leading-relaxed font-medium">
                  To provide Kenyan-localized investment advice and spending insights, Settle utilizes <span className="text-indigo-600 font-bold">Google Gemini AI</span>.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 space-y-4 border border-slate-100">
                <div className="flex items-start gap-4">
                  <Shield size={20} className="text-indigo-500 mt-1 flex-shrink-0" />
                  <div className="text-xs text-slate-600 leading-relaxed">
                    <p className="font-bold text-slate-900 mb-1">Your Privacy is Protected</p>
                    <p>We send <span className="font-bold">only aggregated totals and categories</span> for analysis. Descriptions and personal labels are stripped before processing to ensure your raw history stays local.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <button 
                  onClick={handleAcceptDisclosure}
                  className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                >
                  Enable Insights
                </button>
                <button 
                  onClick={handleOptOutAI}
                  className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Skip AI Features (Local Only)
                </button>
              </div>
            </div>
          </div>
        )}
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
