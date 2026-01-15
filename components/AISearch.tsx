
import React, { useState } from 'react';
import { Search, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { getAIRecommendations } from '../services/gemini';
import { getCMSData } from '../services/storage';
import { AIRecommendation } from '../types';
import { Link } from 'react-router-dom';

export const AISearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AIRecommendation[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const data = getCMSData();
    const recommendations = await getAIRecommendations(query, data);
    setResults(recommendations);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., How to start a business with small capital"
          className="w-full pl-12 pr-24 py-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm focus:border-blue-500 focus:ring-0 transition-all outline-none text-lg"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-6 w-6" />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Ask AI'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="mt-4 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-blue-50 px-4 py-2 flex items-center text-blue-700 text-sm font-semibold">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Recommendations
          </div>
          <div className="divide-y divide-gray-100">
            {results.map((rec, i) => (
              <Link 
                key={i} 
                to={rec.type === 'article' ? `/blog/${rec.id}` : `/marketplace/${rec.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1 ${
                      rec.type === 'article' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {rec.type}
                    </span>
                    <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{rec.reason}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
