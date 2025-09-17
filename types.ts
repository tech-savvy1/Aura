
export interface Emotion {
  emotion: string;
  score: number;
}

export interface AnalysisResult {
  overallSentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  sentimentScore: number;
  engagementScore: number;
  emotions: Emotion[];
  keyThemes: string[];
  text: string;
}
