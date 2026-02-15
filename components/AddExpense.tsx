
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, ChevronDown, Check } from 'lucide-react';
import { Expense, Category, AppSettings } from '../types';
import { CATEGORIES } from '../constants';
import { sanitizeString, validateAmount, validateDate } from '../utils/security';
import { suggestCategory } from '../services/geminiService';

interface AddExpenseProps {
  onAdd: (expense: Expense) => void;
  settings: AppSettings;
}

const AddExpense: React.FC<AddExpenseProps> = ({ onAdd, settings }) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Others');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState('');

  // ML Suggestion Logic
  useEffect(() => {
    if (!settings.isMLPredictionsEnabled || description.length < 3) return;

    const timeoutId = setTimeout(async () => {
      setIsSuggesting(true);
      const suggestion = await suggestCategory(description);
      setCategory(suggestion);
      setIsSuggesting(false);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [description, settings.isMLPredictionsEnabled]);

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

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount: numAmount,
      description: sanitizeString(description),
      category,
      date,
      createdAt: Date.now()
    };

    onAdd(newExpense);
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Add Expense</h2>
        <p className="text-slate-500 mt-1">Record your spending mindfully.</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-8">
        {/* Dominant Amount Field */}
        <div className="space-y-2 text-center">
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Amount</label>
          <div className="relative inline-block w-full">
            <span className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 -ml-24 text-4xl text-slate-300 font-light">{settings.currency}</span>
            <input 
              type="number" 
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-5xl font-bold text-slate-800 text-center focus:outline-none placeholder-slate-100"
              autoFocus
              required
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">What was it for?</label>
          <input 
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Weekly Groceries"
            className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-800"
            maxLength={100}
            required
          />
        </div>

        {/* Category + Suggestion Badge */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
            {isSuggesting ? (
              <span className="text-[10px] text-indigo-400 animate-pulse flex items-center gap-1 font-medium">
                <Sparkles size={10} /> Suggesting...
              </span>
            ) : settings.isMLPredictionsEnabled && description.length >= 3 && (
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                <Check size={10} /> Suggested
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-3 rounded-xl text-xs font-medium transition-all border ${
                  category === cat 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Date Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Date</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar size={18} />
            </div>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-slate-800"
              required
            />
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs text-center font-medium">
            {error}
          </div>
        )}

        <div className="pt-4 grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="w-full py-4 text-slate-500 font-semibold hover:bg-slate-50 rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            Save Expense
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;
