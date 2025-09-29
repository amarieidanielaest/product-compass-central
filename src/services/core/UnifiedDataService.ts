import { supabase } from '@/integrations/supabase/client';
import { dataManagementService, DataEntity, DataQuery } from './DataManagementService';
import { apiOrchestrationService } from './APIOrchestrationService';
import { authenticationService } from './AuthenticationService';

export interface UnifiedDataQuery {
  entities: string[];
  relationships?: boolean;
  filters?: Record<string, any>;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  aggregations?: Array<{
    field: string;
    operation: 'count' | 'sum' | 'avg' | 'min' | 'max';
    groupBy?: string;
  }>;
}

export interface UnifiedDataResult {
  entities: Record<string, DataEntity[]>;
  relationships: Array<{
    source: string;
    target: string;
    type: string;
    metadata?: Record<string, any>;
  }>;
  aggregations: Record<string, any>;
  metadata: {
    totalCount: number;
    executionTime: number;
    cacheHit: boolean;
    queryComplexity: number;
  };
}

export interface DataPipeline {
  id: string;
  name: string;
  source: {
    type: 'database' | 'api' | 'file' | 'realtime';
    config: Record<string, any>;
  };
  transformations: Array<{
    type: 'filter' | 'map' | 'aggregate' | 'join' | 'validate';
    config: Record<string, any>;
  }>;
  destination: {
    type: 'database' | 'cache' | 'analytics' | 'ai';
    config: Record<string, any>;
  };
  schedule?: {
    interval: number;
    timezone: string;
  };
  isActive: boolean;
}

class UnifiedDataService {
  private pipelines: Map<string, DataPipeline> = new Map();
  private realtimeSubscriptions: Map<string, any> = new Map();

  async executeUnifiedQuery(query: UnifiedDataQuery): Promise<UnifiedDataResult> {
    const startTime = Date.now();
    const result: UnifiedDataResult = {
      entities: {},
      relationships: [],
      aggregations: {},
      metadata: {
        totalCount: 0,
        executionTime: 0,
        cacheHit: false,
        queryComplexity: this.calculateQueryComplexity(query)
      }
    };

    try {
      // Execute queries for each entity type in parallel
      const entityQueries = query.entities.map(async (entityType) => {
        const entityQuery: DataQuery = {
          entityType,
          filters: query.filters,
          search: query.search,
          limit: query.limit,
          offset: query.offset,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          includeRelationships: query.relationships
        };

        const response = await dataManagementService.queryEntities(entityQuery);
        if (response.success) {
          result.entities[entityType] = response.data;
          result.metadata.totalCount += response.data.length;
        }
        return { entityType, data: response.data || [] };
      });

      const entityResults = await Promise.all(entityQueries);

      // Process relationships if requested
      if (query.relationships) {
        result.relationships = await this.extractRelationships(entityResults);
      }

      // Process aggregations if requested
      if (query.aggregations) {
        result.aggregations = await this.processAggregations(entityResults, query.aggregations);
      }

      result.metadata.executionTime = Date.now() - startTime;
      return result;

    } catch (error) {
      console.error('Unified query execution failed:', error);
      throw error;
    }
  }

  async createEntity(entity: DataEntity): Promise<string> {
    const response = await dataManagementService.createEntity(entity);
    return response.success ? response.data.id : '';
  }

  async getEntity(id: string, includeRelationships: boolean = false): Promise<any> {
    return await dataManagementService.getEntity(id, includeRelationships);
  }

  async updateEntity(id: string, updates: any): Promise<void> {
    await dataManagementService.updateEntity(id, updates);
  }

  async createRelationship(relationship: {
    sourceId: string;
    targetId: string;
    type: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await dataManagementService.createRelationship(
      relationship.sourceId,
      relationship.targetId,
      relationship.type
    );
  }

  async createDataPipeline(pipeline: Omit<DataPipeline, 'id'>): Promise<string> {
    const id = `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullPipeline: DataPipeline = { ...pipeline, id };
    
    this.pipelines.set(id, fullPipeline);
    
    if (fullPipeline.isActive) {
      await this.activatePipeline(id);
    }

    return id;
  }

  private calculateQueryComplexity(query: UnifiedDataQuery): number {
    let complexity = 0;
    
    complexity += query.entities.length * 2;
    complexity += query.relationships ? 5 : 0;
    complexity += (query.aggregations?.length || 0) * 3;
    complexity += query.search ? 2 : 0;
    complexity += Object.keys(query.filters || {}).length;

    return complexity;
  }

  private async extractRelationships(entityResults: any[]): Promise<any[]> {
    const relationships: any[] = [];
    
    for (const result of entityResults) {
      for (const entity of result.data) {
        for (const rel of entity.relationships || []) {
          relationships.push({
            source: entity.id,
            target: rel.targetId,
            type: rel.type,
            metadata: { sourceType: result.entityType, targetType: rel.targetType }
          });
        }
      }
    }

    return relationships;
  }

  private async processAggregations(
    entityResults: any[],
    aggregations: UnifiedDataQuery['aggregations']
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    if (!aggregations) return results;

    for (const agg of aggregations) {
      const key = `${agg.field}_${agg.operation}`;
      let values: any[] = [];

      // Collect values from all entity results
      for (const result of entityResults) {
        for (const entity of result.data) {
          const value = entity.data[agg.field];
          if (value !== undefined && value !== null) {
            values.push(agg.groupBy ? { value, group: entity.data[agg.groupBy] } : value);
          }
        }
      }

      // Apply aggregation operation
      switch (agg.operation) {
        case 'count':
          results[key] = values.length;
          break;
        case 'sum':
          results[key] = values.reduce((sum, val) => sum + (typeof val === 'object' ? val.value : val), 0);
          break;
        case 'avg':
          results[key] = values.length > 0 ? 
            values.reduce((sum, val) => sum + (typeof val === 'object' ? val.value : val), 0) / values.length : 0;
          break;
        case 'min':
          results[key] = Math.min(...values.map(val => typeof val === 'object' ? val.value : val));
          break;
        case 'max':
          results[key] = Math.max(...values.map(val => typeof val === 'object' ? val.value : val));
          break;
      }
    }

    return results;
  }

  private async activatePipeline(pipelineId: string): Promise<void> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} not found`);
    }

