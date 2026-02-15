
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Expense } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Suggests a category based on the expense description.
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
 * Generates supportive financial insights based on expense history.
 */
export async function generateSpendingInsights(expenses: Expense[], monthlyBudget: number): Promise<string[]> {
  if (expenses.length < 3) return ["Add a few more expenses to see personalized insights."];

  const recentExpenses = expenses.slice(0, 20).map(e => ({
    amount: e.amount,
    category: e.category,
    desc: e.description,
    date: e.date
  }));

  const prompt = `
    Analyze these recent expenses and the monthly budget of ${monthlyBudget}. 
    Provide 2-3 short, supportive, and non-judgmental spending insights or patterns. 
    Focus on helpful observations like "Most of your spending happens on weekends" or "You're doing great keeping your dining out costs down."
    
    Data: ${JSON.stringify(recentExpenses)}
    
    Output format: A JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const insights = JSON.parse(response.text || '[]');
    return insights;
  } catch (error) {
    console.error("Gemini insights generation failed", error);
    return ["Your spending patterns look consistent this month."];
  }
}
