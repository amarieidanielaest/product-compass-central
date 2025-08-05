import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Calendar, Users, Target, Clock, Plus, Filter, 
  ArrowRight, CheckCircle, AlertCircle, MoreHorizontal,
  ExternalLink, MessageSquare, Settings, BarChart3,
  Edit, Trash2, Link, Move, Eye, Copy, Flag,
  ChevronDown, ChevronRight, Kanban, List, CalendarIcon,
  Zap, TrendingUp, AlertTriangle, Play, Pause, Square,
  Columns, Grid, Layout, X, Search, HelpCircle,
  Maximize2, Minimize2, Bot, Workflow, Shield, Layers, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { sprintService, type Sprint, type WorkItem, type WorkflowColumn, type Project, type Team } from '@/services/api/SprintService';
import BoardColumn from './sprint/BoardColumn';
import EnhancedWorkItemCard from './sprint/EnhancedWorkItemCard';
import SmartSwimlanes from './sprint/SmartSwimlanes';
import KeyboardShortcuts, { KeyboardShortcutsHelp } from './sprint/KeyboardShortcuts';
import CreateWorkItemDialog from './sprint/CreateWorkItemDialog';
import MethodologyTemplates from './sprint/MethodologyTemplates';
import SprintAnalytics from './sprint/SprintAnalytics';
import AdvancedFilters from './sprint/AdvancedFilters';
import SprintPlanning from './sprint/SprintPlanning';
import RealtimeCollaboration from './sprint/RealtimeCollaboration';
import { WorkflowAutomation } from './sprint/WorkflowAutomation';
import { IntegrationHub } from './sprint/IntegrationHub';
import { PortfolioManagement } from './sprint/PortfolioManagement';
import { SecurityAuditDashboard } from './sprint/SecurityAuditDashboard';

interface AdaptableSprintBoardProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
  defaultTeamId?: string;
  defaultProjectId?: string;
}

interface ViewConfig {
  type: 'board' | 'swimlanes' | 'list' | 'timeline';
  groupBy: 'status' | 'assignee' | 'priority' | 'epic' | 'item_type';
  filters: {
    status: string[];
    priority: string[];
    assignee: string[];
    itemType: string[];
    search: string;
  };
  compactMode: boolean;
  showSubtasks: boolean;
}

