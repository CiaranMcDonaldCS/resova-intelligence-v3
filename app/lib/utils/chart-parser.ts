/**
 * Chart Parser Utility
 * Extracts chart specifications from AI response text and maps to chart data
 */

import { AnalyticsData } from '@/app/types/analytics';

export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'funnel'
  | 'area'
  | 'stacked-bar';

export interface ParsedChart {
  type: ChartType;
  title: string;
  description: string;
  data: any[];
  dataKey?: string;
}

/**
 * Parse AI response to extract chart specifications
 * Now supports both <CHARTS> JSON format (new) and legacy "Recommended Visualizations" format
 */
export function parseChartsFromResponse(
  responseText: string,
  analyticsData?: AnalyticsData
): ParsedChart[] {
  const charts: ParsedChart[] = [];

  // First, try to parse new <CHARTS> JSON format
  const chartsJsonRegex = /<CHARTS>\s*([\s\S]*?)\s*<\/CHARTS>/i;
  const chartsJsonMatch = responseText.match(chartsJsonRegex);

  if (chartsJsonMatch) {
    try {
      const chartsJson = chartsJsonMatch[1].trim();
      const chartSpecs = JSON.parse(chartsJson);

      if (Array.isArray(chartSpecs)) {
        for (const spec of chartSpecs) {
          const chart = mapChartSpecToData(spec, analyticsData);
          if (chart) {
            charts.push(chart);
          }
        }
        return charts; // Return early if we found charts in JSON format
      }
    } catch (error) {
      console.warn('Failed to parse <CHARTS> JSON, falling back to legacy format:', error);
    }
  }

  // Fallback to legacy format parsing
  // Look for the Recommended Visualizations section (with or without emoji - it gets sanitized)
  const vizSectionRegex = /#{1,3}\s*(?:📊\s*)?Recommended Visualizations([\s\S]*?)(?=\n#{1,3}\s|\n\n---|\n\n\*\*|$)/i;
  const vizMatch = responseText.match(vizSectionRegex);

  // If no dedicated section found, search the entire response text for charts
  const vizSection = vizMatch ? vizMatch[1] : responseText;

  // Parse individual chart recommendations
  // Format: **[Chart Type]: [Title]** - [Description]
  // Also supports: [Chart Type]: [Title] - [Description] (without bold)

  // Try with bold markers first
  const chartRegexBold = /\*\*([^:]+):\s*([^\*]+)\*\*\s*-\s*([^\n]+)/gi;
  // Fallback to plain text format (without requiring line boundaries)
  const chartRegexPlain = /([A-Z][a-z]*\s+[Cc]hart):\s*([^-\n]+)\s*-\s*([^\n]+)/gi;

  let match;

  // First try to match bold format
  while ((match = chartRegexBold.exec(vizSection)) !== null) {
    const chartTypeRaw = match[1].trim().toLowerCase();
    const title = match[2].trim();
    const description = match[3].trim();

    const chart = mapChartToData(chartTypeRaw, title, description, analyticsData);
    if (chart) {
      charts.push(chart);
    }
  }

  // If no bold matches found, try plain format
  if (charts.length === 0) {
    while ((match = chartRegexPlain.exec(vizSection)) !== null) {
      const chartTypeRaw = match[1].trim().toLowerCase();
      const title = match[2].trim();
      const description = match[3].trim();

      const chart = mapChartToData(chartTypeRaw, title, description, analyticsData);
      if (chart) {
        charts.push(chart);
      }
    }
  }

  return charts;
}

/**
 * Map chart spec from <CHARTS> JSON to chart data
 */
function mapChartSpecToData(
  spec: any,
  analyticsData?: AnalyticsData
): ParsedChart | null {
  if (!spec.type || !spec.dataSource || !spec.title) {
    return null;
  }

  const dataSource = spec.dataSource.toLowerCase();
  // Note: Data is now mapped by chart-data-mapper using real analytics data
  // This parser only extracts chart specifications from AI responses
  let data: any[] = [];

  return {
    type: spec.type as ChartType,
    title: spec.title,
    description: spec.description || '',
    data,
  };
}

