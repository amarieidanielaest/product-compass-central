
import { BaseApiService, ApiResponse } from './BaseApiService';

export interface AIGenerationRequest {
  type: 'prd' | 'summary' | 'insights' | 'roadmap-scenario';
  context: Record<string, any>;
  prompt?: string;
}

export interface AIGenerationResponse {
  content: string;
  confidence: number;
  suggestions: string[];
  metadata: Record<string, any>;
}

export interface AIInsight {
  type: 'warning' | 'opportunity' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
  suggestedActions?: string[];
  data?: Record<string, any>;
}

class AIApiService extends BaseApiService {
  constructor() {
    // This will be the AI Co-pilot & Generative AI Service microservice URL
    super('/api/ai');
  }

  async generateContent(request: AIGenerationRequest): Promise<ApiResponse<AIGenerationResponse>> {
    return this.makeRequest<AIGenerationResponse>('/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getInsights(
    domain: 'product' | 'roadmap' | 'feedback' | 'strategy',
    context: Record<string, any>
  ): Promise<ApiResponse<AIInsight[]>> {
    return this.makeRequest<AIInsight[]>('/insights', {
      method: 'POST',
      body: JSON.stringify({ domain, context }),
    });
  }

  async optimizeRoadmap(roadmapData: any): Promise<ApiResponse<{
    optimizedRoadmap: any;
    reasoning: string;
    impactScore: number;
  }>> {
    return this.makeRequest('/optimize/roadmap', {
      method: 'POST',
      body: JSON.stringify({ roadmapData }),
    });
  }

  async chatWithAssistant(
    message: string,
    context: Record<string, any> = {}
  ): Promise<ApiResponse<{
    response: string;
    followUpQuestions: string[];
    actionsSuggested: Array<{ action: string; description: string; }>;
  }>> {
    return this.makeRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }
}

export const aiService = new AIApiService();
