'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (credentials: {
    resovaApiKey: string;
    resovaApiUrl: string;
    claudeApiKey: string;
  }) => Promise<void>;
  onBack?: () => void;
}

export default function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const [resovaApiUrl, setResovaApiUrl] = useState('https://api.resova.io/v1');
  const [resovaApiKey, setResovaApiKey] = useState('');
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [region, setRegion] = useState('io');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const environments = {
    us: 'https://api.resova.us/v1',
    eu: 'https://api.resova.eu/v1',
    io: 'https://api.resova.io/v1',
    staging1: 'https://api.staging1.resova.io/v1',
  };

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    setResovaApiUrl(environments[newRegion as keyof typeof environments] || environments.io);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resovaApiKey && claudeApiKey) {
      setIsLoading(true);
      setError(null);

      try {
        await onLogin({ resovaApiKey, resovaApiUrl, claudeApiKey });
      } catch (error: any) {
        setError(error.message || 'Failed to connect. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 relative">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center space-x-2 text-gray-600 hover:text-[#2685CF] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </button>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <div className="mb-6">
            <img
              src="/logo.png"
              alt="Resova"
              className="h-16 mx-auto"
            />
          </div>
          <p className="text-gray-600">Connect your Resova account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resova Environment
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {['us', 'eu', 'io', 'staging1'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRegionChange(r)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    region === r
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {r === 'staging1' ? 'STAGING' : r.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">{resovaApiUrl}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resova API Key
            </label>
            <input
              type="password"
              value={resovaApiKey}
              onChange={(e) => setResovaApiKey(e.target.value)}
              placeholder="Enter your Resova API key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Claude API Key
            </label>
            <input
              type="password"
              value={claudeApiKey}
              onChange={(e) => setClaudeApiKey(e.target.value)}
              placeholder="Enter your Claude API key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Required for AI-powered insights and analytics
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2685CF] text-white py-3 rounded-lg hover:bg-[#1E6FB0] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isLoading ? 'Connecting...' : 'Connect to Resova'}
          </button>
        </form>
      </div>
    </div>
  );
}