/**
 * Map chart type and context to actual data (legacy format)
 */
function mapChartToData(
  chartTypeRaw: string,
  title: string,
  description: string,
  analyticsData?: AnalyticsData
): ParsedChart | null {
  const chartType = inferChartType(chartTypeRaw);
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();

  // Revenue trends over time
  if (
    (titleLower.includes('revenue') && titleLower.includes('trend')) ||
    (titleLower.includes('revenue') && titleLower.includes('time')) ||
    (descLower.includes('revenue') && descLower.includes('week'))
  ) {
    return {
      type: chartType === 'bar' ? 'bar' : 'line',
      title,
      description,
      data: [],
    };
  }

  // Bookings by service
  if (
    (titleLower.includes('booking') && titleLower.includes('service')) ||
    (titleLower.includes('booking') && titleLower.includes('activity')) ||
    (descLower.includes('which services') && descLower.includes('booking'))
  ) {
    return {
      type: chartType === 'pie' ? 'pie' : 'bar',
      title,
      description,
      data: [],
    };
  }

  // Revenue by service
  if (
    (titleLower.includes('revenue') && titleLower.includes('service')) ||
    (titleLower.includes('revenue') && titleLower.includes('breakdown')) ||
    (titleLower.includes('revenue') && titleLower.includes('distribution'))
  ) {
    return {
      type: 'pie',
      title,
      description,
      data: [],
    };
  }

  // Payment status
  if (
    titleLower.includes('payment') ||
    titleLower.includes('paid') ||
    titleLower.includes('unpaid') ||
    descLower.includes('payment collection')
  ) {
    return {
      type: 'pie',
      title,
      description,
      data: [],
    };
  }

  // Bookings by day
  if (
    (titleLower.includes('day') && titleLower.includes('booking')) ||
    (titleLower.includes('day') && titleLower.includes('revenue')) ||
    titleLower.includes('weekly pattern')
  ) {
    return {
      type: 'bar',
      title,
      description,
      data: [],
    };
  }

  // Guest trends
  if (
    titleLower.includes('guest') ||
    titleLower.includes('visitor') ||
    titleLower.includes('customer volume')
  ) {
    return {
      type: 'line',
      title,
      description,
      data: [],
    };
  }

  // Retention/cohort analysis (funnel)
  if (
    titleLower.includes('retention') ||
    titleLower.includes('cohort') ||
    titleLower.includes('funnel') ||
    titleLower.includes('drop-off')
  ) {
    return {
      type: 'funnel',
      title,
      description,
      data: [
        { name: 'First Visit', value: 100 },
        { name: '30-Day Follow-up', value: 52 },
        { name: '90-Day Re-engagement', value: 21 },
        { name: 'Repeat Customer', value: 12 },
      ],
    };
  }

  // Default fallback - empty data (will be populated by chart-data-mapper)
  return {
    type: chartType,
    title,
    description,
    data: [],
  };
}

/**
 * Infer chart type from raw string
 */
function inferChartType(chartTypeRaw: string): ChartType {
  if (chartTypeRaw.includes('line')) return 'line';
  if (chartTypeRaw.includes('bar')) return 'bar';
  if (chartTypeRaw.includes('pie')) return 'pie';
  if (chartTypeRaw.includes('funnel')) return 'funnel';
  if (chartTypeRaw.includes('area')) return 'area';
  if (chartTypeRaw.includes('stacked')) return 'stacked-bar';

  // Default to line chart
  return 'line';
}

/**
 * Remove chart section from response text for clean display
 */
export function removeChartSection(responseText: string): string {
  const vizSectionRegex = /#{1,3}\s*(?:📊\s*)?Recommended Visualizations([\s\S]*?)(?=\n#{1,3}\s|\n\n---|\n\n\*\*|$)/i;
  return responseText.replace(vizSectionRegex, '').trim();
}
