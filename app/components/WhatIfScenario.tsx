'use client';

import React, { useState } from 'react';
import { AnalyticsData } from '@/app/types/analytics';
import { Calculator, TrendingUp, DollarSign, Users, Calendar, Sparkles } from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  description: string;
  parameters: ScenarioParameter[];
}

interface ScenarioParameter {
  id: string;
  label: string;
  type: 'percentage' | 'currency' | 'number';
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}

interface ScenarioResult {
  metric: string;
  current: number;
  projected: number;
  change: number;
  changePercent: number;
  impact: 'positive' | 'negative' | 'neutral';
}

interface WhatIfScenarioProps {
  analyticsData?: AnalyticsData;
  onRunScenario?: (scenario: string, results: ScenarioResult[]) => void;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'price-increase',
    name: 'Price Adjustment',
    description: 'See the impact of changing your pricing',
    parameters: [
      {
        id: 'price-change',
        label: 'Price Change',
        type: 'percentage',
        defaultValue: 10,
        min: -50,
        max: 100,
        step: 5,
        suffix: '%',
      },
      {
        id: 'demand-impact',
        label: 'Expected Demand Impact',
        type: 'percentage',
        defaultValue: -5,
        min: -50,
        max: 50,
        step: 5,
        suffix: '%',
      },
    ],
  },
  {
    id: 'capacity-increase',
    name: 'Capacity Expansion',
    description: 'Model adding more slots or sessions',
    parameters: [
      {
        id: 'capacity-increase',
        label: 'Capacity Increase',
        type: 'percentage',
        defaultValue: 20,
        min: 0,
        max: 200,
        step: 10,
        suffix: '%',
      },
      {
        id: 'utilization-rate',
        label: 'Expected Utilization',
        type: 'percentage',
        defaultValue: 70,
        min: 0,
        max: 100,
        step: 5,
        suffix: '%',
      },
    ],
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Forecast the ROI of a marketing investment',
    parameters: [
      {
        id: 'marketing-spend',
        label: 'Campaign Budget',
        type: 'currency',
        defaultValue: 1000,
        min: 0,
        max: 10000,
        step: 500,
        suffix: '',
      },
      {
        id: 'conversion-rate',
        label: 'Expected Conversion Rate',
        type: 'percentage',
        defaultValue: 3,
        min: 0,
        max: 20,
        step: 0.5,
        suffix: '%',
      },
      {
        id: 'avg-booking-value',
        label: 'Avg Booking Value',
        type: 'currency',
        defaultValue: 150,
        min: 0,
        max: 1000,
        step: 25,
        suffix: '',
      },
    ],
  },
  {
    id: 'retention-improvement',
    name: 'Customer Retention',
    description: 'Impact of improving repeat customer rate',
    parameters: [
      {
        id: 'retention-increase',
        label: 'Retention Rate Increase',
        type: 'percentage',
        defaultValue: 10,
        min: 0,
        max: 50,
        step: 5,
        suffix: '%',
      },
      {
        id: 'avg-customer-value',
        label: 'Avg Customer Lifetime Value',
        type: 'currency',
        defaultValue: 500,
        min: 0,
        max: 5000,
        step: 100,
        suffix: '',
      },
    ],
  },
  {
    id: 'operational-efficiency',
    name: 'Operational Efficiency',
    description: 'Reduce costs and improve margins',
    parameters: [
      {
        id: 'cost-reduction',
        label: 'Cost Reduction',
        type: 'percentage',
        defaultValue: 10,
        min: 0,
        max: 50,
        step: 5,
        suffix: '%',
      },
      {
        id: 'current-margin',
        label: 'Current Profit Margin',
        type: 'percentage',
        defaultValue: 20,
        min: 0,
        max: 100,
        step: 5,
        suffix: '%',
      },
    ],
  },
];

