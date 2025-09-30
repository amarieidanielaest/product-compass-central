import { supabase } from '@/integrations/supabase/client';
import { unifiedDataService } from '../core/UnifiedDataService';
import { aiServiceIntegration } from '../ai/AIServiceIntegration';

export interface StrategicInitiative {
  id: string;
  title: string;
  description: string;
  vision: string;
  businessValue: number;
  effortEstimate: number;
  timeline: {
    startDate: Date;
    targetDate: Date;
    milestones: Array<{
      id: string;
      title: string;
      date: Date;
      status: 'planned' | 'in_progress' | 'completed' | 'at_risk';
    }>;
  };
  objectives: string[];
  keyResults: Array<{
    id: string;
    description: string;
    target: number;
    current: number;
    unit: string;
  }>;
  dependencies: Array<{
    id: string;
    type: 'blocks' | 'enables' | 'influences';
    description: string;
  }>;
  resources: {
    teams: string[];
    budget: number;
    allocation: number; // percentage
  };
  status: 'ideation' | 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  tags: string[];
  stakeholders: Array<{
    id: string;
    role: 'sponsor' | 'owner' | 'contributor' | 'stakeholder';
    influence: number; // 1-5 scale
  }>;
  metrics: {
    progressPercentage: number;
    confidenceLevel: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    lastUpdated: Date;
  };
}

export interface StrategicRoadmap {
  id: string;
  name: string;
  version: string;
  timeHorizon: {
    start: Date;
    end: Date;
    quarters: Array<{
      name: string;
      start: Date;
      end: Date;
      themes: string[];
    }>;
  };
  initiatives: StrategicInitiative[];
  portfolioAlignment: {
    organizationId: string;
    businessObjectives: string[];
    strategicPillars: string[];
  };
  governance: {
    reviewCycle: 'weekly' | 'monthly' | 'quarterly';
    approvalRequired: boolean;
    stakeholders: string[];
  };
}

export interface OKRFramework {
  id: string;
  period: {
    start: Date;
    end: Date;
    type: 'quarterly' | 'annual';
  };
  objectives: Array<{
    id: string;
    title: string;
    description: string;
    owner: string;
    keyResults: Array<{
      id: string;
      description: string;
      metric: string;
      baseline: number;
      target: number;
      current: number;
      unit: string;
      confidenceLevel: number;
      lastUpdated: Date;
    }>;
    linkedInitiatives: string[];
    progress: number;
    status: 'not_started' | 'on_track' | 'at_risk' | 'off_track' | 'completed';
  }>;
  alignment: {
    parentOKRs: string[];
    childOKRs: string[];
    crossFunctionalDependencies: string[];
  };
}

class StrategicRoadmapService {
  async createStrategicInitiative(initiative: Omit<StrategicInitiative, 'id'>): Promise<string> {
    const id = `initiative_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store in unified data service for cross-system accessibility
    // Store initiative using roadmap_items table
    await supabase.from('roadmap_items').insert({
      title: initiative.title,
      description: initiative.description,
      category: 'strategic',
      status: initiative.status,
      priority: initiative.priority,
      business_value_score: initiative.businessValue,
      effort_points: initiative.effortEstimate
    });

    // AI-powered strategic analysis
    await aiServiceIntegration.analyzeStrategicAlignment({
      initiative: { ...initiative, id },
      context: 'creation'
    });

    return id;
  }

  async getStrategicRoadmap(organizationId: string): Promise<StrategicRoadmap | null> {
    const query = await unifiedDataService.executeUnifiedQuery({
      entities: ['strategic_initiative', 'okr_objective'],
      filters: { organizationId },
      relationships: true,
      aggregations: [
        { field: 'status', operation: 'count', groupBy: 'status' },
        { field: 'businessValue', operation: 'sum' },
        { field: 'effortEstimate', operation: 'sum' }
      ]
    });

    if (!query.entities.strategic_initiative?.length) return null;

    const initiatives = query.entities.strategic_initiative.map(entity => entity.data as StrategicInitiative);
    
    return {
      id: `roadmap_${organizationId}`,
      name: 'Strategic Roadmap',
      version: '1.0',
      timeHorizon: this.calculateTimeHorizon(initiatives),
      initiatives,
      portfolioAlignment: {
        organizationId,
        businessObjectives: this.extractBusinessObjectives(initiatives),
        strategicPillars: this.extractStrategicPillars(initiatives)
      },
      governance: {
        reviewCycle: 'quarterly',
        approvalRequired: true,
        stakeholders: this.extractStakeholders(initiatives)
      }
    };
  }

  async updateInitiativeProgress(initiativeId: string, progress: Partial<StrategicInitiative['metrics']>): Promise<void> {
    const entity = await unifiedDataService.getEntity(initiativeId);
    if (!entity.success) throw new Error('Initiative not found');

    const updatedInitiative = {
      ...entity.data.data,
      metrics: {
        ...entity.data.data.metrics,
        ...progress,
        lastUpdated: new Date()
      }
    };

    await unifiedDataService.updateEntity(initiativeId, updatedInitiative);

    // AI-powered progress analysis
    await aiServiceIntegration.analyzeStrategicAlignment({
      initiative: updatedInitiative,
      context: 'progress_update'
    });
  }

  async createOKRFramework(framework: Omit<OKRFramework, 'id'>): Promise<string> {
    const id = `okr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store OKR framework using roadmap_items table
    await supabase.from('roadmap_items').insert({
      title: `OKR Framework - ${framework.period.type}`,
      description: 'OKR Framework',
      category: 'okr',
      status: 'planned'
    });

    return id;
  }

