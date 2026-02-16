
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowUpCircle, RefreshCw } from 'lucide-react';
import { Income, IncomeCategory, IncomeFrequency, AppSettings } from '../types';
import { INCOME_CATEGORIES, INCOME_FREQUENCIES } from '../constants';
import { sanitizeString, validateAmount, validateDate } from '../utils/security';

interface AddIncomeProps {
  onAdd: (income: Income) => void;
  settings: AppSettings;
}

const AddIncome: React.FC<AddIncomeProps> = ({ onAdd, settings }) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IncomeCategory>('Salary');
  const [frequency, setFrequency] = useState<IncomeFrequency>('Monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!validateAmount(numAmount)) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description.');
      return;
    }

    if (!validateDate(date)) {
      setError('Please select a valid date.');
      return;
    }

    const newIncome: Income = {
      id: crypto.randomUUID(),
      amount: numAmount,
      description: sanitizeString(description),
      category,
      frequency,
      date,
      createdAt: Date.now()
    };

    onAdd(newIncome);
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Record Income</h2>
        <p className="text-slate-500 mt-1">Track your earnings to plan your growth.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-6">
        <div className="space-y-2 text-center">
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Amount</label>
          <div className="relative inline-block w-full">
            <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 -ml-24 text-4xl text-emerald-300 font-light">{settings.currency}</span>
            <input 
              type="number" 
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-5xl font-bold text-emerald-600 text-center focus:outline-none placeholder-emerald-50"
              autoFocus
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Source</label>
            <input 
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monthly Salary"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Date Received</label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Frequency</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {INCOME_FREQUENCIES.map(freq => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
                className={`px-3 py-3 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                  frequency === freq 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INCOME_CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-3 rounded-xl text-xs font-medium transition-all border ${
                  category === cat 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs text-center">{error}</div>}

        <div className="pt-4 grid grid-cols-2 gap-4">
          <button type="button" onClick={() => navigate(-1)} className="w-full py-4 text-slate-500 font-semibold hover:bg-slate-50 rounded-2xl">Cancel</button>
          <button type="submit" className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700 active:scale-95 transition-all">Save Income</button>
        </div>
      </form>
    </div>
  );
};

export default AddIncome;
