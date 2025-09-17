
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, Legend, ZAxis
} from 'recharts';
import { AnalysisResult, Emotion } from '../types';
import { Card } from './common/Card';

interface DashboardProps {
  data: AnalysisResult[];
}

const sentimentConfig = {
    Positive: { color: 'text-aura-accent-teal', chartColor: '#4fd1c5' },
    Negative: { color: 'text-red-400', chartColor: '#f56565' },
    Neutral: { color: 'text-aura-accent-lavender', chartColor: '#b794f4' },
    Mixed: { color: 'text-aura-accent-gold', chartColor: '#f6e05e' },
};

const getEmotionColor = (emotion: string): string => {
    const lowerEmotion = emotion.toLowerCase();
    const colorMap: Record<string, string> = {
        // --- Positive Emotions ---
        'joy': '#fde047',            // Yellow-300
        'happiness': '#facc15',      // Amber-400
        'love': '#f9a8d4',           // Pink-300
        'adoration': '#ec4899',      // Pink-500
        'excitement': '#fb923c',     // Orange-400
        'enthusiasm': '#f97316',     // Orange-500
        'surprise': '#67e8f9',       // Cyan-300 (Positive Surprise)
        'amusement': '#fdba74',      // Orange-300
        'trust': '#86efac',          // Green-300
        'admiration': '#4ade80',     // Green-400
        'anticipation': '#c4b5fd',   // Violet-300
        'optimism': '#a3e635',       // Lime-400
        'hope': '#84cc16',           // Lime-500
        'serenity': '#bae6fd',       // Sky-200
        'calmness': '#7dd3fc',       // Sky-300
        'satisfaction': '#34d399',   // Emerald-400
        'contentment': '#22c55e',    // Emerald-500
        'pride': '#f59e0b',          // Amber-500
        'relief': '#5eead4',         // Teal-300

        // --- Negative Emotions ---
        'anger': '#f87171',          // Red-400
        'rage': '#ef4444',           // Red-500
        'sadness': '#93c5fd',        // Blue-300
        'grief': '#60a5fa',          // Blue-400
        'disappointment': '#3b82f6', // Blue-500
        'fear': '#c084fc',           // Purple-400
        'anxiety': '#a855f7',        // Purple-500
        'disgust': '#a16207',        // Yellow-700
        'loathing': '#854d0e',       // Yellow-800
        'annoyance': '#fb7185',      // Rose-400
        'frustration': '#f43f5e',    // Rose-500
        'pessimism': '#be123c',      // Rose-700
        'remorse': '#94a3b8',        // Slate-400
        'guilt': '#64748b',          // Slate-500
        'shame': '#9333ea',          // Purple-600
        'jealousy': '#ca8a04',       // Amber-600
        'boredom': '#a1a1aa',        // Zinc-400

        // --- Neutral/Ambiguous Emotions ---
        'neutral': '#d1d5db',       // Gray-300
        'neutrality': '#9ca3af',     // Gray-400
        'curiosity': '#22d3ee',       // Cyan-400
        'interest': '#06b6d4',       // Cyan-500
        'confusion': '#a8a29e',       // Stone-400
    };
    return colorMap[lowerEmotion] || '#718096'; // default color (Slate-500)
};


const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-aura-primary p-2 border border-aura-secondary rounded-md shadow-lg">
        <p className="label text-aura-text-primary">{`${label} : ${(payload[0].value * 100).toFixed(0)}%`}</p>
      </div>
    );
  }
  return null;
};

const CustomScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-aura-primary p-3 border border-aura-secondary rounded-md shadow-lg max-w-sm">
        <p className="text-aura-text-secondary text-sm mb-2">
            Sentiment: <span className="font-bold text-white">{data.sentimentScore.toFixed(2)}</span> |
            Engagement: <span className="font-bold text-white">{data.engagementScore.toFixed(2)}</span>
        </p>
        <p className="text-aura-text-primary text-sm whitespace-normal leading-tight">{`"${data.text}"`}</p>
      </div>
    );
  }
  return null;
};


