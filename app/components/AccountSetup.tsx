'use client';

import { useState } from 'react';
import { AuthStorage } from '@/app/lib/storage/auth-storage';
import { ConfigStorage } from '@/app/lib/storage/config-storage';
import { ActivityType } from '@/app/lib/storage/types';
import { getActivityOptionsByCategory } from '@/app/lib/config/activity-types';
import { useRouter } from 'next/navigation';

type SetupStep = 'credentials' | 'activities' | 'business';

interface FormData {
  // Step 1: Credentials
  resovaApiKey: string;
  resovaApiUrl: string;
  claudeApiKey: string;

  // Step 2: Activities
  activityTypes: ActivityType[];

  // Step 3: Business (optional)
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

export default function AccountSetup() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SetupStep>('credentials');
  const [isLoading, setIsLoading] = useState(false);
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

  // Validation functions
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

  // Step navigation
  const handleNextStep = async () => {
    if (currentStep === 'credentials') {
      if (!validateCredentials()) return;
      setCurrentStep('activities');
    } else if (currentStep === 'activities') {
      if (!validateActivities()) return;
      setCurrentStep('business');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'activities') {
      setCurrentStep('credentials');
    } else if (currentStep === 'business') {
      setCurrentStep('activities');
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

  // Save and complete
  const handleComplete = async () => {
    setIsLoading(true);

    try {
      // Log API key before saving to debug any modification issues
      console.log('🔍 [AccountSetup] API Key BEFORE save:');
      console.log(`   Raw value length: ${formData.resovaApiKey.length}`);
      console.log(`   After trim length: ${formData.resovaApiKey.trim().length}`);
      console.log(`   First 10 chars: ${formData.resovaApiKey.substring(0, 10)}`);
      console.log(`   Last 4 chars: ${formData.resovaApiKey.substring(formData.resovaApiKey.length - 4)}`);

      // Save authentication
      const authData = {
        resovaApiKey: formData.resovaApiKey.trim(),
        resovaApiUrl: formData.resovaApiUrl.trim(),
        claudeApiKey: formData.claudeApiKey.trim(),
        lastLogin: new Date().toISOString(),
        version: '1.0',
      };

      console.log('💾 [AccountSetup] Saving to AuthStorage...');
      AuthStorage.save(authData);

      // Verify what was saved
      const savedAuth = AuthStorage.load();
      console.log('✅ [AccountSetup] Loaded back from storage:');
      console.log(`   Resova API Key length: ${savedAuth?.resovaApiKey.length}`);
      console.log(`   Resova API Key: ${savedAuth?.resovaApiKey.substring(0, 10)}...${savedAuth?.resovaApiKey.substring(savedAuth.resovaApiKey.length - 4)}`);

      // Save configuration
      ConfigStorage.save({
        activityTypes: formData.activityTypes,
        businessName: formData.businessName.trim() || undefined,
        timezone: formData.timezone,
        currency: formData.currency,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Mark onboarding complete
      ConfigStorage.setOnboardingComplete();

      // Redirect to dashboard
      router.push('/');
    } catch (error) {
      console.error('Failed to save account setup:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const activityCategories = getActivityOptionsByCategory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to Resova Intelligence
          </h1>
          <p className="text-slate-400">
            Your AI-powered business partner for data-driven decisions
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <StepIndicator
              number={1}
              label="Credentials"
              isActive={currentStep === 'credentials'}
              isComplete={currentStep === 'activities' || currentStep === 'business'}
            />
            <div className="w-16 h-0.5 bg-slate-700" />
            <StepIndicator
              number={2}
              label="Activities"
              isActive={currentStep === 'activities'}
              isComplete={currentStep === 'business'}
            />
            <div className="w-16 h-0.5 bg-slate-700" />
            <StepIndicator
              number={3}
              label="Business"
              isActive={currentStep === 'business'}
              isComplete={false}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 rounded-lg shadow-xl p-8">
          {/* Step 1: Credentials */}
          {currentStep === 'credentials' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">API Credentials</h2>
                <p className="text-slate-400 mb-6">
                  Enter your Resova and Claude API keys to get started
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
                  <p className="mt-1 text-sm text-red-400">{errors.resovaApiKey}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Find in Resova: Settings → General Settings → Developer
                </p>
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
                  <p className="mt-1 text-sm text-red-400">{errors.resovaApiUrl}</p>
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
                  <p className="mt-1 text-sm text-red-400">{errors.claudeApiKey}</p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  Get your API key from{' '}
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Anthropic Console
                  </a>
                </p>
              </div>

              {/* Security Note */}
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                <p className="text-sm text-slate-300">
                  🔒 <strong>Your credentials are secure:</strong> All API keys are stored locally in your browser and never sent to our servers.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Activities */}
          {currentStep === 'activities' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Activity Types</h2>
                <p className="text-slate-400 mb-6">
                  Select the activities your venue offers. This helps tailor AI advice to your business model.
                </p>
              </div>

              {errors.activityTypes && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                  <p className="text-sm text-red-400">{errors.activityTypes}</p>
                </div>
              )}

              {/* Selected count */}
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                <p className="text-sm text-slate-300">
                  Selected: <strong>{formData.activityTypes.length}</strong> {formData.activityTypes.length === 1 ? 'activity' : 'activities'}
                </p>
              </div>

              {/* Activity categories */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {activityCategories.map(({ category, activities }) => {
                  const categoryActivityTypes = activities.map(a => a.value);
                  const allSelected = categoryActivityTypes.every(act =>
                    formData.activityTypes.includes(act)
                  );
                  const someSelected = categoryActivityTypes.some(act =>
                    formData.activityTypes.includes(act)
                  );

                  return (
                    <div key={category} className="bg-slate-700/30 rounded-lg p-4">
                      {/* Category header with select all */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">{category}</h3>
                        <button
                          onClick={() => toggleCategory(categoryActivityTypes)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          {allSelected ? 'Deselect All' : someSelected ? 'Select All' : 'Select All'}
                        </button>
                      </div>

                      {/* Activities grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {activities.map(activity => (
                          <label
                            key={activity.value}
                            className="flex items-center space-x-3 p-2 rounded hover:bg-slate-600/30 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.activityTypes.includes(activity.value)}
                              onChange={() => toggleActivity(activity.value)}
                              className="w-4 h-4 rounded border-slate-500 text-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{activity.label}</p>
                              <p className="text-xs text-slate-400">{activity.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Business Details */}
          {currentStep === 'business' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Business Details</h2>
                <p className="text-slate-400 mb-6">
                  Optional: Customize your experience with business-specific settings
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
                  placeholder="e.g., Adventure Zone FEC"
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

              {/* Summary */}
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Setup Summary:</h4>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li>✅ API credentials configured</li>
                  <li>✅ {formData.activityTypes.length} activity {formData.activityTypes.length === 1 ? 'type' : 'types'} selected</li>
                  {formData.businessName && <li>✅ Business name: {formData.businessName}</li>}
                  <li>✅ Ready to start using Resova Intelligence!</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 'credentials'}
              className="px-6 py-2 text-slate-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {currentStep === 'business' ? (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Complete Setup →'}
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                className="px-8 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step indicator component
interface StepIndicatorProps {
  number: number;
  label: string;
  isActive: boolean;
  isComplete: boolean;
}

function StepIndicator({ number, label, isActive, isComplete }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
          isComplete
            ? 'bg-green-500 text-white'
            : isActive
            ? 'bg-blue-500 text-white'
            : 'bg-slate-700 text-slate-400'
        }`}
      >
        {isComplete ? '✓' : number}
      </div>
      <span className={`text-xs mt-1 ${isActive ? 'text-white' : 'text-slate-500'}`}>
        {label}
      </span>
    </div>
  );
}
