import { GoogleGenAI, Type } from "@google/genai";
import { Company, FundamentalAnalysis, SentimentAnalysis } from "../types";

// Note: process.env.GEMINI_API_KEY is handled by the platform
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export class GeminiService {
  static async performFundamentalScan(company: Company): Promise<FundamentalAnalysis> {
    const prompt = `Voer een uitgebreide fundamentele analyse uit van het volgende bedrijf genoteerd op Euronext Amsterdam:
    Naam: ${company.name}
    Symbool: ${company.symbol}
    ISIN: ${company.isin}
    Sector: ${company.sector || 'Onbekend'}

    Geef een gedetailleerd rapport in het NEDERLANDS inclusief:
    1. Korte geschiedenis en evolutie van het bedrijf.
    2. Analyse van hun businessmodel en belangrijkste inkomstenstromen.
    3. Beoordeling van de financiële gezondheid (kwalitatief op basis van recente trends).
    4. Marktpositie en competitief landschap.
    5. Type economische slotgracht (moat), indien aanwezig.
    6. SWOT-analyse.
    7. Risico-classificatie (Laag, Gemiddeld, of Hoog).
    8. Beleggingsaanbeveling (Hold, Buy, Sell, Koop, Verkoop) met onderbouwing.
    9. Een beknopte samenvatting voor een executive.

    Zorg ervoor dat ALLE labels in de 'keyMetrics' array ook vertaald zijn naar het Nederlands (bijv. 'P/E Ratio' wordt 'Koers-winstverhouding', 'Market Cap' wordt 'Marktkapitalisatie'). Zoek naar het laatste financiële nieuws en rapporten van 2024 en 2025 voor actuele inzichten. Alle tekst MOET in het Nederlands zijn.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              companyHistory: { type: Type.STRING },
              businessModel: { type: Type.STRING },
              financialHealth: {
                type: Type.OBJECT,
                properties: {
                  score: { type: Type.NUMBER, description: "A score from 0 to 100" },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keyMetrics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING }
                      },
                      required: ["label", "value"]
                    }
                  }
                },
                required: ["score", "strengths", "weaknesses", "keyMetrics"]
              },
              marketPosition: { type: Type.STRING },
              moatType: { type: Type.STRING },
              swotAnalysis: {
                type: Type.OBJECT,
                properties: {
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  threats: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["strengths", "weaknesses", "opportunities", "threats"]
              },
              riskRating: { 
                type: Type.STRING, 
                enum: ["Low", "Medium", "High"] 
              },
              recommendation: { type: Type.STRING },
              summary: { type: Type.STRING }
            },
            required: [
              "companyHistory", 
              "businessModel", 
              "financialHealth", 
              "marketPosition", 
              "moatType", 
              "swotAnalysis", 
              "riskRating", 
              "recommendation", 
              "summary"
            ]
          },
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "{}";
      const cleaned = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
      const analysis = JSON.parse(cleaned) as FundamentalAnalysis;
      analysis.lastUpdated = new Date().toISOString();
      return analysis;
    } catch (error) {
      console.error("Gemini Scan Error:", error);
      throw new Error(`Failed to perform fundamental scan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async performSentimentAnalysis(company: Company): Promise<SentimentAnalysis> {
    const prompt = `Voer een sentimentanalyse uit van het volgende bedrijf genoteerd op Euronext Amsterdam:
    Naam: ${company.name}
    Symbool: ${company.symbol}
    ISIN: ${company.isin}

    Geef een gedetailleerd rapport in het NEDERLANDS inclusief:
    1. Een totaalscore van het sentiment (-100 tot 100).
    2. Een label (Zeer Negatief, Negatief, Neutraal, Positief, Zeer Positief).
    3. Een beknopte samenvatting van het algemene sentiment.
    4. Een lijst met recent nieuws (minimaal 3 items) met titel, bron, datum, sentiment (Positive, Negative, Neutral) en impact omschrijving.
    5. Social media buzz info voor relevante platformen (X, Reddit, LinkedIn).

    Zoek naar het allerlaatste nieuws en sociale trends van de afgelopen week.
    Retourneer ALTIJD in JSON-formaat. Alle tekst MOET in het Nederlands zijn.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              label: { 
                type: Type.STRING,
                enum: ['Zeer Negatief', 'Negatief', 'Neutraal', 'Positief', 'Zeer Positief']
              },
              summary: { type: Type.STRING },
              recentNews: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    source: { type: Type.STRING },
                    date: { type: Type.STRING },
                    sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] },
                    impact: { type: Type.STRING }
                  },
                  required: ["title", "source", "date", "sentiment", "impact"]
                }
              },
              socialMediaBuzz: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    platform: { type: Type.STRING },
                    trend: { type: Type.STRING, enum: ['Rising', 'Falling', 'Stable'] },
                    volume: { type: Type.STRING }
                  },
                  required: ["platform", "trend", "volume"]
                }
              }
            },
            required: ["score", "label", "summary", "recentNews", "socialMediaBuzz"]
          },
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "{}";
      const cleaned = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
      const analysis = JSON.parse(cleaned) as SentimentAnalysis;
      analysis.lastUpdated = new Date().toISOString();
      return analysis;
    } catch (error) {
      console.error("Gemini Sentiment Error:", error);
      throw new Error(`Failed to perform sentiment analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
