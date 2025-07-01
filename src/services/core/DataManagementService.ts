
import { BaseApiService, ApiResponse } from '../api/BaseApiService';

export interface DataEntity {
  id: string;
  type: 'user' | 'product' | 'feedback' | 'roadmap' | 'experiment' | 'okr';
  data: Record<string, any>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    version: number;
    tags: string[];
  };
  relationships: Array<{
    type: 'depends_on' | 'related_to' | 'child_of' | 'linked_to';
    targetId: string;
    targetType: string;
  }>;
}

export interface DataQuery {
  entityType?: string;
  filters?: Record<string, any>;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeRelationships?: boolean;
}

export interface DataSyncStatus {
  entityId: string;
  status: 'synced' | 'pending' | 'conflict' | 'error';
  lastSyncAt: string;
  conflictResolution?: 'auto' | 'manual' | 'pending';
}

class DataManagementService extends BaseApiService {
  private cache: Map<string, DataEntity> = new Map();
  private syncQueue: Set<string> = new Set();
  private syncListeners: Array<(status: DataSyncStatus[]) => void> = [];

  constructor() {
    super('/api/data');
    this.initializeSyncWorker();
  }

  async queryEntities(query: DataQuery): Promise<ApiResponse<DataEntity[]>> {
    // Check cache first for simple queries
    if (this.shouldUseCache(query)) {
      const cachedResults = this.queryCachedEntities(query);
      if (cachedResults.length > 0) {
        return { success: true, data: cachedResults };
      }
    }

    const response = await this.makeRequest<DataEntity[]>('/query', {
      method: 'POST',
      body: JSON.stringify(query),
    });

    if (response.success) {
      // Update cache with results
      response.data.forEach(entity => {
        this.cache.set(entity.id, entity);
      });
    }

    return response;
  }

  async getEntity(id: string, includeRelationships = false): Promise<ApiResponse<DataEntity>> {
    // Check cache first
    const cached = this.cache.get(id);
    if (cached && (!includeRelationships || cached.relationships.length > 0)) {
      return { success: true, data: cached };
    }

    const response = await this.makeRequest<DataEntity>(`/entities/${id}?includeRelationships=${includeRelationships}`);
    
    if (response.success) {
      this.cache.set(id, response.data);
    }

    return response;
  }

  async createEntity(entityData: Omit<DataEntity, 'id' | 'metadata'>): Promise<ApiResponse<DataEntity>> {
    const response = await this.makeRequest<DataEntity>('/entities', {
      method: 'POST',
      body: JSON.stringify(entityData),
    });

    if (response.success) {
      this.cache.set(response.data.id, response.data);
      this.notifySyncChange([{
        entityId: response.data.id,
        status: 'synced',
        lastSyncAt: new Date().toISOString()
      }]);
    }

    return response;
  }

  async updateEntity(id: string, updates: Partial<DataEntity>): Promise<ApiResponse<DataEntity>> {
    // Optimistic update
    const cached = this.cache.get(id);
    if (cached) {
      const optimisticUpdate = { ...cached, ...updates };
      this.cache.set(id, optimisticUpdate);
    }

    // Queue for sync
    this.syncQueue.add(id);

    const response = await this.makeRequest<DataEntity>(`/entities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (response.success) {
      this.cache.set(id, response.data);
      this.syncQueue.delete(id);
      this.notifySyncChange([{
        entityId: id,
        status: 'synced',
        lastSyncAt: new Date().toISOString()
      }]);
    } else {
      // Revert optimistic update on failure
      if (cached) {
        this.cache.set(id, cached);
      }
      this.notifySyncChange([{
        entityId: id,
        status: 'error',
        lastSyncAt: new Date().toISOString()
      }]);
    }

    return response;
  }

  async deleteEntity(id: string): Promise<ApiResponse<void>> {
    const response = await this.makeRequest<void>(`/entities/${id}`, {
      method: 'DELETE',
    });

    if (response.success) {
      this.cache.delete(id);
      this.syncQueue.delete(id);
    }

    return response;
  }

  async createRelationship(sourceId: string, targetId: string, type: DataEntity['relationships'][0]['type']): Promise<ApiResponse<void>> {
    const response = await this.makeRequest<void>('/relationships', {
      method: 'POST',
      body: JSON.stringify({ sourceId, targetId, type }),
    });

    if (response.success) {
      // Update cached entities with new relationship
      const sourceEntity = this.cache.get(sourceId);
      if (sourceEntity) {
        sourceEntity.relationships.push({
          type,
          targetId,
          targetType: 'unknown' // Will be resolved on next fetch
        });
      }
    }

    return response;
  }

  async getRelationships(entityId: string, relationshipType?: string): Promise<ApiResponse<DataEntity[]>> {
    const queryParams = new URLSearchParams({ entityId });
    if (relationshipType) queryParams.append('type', relationshipType);

    return this.makeRequest<DataEntity[]>(`/relationships?${queryParams}`);
  }

  async syncPendingChanges(): Promise<void> {
    if (this.syncQueue.size === 0) return;

    const pendingIds = Array.from(this.syncQueue);
    const syncStatuses: DataSyncStatus[] = [];

    for (const id of pendingIds) {
      const entity = this.cache.get(id);
      if (!entity) continue;

      try {
        const response = await this.updateEntity(id, entity);
        syncStatuses.push({
          entityId: id,
          status: response.success ? 'synced' : 'error',
          lastSyncAt: new Date().toISOString()
        });
      } catch (error) {
        syncStatuses.push({
          entityId: id,
          status: 'error',
          lastSyncAt: new Date().toISOString()
        });
      }
    }

    this.notifySyncChange(syncStatuses);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  onSyncStatusChange(callback: (statuses: DataSyncStatus[]) => void): () => void {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(listener => listener !== callback);
    };
  }

  private shouldUseCache(query: DataQuery): boolean {
    // Use cache for simple queries without complex filters
    return !query.search && !query.filters && this.cache.size > 0;
  }

  private queryCachedEntities(query: DataQuery): DataEntity[] {
    const entities = Array.from(this.cache.values());
    
    let filtered = entities;
    
    if (query.entityType) {
      filtered = filtered.filter(entity => entity.type === query.entityType);
    }

    if (query.sortBy) {
      filtered.sort((a, b) => {
        const aVal = query.sortBy === 'createdAt' ? a.metadata.createdAt : a.data[query.sortBy!];
        const bVal = query.sortBy === 'createdAt' ? b.metadata.createdAt : b.data[query.sortBy!];
        
        if (query.sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    if (query.limit) {
      filtered = filtered.slice(query.offset || 0, (query.offset || 0) + query.limit);
    }

    return filtered;
  }

  private initializeSyncWorker(): void {
    // Sync pending changes every 30 seconds
    setInterval(() => {
      if (this.syncQueue.size > 0) {
        this.syncPendingChanges();
      }
    }, 30000);
  }

  private notifySyncChange(statuses: DataSyncStatus[]): void {
    this.syncListeners.forEach(listener => listener(statuses));
  }
}

export const dataManagementService = new DataManagementService();