export default function WhatIfScenario({ analyticsData, onRunScenario }: WhatIfScenarioProps) {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [parameterValues, setParameterValues] = useState<Record<string, number>>({});
  const [results, setResults] = useState<ScenarioResult[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setResults(null);

    // Initialize parameter values with defaults
    const defaults: Record<string, number> = {};
    scenario.parameters.forEach(param => {
      defaults[param.id] = param.defaultValue;
    });
    setParameterValues(defaults);
  };

  const handleParameterChange = (paramId: string, value: number) => {
    setParameterValues(prev => ({ ...prev, [paramId]: value }));
  };

  const calculateScenario = () => {
    if (!selectedScenario || !analyticsData) return;

    setIsCalculating(true);

    // Simulate calculation delay for better UX
    setTimeout(() => {
      const scenarioResults: ScenarioResult[] = [];

      switch (selectedScenario.id) {
        case 'price-increase': {
          const priceChange = parameterValues['price-change'] || 0;
          const demandImpact = parameterValues['demand-impact'] || 0;
          const currentRevenue = analyticsData.periodSummary.gross;
          const currentBookings = analyticsData.salesSummary.bookings;

          const newBookings = currentBookings * (1 + demandImpact / 100);
          const newAvgPrice = (currentRevenue / currentBookings) * (1 + priceChange / 100);
          const projectedRevenue = newBookings * newAvgPrice;

          scenarioResults.push(
            {
              metric: 'Monthly Revenue',
              current: currentRevenue,
              projected: projectedRevenue,
              change: projectedRevenue - currentRevenue,
              changePercent: ((projectedRevenue - currentRevenue) / currentRevenue) * 100,
              impact: projectedRevenue > currentRevenue ? 'positive' : 'negative',
            },
            {
              metric: 'Total Bookings',
              current: currentBookings,
              projected: newBookings,
              change: newBookings - currentBookings,
              changePercent: demandImpact,
              impact: newBookings > currentBookings ? 'positive' : 'negative',
            },
            {
              metric: 'Avg Booking Value',
              current: currentRevenue / currentBookings,
              projected: newAvgPrice,
              change: newAvgPrice - (currentRevenue / currentBookings),
              changePercent: priceChange,
              impact: priceChange > 0 ? 'positive' : 'negative',
            }
          );
          break;
        }

        case 'capacity-increase': {
          const capacityIncrease = parameterValues['capacity-increase'] || 0;
          const utilizationRate = parameterValues['utilization-rate'] || 0;
          const currentRevenue = analyticsData.periodSummary.gross;
          const currentBookings = analyticsData.salesSummary.bookings;
          const avgBookingValue = currentRevenue / currentBookings;

          const additionalCapacity = currentBookings * (capacityIncrease / 100);
          const additionalBookings = additionalCapacity * (utilizationRate / 100);
          const projectedBookings = currentBookings + additionalBookings;
          const projectedRevenue = projectedBookings * avgBookingValue;

          scenarioResults.push(
            {
              metric: 'Monthly Revenue',
              current: currentRevenue,
              projected: projectedRevenue,
              change: projectedRevenue - currentRevenue,
              changePercent: ((projectedRevenue - currentRevenue) / currentRevenue) * 100,
              impact: 'positive',
            },
            {
              metric: 'Total Bookings',
              current: currentBookings,
              projected: projectedBookings,
              change: additionalBookings,
              changePercent: (additionalBookings / currentBookings) * 100,
              impact: 'positive',
            },
            {
              metric: 'Capacity Utilization',
              current: analyticsData.capacityAnalysis?.overall.utilizationPercent || 75,
              projected: (projectedBookings / (currentBookings * (1 + capacityIncrease / 100))) * 100,
              change: 0,
              changePercent: 0,
              impact: 'neutral',
            }
          );
          break;
        }

        case 'marketing-campaign': {
          const budget = parameterValues['marketing-spend'] || 0;
          const conversionRate = parameterValues['conversion-rate'] || 0;
          const avgBookingValue = parameterValues['avg-booking-value'] || 0;

          // Assume 10,000 impressions per $1000 spent
          const impressions = (budget / 1000) * 10000;
          const conversions = impressions * (conversionRate / 100);
          const revenue = conversions * avgBookingValue;
          const profit = revenue - budget;
          const roi = ((profit / budget) * 100);

          scenarioResults.push(
            {
              metric: 'Campaign ROI',
              current: 0,
              projected: roi,
              change: roi,
              changePercent: 0,
              impact: roi > 0 ? 'positive' : 'negative',
            },
            {
              metric: 'New Bookings',
              current: 0,
              projected: conversions,
              change: conversions,
              changePercent: 0,
              impact: 'positive',
            },
            {
              metric: 'Revenue Generated',
              current: 0,
              projected: revenue,
              change: revenue,
              changePercent: 0,
              impact: 'positive',
            },
            {
              metric: 'Net Profit',
              current: 0,
              projected: profit,
              change: profit,
              changePercent: 0,
              impact: profit > 0 ? 'positive' : 'negative',
            }
          );
          break;
        }

        case 'retention-improvement': {
          const retentionIncrease = parameterValues['retention-increase'] || 0;
          const avgCustomerValue = parameterValues['avg-customer-value'] || 0;
          const currentCustomers = analyticsData.businessInsights?.customerIntelligence?.totalCustomers || 1000;
          const currentRetention = analyticsData.guestSummary.repeatCustomers;

          const additionalRetainedCustomers = currentCustomers * (retentionIncrease / 100);
          const additionalRevenue = additionalRetainedCustomers * avgCustomerValue;
          const annualImpact = additionalRevenue * 12;

          scenarioResults.push(
            {
              metric: 'Additional Monthly Revenue',
              current: 0,
              projected: additionalRevenue,
              change: additionalRevenue,
              changePercent: 0,
              impact: 'positive',
            },
            {
              metric: 'Retention Rate',
              current: currentRetention,
              projected: currentRetention + retentionIncrease,
              change: retentionIncrease,
              changePercent: (retentionIncrease / currentRetention) * 100,
              impact: 'positive',
            },
            {
              metric: 'Annual Revenue Impact',
              current: 0,
              projected: annualImpact,
              change: annualImpact,
              changePercent: 0,
              impact: 'positive',
            }
          );
          break;
        }

        case 'operational-efficiency': {
          const costReduction = parameterValues['cost-reduction'] || 0;
          const currentMargin = parameterValues['current-margin'] || 0;
          const currentRevenue = analyticsData.periodSummary.gross;
          const currentProfit = currentRevenue * (currentMargin / 100);
          const currentCosts = currentRevenue - currentProfit;

          const newCosts = currentCosts * (1 - costReduction / 100);
          const newProfit = currentRevenue - newCosts;
          const newMargin = (newProfit / currentRevenue) * 100;

          scenarioResults.push(
            {
              metric: 'Profit Margin',
              current: currentMargin,
              projected: newMargin,
              change: newMargin - currentMargin,
              changePercent: ((newMargin - currentMargin) / currentMargin) * 100,
              impact: 'positive',
            },
            {
              metric: 'Monthly Profit',
              current: currentProfit,
              projected: newProfit,
              change: newProfit - currentProfit,
              changePercent: ((newProfit - currentProfit) / currentProfit) * 100,
              impact: 'positive',
            },
            {
              metric: 'Cost Savings',
              current: currentCosts,
              projected: newCosts,
              change: currentCosts - newCosts,
              changePercent: -costReduction,
              impact: 'positive',
            }
          );
          break;
        }
      }

      setResults(scenarioResults);
      setIsCalculating(false);

      // Notify parent component
      if (onRunScenario) {
        onRunScenario(selectedScenario.name, scenarioResults);
      }
    }, 800);
  };

  const formatValue = (value: number, type: 'currency' | 'percentage' | 'number') => {
    if (type === 'currency') {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else if (type === 'percentage') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-purple-400" />
        <h2 className="text-lg font-semibold text-white">What If Scenario Planning</h2>
        <Sparkles className="w-4 h-4 text-purple-400" />
      </div>

      <p className="text-sm text-[#A0A0A0] leading-relaxed">
        Model different business scenarios and see projected outcomes based on your real data.
      </p>

      {/* Scenario Selection */}
      {!selectedScenario ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleScenarioSelect(scenario)}
              className="text-left p-4 rounded-xl border border-[#383838] bg-[#1E1E1E] hover:border-[#5E5CE6] hover:shadow-lg hover:shadow-[#5E5CE6]/10 transition-all group"
            >
              <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-[#5E5CE6] transition-colors">
                {scenario.name}
              </h3>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                {scenario.description}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Back Button */}
          <button
            onClick={() => {
              setSelectedScenario(null);
              setResults(null);
            }}
            className="text-xs text-[#5E5CE6] hover:text-[#7E7CFF] font-medium"
          >
            ← Back to scenarios
          </button>

          {/* Selected Scenario */}
          <div className="bg-gradient-to-br from-[#2E2D72]/10 via-[#5E5CE6]/5 to-transparent border border-[#5E5CE6]/20 rounded-xl p-4">
            <h3 className="text-base font-semibold text-white mb-1">
              {selectedScenario.name}
            </h3>
            <p className="text-xs text-[#A0A0A0]">
              {selectedScenario.description}
            </p>
          </div>

          {/* Parameters */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-white">Adjust Parameters</h4>
            {selectedScenario.parameters.map((param) => (
              <div key={param.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#A0A0A0]">
                    {param.label}
                  </label>
                  <span className="text-sm font-semibold text-white">
                    {param.type === 'currency' && '$'}
                    {parameterValues[param.id] || param.defaultValue}
                    {param.suffix}
                  </span>
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={parameterValues[param.id] || param.defaultValue}
                  onChange={(e) => handleParameterChange(param.id, parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#2E2E2E] rounded-lg appearance-none cursor-pointer accent-[#5E5CE6]"
                />
                <div className="flex justify-between text-xs text-[#666]">
                  <span>{param.type === 'currency' && '$'}{param.min}{param.suffix}</span>
                  <span>{param.type === 'currency' && '$'}{param.max}{param.suffix}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Calculate Button */}
          <button
            onClick={calculateScenario}
            disabled={isCalculating}
            className="w-full px-4 py-3 rounded-lg bg-[#5E5CE6] hover:bg-[#7E7CFF] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCalculating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                Calculate Scenario
              </>
            )}
          </button>

          {/* Results */}
          {results && (
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <h4 className="text-sm font-semibold text-white">Projected Results</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border ${
                      result.impact === 'positive'
                        ? 'border-green-400/30 bg-green-400/5'
                        : result.impact === 'negative'
                        ? 'border-red-400/30 bg-red-400/5'
                        : 'border-gray-400/30 bg-gray-400/5'
                    }`}
                  >
                    <p className="text-xs text-[#A0A0A0] mb-1">{result.metric}</p>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-xl font-bold text-white">
                        {formatValue(result.projected, result.metric.includes('Revenue') || result.metric.includes('Profit') || result.metric.includes('Value') || result.metric.includes('ROI') || result.metric.includes('Savings') || result.metric.includes('Cost') ? 'currency' : result.metric.includes('Rate') || result.metric.includes('Margin') || result.metric.includes('Utilization') ? 'percentage' : 'number')}
                      </span>
                      {result.current > 0 && (
                        <span className="text-xs text-[#666]">
                          from {formatValue(result.current, result.metric.includes('Revenue') || result.metric.includes('Profit') || result.metric.includes('Value') || result.metric.includes('Cost') ? 'currency' : result.metric.includes('Rate') || result.metric.includes('Margin') || result.metric.includes('Utilization') ? 'percentage' : 'number')}
                        </span>
                      )}
                    </div>
                    {result.change !== 0 && (
                      <div className={`flex items-center gap-1 text-xs font-medium ${
                        result.impact === 'positive' ? 'text-green-400' : result.impact === 'negative' ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {result.impact === 'positive' ? '↗' : result.impact === 'negative' ? '↘' : '→'}
                        {result.change > 0 && '+'}{formatValue(Math.abs(result.change), result.metric.includes('Revenue') || result.metric.includes('Profit') || result.metric.includes('Value') || result.metric.includes('ROI') || result.metric.includes('Savings') || result.metric.includes('Cost') ? 'currency' : result.metric.includes('Rate') || result.metric.includes('Margin') || result.metric.includes('Utilization') ? 'percentage' : 'number')}
                        {result.changePercent !== 0 && ` (${result.changePercent > 0 ? '+' : ''}${result.changePercent.toFixed(1)}%)`}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Ask AI about results */}
              <div className="mt-4 p-4 rounded-xl border border-[#5E5CE6]/20 bg-[#5E5CE6]/5">
                <p className="text-xs text-[#A0A0A0] mb-2">
                  Want deeper insights on these projections?
                </p>
                <button
                  onClick={() => {
                    const question = `Based on the ${selectedScenario.name} scenario I just ran, what are the key risks and opportunities I should consider?`;
                    // This would trigger the chat with the scenario context
                    if (onRunScenario) {
                      onRunScenario(question, results);
                    }
                  }}
                  className="text-xs text-[#5E5CE6] hover:text-[#7E7CFF] font-medium"
                >
                  Ask AI to analyze these results →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
