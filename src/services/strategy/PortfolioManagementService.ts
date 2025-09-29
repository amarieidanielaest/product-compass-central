import { supabase } from '@/integrations/supabase/client';
import { unifiedDataService } from '../core/UnifiedDataService';

export interface PortfolioItem {
  id: string;
  title: string;
  type: 'project' | 'initiative' | 'epic' | 'feature';
  status: 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  businessValue: number;
  effort: number;
  timeline: {
    start: Date;
    end: Date;
    milestones: Array<{
      name: string;
      date: Date;
      status: 'planned' | 'completed' | 'at_risk';
    }>;
  };
  resources: {
    budget: number;
    teamAllocation: number;
    dependencies: string[];
  };
  metrics: {
    progress: number;
    roi: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  items: PortfolioItem[];
  totals: {
    totalValue: number;
    totalEffort: number;
    totalBudget: number;
    activeItems: number;
    completedItems: number;
  };
  healthScore: number;
  lastUpdated: Date;
}

class PortfolioManagementService {
  async getPortfolio(organizationId: string): Promise<Portfolio> {
    const { data: roadmapItems } = await supabase
      .from('roadmap_items')
      .select('*')
      .eq('organization_id', organizationId);

    const { data: projects } = await supabase
      .from('projects')
      .select('*');

    const items: PortfolioItem[] = [
      ...(roadmapItems || []).map(item => ({
        id: item.id,
        title: item.title,
        type: 'initiative' as const,
        status: item.status as any,
        priority: item.priority as any,
        businessValue: item.business_value_score || 0,
        effort: item.effort_points || 0,
        timeline: {
          start: new Date(item.start_date || item.created_at),
          end: new Date(item.due_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
          milestones: []
        },
        resources: {
          budget: 0,
          teamAllocation: 0,
          dependencies: item.dependencies ? Object.keys(item.dependencies) : []
        },
        metrics: {
          progress: this.calculateProgress(item),
          roi: 0,
          riskLevel: 'medium' as const
        }
      })),
      ...(projects || []).map(project => ({
        id: project.id,
        title: project.name,
        type: 'project' as const,
        status: project.status as any,
        priority: 'medium' as const,
        businessValue: 0,
        effort: 0,
        timeline: {
          start: new Date(project.start_date || project.created_at),
          end: new Date(project.end_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
          milestones: []
        },
        resources: {
          budget: 0,
          teamAllocation: 0,
          dependencies: []
        },
        metrics: {
          progress: 0,
          roi: 0,
          riskLevel: 'medium' as const
        }
      }))
    ];

    const totals = this.calculateTotals(items);
    const healthScore = this.calculateHealthScore(items);

    return {
      id: `portfolio_${organizationId}`,
      name: 'Product Portfolio',
      description: 'Comprehensive portfolio view',
      items,
      totals,
      healthScore,
      lastUpdated: new Date()
    };
  }

  async getResourceCapacity(organizationId: string): Promise<{
    totalCapacity: number;
    allocatedCapacity: number;
    availableCapacity: number;
    overallocation: number;
    teams: Array<{
      id: string;
      name: string;
      capacity: number;
      allocated: number;
      efficiency: number;
    }>;
  }> {
    const { data: teams } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        team_memberships(count)
      `);

    const teamCapacities = (teams || []).map(team => {
      const memberCount = team.team_memberships?.[0]?.count || 1;
      const capacity = memberCount * 40; // 40 hours per week per member
      
      return {
        id: team.id,
        name: team.name,
        capacity,
        allocated: capacity * 0.8, // Assume 80% allocation
        efficiency: 0.85
      };
    });

    const totalCapacity = teamCapacities.reduce((sum, team) => sum + team.capacity, 0);
    const allocatedCapacity = teamCapacities.reduce((sum, team) => sum + team.allocated, 0);
    const availableCapacity = totalCapacity - allocatedCapacity;

    return {
      totalCapacity,
      allocatedCapacity,
      availableCapacity,
      overallocation: Math.max(0, (allocatedCapacity - totalCapacity) / totalCapacity),
      teams: teamCapacities
    };
  }

  async optimizePortfolio(organizationId: string, constraints: {
    maxBudget?: number;
    maxTeams?: number;
    minROI?: number;
    targetTimeframe?: Date;
  }): Promise<{
    optimizedItems: PortfolioItem[];
    removedItems: PortfolioItem[];
    reasoning: string[];
    projectedOutcome: {
      totalValue: number;
      totalEffort: number;
      expectedROI: number;
      riskScore: number;
    };
  }> {
    const portfolio = await this.getPortfolio(organizationId);
    const items = [...portfolio.items];

    // Sort by value/effort ratio
    items.sort((a, b) => {
      const ratioA = a.businessValue / Math.max(a.effort, 1);
      const ratioB = b.businessValue / Math.max(b.effort, 1);
      return ratioB - ratioA;
    });

    const optimizedItems: PortfolioItem[] = [];
    const removedItems: PortfolioItem[] = [];
    const reasoning: string[] = [];

    let totalBudget = 0;
    let totalEffort = 0;

    for (const item of items) {
      const wouldExceedBudget = constraints.maxBudget && 
        totalBudget + item.resources.budget > constraints.maxBudget;
      
      const belowMinROI = constraints.minROI && 
        item.metrics.roi < constraints.minROI;
      
      const tooHighRisk = item.metrics.riskLevel === 'critical';

      if (wouldExceedBudget || belowMinROI || tooHighRisk) {
        removedItems.push(item);
        if (wouldExceedBudget) reasoning.push(`Removed ${item.title}: Would exceed budget constraint`);
        if (belowMinROI) reasoning.push(`Removed ${item.title}: Below minimum ROI threshold`);
        if (tooHighRisk) reasoning.push(`Removed ${item.title}: Critical risk level`);
      } else {
        optimizedItems.push(item);
        totalBudget += item.resources.budget;
        totalEffort += item.effort;
      }
    }

    const projectedOutcome = {
      totalValue: optimizedItems.reduce((sum, item) => sum + item.businessValue, 0),
      totalEffort,
      expectedROI: optimizedItems.reduce((sum, item) => sum + item.metrics.roi, 0) / optimizedItems.length,
      riskScore: this.calculateRiskScore(optimizedItems)
    };

    return {
      optimizedItems,
      removedItems,
      reasoning,
      projectedOutcome
    };
  }

  private calculateProgress(item: any): number {
    if (item.status === 'completed') return 100;
    if (item.status === 'planned') return 0;
    if (item.status === 'cancelled') return 0;
    
    // Calculate based on timeline
    const start = new Date(item.start_date || item.created_at);
    const end = new Date(item.due_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  }

  private calculateTotals(items: PortfolioItem[]) {
    return {
      totalValue: items.reduce((sum, item) => sum + item.businessValue, 0),
      totalEffort: items.reduce((sum, item) => sum + item.effort, 0),
      totalBudget: items.reduce((sum, item) => sum + item.resources.budget, 0),
      activeItems: items.filter(item => item.status === 'active').length,
      completedItems: items.filter(item => item.status === 'completed').length
    };
  }

  private calculateHealthScore(items: PortfolioItem[]): number {
    if (!items.length) return 0;
    
    const onTrackItems = items.filter(item => 
      item.status === 'active' && item.metrics.riskLevel !== 'high' && item.metrics.riskLevel !== 'critical'
    ).length;
    
    const completedItems = items.filter(item => item.status === 'completed').length;
    
    return ((onTrackItems + completedItems) / items.length) * 100;
  }

  private calculateRiskScore(items: PortfolioItem[]): number {
    const riskWeights = { low: 1, medium: 2, high: 3, critical: 4 };
    const totalRisk = items.reduce((sum, item) => sum + riskWeights[item.metrics.riskLevel], 0);
    return totalRisk / items.length;
  }
}

export const portfolioManagementService = new PortfolioManagementService();