    // Set up real-time data ingestion if source is realtime
    if (pipeline.source.type === 'realtime') {
      await this.setupRealtimeIngestion(pipeline);
    }

    // Set up scheduled processing if schedule is defined
    if (pipeline.schedule) {
      this.setupScheduledProcessing(pipeline);
    }

    pipeline.isActive = true;
  }

  private async setupRealtimeIngestion(pipeline: DataPipeline): Promise<void> {
    const { table, events = ['INSERT', 'UPDATE', 'DELETE'] } = pipeline.source.config;
    
    const channel = supabase
      .channel(`pipeline_${pipeline.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table,
          filter: pipeline.source.config.filter 
        },
        async (payload) => {
          try {
            const transformedData = await this.processDataTransformation(
              [payload.new || payload.old], 
              pipeline.transformations
            );
            
            await this.processDestination(transformedData, pipeline.destination);
          } catch (error) {
            console.error(`Pipeline ${pipeline.id} processing failed:`, error);
          }
        }
      )
      .subscribe();

    this.realtimeSubscriptions.set(pipeline.id, channel);
  }

  private setupScheduledProcessing(pipeline: DataPipeline): void {
    if (!pipeline.schedule) return;

    setInterval(async () => {
      try {
        // Fetch data from source
        const sourceData = await this.fetchFromSource(pipeline.source);
        
        // Apply transformations
        const transformedData = await this.processDataTransformation(
          sourceData, 
          pipeline.transformations
        );
        
        // Send to destination
        await this.processDestination(transformedData, pipeline.destination);
      } catch (error) {
        console.error(`Scheduled pipeline ${pipeline.id} failed:`, error);
      }
    }, pipeline.schedule.interval * 1000);
  }

  private async processDataTransformation(
    data: any[],
    transformations: DataPipeline['transformations']
  ): Promise<any[]> {
    let processedData = [...data];

    for (const transformation of transformations) {
      switch (transformation.type) {
        case 'filter':
          processedData = this.applyFilter(processedData, transformation.config);
          break;
        case 'map':
          processedData = this.applyMapping(processedData, transformation.config);
          break;
        case 'aggregate':
          processedData = this.applyAggregation(processedData, transformation.config);
          break;
        case 'join':
          processedData = await this.applyJoin(processedData, transformation.config);
          break;
        case 'validate':
          processedData = this.applyValidation(processedData, transformation.config);
          break;
      }
    }

    return processedData;
  }

  private async fetchFromSource(source: DataPipeline['source']): Promise<any[]> {
    switch (source.type) {
      case 'database':
        const { data } = await supabase
          .from(source.config.table)
          .select(source.config.select || '*')
          .limit(source.config.limit || 1000);
        return data || [];
      
      case 'api':
        const response = await apiOrchestrationService.executeRequest(
          source.config.endpointId,
          source.config.payload
        );
        return Array.isArray(response.data) ? response.data : [];
      
      default:
        return [];
    }
  }

  private async processDestination(data: any[], destination: DataPipeline['destination']): Promise<void> {
    switch (destination.type) {
      case 'database':
        await supabase
          .from(destination.config.table)
          .insert(data);
        break;
      
      case 'cache':
        for (const item of data) {
          // Cache implementation would go here
        }
        break;
      
      case 'analytics':
        // Send to analytics service
        break;
      
      case 'ai':
        // Send to AI service for processing
        break;
    }
  }

  private applyFilter(data: any[], config: any): any[] {
    return data.filter(item => {
      for (const [key, value] of Object.entries(config.conditions || {})) {
        if (item[key] !== value) return false;
      }
      return true;
    });
  }

  private applyMapping(data: any[], config: any): any[] {
    return data.map(item => {
      const mapped: any = {};
      for (const [newKey, oldKey] of Object.entries(config.mapping || {})) {
        mapped[newKey] = item[oldKey as string];
      }
      return { ...item, ...mapped };
    });
  }

  private applyAggregation(data: any[], config: any): any[] {
    // Group by specified field and aggregate
    const groups: Record<string, any[]> = {};
    
    data.forEach(item => {
      const groupKey = item[config.groupBy] || 'default';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });

    return Object.entries(groups).map(([key, items]) => ({
      group: key,
      count: items.length,
      ...config.aggregations || {}
    }));
  }

  private async applyJoin(data: any[], config: any): Promise<any[]> {
    // Simple join implementation
    const joinData = await this.fetchFromSource({
      type: 'database',
      config: { table: config.table, select: config.select }
    });

    return data.map(item => {
      const match = joinData.find(joinItem => 
        joinItem[config.joinKey] === item[config.sourceKey]
      );
      return { ...item, ...match };
    });
  }

  private applyValidation(data: any[], config: any): any[] {
    return data.filter(item => {
      for (const rule of config.rules || []) {
        const value = item[rule.field];
        switch (rule.type) {
          case 'required':
            if (value == null || value === '') return false;
            break;
          case 'type':
            if (typeof value !== rule.expectedType) return false;
            break;
          case 'range':
            if (typeof value === 'number' && (value < rule.min || value > rule.max)) return false;
            break;
        }
      }
      return true;
    });
  }
}

export const unifiedDataService = new UnifiedDataService();