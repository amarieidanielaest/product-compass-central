import { aiService } from '../api/AIService';
import { unifiedDataService } from '../core/UnifiedDataService';
import { dataManagementService } from '../core/DataManagementService';
import { authenticationService } from '../core/AuthenticationService';

export interface AIInsightRequest {
  type: 'feedback_analysis' | 'user_behavior' | 'product_health' | 'roadmap_optimization' | 'competitive_analysis';
  data: {
    entityIds?: string[];
    timeRange?: { start: string; end: string };
    context?: Record<string, any>;
    filters?: Record<string, any>;
  };
  config: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    includeConfidence?: boolean;
    format?: 'summary' | 'detailed' | 'actionable';
  };
}

export interface AIInsight {
  id: string;
  type: string;
  title: string;
  summary: string;
  confidence: number;
  insights: Array<{
    category: string;
    finding: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
    dataSupport: {
      metrics: Record<string, number>;
      trends: Record<string, any>;
      sources: string[];
    };
  }>;
  metadata: {
    modelUsed: string;
    processingTime: number;
    dataPoints: number;
    generatedAt: string;
  };
}

export interface SmartNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  category: 'insight' | 'alert' | 'recommendation' | 'update';
  actionable: boolean;
  actions?: Array<{
    label: string;
    type: 'navigate' | 'execute' | 'dismiss';
    payload: Record<string, any>;
  }>;
  relatedEntities: string[];
  expiresAt?: string;
}

class AIServiceIntegration {
  private insightCache: Map<string, { insight: AIInsight; expiresAt: number }> = new Map();
  private processingQueue: Map<string, AIInsightRequest> = new Map();

  async generateInsights(request: AIInsightRequest): Promise<AIInsight> {
    // Check cache first
    const cacheKey = this.generateCacheKey(request);
    const cached = this.insightCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.insight;
    }

    // Add to processing queue
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.processingQueue.set(requestId, request);

