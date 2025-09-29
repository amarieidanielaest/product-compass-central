import { supabase } from '@/integrations/supabase/client';

export interface KeyResult {
  id: string;
  description: string;
  metric: string;
  baseline: number;
  target: number;
  current: number;
  unit: string;
  progress: number;
  confidence: number;
  lastUpdated: Date;
  milestones: Array<{
    value: number;
    date: Date;
    achieved: boolean;
  }>;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  owner: string;
  category: string;
  status: 'draft' | 'active' | 'at_risk' | 'completed' | 'cancelled';
  keyResults: KeyResult[];
  progress: number;
  confidenceLevel: number;
  linkedInitiatives: string[];
  parentObjectives: string[];
  childObjectives: string[];
  created: Date;
  lastUpdated: Date;
}

export interface OKRCycle {
  id: string;
  name: string;
  period: {
    start: Date;
    end: Date;
    type: 'quarterly' | 'annual';
  };
  objectives: Objective[];
  organizationId: string;
  status: 'planning' | 'active' | 'review' | 'completed';
  overallProgress: number;
  created: Date;
}

class OKRManagementService {
  async createOKRCycle(cycle: Omit<OKRCycle, 'id' | 'created' | 'overallProgress'>): Promise<string> {
    const id = `okr_cycle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newCycle: OKRCycle = {
      ...cycle,
      id,
      overallProgress: 0,
      created: new Date()
    };

    // Store in database (simplified for demo)
    await supabase
      .from('roadmap_items')
      .insert({
        title: cycle.name,
        description: `OKR Cycle: ${cycle.period.type}`,
        category: 'okr_cycle',
        status: cycle.status,
        organization_id: cycle.organizationId,
        start_date: cycle.period.start.toISOString().split('T')[0],
        due_date: cycle.period.end.toISOString().split('T')[0]
      });

    return id;
  }

  async createObjective(cycleId: string, objective: Omit<Objective, 'id' | 'created' | 'lastUpdated' | 'progress'>): Promise<string> {
    const id = `objective_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newObjective: Objective = {
      ...objective,
      id,
      progress: 0,
      created: new Date(),
      lastUpdated: new Date()
    };

    // Store objective
    await supabase
      .from('roadmap_items')
      .insert({
        title: objective.title,
        description: objective.description,
        category: 'objective',
        status: objective.status,
        business_value_score: 0
      });

    return id;
  }

  async updateKeyResultProgress(keyResultId: string, newValue: number): Promise<void> {
    // Implementation would update the key result in database
    // For now, this is a placeholder
    console.log(`Updating key result ${keyResultId} to ${newValue}`);
  }

  async getOKRCycle(cycleId: string): Promise<OKRCycle | null> {
    // Get cycle data from database
    const { data: roadmapData } = await supabase
      .from('roadmap_items')
      .select('*')
      .eq('category', 'okr_cycle')
      .single();

    if (!roadmapData) return null;

    // Get objectives for this cycle
    const { data: objectivesData } = await supabase
      .from('roadmap_items')
      .select('*')
      .eq('category', 'objective');

    const objectives: Objective[] = (objectivesData || []).map(obj => ({
      id: obj.id,
      title: obj.title,
      description: obj.description || '',
      owner: 'Unknown',
      category: obj.category || 'general',
      status: obj.status as any,
      keyResults: [], // Would be populated from separate table
      progress: 0,
      confidenceLevel: 0.5,
      linkedInitiatives: [],
      parentObjectives: [],
      childObjectives: [],
      created: new Date(obj.created_at),
      lastUpdated: new Date(obj.updated_at)
    }));

    return {
      id: cycleId,
      name: roadmapData.title,
      period: {
        start: new Date(roadmapData.start_date),
        end: new Date(roadmapData.due_date),
        type: 'quarterly'
      },
      objectives,
      organizationId: roadmapData.organization_id,
      status: roadmapData.status as any,
      overallProgress: this.calculateOverallProgress(objectives),
      created: new Date(roadmapData.created_at)
    };
  }

  async getOKRAlignment(organizationId: string): Promise<{
    totalObjectives: number;
    alignedObjectives: number;
    cascadingLevels: number;
    alignmentScore: number;
    gaps: Array<{
      level: string;
      description: string;
      impact: 'low' | 'medium' | 'high';
    }>;
  }> {
    const { data: objectives } = await supabase
      .from('roadmap_items')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('category', 'objective');

    const totalObjectives = objectives?.length || 0;
    
    // Simplified alignment calculation
    const alignedObjectives = Math.floor(totalObjectives * 0.7); // 70% aligned
    const cascadingLevels = 3; // Assume 3 levels
    const alignmentScore = totalObjectives > 0 ? (alignedObjectives / totalObjectives) * 100 : 0;

    const gaps = [
      {
        level: 'Strategic',
        description: 'Some strategic objectives lack clear key results',
        impact: 'medium' as const
      },
      {
        level: 'Tactical',
        description: 'Cross-functional alignment needs improvement',
        impact: 'low' as const
      }
    ];

    return {
      totalObjectives,
      alignedObjectives,
      cascadingLevels,
      alignmentScore,
      gaps
    };
  }

  async generateOKRReport(cycleId: string): Promise<{
    summary: {
      totalObjectives: number;
      completedObjectives: number;
      averageProgress: number;
      atRiskObjectives: number;
    };
    topPerformers: Objective[];
    needsAttention: Objective[];
    keyInsights: string[];
    recommendations: string[];
  }> {
    const cycle = await this.getOKRCycle(cycleId);
    if (!cycle) throw new Error('OKR cycle not found');

    const objectives = cycle.objectives;
    const completedObjectives = objectives.filter(obj => obj.status === 'completed');
    const atRiskObjectives = objectives.filter(obj => obj.status === 'at_risk');
    const averageProgress = objectives.length > 0 
      ? objectives.reduce((sum, obj) => sum + obj.progress, 0) / objectives.length 
      : 0;

    const topPerformers = objectives
      .filter(obj => obj.progress >= 80)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3);

    const needsAttention = objectives
      .filter(obj => obj.progress < 50 || obj.status === 'at_risk')
      .sort((a, b) => a.progress - b.progress)
      .slice(0, 3);

    const keyInsights = [
      `${Math.round(averageProgress)}% average progress across all objectives`,
      `${atRiskObjectives.length} objectives need immediate attention`,
      `${topPerformers.length} objectives are performing exceptionally well`
    ];

    const recommendations = [
      'Focus on key results with lower confidence levels',
      'Increase check-in frequency for at-risk objectives',
      'Consider realigning objectives based on current progress'
    ];

    return {
      summary: {
        totalObjectives: objectives.length,
        completedObjectives: completedObjectives.length,
        averageProgress,
        atRiskObjectives: atRiskObjectives.length
      },
      topPerformers,
      needsAttention,
      keyInsights,
      recommendations
    };
  }

  private calculateOverallProgress(objectives: Objective[]): number {
    if (!objectives.length) return 0;
    return objectives.reduce((sum, obj) => sum + obj.progress, 0) / objectives.length;
  }
}

export const okrManagementService = new OKRManagementService();