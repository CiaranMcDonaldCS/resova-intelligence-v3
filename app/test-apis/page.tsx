'use client';

import { useState } from 'react';

interface ApiTestResult {
  name: string;
  endpoint: string;
  method: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  responseCount?: number;
  error?: string;
  responseTime?: number;
  sampleData?: any;
}

export default function TestApisPage() {
  const [apiKey, setApiKey] = useState('');
  const [testResults, setTestResults] = useState<ApiTestResult[]>([
    {
      name: 'Gift Vouchers',
      endpoint: '/v1/reporting/inventory/giftVouchers',
      method: 'POST',
      status: 'pending'
    },
    {
      name: 'Guests (Customers)',
      endpoint: '/v1/reporting/guests',
      method: 'GET',
      status: 'pending'
    },
    {
      name: 'Extras (Add-ons)',
      endpoint: '/v1/reporting/inventory/extras',
      method: 'GET',
      status: 'pending'
    }
  ]);

  const updateTestResult = (index: number, updates: Partial<ApiTestResult>) => {
    setTestResults(prev => {
      const newResults = [...prev];
      newResults[index] = { ...newResults[index], ...updates };
      return newResults;
    });
  };

  const testGiftVouchersApi = async () => {
    const index = 0;
    updateTestResult(index, { status: 'loading' });
    const startTime = performance.now();

    try {
      const response = await fetch('https://api.resova.io/v1/reporting/inventory/giftVouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          date_range: { range: '365' },
          type: 'all_gifts',
          transaction_status: 'all',
          gift_status: 'all'
        })
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      updateTestResult(index, {
        status: 'success',
        responseCount: Array.isArray(data) ? data.length : 0,
        responseTime,
        sampleData: Array.isArray(data) && data.length > 0 ? data[0] : null
      });
    } catch (error: any) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      updateTestResult(index, {
        status: 'error',
        error: error.message || 'Unknown error',
        responseTime
      });
    }
  };

  const testGuestsApi = async () => {
    const index = 1;
    updateTestResult(index, { status: 'loading' });
    const startTime = performance.now();

    try {
      const params = new URLSearchParams({
        'date_range[range]': '365',
        'type': 'by_date_attended',
        'items': 'all'
      });

      const response = await fetch(`https://api.resova.io/v1/reporting/guests?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      updateTestResult(index, {
        status: 'success',
        responseCount: Array.isArray(data) ? data.length : 0,
        responseTime,
        sampleData: Array.isArray(data) && data.length > 0 ? data[0] : null
      });
    } catch (error: any) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      updateTestResult(index, {
        status: 'error',
        error: error.message || 'Unknown error',
        responseTime
      });
    }
  };

  const testExtrasApi = async () => {
    const index = 2;
    updateTestResult(index, { status: 'loading' });
    const startTime = performance.now();

    try {
      const params = new URLSearchParams({
        'date_range[range]': '365',
        'extras': 'all',
        'transaction_status': 'all'
      });

      const response = await fetch(`https://api.resova.io/v1/reporting/inventory/extras?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      updateTestResult(index, {
        status: 'success',
        responseCount: Array.isArray(data) ? data.length : 0,
        responseTime,
        sampleData: Array.isArray(data) && data.length > 0 ? data[0] : null
      });
    } catch (error: any) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      updateTestResult(index, {
        status: 'error',
        error: error.message || 'Unknown error',
        responseTime
      });
    }
  };

  const runAllTests = async () => {
    await testGiftVouchersApi();
    await testGuestsApi();
    await testExtrasApi();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏸️';
      case 'loading': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'loading': return 'bg-blue-100 text-blue-700';
      case 'success': return 'bg-green-100 text-green-700';
      case 'error': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Resova Reporting APIs Test</h1>
            <p className="text-gray-600">
              Test the three new Reporting APIs to verify they are working correctly.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Enter Your Resova API Key</h2>
            <p className="text-sm text-gray-600 mb-4">
              Your API key is required to test the Resova Reporting APIs. It will only be used for testing and not stored.
            </p>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Resova API Key"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {}}
              disabled={!apiKey}
              className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Tests
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resova Reporting APIs Test</h1>
          <p className="text-gray-600">
            Test the three new Reporting APIs to verify they are working correctly.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={runAllTests}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Run All Tests
            </button>
            <button
              onClick={testGiftVouchersApi}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Test Gift Vouchers
            </button>
            <button
              onClick={testGuestsApi}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Test Guests
            </button>
            <button
              onClick={testExtrasApi}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Test Extras
            </button>
            <button
              onClick={() => setApiKey('')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ml-auto"
            >
              Change API Key
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div
              key={result.name}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {getStatusIcon(result.status)} {result.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {result.method}
                    </span>{' '}
                    <span className="font-mono text-xs">{result.endpoint}</span>
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                  {result.status.toUpperCase()}
                </span>
              </div>

              {result.status === 'success' && (
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Records Returned</p>
                      <p className="text-2xl font-bold text-green-600">{result.responseCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Response Time</p>
                      <p className="text-2xl font-bold text-blue-600">{result.responseTime}ms</p>
                    </div>
                  </div>

                  {result.sampleData && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Sample Data (First Record):</p>
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-48">
                        {JSON.stringify(result.sampleData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {result.status === 'error' && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-800 mb-1">Error Details:</p>
                    <p className="text-sm text-red-700 font-mono">{result.error}</p>
                    {result.responseTime && (
                      <p className="text-sm text-red-600 mt-2">Failed after {result.responseTime}ms</p>
                    )}
                  </div>

                  {result.error?.includes('CORS') || result.error?.includes('Failed to fetch') ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-3">
                      <p className="text-sm font-medium text-blue-800 mb-1">Expected Behavior:</p>
                      <p className="text-sm text-blue-700">
                        CORS errors are expected when running in a web browser during development.
                        These APIs will work correctly in:
                      </p>
                      <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                        <li>Electron desktop environment (no CORS restrictions)</li>
                        <li>Server-side rendering (Next.js server components)</li>
                        <li>Production deployments with proper server-side API routes</li>
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}

              {result.status === 'loading' && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Testing API endpoint...</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About These Tests</h3>
          <p className="text-sm text-blue-800 mb-3">
            These tests verify that the three new Resova Reporting APIs are correctly integrated:
          </p>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li><strong>Gift Vouchers API</strong> - 22 fields including redemption tracking and purchaser information</li>
            <li><strong>Guests API</strong> - 48 fields including lifetime value, purchase history, and waiver compliance</li>
            <li><strong>Extras API</strong> - 17 fields including inventory levels and sales performance</li>
          </ul>
          <p className="text-sm text-blue-800 mt-3">
            All APIs fetch data for the last 12 months (365 days) as configured in the service layer.
          </p>
        </div>
      </div>
    </div>
  );
}
