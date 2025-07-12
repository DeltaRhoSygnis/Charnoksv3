
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Sale, ForecastDataPoint, AIInsights, Expense, Product, ParsedSaleFromAI } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const generatePromptForForecast = (sales: Sale[]): string => {
  const historicalData = sales.slice(0, 30).map(s => ({ date: new Date(s.date).toLocaleDateString(), total: s.total }));
  const dataSummary = historicalData.reduce((acc, curr) => {
    const date = curr.date;
    acc[date] = (acc[date] || 0) + curr.total;
    return acc;
  }, {} as Record<string, number>);

  return `
    You are a financial analyst for a small restaurant.
    Based on the following daily sales data for the last 30 days, please provide a 7-day sales forecast.
    
    Historical Data (date: total sales):
    ${JSON.stringify(dataSummary, null, 2)}
  `;
};


const generatePromptForInsights = (sales: Sale[], expenses: Expense[]): string => {
  const totalSales = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  return `
    You are an expert business consultant for a small fried chicken restaurant.
    Here is a snapshot of their recent performance:
    - Total Sales (last 90 days): $${totalSales.toFixed(2)}
    - Total Expenses (last 90 days): $${totalExpenses.toFixed(2)}
    - Net Profit (last 90 days): $${(totalSales - totalExpenses).toFixed(2)}

    Based on this data, provide smart business insights.
    - "insights": Provide 2-3 general observations.
    - "risks": Identify 2-3 potential risks or areas of concern.
    - "opportunities": Suggest 2-3 growth opportunities or areas for improvement.
  `;
};


export const getSalesForecast = async (sales: Sale[]): Promise<ForecastDataPoint[]> => {
  if (!ai) return Promise.reject(new Error("API key not configured."));

  const prompt = generatePromptForForecast(sales);
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING, description: "The forecasted day, e.g., 'Day 1'" },
                predictedSales: { type: Type.NUMBER, description: 'The predicted sales amount for that day.' },
              },
              required: ["day", "predictedSales"],
            }
          },
          temperature: 0.5,
        }
    });
    
    if (!response.text) {
        throw new Error("AI response was empty.");
    }
    const jsonStr = response.text.trim();
    const parsedData = JSON.parse(jsonStr);
    
    if (Array.isArray(parsedData) && parsedData.every(item => 'day' in item && 'predictedSales' in item)) {
        return parsedData;
    } else {
        throw new Error("AI response is not in the expected format.");
    }

  } catch (error) {
    console.error("Error fetching sales forecast:", error);
    throw new Error("Failed to get sales forecast from AI.");
  }
};

export const getBusinessInsights = async (sales: Sale[], expenses: Expense[]): Promise<AIInsights> => {
    if (!ai) return Promise.reject(new Error("API key not configured."));

    const prompt = generatePromptForInsights(sales, expenses);
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        insights: { type: Type.ARRAY, items: { type: Type.STRING }, description: "General observations about the business." },
                        risks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potential risks or areas of concern." },
                        opportunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Growth opportunities or areas for improvement." }
                    },
                    required: ["insights", "risks", "opportunities"],
                },
                temperature: 0.7
            }
        });

        if (!response.text) {
            throw new Error("AI response was empty.");
        }
        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);
        if (parsedData && 'insights' in parsedData && 'risks' in parsedData && 'opportunities' in parsedData) {
            return parsedData;
        } else {
            throw new Error("AI response is not in the expected format for insights.");
        }
    } catch (error) {
        console.error("Error fetching business insights:", error);
        throw new Error("Failed to get business insights from AI.");
    }
};

const generatePromptForVoiceSale = (transcript: string, products: Product[]): string => {
  const productNames = products.map(p => p.name).join(', ');
  return `
    You are an intelligent Point of Sale assistant. Your task is to parse a spoken sales order into a structured JSON format.
    The user will provide a string of text. You must identify product names, their quantities, and the payment amount mentioned.

    - Match the product names from the text to the available product list.
    - If a product is mentioned without a quantity, assume the quantity is 1.
    - The payment is usually mentioned at the end with a currency word like "pesos", "dollars", or just a number.
    - If no payment is mentioned, the payment value should be 0.

    Available Products: ${productNames}

    Transcript to parse: "${transcript}"
  `;
}

export const parseSaleFromVoice = async (transcript: string, products: Product[]): Promise<ParsedSaleFromAI> => {
  if (!ai) return Promise.reject(new Error("API key not configured."));

  const prompt = generatePromptForVoiceSale(transcript, products);
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                items: {
                    type: Type.ARRAY,
                    description: "List of products and their quantities.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            productName: {
                                type: Type.STRING,
                                description: "The name of the product mentioned. Must exactly match one of the available product names.",
                            },
                            quantity: {
                                type: Type.INTEGER,
                                description: "The quantity of the product.",
                            }
                        },
                        required: ["productName", "quantity"]
                    }
                },
                payment: {
                    type: Type.NUMBER,
                    description: "The payment amount in numbers, e.g., 100. If not mentioned, return 0."
                }
            },
            required: ["items", "payment"]
          },
          temperature: 0.1,
        }
    });
    
    if (!response.text) {
        throw new Error("AI response was empty.");
    }
    const jsonStr = response.text.trim();
    const parsedData = JSON.parse(jsonStr) as ParsedSaleFromAI;

    // Basic validation
    if (parsedData && Array.isArray(parsedData.items) && typeof parsedData.payment === 'number') {
        return parsedData;
    } else {
        throw new Error("AI response is not in the expected format for a sale.");
    }

  } catch (error) {
    console.error("Error parsing sale from voice:", error);
    throw new Error("Failed to parse sale from AI.");
  }
};

export const getAIAssistantResponse = async (
    query: string,
    history: { text: string; sender: 'user' | 'ai' }[],
    sales: Sale[],
    expenses: Expense[],
    products: Product[]
): Promise<string> => {
    if (!ai) return Promise.reject(new Error("API key not configured."));

    // Prepare a compact version of the data for the prompt
    const latestSales = sales.slice(0, 50).map(s => ({ date: s.date, total: s.total, items: s.items.length }));
    const latestExpenses = expenses.slice(0, 20).map(e => ({ date: e.date, amount: e.amount, description: e.description.slice(0, 20) }));
    const productList = products.map(p => ({ name: p.name, price: p.price, stock: p.stock, category: p.category }));

    const systemInstruction = `
        You are a helpful business assistant for a Point of Sale (POS) system called "Charnoks".
        Your role is to analyze the provided business data and answer the user's questions in a clear, concise, and friendly manner.
        You should provide actionable insights, summaries, and answers based ONLY on the data given.
        When asked for suggestions, be creative but realistic for a small business.
        Format your answers using markdown for better readability (e.g., use lists, bold text).
        If you are asked a question you cannot answer with the given data, politely say so.

        Here is the current business data:
        - Products: ${JSON.stringify(productList)}
        - Recent Sales (up to 50): ${JSON.stringify(latestSales)}
        - Recent Expenses (up to 20): ${JSON.stringify(latestExpenses)}
    `;

    // Format chat history for Gemini
    const geminiHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [...geminiHistory, { role: 'user', parts: [{ text: query }] }],
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            }
        });

        if (!response.text) {
            throw new Error("AI assistant did not provide a response.");
        }
        return response.text;
    } catch (error) {
        console.error("Error fetching AI assistant response:", error);
        throw new Error("Failed to get response from AI assistant.");
    }
};
