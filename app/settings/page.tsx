'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthStorage } from '@/app/lib/storage/auth-storage';
import { ConfigStorage } from '@/app/lib/storage/config-storage';
import { ActivityType } from '@/app/lib/storage/types';
import { getActivityOptionsByCategory } from '@/app/lib/config/activity-types';

type SettingsTab = 'credentials' | 'activities' | 'business';

interface FormData {
  // Credentials
  resovaApiKey: string;
  resovaApiUrl: string;
  claudeApiKey: string;

  // Activities
  activityTypes: ActivityType[];

  // Business
  businessName: string;
  timezone: string;
  currency: string;
}

interface FormErrors {
  resovaApiKey?: string;
  resovaApiUrl?: string;
  claudeApiKey?: string;
  activityTypes?: string;
}

const RESOVA_DATACENTER_OPTIONS = [
  { value: 'https://api.resova.us/v1', label: 'United States (api.resova.us)' },
  { value: 'https://api.resova.eu/v1', label: 'Europe (api.resova.eu)' },
  { value: 'https://api.resova.io/v1', label: 'International (api.resova.io)' },
  { value: 'https://api.staging1.resova.io/v1', label: 'Staging (api.staging1.resova.io)' },
];

const TIMEZONE_OPTIONS = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const CURRENCY_OPTIONS = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('credentials');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    resovaApiKey: '',
    resovaApiUrl: RESOVA_DATACENTER_OPTIONS[0].value,
    claudeApiKey: '',
    activityTypes: [],
    businessName: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
    currency: 'USD',
  });

  // Load existing settings on mount
  useEffect(() => {
    const authData = AuthStorage.load();
    const configData = ConfigStorage.load();

    if (authData) {
      setFormData(prev => ({
        ...prev,
        resovaApiKey: authData.resovaApiKey || '',
        resovaApiUrl: authData.resovaApiUrl || RESOVA_DATACENTER_OPTIONS[0].value,
        claudeApiKey: authData.claudeApiKey || '',
      }));
    }

    if (configData) {
      setFormData(prev => ({
        ...prev,
        activityTypes: configData.activityTypes || [],
        businessName: configData.businessName || '',
        timezone: configData.timezone || prev.timezone,
        currency: configData.currency || 'USD',
      }));
    }
  }, []);

  // Validation
  const validateCredentials = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.resovaApiKey.trim()) {
      newErrors.resovaApiKey = 'Resova API key is required';
    } else if (formData.resovaApiKey.length < 10) {
      newErrors.resovaApiKey = 'API key appears to be invalid';
    }

    if (!formData.resovaApiUrl.trim()) {
      newErrors.resovaApiUrl = 'Resova API URL is required';
    } else if (!formData.resovaApiUrl.startsWith('https://')) {
      newErrors.resovaApiUrl = 'API URL must start with https://';
    }

    if (!formData.claudeApiKey.trim()) {
      newErrors.claudeApiKey = 'Claude API key is required';
    } else if (!formData.claudeApiKey.startsWith('sk-ant-')) {
      newErrors.claudeApiKey = 'Claude API key should start with sk-ant-';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateActivities = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.activityTypes.length === 0) {
      newErrors.activityTypes = 'Please select at least one activity type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save handlers
  const handleSaveCredentials = async () => {
    if (!validateCredentials()) return;

    setIsLoading(true);
    try {
      AuthStorage.save({
        resovaApiKey: formData.resovaApiKey.trim(),
        resovaApiUrl: formData.resovaApiUrl.trim(),
        claudeApiKey: formData.claudeApiKey.trim(),
        lastLogin: new Date().toISOString(),
        version: '1.0',
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save credentials:', error);
      alert('Failed to save credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveActivities = async () => {
    if (!validateActivities()) return;

    setIsLoading(true);
    try {
      const existingConfig = ConfigStorage.load();
      ConfigStorage.save({
        ...existingConfig,
        activityTypes: formData.activityTypes,
        updatedAt: new Date().toISOString(),
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save activities:', error);
      alert('Failed to save activities. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBusiness = async () => {
    setIsLoading(true);
    try {
      const existingConfig = ConfigStorage.load();
      ConfigStorage.save({
        ...existingConfig,
        businessName: formData.businessName.trim() || undefined,
        timezone: formData.timezone,
        currency: formData.currency,
        updatedAt: new Date().toISOString(),
      });

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save business details:', error);
      alert('Failed to save business details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Activity selection
  const toggleActivity = (activityType: ActivityType) => {
    setFormData(prev => ({
      ...prev,
      activityTypes: prev.activityTypes.includes(activityType)
        ? prev.activityTypes.filter(t => t !== activityType)
        : [...prev.activityTypes, activityType]
    }));
  };

  const toggleCategory = (categoryActivities: string[]) => {
    const allSelected = categoryActivities.every(act =>
      formData.activityTypes.includes(act as ActivityType)
    );

    setFormData(prev => ({
      ...prev,
      activityTypes: allSelected
        ? prev.activityTypes.filter(t => !categoryActivities.includes(t))
        : [...new Set([...prev.activityTypes, ...categoryActivities as ActivityType[]])]
    }));
  };

  // Logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout? This will clear all saved credentials.')) {
      AuthStorage.clear();
      ConfigStorage.clear();
      router.push('/onboarding');
    }
  };

  const activityCategories = getActivityOptionsByCategory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-slate-400">Manage your account and preferences</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'credentials'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            API Credentials
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'activities'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Activity Types
          </button>
          <button
            onClick={() => setActiveTab('business')}
            className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
              activeTab === 'business'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Business Details
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          {/* Credentials Tab */}
          {activeTab === 'credentials' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">API Credentials</h2>
                <p className="text-slate-400 mb-6">
                  Update your Resova and Claude API keys
                </p>
              </div>

              {/* Resova API Key */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Resova API Key *
                </label>
                <input
                  type="password"
                  value={formData.resovaApiKey}
                  onChange={(e) => setFormData({ ...formData, resovaApiKey: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your Resova API key"
                />
                {errors.resovaApiKey && (
                  <p className="text-red-400 text-sm mt-1">{errors.resovaApiKey}</p>
                )}
              </div>

              {/* Resova API URL */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Resova Datacenter *
                </label>
                <select
                  value={formData.resovaApiUrl}
                  onChange={(e) => setFormData({ ...formData, resovaApiUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {RESOVA_DATACENTER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.resovaApiUrl && (
                  <p className="text-red-400 text-sm mt-1">{errors.resovaApiUrl}</p>
                )}
              </div>

              {/* Claude API Key */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Claude API Key *
                </label>
                <input
                  type="password"
                  value={formData.claudeApiKey}
                  onChange={(e) => setFormData({ ...formData, claudeApiKey: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="sk-ant-..."
                />
                {errors.claudeApiKey && (
                  <p className="text-red-400 text-sm mt-1">{errors.claudeApiKey}</p>
                )}
                <p className="text-slate-400 text-sm mt-2">
                  Get your API key from{' '}
                  <a
                    href="https://console.anthropic.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    console.anthropic.com
                  </a>
                </p>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveCredentials}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Saving...' : isSaved ? 'Saved!' : 'Save Credentials'}
                </button>
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Activity Types</h2>
                <p className="text-slate-400 mb-6">
                  Select the types of activities you offer to personalize your AI insights
                </p>
              </div>

              {errors.activityTypes && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4">
                  <p className="text-red-400">{errors.activityTypes}</p>
                </div>
              )}

              <div className="space-y-6">
                {Object.entries(activityCategories).map(([category, activities]) => (
                  <div key={category} className="border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{category}</h3>
                      <button
                        onClick={() => toggleCategory(activities)}
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        {activities.every(act => formData.activityTypes.includes(act as ActivityType))
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {activities.map(activity => (
                        <label
                          key={activity}
                          className="flex items-center space-x-2 p-2 rounded hover:bg-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.activityTypes.includes(activity as ActivityType)}
                            onChange={() => toggleActivity(activity as ActivityType)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-slate-300 text-sm">
                            {activity.replace(/_/g, ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveActivities}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Saving...' : isSaved ? 'Saved!' : 'Save Activities'}
                </button>
              </div>
            </div>
          )}

          {/* Business Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Business Details</h2>
                <p className="text-slate-400 mb-6">
                  Optional business information for personalized insights
                </p>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Business Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your Business Name"
                />
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Timezone
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIMEZONE_OPTIONS.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CURRENCY_OPTIONS.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSaveBusiness}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Saving...' : isSaved ? 'Saved!' : 'Save Business Details'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
