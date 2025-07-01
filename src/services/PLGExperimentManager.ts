
export interface PLGExperiment {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  hypothesis: string;
  variants: Array<{
    id: string;
    name: string;
    description: string;
    trafficAllocation: number;
  }>;
  metrics: string[];
  startDate?: string;
  endDate?: string;
  results?: {
    conversionRate: number;
    statisticalSignificance: number;
    winner?: string;
  };
}

export class PLGExperimentManager {
  private static instance: PLGExperimentManager;
  private experiments: Map<string, PLGExperiment> = new Map();

  constructor() {
    this.initializeMockData();
  }

  static getInstance(): PLGExperimentManager {
    if (!PLGExperimentManager.instance) {
      PLGExperimentManager.instance = new PLGExperimentManager();
    }
    return PLGExperimentManager.instance;
  }

  async getActiveExperiments(): Promise<PLGExperiment[]> {
    return Array.from(this.experiments.values()).filter(exp => exp.status === 'active');
  }

  async getExperimentResults(experimentId: string): Promise<PLGExperiment['results'] | null> {
    const experiment = this.experiments.get(experimentId);
    return experiment?.results || null;
  }

  async createExperiment(experimentData: Omit<PLGExperiment, 'id'>): Promise<string> {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const experiment: PLGExperiment = {
      id,
      ...experimentData
    };
    
    this.experiments.set(id, experiment);
    return id;
  }

  async updateExperiment(id: string, updates: Partial<PLGExperiment>): Promise<boolean> {
    const experiment = this.experiments.get(id);
    if (!experiment) return false;

    this.experiments.set(id, { ...experiment, ...updates });
    return true;
  }

  async deleteExperiment(id: string): Promise<boolean> {
    return this.experiments.delete(id);
  }

  private initializeMockData() {
    const mockExperiments: PLGExperiment[] = [
      {
        id: 'exp_1',
        name: 'Onboarding Flow A/B Test',
        status: 'active',
        hypothesis: 'Simplified onboarding will increase activation rate',
        variants: [
          { id: 'control', name: 'Control', description: 'Current onboarding', trafficAllocation: 50 },
          { id: 'variant_a', name: 'Simplified', description: 'Reduced steps onboarding', trafficAllocation: 50 }
        ],
        metrics: ['activation_rate', 'time_to_first_value'],
        startDate: '2024-01-01',
        results: { conversionRate: 0.25, statisticalSignificance: 0.95 }
      },
      {
        id: 'exp_2',
        name: 'Pricing Page CTA Test',
        status: 'active',
        hypothesis: 'Different CTA text will improve conversion',
        variants: [
          { id: 'control', name: 'Control', description: 'Start Free Trial', trafficAllocation: 50 },
          { id: 'variant_b', name: 'Variant B', description: 'Get Started Now', trafficAllocation: 50 }
        ],
        metrics: ['conversion_rate', 'click_through_rate'],
        startDate: '2024-01-15',
        results: { conversionRate: 0.18, statisticalSignificance: 0.87 }
      }
    ];

    mockExperiments.forEach(exp => {
      this.experiments.set(exp.id, exp);
    });
  }
}

export const plgExperimentManager = PLGExperimentManager.getInstance();
