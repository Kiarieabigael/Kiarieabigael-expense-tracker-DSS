
import { Category, IncomeCategory, IncomeFrequency } from './types';

export const CATEGORIES: Category[] = [
  'Food & Dining',
  'Transport',
  'Housing',
  'Entertainment',
  'Shopping',
  'Health',
  'Education',
  'Bills',
  'Others'
];

export const INCOME_CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Business',
  'Side Hustle',
  'Investment Return',
  'Gift',
  'Others'
];

export const INCOME_FREQUENCIES: IncomeFrequency[] = [
  'Weekly',
  'Bi-weekly',
  'Monthly',
  'One-time'
];

export const CATEGORY_COLORS: Record<Category, string> = {
  'Food & Dining': '#f87171',
  'Transport': '#60a5fa',
  'Housing': '#fbbf24',
  'Entertainment': '#a78bfa',
  'Shopping': '#34d399',
  'Health': '#f472b6',
  'Education': '#fb923c',
  'Bills': '#94a3b8',
  'Others': '#cbd5e1'
};

export const DEFAULT_CURRENCY = 'KSh';
