import { GoogleGenAI, Type } from "@google/genai";
import { CMSData, AIRecommendation } from '../types.ts';

export interface GroundedTrend {
  title: string;
  description: string;
  platform: string;
  sources: { title: string; uri: string }[];
}

export const getAIRecommendations = async (query: string, cmsData: CMSData): Promise<AIRecommendation[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const context = `
    Context: You are the AI assistant for INCOMELAB. 
    The site has articles about: ${cmsData.articles.map(a => a.title).join(', ')}
    The site has products: ${cmsData.products.map(p => p.name).join(', ')}
    
    Task: Based on the user query, recommend the most relevant 2 items from our inventory.
    User Query: "${query}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, description: 'article or product' },
              id: { type: Type.STRING, description: 'The original item title or name to match' },
              title: { type: Type.STRING },
              reason: { type: Type.STRING, description: 'Why this is recommended' }
            },
            required: ['type', 'id', 'title', 'reason']
          }
        }
      }
    });

    const json = JSON.parse(response.text || '[]');
    
    return json.map((rec: any) => {
      let matchedId = '';
      if (rec.type === 'article') {
        matchedId = cmsData.articles.find(a => a.title.toLowerCase().includes(rec.id.toLowerCase()))?.id || '';
      } else {
        matchedId = cmsData.products.find(p => p.name.toLowerCase().includes(rec.id.toLowerCase()))?.id || '';
      }
      return { ...rec, id: matchedId };
    }).filter((r: AIRecommendation) => r.id !== '');

  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [];
  }
};

/**
 * Fetches real-world trending data using Google Search Grounding.
 * Focuses on YouTube and Google search trends for income opportunities.
 */
export const fetchLiveTrends = async (category: string): Promise<GroundedTrend[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Research the latest high-volume search trends on Google and YouTube for the year 2025/2026 
    specifically regarding "${category} Income Opportunities". 
    Identify 3 specific, actionable trends that people are searching for right now.
    For each trend, provide a concise summary of WHY it's trending.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Required for Google Search Grounding
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text || '';
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract URIs for grounding
    const sources = chunks.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri || '#'
    })).filter(s => s.uri !== '#');

    const trends: GroundedTrend[] = [
      {
        title: `Live ${category} Insight`,
        description: text,
        platform: "Google Search & YouTube Trends",
        sources: sources.slice(0, 5) // Return first 5 sources
      }
    ];

    return trends;
  } catch (error) {
    console.error("Live Trends Error:", error);
    return [];
  }
};