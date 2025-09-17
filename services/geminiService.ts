
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      overallSentiment: {
        type: Type.STRING,
        description: "Overall sentiment of the text line. Must be one of: 'Positive', 'Negative', 'Neutral', 'Mixed'.",
        enum: ['Positive', 'Negative', 'Neutral', 'Mixed'],
      },
      sentimentScore: {
        type: Type.NUMBER,
        description: "A numerical score from -1.0 (very negative) to 1.0 (very positive), representing the intensity of the sentiment.",
      },
      engagementScore: {
        type: Type.NUMBER,
        description: "An estimated engagement score from 0.0 to 1.0, representing the likelihood of the text to generate user interaction (e.g., likes, comments).",
      },
      emotions: {
        type: Type.ARRAY,
        description: "A breakdown of up to 5 primary detected emotions and their confidence scores.",
        items: {
          type: Type.OBJECT,
          properties: {
            emotion: {
              type: Type.STRING,
              description: "The detected emotion from a wide spectrum (e.g., Joy, Sadness, Anger, Fear, Surprise, Frustration, Satisfaction, Admiration, Disgust, etc.)."
            },
            score: {
              type: Type.NUMBER,
              description: "Confidence score for this emotion, from 0.0 to 1.0."
            },
          },
          required: ['emotion', 'score'],
        },
      },
      keyThemes: {
        type: Type.ARRAY,
        description: "A list of 2-4 key themes, topics, or subjects mentioned in the text line.",
        items: {
          type: Type.STRING,
        },
      },
      text: {
        type: Type.STRING,
        description: "The original text of the line that was analyzed."
      }
    },
    required: ['overallSentiment', 'sentimentScore', 'engagementScore', 'emotions', 'keyThemes', 'text'],
  }
};


export const analyzeText = async (text: string): Promise<AnalysisResult[]> => {
  const prompt = `
    Perform a comprehensive sentiment and emotional analysis on the following text block. Each line in the block represents a distinct post or review.
    For each line, identify the overall sentiment, calculate a sentiment score, estimate a plausible engagement score, detect primary emotions, extract key themes, and include the original text.
    Return the result as a JSON array, where each object in the array corresponds to a line from the input text.

    Text to analyze:
    ---
    ${text}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (
        !Array.isArray(result) ||
        (result.length > 0 && (typeof result[0].sentimentScore !== 'number' || !result[0].overallSentiment))
    ) {
        throw new Error("Invalid data structure received from API. Expected an array of analysis results.");
    }
    
    // In case the model returns an empty array for an empty input
    if (result.length === 0 && text.trim().length > 0) {
        throw new Error("API returned an empty result for valid text.");
    }

    return result as AnalysisResult[];

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from Gemini API.");
  }
};