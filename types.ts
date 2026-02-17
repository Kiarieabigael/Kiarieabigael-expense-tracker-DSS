
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

export type IncomeCategory = 
  | 'Salary'
  | 'Business'
  | 'Side Hustle'
  | 'Investment Return'
  | 'Gift'
  | 'Others';

export type IncomeFrequency = 'Weekly' | 'Bi-weekly' | 'Monthly' | 'One-time';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  description: string;
  date: string; // ISO format
  createdAt: number;
}

export interface Income {
  id: string;
  amount: number;
  category: IncomeCategory;
  frequency: IncomeFrequency;
  description: string;
  date: string;
  createdAt: number;
}

export interface InvestmentAdvice {
  level: 'Low' | 'Medium' | 'High';
  option: string;
  description: string;
  riskWarning?: string;
}

export interface FinancialHealth {
  surplus: number;
  savingsRate: number;
  emergencyFundStatus: 'Critical' | 'Building' | 'Secure';
  recommendation: string;
}

export interface FinancialReport {
  period: string; // e.g., "January 2024" or "2024 Annual"
  summary: string;
  metrics: {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    investments: number;
    surplus: number;
  };
  topCategories: { category: Category; amount: number }[];
  aiAdvice: string;
}

export interface AppSettings {
  isMLPredictionsEnabled: boolean;
  isAIFeaturesEnabled: boolean;
  hasAcceptedAIDisclosure: boolean;
  currency: string;
  monthlyBudget: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  authProvider: 'local';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
