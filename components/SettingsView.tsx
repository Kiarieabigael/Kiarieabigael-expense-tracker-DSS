
import React from 'react';
import { Shield, Database, Trash2, Download, CloudOff, Info, CheckCircle2 } from 'lucide-react';
import { AppSettings, Expense } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  expenses: Expense[];
  onUpdate: (settings: AppSettings) => void;
  onClearData: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, expenses, onUpdate, onClearData }) => {
  const exportData = () => {
    const dataStr = JSON.stringify({ expenses, settings }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'settle_data_export.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const confirmDelete = () => {
    if (window.confirm("Are you sure? This will delete all your local data permanently. There is no backup.")) {
      onClearData();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Privacy & Control</h2>
        <p className="text-slate-500 mt-1">Your data, your rules.</p>
      </header>

      {/* Privacy Promise */}
      <section className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-50">
        <div className="flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-2xl">
            <CloudOff size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Our Privacy Promise</h3>
            <p className="text-emerald-50 leading-relaxed text-sm">
              Settle is a "Local-First" application. Every expense you record, every category suggestion, and every insight generated remains exclusively on your device. We have no servers, no trackers, and no way to see your financial life.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Core Settings */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Shield size={20} className="text-indigo-500" /> Preferences
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">AI Predictions</p>
                <p className="text-[10px] text-slate-400">Smart category suggestions while you type.</p>
              </div>
              <button 
                onClick={() => onUpdate({ ...settings, isMLPredictionsEnabled: !settings.isMLPredictionsEnabled })}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.isMLPredictionsEnabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.isMLPredictionsEnabled ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Monthly Budget Target</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{settings.currency}</span>
                <input 
                  type="number"
                  value={settings.monthlyBudget}
                  onChange={(e) => onUpdate({ ...settings, monthlyBudget: parseInt(e.target.value) || 0 })}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Currency Symbol</label>
              <input 
                type="text"
                value={settings.currency}
                onChange={(e) => onUpdate({ ...settings, currency: e.target.value.slice(0, 3) })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                maxLength={3}
              />
            </div>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Database size={20} className="text-indigo-500" /> Data Storage
          </h3>

          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Local Records</span>
                <span className="text-sm font-bold text-slate-700">{expenses.length} expenses</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-1/4" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={exportData}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all border border-transparent hover:border-indigo-100 group"
              >
                <div className="flex items-center gap-3">
                  <Download size={18} />
                  <span className="text-sm font-semibold">Export JSON Data</span>
                </div>
                <ChevronRightSmall />
              </button>

              <button 
                onClick={confirmDelete}
                className="w-full flex items-center justify-between p-4 bg-rose-50/30 hover:bg-rose-50 text-rose-600 rounded-2xl transition-all border border-transparent hover:border-rose-100"
              >
                <div className="flex items-center gap-3">
                  <Trash2 size={18} />
                  <span className="text-sm font-semibold">Delete All Data</span>
                </div>
                <ChevronRightSmall />
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl flex items-start gap-4">
        <Info className="text-indigo-500 mt-1 flex-shrink-0" size={20} />
        <div>
          <h4 className="font-bold text-indigo-900 mb-1">Security Checklist</h4>
          <ul className="text-xs text-indigo-800/70 space-y-2 mt-2">
            <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-indigo-500" /> Sanitized inputs to prevent script injection.</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-indigo-500" /> No data transmitted to external analytics providers.</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-indigo-500" /> Gemini API used only for local UX enhancement.</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={12} className="text-indigo-500" /> User-confirmed categorization (No locked blackbox decisions).</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const ChevronRightSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 group-hover:opacity-100 transition-opacity">
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default SettingsView;
