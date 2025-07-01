export * from './BaseApiService';
export * from './FeedbackService';
export * from './AnalyticsService';
export * from './AIService';
export * from './SprintService';
export * from './RoadmapService';
export * from './StrategyService';
export * from './FeatureFlagsService';

// Export service instances
export { feedbackService } from './FeedbackService';
export { analyticsService } from './AnalyticsService';
export { aiService } from './AIService';
export { sprintService } from './SprintService';
export { roadmapService } from './RoadmapService';
export { strategyService } from './StrategyService';
export { featureFlagsService } from './FeatureFlagsService';

// Export core services
export * from '../core';
export { authenticationService, dataManagementService, apiOrchestrationService } from '../core';

// Export AI Co-pilot service
export { aiCopilotService } from '../ai/AICopilotService';

// Export analytics event tracker
export { eventTracker } from '../analytics/EventTracker';
export type { AnalyticsEvent } from '../analytics/EventTracker';