const AdaptableSprintBoard = ({ 
  selectedProductId, 
  onNavigate, 
  defaultTeamId, 
  defaultProjectId 
}: AdaptableSprintBoardProps) => {
  const { toast } = useToast();

  // Core state
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [workflowColumns, setWorkflowColumns] = useState<WorkflowColumn[]>([]);
  
  // Selection state
  const [selectedTeam, setSelectedTeam] = useState<string>(defaultTeamId || '');
  const [selectedProject, setSelectedProject] = useState<string>(defaultProjectId || '');
  const [selectedSprint, setSelectedSprint] = useState<string>('');
  
  // View configuration
  const [viewConfig, setViewConfig] = useState<ViewConfig>({
    type: 'board',
    groupBy: 'status',
    filters: {
      status: [],
      priority: [],
      assignee: [],
      itemType: [],
      search: ''
    },
    compactMode: false,
    showSubtasks: true
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [selectedWorkItems, setSelectedWorkItems] = useState<string[]>([]);
  const [showCreateWorkItem, setShowCreateWorkItem] = useState(false);
  const [showSprintSettings, setShowSprintSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showMethodologyTemplates, setShowMethodologyTemplates] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [draggedItem, setDraggedItem] = useState<WorkItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [editingWorkItem, setEditingWorkItem] = useState<WorkItem | null>(null);
  const [createWorkItemStatus, setCreateWorkItemStatus] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  const [activeMainTab, setActiveMainTab] = useState('board');

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        console.log('Loading teams...');
        const teamsResponse = await sprintService.getTeams();
        console.log('Teams response:', teamsResponse);
        if (teamsResponse.success && teamsResponse.data) {
          setTeams(teamsResponse.data);
          console.log('Teams loaded:', teamsResponse.data);
          if (!selectedTeam && teamsResponse.data.length > 0) {
            setSelectedTeam(teamsResponse.data[0].id);
            console.log('Auto-selected team:', teamsResponse.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading teams:', error);
        toast({
          title: "Error loading teams",
          description: "Failed to load team data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load projects when team changes
  useEffect(() => {
    if (selectedTeam) {
      loadProjects();
    }
  }, [selectedTeam]);

  // Load sprints when project changes
  useEffect(() => {
    if (selectedProject) {
      loadSprints();
    }
  }, [selectedProject]);

  // Load work items and workflow when sprint changes
  useEffect(() => {
    if (selectedSprint) {
      loadSprintData();
    }
  }, [selectedSprint]);

  const loadProjects = async () => {
    try {
      const response = await sprintService.getProjects(selectedTeam);
      if (response.success && response.data) {
        setProjects(response.data);
        if (!selectedProject && response.data.length > 0) {
          setSelectedProject(response.data[0].id);
        }
      }
    } catch (error) {
      toast({
        title: "Error loading projects",
        description: "Failed to load project data",
        variant: "destructive",
      });
    }
  };

  const loadSprints = async (projectId?: string) => {
    try {
      const response = await sprintService.getSprints(projectId || selectedProject);
      if (response.success && response.data) {
        setSprints(response.data);
        // Auto-select active sprint or latest sprint
        const activeSprint = response.data.find(s => s.status === 'active');
        const targetSprint = activeSprint || response.data[0];
        if (targetSprint && !selectedSprint) {
          setSelectedSprint(targetSprint.id);
        }
      }
    } catch (error) {
      toast({
        title: "Error loading sprints",
        description: "Failed to load sprint data",
        variant: "destructive",
      });
    }
  };

  const loadSprintData = async () => {
    try {
      // Load work items
      const workItemsResponse = await sprintService.getWorkItems(selectedSprint);
      if (workItemsResponse.success && workItemsResponse.data) {
        setWorkItems(workItemsResponse.data);
      }

      // Load workflow columns
      const columnsResponse = await sprintService.getWorkflowColumns(selectedSprint);
      if (columnsResponse.success && columnsResponse.data) {
        setWorkflowColumns(columnsResponse.data);
      }
    } catch (error) {
      toast({
        title: "Error loading sprint data",
        description: "Failed to load sprint details",
        variant: "destructive",
      });
    }
  };

  // Get current sprint object
  const currentSprint = sprints.find(s => s.id === selectedSprint);
  const currentProject = projects.find(p => p.id === selectedProject);
  const currentTeam = teams.find(t => t.id === selectedTeam);

  // Filter work items based on view configuration
  const filteredWorkItems = useMemo(() => {
    return workItems.filter(item => {
      const { filters } = viewConfig;
      
      if (filters.status.length > 0 && !filters.status.includes(item.status)) return false;
      if (filters.priority.length > 0 && !filters.priority.includes(item.priority)) return false;
      if (filters.assignee.length > 0 && item.assignee_id && !filters.assignee.includes(item.assignee_id)) return false;
      if (filters.itemType.length > 0 && !filters.itemType.includes(item.item_type)) return false;
      
      // Search filter
      if (filters.search.trim()) {
        const searchLower = filters.search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(searchLower);
        const matchesDescription = item.description?.toLowerCase().includes(searchLower);
        const matchesTags = item.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        const matchesAssignee = item.assignee && 
          `${item.assignee.first_name} ${item.assignee.last_name}`.toLowerCase().includes(searchLower);
        
        if (!(matchesTitle || matchesDescription || matchesTags || matchesAssignee)) {
          return false;
        }
      }
      
      return true;
    });
  }, [workItems, viewConfig.filters]);

  // Group work items by selected criteria
  const groupedWorkItems = useMemo(() => {
    const grouped: Record<string, WorkItem[]> = {};
    
    filteredWorkItems.forEach(item => {
      let groupKey = '';
      
      switch (viewConfig.groupBy) {
        case 'status':
          groupKey = item.status;
          break;
        case 'assignee':
          groupKey = item.assignee?.name || 'Unassigned';
          break;
        case 'priority':
          groupKey = item.priority;
          break;
        case 'epic':
          groupKey = item.parent?.title || 'No Epic';
          break;
        default:
          groupKey = item.status;
      }
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(item);
    });
    
    return grouped;
  }, [filteredWorkItems, viewConfig.groupBy]);

  // Drag and drop handlers
  const handleDragStart = useCallback((item: WorkItem) => {
    setDraggedItem(item);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnName?: string) => {
    e.preventDefault();
    if (columnName) {
      setDragOverColumn(columnName);
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(async (targetStatus: string) => {
    if (!draggedItem || draggedItem.status === targetStatus) {
      setDraggedItem(null);
      setDragOverColumn(null);
      return;
    }

    try {
      const response = await sprintService.updateWorkItem(draggedItem.id, { status: targetStatus });
      if (response.success && response.data) {
        setWorkItems(prev => prev.map(item => 
          item.id === draggedItem.id ? { ...item, status: targetStatus } : item
        ));
        toast({
          title: "Work item updated",
          description: `Moved to ${targetStatus}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error updating work item",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setDraggedItem(null);
      setDragOverColumn(null);
    }
  }, [draggedItem, toast]);

  // Work item actions
  const handleCreateWorkItem = useCallback(async (workItemData: Partial<WorkItem>) => {
    try {
      const response = await sprintService.createWorkItem({
        ...workItemData,
        sprint_id: selectedSprint,
        status: createWorkItemStatus || workflowColumns[0]?.name || 'todo',
        effort_estimate: workItemData.effort_estimate || 0,
        effort_unit: workItemData.effort_unit || 'points',
        custom_fields: workItemData.custom_fields || {},
        tags: workItemData.tags || [],
        linked_feedback_ids: workItemData.linked_feedback_ids || [],
      } as Omit<WorkItem, 'id' | 'created_at' | 'updated_at'>);

      if (response.success && response.data) {
        setWorkItems(prev => [...prev, response.data]);
        setShowCreateWorkItem(false);
        setCreateWorkItemStatus('');
        toast({
          title: "Work item created",
          description: `${response.data.title} has been created`,
        });
      }
    } catch (error) {
      toast({
        title: "Error creating work item",
        description: "Failed to create work item",
        variant: "destructive",
      });
    }
  }, [selectedSprint, workflowColumns, createWorkItemStatus, toast]);

  const handleUpdateWorkItem = useCallback(async (id: string, updates: Partial<WorkItem>) => {
    try {
      const response = await sprintService.updateWorkItem(id, updates);
      if (response.success && response.data) {
        setWorkItems(prev => prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        ));
        setEditingWorkItem(null);
        toast({
          title: "Work item updated",
          description: "Changes saved successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error updating work item",
        description: "Failed to save changes",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleDeleteWorkItem = useCallback(async (id: string) => {
    try {
      const response = await sprintService.deleteWorkItem(id);
      if (response.success) {
        setWorkItems(prev => prev.filter(item => item.id !== id));
        toast({
          title: "Work item deleted",
          description: "Work item has been removed",
        });
      }
    } catch (error) {
      toast({
        title: "Error deleting work item",
        description: "Failed to delete work item",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleSelectWorkItem = useCallback((id: string, selected: boolean) => {
    setSelectedWorkItems(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(itemId => itemId !== id)
    );
  }, []);

  const handleCreateWorkItemWithStatus = useCallback((status: string) => {
    setCreateWorkItemStatus(status);
    setShowCreateWorkItem(true);
  }, []);

  // Enhanced keyboard shortcuts handlers
  const handleSelectAllWorkItems = useCallback(() => {
    setSelectedWorkItems(filteredWorkItems.map(item => item.id));
  }, [filteredWorkItems]);

  const handleClearSelection = useCallback(() => {
    setSelectedWorkItems([]);
    setFocusedItem(null);
  }, []);

  const handleToggleView = useCallback(() => {
    setViewConfig(prev => ({
      ...prev,
      type: prev.type === 'board' ? 'swimlanes' : prev.type === 'swimlanes' ? 'list' : 'board'
    }));
  }, []);

  const handleFocusSearch = useCallback(() => {
    const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
    searchInput?.focus();
  }, []);

  const handleRefresh = useCallback(() => {
    if (selectedSprint) {
      loadSprintData();
      toast({
        title: "Board refreshed",
        description: "Latest data loaded successfully",
      });
    }
  }, [selectedSprint]);

  // Update search filter
  const updateSearchFilter = useCallback((search: string) => {
    setViewConfig(prev => ({
      ...prev,
      filters: { ...prev.filters, search }
    }));
  }, []);

  // Utility functions
  const getStatusColor = (status: string) => {
    const column = workflowColumns.find(col => col.name.toLowerCase() === status.toLowerCase());
    return column?.color || '#6b7280';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-700 bg-red-50 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'epic': return Target;
      case 'story': return MessageSquare;
      case 'task': return CheckCircle;
      case 'bug': return AlertTriangle;
      case 'feature': return Zap;
      default: return CheckCircle;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Clean streamlined header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Left: Context selectors + Search */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <span className="truncate">{team.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3" />
                      <span className="truncate">{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSprint} onValueChange={setSelectedSprint}>
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue placeholder="Sprint" />
              </SelectTrigger>
              <SelectContent>
                {sprints.map(sprint => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span className="truncate">{sprint.name}</span>
                      {sprint.status === 'active' && (
                        <Badge variant="secondary" className="ml-1 text-xs h-4">Active</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search in header */}
            <div className="relative w-48">
              <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={viewConfig.filters.search || ''}
                onChange={(e) => setViewConfig(prev => ({
                  ...prev,
                  filters: { ...prev.filters, search: e.target.value }
                }))}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* Right: View toggle + Actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md">
              <Button 
                variant={viewConfig.type === 'board' ? 'default' : 'ghost'} 
                size="sm"
                className="rounded-r-none border-r px-2 h-7 text-xs"
                onClick={() => setViewConfig(prev => ({ ...prev, type: 'board' }))}
              >
                <Columns className="w-3 h-3" />
              </Button>
              <Button 
                variant={viewConfig.type === 'list' ? 'default' : 'ghost'} 
                size="sm"
                className="rounded-l-none px-2 h-7 text-xs"
                onClick={() => setViewConfig(prev => ({ ...prev, type: 'list' }))}
              >
                <List className="w-3 h-3" />
              </Button>
            </div>

            <Button 
              onClick={() => setShowCreateWorkItem(true)}
              disabled={!selectedSprint}
              size="sm"
              className="h-7 px-3 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
              className="h-7 px-2 text-xs"
            >
              <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      {currentSprint && (
        <div className="flex-1 flex flex-col px-6 py-4">
          {/* Clean tabs navigation */}
          <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="flex-1 flex flex-col">
            <TabsList className="w-fit mb-4">
              <TabsTrigger value="board" className="text-sm">
                <Kanban className="w-4 h-4 mr-2" />
                Board
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="planning" className="text-sm">
                <Target className="w-4 h-4 mr-2" />
                Planning
              </TabsTrigger>
            </TabsList>

            <TabsContent value="board" className="flex-1 flex flex-col space-y-3">
            {/* Compact sprint overview */}
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{currentSprint.name}</h3>
                  <Badge variant="outline" className={`text-xs ${
                    currentSprint.status === 'active' ? 'text-green-700 bg-green-50' : 
                    currentSprint.status === 'completed' ? 'text-blue-700 bg-blue-50' :
                    'text-gray-700 bg-gray-50'
                  }`}>
                    {currentSprint.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{workItems.length} items</span>
                  <span>{workItems.filter(item => workflowColumns.find(col => col.column_type === 'end')?.name === item.status).length} done</span>
                  <span>{workItems.reduce((sum, item) => sum + item.effort_estimate, 0)} pts</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="flex-1">
            <SprintAnalytics
              sprint={currentSprint}
              workItems={workItems}
              onRefresh={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="planning" className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Sprint Planning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Advanced sprint planning tools coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="flex-1">
            <WorkflowAutomation />
          </TabsContent>

          <TabsContent value="integrations" className="flex-1">
            <IntegrationHub />
          </TabsContent>

          <TabsContent value="security" className="flex-1">
            <SecurityAuditDashboard />
          </TabsContent>
        </Tabs>
        </div>
      )}

      {/* Board/List content within the board tab */}
      {activeMainTab === 'board' && currentSprint && (
        <div className="px-6">
          {/* Responsive Board view */}
          {viewConfig.type === 'board' && workflowColumns.length > 0 && (
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:flex md:gap-4 md:overflow-x-auto pb-4 min-h-[400px]">
                {workflowColumns
                  .sort((a, b) => a.position - b.position)
                  .map((column) => (
                    <div key={column.id} className="md:flex-shrink-0 md:w-72 lg:w-80">
                      <BoardColumn
                        column={column}
                        workItems={groupedWorkItems[column.name] || []}
                        onDrop={handleDrop}
                        onDragOver={(e) => handleDragOver(e, column.name)}
                        onCreateWorkItem={handleCreateWorkItemWithStatus}
                        onEditWorkItem={setEditingWorkItem}
                        onDeleteWorkItem={handleDeleteWorkItem}
                        onViewWorkItem={(item) => console.log('View item:', item)}
                        onMoveWorkItem={(item) => console.log('Move item:', item)}
                        onDragStartWorkItem={handleDragStart}
                        selectedWorkItems={selectedWorkItems}
                        onSelectWorkItem={handleSelectWorkItem}
                        isDragOver={dragOverColumn === column.name}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* List view */}
          {viewConfig.type === 'list' && (
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Work Items</CardTitle>
                </CardHeader>
                <CardContent className="max-h-96 overflow-y-auto">
                  <div className="space-y-2">
                    {filteredWorkItems.map((item) => {
                      const ItemIcon = getItemTypeIcon(item.item_type);
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <ItemIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">{item.title}</span>
                            <Badge variant="outline" style={{ backgroundColor: getStatusColor(item.status), color: 'white' }}>
                              {item.status}
                            </Badge>
                            <Badge className={getPriorityColor(item.priority)} variant="outline">
                              {item.priority}
                            </Badge>
                            {item.effort_estimate > 0 && (
                              <span className="text-sm text-muted-foreground flex-shrink-0">
                                {item.effort_estimate} {item.effort_unit}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm text-muted-foreground hidden sm:block">
                              {item.assignee?.name || 'Unassigned'}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => setEditingWorkItem(item)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {filteredWorkItems.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No work items found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Real-time collaboration */}
      {selectedSprint && (
        <RealtimeCollaboration
          sprintId={selectedSprint}
          onWorkItemUpdate={(item) => setWorkItems(prev => prev.map(w => w.id === item.id ? item : w))}
          onWorkItemCreate={(item) => setWorkItems(prev => [...prev, item])}
          onWorkItemDelete={(itemId) => setWorkItems(prev => prev.filter(w => w.id !== itemId))}
          onSprintUpdate={(sprint) => setSprints(prev => prev.map(s => s.id === sprint.id ? sprint : s))}
          onUserJoined={(userId, userInfo) => console.log('User joined:', userId, userInfo)}
          onUserLeft={(userId) => console.log('User left:', userId)}
          onUserCursorMove={(userId, position) => console.log('Cursor move:', userId, position)}
        >
          <div />
        </RealtimeCollaboration>
      )}

      {/* Keyboard shortcuts */}
      <KeyboardShortcuts
        onCreateWorkItem={() => setShowCreateWorkItem(true)}
        onEditWorkItem={(item: WorkItem) => setEditingWorkItem(item)}
        onDeleteWorkItem={handleDeleteWorkItem}
        onToggleView={handleToggleView}
        onFocusSearch={handleFocusSearch}
        onRefresh={handleRefresh}
        selectedWorkItems={selectedWorkItems}
        workItems={workItems}
      />

      {/* No sprint selected state */}
      {!selectedSprint && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Layout className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-2">Start with a Sprint Board</h3>
              <p className="text-muted-foreground mb-6">
                Create a new sprint or select an existing one to start managing your work items with our adaptable board
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => setShowMethodologyTemplates(true)}
                  disabled={!selectedProject}
                  className="w-full sm:w-auto"
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Create New Sprint
                </Button>
                {sprints.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedSprint(sprints[0].id)}
                    className="w-full sm:w-auto"
                  >
                    Use Existing Sprint
                  </Button>
                )}
              </div>
              {!selectedProject && (
                <p className="text-sm text-amber-600 mt-4">
                  Please select a project first to create a sprint
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialogs */}
      <CreateWorkItemDialog
        open={showCreateWorkItem}
        onOpenChange={setShowCreateWorkItem}
        onSave={handleCreateWorkItem}
        initialStatus={createWorkItemStatus}
        mode="create"
      />

      <CreateWorkItemDialog
        open={!!editingWorkItem}
        onOpenChange={(open) => !open && setEditingWorkItem(null)}
        onSave={(data) => editingWorkItem && handleUpdateWorkItem(editingWorkItem.id, data)}
        workItem={editingWorkItem || undefined}
        mode="edit"
      />

      {showMethodologyTemplates && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Choose Methodology Template</h2>
                <Button variant="ghost" onClick={() => setShowMethodologyTemplates(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <MethodologyTemplates
                onSelectTemplate={async (template) => {
                  try {
                    // Create a new sprint based on the template
                    const newSprint: Omit<Sprint, 'id' | 'created_at' | 'updated_at'> = {
                      name: `${template.name} Sprint ${sprints.length + 1}`,
                      goal: `Sprint using ${template.name} methodology`,
                      project_id: selectedProject,
                      start_date: new Date().toISOString().split('T')[0],
                      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      status: 'planned',
                      capacity: 40,
                      committed: 0,
                      completed: 0,
                      methodology_type: template.methodology_type as 'scrum' | 'kanban' | 'waterfall',
                      workflow_config: template.default_config
                    };

                    const response = await sprintService.createSprint(newSprint);
                    if (response.success) {
                      // Create workflow columns for this sprint
                      const columns = template.default_columns.map(col => ({
                        ...col,
                        sprint_id: response.data.id,
                        id: `${response.data.id}-${col.name.toLowerCase().replace(/\s+/g, '-')}`
                      }));
                      
                      await sprintService.updateWorkflowColumns(response.data.id, columns);
                      
                      // Refresh data
                      setSelectedSprint(response.data.id);
                      await loadSprints(selectedProject);
                      
                      toast({
                        title: "Sprint created",
                        description: `${template.name} sprint has been created successfully`,
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Error creating sprint",
                      description: "Failed to create sprint from template",
                      variant: "destructive",
                    });
                  }
                  setShowMethodologyTemplates(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdaptableSprintBoard;
