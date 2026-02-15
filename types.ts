
export type Category = 
  | 'Food & Dining'
  | 'Transport'
  | 'Housing'
  | 'Entertainment'
  | 'Shopping'
  | 'Health'
  | 'Education'
  | 'Bills'
  | 'Others';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO format
  createdAt: number;
}

export interface Budget {
  category: Category | 'Total';
  limit: number;
}

export interface Insight {
  id: string;
  text: string;
  type: 'positive' | 'warning' | 'neutral';
  dateGenerated: number;
}

export interface AppSettings {
  isMLPredictionsEnabled: boolean;
  currency: string;
  monthlyBudget: number;
}
