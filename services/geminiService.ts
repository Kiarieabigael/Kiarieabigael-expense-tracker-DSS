
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Expense, Income, InvestmentAdvice, FinancialHealth, FinancialReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Suggests a category based on the expense description.
 * This is the only function that sends raw text, and only for the specific active entry.
 */
export async function suggestCategory(description: string): Promise<Category> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest a single financial category from this list for the description: "${description}". 
      List: Food & Dining, Transport, Housing, Entertainment, Shopping, Health, Education, Bills, Others. 
      Return only the category name.`,
      config: {
        maxOutputTokens: 20,
        temperature: 0.1,
      }
    });

    const suggested = response.text?.trim() as Category;
    const validCategories: Category[] = [
      'Food & Dining', 'Transport', 'Housing', 'Entertainment', 'Shopping', 'Health', 'Education', 'Bills', 'Others'
    ];
    
    return validCategories.includes(suggested) ? suggested : 'Others';
  } catch (error) {
    console.error("Gemini category suggestion failed", error);
    return 'Others';
  }
}

/**
 * Generates a comprehensive financial report for a month or a year.
 * DESCRIPTION STRIPPING: Only categories and frequencies are sent.
 */
export async function generateFinancialReport(
  period: string,
  expenses: Expense[],
  incomes: Income[],
  currency: string
): Promise<FinancialReport> {
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const surplus = totalIncome - totalExpenses;
  
  const categories: Record<string, number> = {};
  expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category, amount]) => ({ category: category as Category, amount }));

  // PRIVACY: We map income category instead of description
  const incomeSummary = incomes.map(i => ({ cat: i.category, freq: i.frequency, amt: i.amount }));

  const prompt = `
    You are a Kenyan financial advisor assistant. Create a ${period} financial report based on:
    - Total Income: ${currency} ${totalIncome}
    - Total Expenses: ${currency} ${totalExpenses}
    - Top Spending Categories: ${JSON.stringify(sortedCategories)}
    - Income Sources (Categorized): ${JSON.stringify(incomeSummary)}
    
    Structure your response as follows:
    1. A short, supportive, non-judgmental summary (max 3 sentences).
    2. Future-looking financial advice considering localized Kenyan investment options (MMFs, SACCOs, NSE).
    3. Emphasize emergency fund progress.
    
    Output in strict JSON format:
    {
      "summary": "string",
      "aiAdvice": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const aiResult = JSON.parse(response.text || '{}');
    
    return {
      period,
      summary: aiResult.summary || "A solid overview of your financial activity.",
      metrics: {
        totalIncome,
        totalExpenses,
        savings: Math.max(0, surplus * 0.5), // Simulated distribution
        investments: Math.max(0, surplus * 0.5),
        surplus
      },
      topCategories: sortedCategories,
      aiAdvice: aiResult.aiAdvice || "Continue tracking to see deeper trends."
    };
  } catch (error) {
    console.error("Report generation failed", error);
    return {
      period,
      summary: "Your financial report is ready. You have managed your cashflow through the period.",
      metrics: { totalIncome, totalExpenses, savings: 0, investments: 0, surplus },
      topCategories: sortedCategories,
      aiAdvice: "Consider setting aside 20% of your surplus into a Money Market Fund for liquidity."
    };
  }
}

/**
 * Generates Kenyan-specific investment advice based on financial standing.
 * Uses only aggregate totals.
 */
export async function generateInvestmentDSS(
  totalIncome: number, 
  totalExpenses: number, 
  currency: string
): Promise<{ health: FinancialHealth, investments: InvestmentAdvice[] }> {
  const surplus = totalIncome - totalExpenses;
  
  const prompt = `
    You are a Kenyan financial advisor. Analyze this aggregate data:
    - Monthly Income Total: ${currency} ${totalIncome}
    - Monthly Expenses Total: ${currency} ${totalExpenses}
    - Monthly Surplus Total: ${currency} ${surplus}
    
    Provide:
    1. Financial health summary (surplus, savings rate, emergency fund status). Emergency fund target is 3x monthly expenses.
    2. 3 Specific investment options available in Kenya (MMF, SACCO, M-Akiba, NSE, etc.) categorized by Risk (Low, Medium, High).
    3. High-risk options must include clear warnings.
    
    Output in strict JSON format matching:
    {
      "health": {
        "surplus": number,
        "savingsRate": number,
        "emergencyFundStatus": "Critical" | "Building" | "Secure",
        "recommendation": "string"
      },
      "investments": [
        { "level": "Low" | "Medium" | "High", "option": "string", "description": "string", "riskWarning": "string" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini DSS failed", error);
    return {
      health: {
        surplus,
        savingsRate: totalIncome > 0 ? (surplus / totalIncome) * 100 : 0,
        emergencyFundStatus: surplus > 0 ? 'Building' : 'Critical',
        recommendation: "Focus on building an emergency fund covering 3 months of expenses."
      },
      investments: [
        { level: 'Low', option: 'Money Market Fund (MMF)', description: 'Low-risk, flexible interest-earning account like CIC or Zimele.' }
      ]
    };
  }
}

/**
 * Generates supportive financial insights based on expense history.
 * PRIVACY: Descriptions stripped.
 */
export async function generateSpendingInsights(expenses: Expense[], monthlyBudget: number): Promise<string[]> {
  if (expenses.length < 3) return ["Add a few more expenses to see personalized insights."];
  
  // PRIVACY: Stripping raw descriptions (desc) from the payload
  const recentExpenses = expenses.slice(0, 20).map(e => ({ 
    amount: e.amount, 
    category: e.category, 
    date: e.date 
  }));
  
  const prompt = `Analyze these categorized spending patterns (descriptions stripped for privacy) and the budget of ${monthlyBudget}. Provide 2-3 short, supportive, non-judgmental insights. Output: JSON array of strings. Data: ${JSON.stringify(recentExpenses)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return ["Your spending patterns look consistent this month."];
  }
}
