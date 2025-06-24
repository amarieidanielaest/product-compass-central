
// Widget Library - Comprehensive Product Management & PLG Metrics
export { default as UserMetricsWidget } from './UserMetricsWidget';
export { default as PLGMetricsWidget } from './PLGMetricsWidget';
export { default as RevenueMetricsWidget } from './RevenueMetricsWidget';
export { default as ProductHealthWidget } from './ProductHealthWidget';
export { default as FeedbackInsightsWidget } from './FeedbackInsightsWidget';
export { default as OKRAlignmentWidget } from './OKRAlignmentWidget';
export { default as CompetitorAnalysisWidget } from './CompetitorAnalysisWidget';

// Widget configuration types
export interface BaseWidgetProps {
  timeframe?: '7d' | '30d' | '90d';
  showCharts?: boolean;
  className?: string;
}

// Widget categories for dashboard organization
export const WidgetCategories = {
  USER_ANALYTICS: 'User Analytics',
  PRODUCT_HEALTH: 'Product Health',
  BUSINESS_METRICS: 'Business Metrics',
  STRATEGIC_ALIGNMENT: 'Strategic Alignment',
  COMPETITIVE_INTELLIGENCE: 'Competitive Intelligence',
  CUSTOMER_INSIGHTS: 'Customer Insights'
} as const;

// Widget metadata for dashboard configuration
export const WidgetRegistry = [
  {
    id: 'user-metrics',
    name: 'User Metrics',
    component: 'UserMetricsWidget',
    category: WidgetCategories.USER_ANALYTICS,
    description: 'Track user engagement, retention, and growth metrics'
  },
  {
    id: 'plg-metrics',
    name: 'PLG Metrics',
    component: 'PLGMetricsWidget',
    category: WidgetCategories.USER_ANALYTICS,
    description: 'Monitor product-led growth activation, viral coefficients, and time-to-value'
  },
  {
    id: 'revenue-metrics',
    name: 'Revenue Metrics',
    component: 'RevenueMetricsWidget',
    category: WidgetCategories.BUSINESS_METRICS,
    description: 'Track MRR, ARR, ARPU, and customer lifetime value'
  },
  {
    id: 'product-health',
    name: 'Product Health',
    component: 'ProductHealthWidget',
    category: WidgetCategories.PRODUCT_HEALTH,
    description: 'Monitor system uptime, deployment health, and technical debt'
  },
  {
    id: 'feedback-insights',
    name: 'Feedback Insights',
    component: 'FeedbackInsightsWidget',
    category: WidgetCategories.CUSTOMER_INSIGHTS,
    description: 'Analyze customer feedback sentiment, feature requests, and resolution rates'
  },
  {
    id: 'okr-alignment',
    name: 'OKR Alignment',
    component: 'OKRAlignmentWidget',
    category: WidgetCategories.STRATEGIC_ALIGNMENT,
    description: 'Track objectives, key results, and quarterly progress alignment'
  },
  {
    id: 'competitor-analysis',
    name: 'Competitive Intelligence',
    component: 'CompetitorAnalysisWidget',
    category: WidgetCategories.COMPETITIVE_INTELLIGENCE,
    description: 'Monitor competitor features, market position, and strategic insights'
  }
] as const;