  async alignInitiativeToOKR(initiativeId: string, objectiveId: string): Promise<void> {
    await unifiedDataService.createRelationship({
      sourceId: initiativeId,
      targetId: objectiveId,
      type: 'linked_to',
      metadata: {
        alignmentType: 'strategic',
        relationshipSubtype: 'supports',
        createdAt: new Date().toISOString()
      }
    });

    // AI analysis of alignment quality
    const alignment = await aiServiceIntegration.analyzeOKRAlignment({
      initiativeId,
      objectiveId
    });

    if (alignment.data?.confidence < 0.7) {
      console.warn(`Low alignment confidence (${alignment.data.confidence}) between initiative ${initiativeId} and objective ${objectiveId}`);
    }
  }

  async getPortfolioHealth(organizationId: string): Promise<{
    overallHealth: number;
    initiatives: {
      total: number;
      onTrack: number;
      atRisk: number;
      offTrack: number;
    };
    okrs: {
      total: number;
      achieving: number;
      struggling: number;
    };
    resourceUtilization: number;
    strategicAlignment: number;
    recommendations: string[];
  }> {
    const query = await unifiedDataService.executeUnifiedQuery({
      entities: ['strategic_initiative', 'okr_framework'],
      filters: { organizationId },
      aggregations: [
        { field: 'status', operation: 'count', groupBy: 'status' },
        { field: 'metrics.confidenceLevel', operation: 'avg' },
        { field: 'resources.allocation', operation: 'sum' }
      ]
    });

    const initiatives = query.entities.strategic_initiative || [];
    const okrs = query.entities.okr_framework || [];

    const initiativeStats = {
      total: initiatives.length,
      onTrack: initiatives.filter(i => i.data.status === 'active' && i.data.metrics.confidenceLevel > 0.7).length,
      atRisk: initiatives.filter(i => i.data.metrics.riskLevel === 'high').length,
      offTrack: initiatives.filter(i => i.data.status === 'on_hold' || i.data.metrics.confidenceLevel < 0.5).length
    };

    const okrStats = {
      total: okrs.length,
      achieving: okrs.filter(o => o.data.objectives.every((obj: any) => obj.progress > 0.7)).length,
      struggling: okrs.filter(o => o.data.objectives.some((obj: any) => obj.status === 'at_risk')).length
    };

    const resourceUtilization = query.aggregations['resources.allocation_sum'] || 0;
    const strategicAlignment = await this.calculateStrategicAlignment(initiatives, okrs);

    // AI-powered recommendations
    const aiRecommendations = await aiServiceIntegration.generateStrategicRecommendations({
      initiatives: initiatives.map(i => i.data),
      okrs: okrs.map(o => o.data),
      metrics: { resourceUtilization, strategicAlignment }
    });

    return {
      overallHealth: this.calculateOverallHealth(initiativeStats, okrStats, resourceUtilization, strategicAlignment),
      initiatives: initiativeStats,
      okrs: okrStats,
      resourceUtilization,
      strategicAlignment,
      recommendations: aiRecommendations.data?.recommendations || []
    };
  }