    try {
      const startTime = Date.now();
      
      // Gather relevant data
      const contextData = await this.gatherContextData(request);
      
      // Generate AI insights
      const aiResponse = await this.processWithAI(request, contextData);
      
      // Structure the insight response
      const insight: AIInsight = {
        id: requestId,
        type: request.type,
        title: aiResponse.title || `${request.type.replace('_', ' ')} Analysis`,
        summary: aiResponse.summary,
        confidence: aiResponse.confidence || 0.8,
        insights: this.structureInsights(aiResponse.insights || []),
        metadata: {
          modelUsed: request.config.model || 'gpt-4',
          processingTime: Date.now() - startTime,
          dataPoints: contextData.totalDataPoints,
          generatedAt: new Date().toISOString()
        }
      };

      // Cache the result
      this.insightCache.set(cacheKey, {
        insight,
        expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
      });

      // Generate smart notifications if needed
      await this.generateSmartNotifications(insight);

      return insight;

    } finally {
      this.processingQueue.delete(requestId);
    }
  }

  async generateSmartNotifications(insight: AIInsight): Promise<SmartNotification[]> {
    const user = await authenticationService.getCurrentUser();
    if (!user) return [];

    const notifications: SmartNotification[] = [];

    // Generate notifications for high-impact insights
    const highImpactInsights = insight.insights.filter(i => i.impact === 'high');
    
    for (const finding of highImpactInsights) {
      const notification: SmartNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        title: `High Impact Finding: ${finding.category}`,
        message: finding.finding,
        priority: 'high',
        category: 'insight',
        actionable: true,
        actions: this.generateNotificationActions(finding, insight),
        relatedEntities: [insight.id],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      notifications.push(notification);
    }

    // Store notifications (would integrate with notification service)
    return notifications;
  }

  async processAutomaticInsights(): Promise<void> {
    // Automatic insight generation for key metrics
    const user = await authenticationService.getCurrentUser();
    if (!user) return;

    const automaticInsights = [
      {
        type: 'feedback_analysis' as const,
        schedule: 'daily',
        condition: async () => {
          // Check if there's new feedback in the last 24 hours
          const result = await unifiedDataService.executeUnifiedQuery({
            entities: ['feedback'],
            filters: {
              createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
            },
            limit: 1
          });
          return result.metadata.totalCount > 0;
        }
      },
      {
        type: 'product_health' as const,
        schedule: 'weekly',
        condition: async () => true // Always run weekly health checks
      }
    ];

    for (const autoInsight of automaticInsights) {
      if (await autoInsight.condition()) {
        const request: AIInsightRequest = {
          type: autoInsight.type,
          data: {
            timeRange: {
              start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              end: new Date().toISOString()
            }
          },
          config: {
            format: 'summary',
            includeConfidence: true
          }
        };

        try {
          await this.generateInsights(request);
        } catch (error) {
          console.error(`Automatic insight generation failed for ${autoInsight.type}:`, error);
        }
      }
    }
  }

  async getInsightHistory(type?: string, limit = 10): Promise<AIInsight[]> {
    // In a real implementation, this would query from database
    const cachedInsights = Array.from(this.insightCache.values())
      .map(cached => cached.insight)
      .filter(insight => !type || insight.type === type)
      .sort((a, b) => new Date(b.metadata.generatedAt).getTime() - new Date(a.metadata.generatedAt).getTime())
      .slice(0, limit);

    return cachedInsights;
  }

  private async gatherContextData(request: AIInsightRequest): Promise<{
    entities: Record<string, any[]>;
    relationships: any[];
    metrics: Record<string, number>;
    totalDataPoints: number;
  }> {
    const contextData = {
      entities: {} as Record<string, any[]>,
      relationships: [] as any[],
      metrics: {} as Record<string, number>,
      totalDataPoints: 0
    };

    // Determine relevant entities based on insight type
    const relevantEntities = this.getRelevantEntities(request.type);
    
    // Query unified data
    const dataResult = await unifiedDataService.executeUnifiedQuery({
      entities: relevantEntities,
      relationships: true,
      filters: request.data.filters,
      limit: 1000 // Reasonable limit for AI processing
    });

    contextData.entities = dataResult.entities;
    contextData.relationships = dataResult.relationships;
    contextData.totalDataPoints = dataResult.metadata.totalCount;

    // Calculate relevant metrics
    contextData.metrics = this.calculateRelevantMetrics(dataResult, request.type);

    return contextData;
  }

  private async processWithAI(request: AIInsightRequest, contextData: any): Promise<any> {
    const prompt = this.buildAIPrompt(request, contextData);
    
    const response = await aiService.generateContent({
      type: 'insights',
      context: contextData,
      prompt
    });

    if (!response.success) {
      throw new Error(`AI processing failed: ${response.message}`);
    }

    try {
      return JSON.parse(response.data.content);
    } catch (error) {
      // Fallback to structured parsing if JSON parsing fails
      return this.parseAIResponse(response.data.content);
    }
  }

  private buildAIPrompt(request: AIInsightRequest, contextData: any): string {
    const basePrompt = `As a product management AI assistant, analyze the following data and provide insights for ${request.type}.

Context Data:
- Total data points: ${contextData.totalDataPoints}
- Entities: ${Object.keys(contextData.entities).join(', ')}
- Key metrics: ${JSON.stringify(contextData.metrics, null, 2)}
- Relationships: ${contextData.relationships.length} connections found

Please provide your analysis in the following JSON format:
{
  "title": "Analysis Title",
  "summary": "Executive summary of findings",
  "confidence": 0.85,
  "insights": [
    {
      "category": "Category Name",
      "finding": "Specific finding",
      "impact": "high|medium|low",
      "recommendation": "Actionable recommendation",
      "dataSupport": {
        "metrics": {"key": value},
        "trends": {"trend": "description"},
        "sources": ["data source references"]
      }
    }
  ]
}`;

    // Add type-specific context
    switch (request.type) {
      case 'feedback_analysis':
        return `${basePrompt}

Focus on:
- Sentiment trends and patterns
- Feature request priorities
- Customer satisfaction indicators
- Recurring themes and issues`;

      case 'user_behavior':
        return `${basePrompt}

Focus on:
- Usage patterns and engagement
- Feature adoption rates
- User journey bottlenecks
- Churn risk indicators`;

      case 'product_health':
        return `${basePrompt}

Focus on:
- Performance metrics trends
- Quality indicators
- User satisfaction scores
- Technical debt assessment`;

      default:
        return basePrompt;
    }
  }

  private structureInsights(rawInsights: any[]): AIInsight['insights'] {
    return rawInsights.map(insight => ({
      category: insight.category || 'General',
      finding: insight.finding || '',
      impact: insight.impact || 'medium',
      recommendation: insight.recommendation || '',
      dataSupport: {
        metrics: insight.dataSupport?.metrics || {},
        trends: insight.dataSupport?.trends || {},
        sources: insight.dataSupport?.sources || []
      }
    }));
  }

  private generateNotificationActions(finding: any, insight: AIInsight): SmartNotification['actions'] {
    const actions: SmartNotification['actions'] = [
      {
        label: 'View Full Analysis',
        type: 'navigate',
        payload: { route: `/insights/${insight.id}` }
      }
    ];

    // Add context-specific actions based on finding category
    if (finding.category.toLowerCase().includes('feedback')) {
      actions.push({
        label: 'Review Feedback',
        type: 'navigate',
        payload: { route: '/feedback', filter: finding.category }
      });
    }

    if (finding.category.toLowerCase().includes('roadmap')) {
      actions.push({
        label: 'Update Roadmap',
        type: 'navigate',
        payload: { route: '/roadmap' }
      });
    }

    return actions;
  }

  private getRelevantEntities(type: string): string[] {
    const entityMap: Record<string, string[]> = {
      feedback_analysis: ['feedback', 'user', 'product'],
      user_behavior: ['user', 'product', 'experiment'],
      product_health: ['product', 'feedback', 'okr'],
      roadmap_optimization: ['roadmap', 'feedback', 'okr'],
      competitive_analysis: ['product', 'feedback', 'roadmap']
    };

    return entityMap[type] || ['product', 'feedback', 'user'];
  }

  private calculateRelevantMetrics(dataResult: any, type: string): Record<string, number> {
    const metrics: Record<string, number> = {};

    // Calculate common metrics
    metrics.totalEntities = dataResult.metadata.totalCount;
    metrics.relationshipsCount = dataResult.relationships.length;

    // Calculate type-specific metrics
    switch (type) {
      case 'feedback_analysis':
        if (dataResult.entities.feedback) {
          const feedback = dataResult.entities.feedback;
          metrics.totalFeedback = feedback.length;
          metrics.positiveFeedback = feedback.filter((f: any) => f.data.sentiment === 'positive').length;
          metrics.negativeFeedback = feedback.filter((f: any) => f.data.sentiment === 'negative').length;
        }
        break;

      case 'user_behavior':
        if (dataResult.entities.user) {
          const users = dataResult.entities.user;
          metrics.totalUsers = users.length;
          metrics.activeUsers = users.filter((u: any) => u.data.lastActive && 
            new Date(u.data.lastActive) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
        }
        break;
    }

    return metrics;
  }

  private parseAIResponse(content: string): any {
    // Fallback parsing for non-JSON responses
    return {
      title: 'AI Analysis',
      summary: content.substring(0, 200),
      confidence: 0.7,
      insights: [{
        category: 'General',
        finding: content,
        impact: 'medium' as const,
        recommendation: 'Review the analysis and take appropriate action',
        dataSupport: {
          metrics: {},
          trends: {},
          sources: []
        }
      }]
    };
  }

  private generateCacheKey(request: AIInsightRequest): string {
    return `${request.type}_${JSON.stringify(request.data)}_${JSON.stringify(request.config)}`;
  }
}

export const aiServiceIntegration = new AIServiceIntegration();