const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // --- Aggregate Calculations ---
  const avgSentimentScore = data.reduce((acc, curr) => acc + curr.sentimentScore, 0) / data.length;
  
  let overallSentimentLabel: keyof typeof sentimentConfig = 'Neutral';
  if (avgSentimentScore > 0.2) overallSentimentLabel = 'Positive';
  else if (avgSentimentScore < -0.2) overallSentimentLabel = 'Negative';
  else if (data.some(d => d.overallSentiment === 'Positive') && data.some(d => d.overallSentiment === 'Negative')) {
      overallSentimentLabel = 'Mixed';
  }
  const config = sentimentConfig[overallSentimentLabel];

  const aggregatedEmotions = data.flatMap(d => d.emotions)
    .reduce((acc, emotion) => {
      const lowerEmotion = emotion.emotion.toLowerCase();
      acc[lowerEmotion] = (acc[lowerEmotion] || 0) + emotion.score;
      return acc;
    }, {} as Record<string, number>);

  const topEmotions = Object.entries(aggregatedEmotions)
    .map(([emotion, score]) => ({ emotion, score: score / data.length }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const allThemes = data.flatMap(item => item.keyThemes);
  const themeCounts = allThemes.reduce((acc, theme) => {
    const lowerTheme = theme.toLowerCase();
    acc[lowerTheme] = (acc[lowerTheme] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topThemes = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(entry => entry[0]);

  // --- Donut Chart Calculation ---
  // Normalize score from -1..1 to 0..100 for the SVG stroke
  const scorePercentage = (avgSentimentScore + 1) / 2 * 100;
  // Calculate displayed score on a 0-10 scale
  const displayScore = (avgSentimentScore + 1) * 5;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in">
      {/* Overall Sentiment */}
      <Card title="Overall Sentiment" className="xl:col-span-1">
        <div className="flex flex-col items-center justify-center h-full p-4">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle className="text-aura-primary" strokeWidth="8" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
              <circle
                className={config.color} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"
                transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} />
            </svg>
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${config.color}`}>
              <span className="text-4xl font-bold">{displayScore.toFixed(1)}</span>
              <span className="text-lg font-semibold -mt-1">{overallSentimentLabel}</span>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Sentiment-Engagement Matrix */}
      <Card title="Sentiment-Engagement Matrix" className="md:col-span-2 xl:col-span-2">
        <div className="py-4 pr-4 h-96">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                    <XAxis type="number" dataKey="sentimentScore" name="Sentiment" unit="" domain={[-1, 1]} stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="number" dataKey="engagementScore" name="Engagement" unit="" domain={[0, 1]} stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                    <ZAxis type="number" range={[10, 200]} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{paddingTop: '20px'}} />
                    <Scatter name="Positive" data={data.filter(p => p.overallSentiment === 'Positive')} fill={sentimentConfig.Positive.chartColor} shape="circle" />
                    <Scatter name="Negative" data={data.filter(p => p.overallSentiment === 'Negative')} fill={sentimentConfig.Negative.chartColor} shape="circle" />
                    <Scatter name="Neutral" data={data.filter(p => p.overallSentiment === 'Neutral')} fill={sentimentConfig.Neutral.chartColor} shape="circle" />
                    <Scatter name="Mixed" data={data.filter(p => p.overallSentiment === 'Mixed')} fill={sentimentConfig.Mixed.chartColor} shape="circle" />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
      </Card>

      {/* Emotion Analysis */}
      <Card title="Emotion Analysis" className="md:col-span-2 xl:col-span-2">
         <div className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topEmotions} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="emotion" stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} className="capitalize" />
                    <YAxis stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}/>
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(113, 128, 150, 0.1)' }} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {topEmotions.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getEmotionColor(entry.emotion)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Key Themes */}
      <Card title="Key Themes" className="xl:col-span-1">
        <div className="p-4 flex flex-wrap gap-2">
          {topThemes.map((theme, index) => (
            <span key={index} className="bg-aura-primary text-aura-text-primary text-sm font-medium px-3 py-1 rounded-full capitalize">
              {theme}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