  async generateStrategicInsights(organizationId: string): Promise<{
    trendAnalysis: Array<{
      metric: string;
      trend: 'improving' | 'stable' | 'declining';
      change: number;
      timeframe: string;
    }>;
    riskAssessment: Array<{
      risk: string;
      probability: number;
      impact: number;
      mitigation: string;
    }>;
    opportunityAnalysis: Array<{
      opportunity: string;
      value: number;
      effort: number;
      timeline: string;
    }>;
    recommendations: Array<{
      action: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      rationale: string;
      expectedImpact: string;
    }>;
  }> {
    const roadmap = await this.getStrategicRoadmap(organizationId);
    if (!roadmap) throw new Error('No strategic roadmap found');

    const insights = await aiServiceIntegration.generateStrategicInsights({
      roadmap,
      historicalData: await this.getHistoricalData(organizationId)
    });

    return insights.data || {
      trendAnalysis: [],
      riskAssessment: [],
      opportunityAnalysis: [],
      recommendations: []
    };
  }

  private calculateTimeHorizon(initiatives: StrategicInitiative[]): StrategicRoadmap['timeHorizon'] {
    const dates = initiatives.flatMap(i => [i.timeline.startDate, i.timeline.targetDate]);
    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));

    const quarters = [];
    let currentQuarter = new Date(start);
    while (currentQuarter < end) {
      const quarterEnd = new Date(currentQuarter);
      quarterEnd.setMonth(quarterEnd.getMonth() + 3);
      
      quarters.push({
        name: `Q${Math.floor(currentQuarter.getMonth() / 3) + 1} ${currentQuarter.getFullYear()}`,
        start: new Date(currentQuarter),
        end: quarterEnd,
        themes: this.extractThemesForPeriod(initiatives, currentQuarter, quarterEnd)
      });
      
      currentQuarter = quarterEnd;
    }

    return { start, end, quarters };
  }

  private extractBusinessObjectives(initiatives: StrategicInitiative[]): string[] {
    return [...new Set(initiatives.flatMap(i => i.objectives))];
  }

  private extractStrategicPillars(initiatives: StrategicInitiative[]): string[] {
    return [...new Set(initiatives.map(i => i.category))];
  }

  private extractStakeholders(initiatives: StrategicInitiative[]): string[] {
    return [...new Set(initiatives.flatMap(i => i.stakeholders.map(s => s.id)))];
  }

  private extractThemesForPeriod(initiatives: StrategicInitiative[], start: Date, end: Date): string[] {
    return initiatives
      .filter(i => i.timeline.startDate >= start && i.timeline.startDate <= end)
      .map(i => i.category);
  }

  private async calculateStrategicAlignment(initiatives: any[], okrs: any[]): Promise<number> {
    if (!initiatives.length || !okrs.length) return 0;

    const query = await unifiedDataService.executeUnifiedQuery({
      entities: ['strategic_initiative'],
      relationships: true
    });

    const alignedInitiatives = query.relationships.filter(rel => 
      rel.type === 'supports' && 
      initiatives.some(i => i.id === rel.source) &&
      okrs.some(o => o.data.objectives.some((obj: any) => obj.id === rel.target))
    ).length;

    return alignedInitiatives / initiatives.length;
  }

  private calculateOverallHealth(
    initiatives: any, 
    okrs: any, 
    resourceUtilization: number, 
    strategicAlignment: number
  ): number {
    const initiativeHealth = initiatives.total > 0 ? initiatives.onTrack / initiatives.total : 0;
    const okrHealth = okrs.total > 0 ? okrs.achieving / okrs.total : 0;
    const resourceHealth = Math.min(resourceUtilization / 0.8, 1); // 80% utilization is optimal
    
    return (initiativeHealth * 0.4 + okrHealth * 0.3 + resourceHealth * 0.15 + strategicAlignment * 0.15);
  }

  private async getHistoricalData(organizationId: string): Promise<any[]> {
    // Implementation would fetch historical metrics from analytics service
    return [];
  }
}

export const strategicRoadmapService = new StrategicRoadmapService();