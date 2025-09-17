import React, { useState, useCallback } from 'react';
import { AnalysisResult } from './types';
import { analyzeText } from './services/geminiService';
import Dashboard from './components/Dashboard';
import { Spinner } from './components/common/Spinner';
import { AuraLogo } from './components/icons/AuraLogo';

const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [analysis, setAnalysis] = useState<AnalysisResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = useCallback(async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeText(text);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      setError('Failed to analyze sentiment. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [text]);

  const exampleText = `The new headphones are incredible! The sound quality is crisp and the noise cancellation is top-notch. A must-buy for audiophiles.
I'm so disappointed with this laptop. The battery life is terrible, it overheats constantly, and customer support was no help at all.
This coffee maker is just okay. It gets the job done but doesn't have any special features. Pretty average.
WOW! This gaming mouse has completely changed how I play. It's so responsive and comfortable. 10/10 would recommend!
I waited a month for this package to arrive, and it was damaged. The product itself seems fine, but the shipping experience was awful.
Not sure how I feel about this new phone update. Some features are cool, but others are really confusing and unintuitive.`;

  return (
    <div className="min-h-screen bg-aura-bg text-aura-text-primary font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <AuraLogo className="h-10 w-10 text-aura-accent-teal" />
          <div>
            <h1 className="text-3xl font-bold text-white">Aura</h1>
            <p className="text-aura-text-secondary">Advanced Sentiment & Engagement Analytics</p>
          </div>
        </header>

        <main>
          <div className="bg-aura-surface p-6 rounded-2xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Analyze Text</h2>
            <textarea
              className="w-full h-40 p-4 bg-aura-primary border border-aura-secondary rounded-lg focus:ring-2 focus:ring-aura-accent-lavender focus:outline-none transition-shadow duration-200 text-aura-text-primary placeholder-aura-text-secondary"
              placeholder="Paste social media posts or reviews here, one per line..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
              <button
                  onClick={() => setText(exampleText)}
                  className="text-sm bg-aura-primary hover:bg-opacity-80 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Load Example
              </button>
              <button
                onClick={handleAnalysis}
                disabled={isLoading}
                className="w-full sm:w-auto bg-aura-accent-teal hover:bg-opacity-90 text-aura-bg font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 disabled:bg-aura-primary disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
              >
                {isLoading ? <><Spinner /> Analyzing...</> : 'Analyze'}
              </button>
            </div>
          </div>

          {error && <div className="bg-red-900 border border-red-700 text-red-100 p-4 rounded-lg text-center mb-8">{error}</div>}
          
          {!isLoading && !analysis && !error && (
            <div className="text-center py-16 px-6 bg-aura-surface rounded-2xl shadow-lg">
                <AuraLogo className="h-16 w-16 text-aura-accent-lavender mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white">Welcome to Aura</h3>
                <p className="text-aura-text-secondary mt-2 max-w-xl mx-auto">
                    Enter text above, with each post or review on a new line, to unveil nuanced emotional insights and see your content on the Sentiment-Engagement Matrix.
                </p>
            </div>
          )}

          {analysis && <Dashboard data={analysis} />}
        </main>
      </div>
    </div>
  );
};

export default App;