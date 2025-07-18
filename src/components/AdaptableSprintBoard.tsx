import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Calendar, Users, Target, Clock, Plus, Filter, 
  ArrowRight, CheckCircle, AlertCircle, MoreHorizontal,
  ExternalLink, MessageSquare, Settings, BarChart3,
  Edit, Trash2, Link, Move, Eye, Copy, Flag,
  ChevronDown, ChevronRight, Kanban, List, CalendarIcon,
  Zap, TrendingUp, AlertTriangle, Play, Pause, Square,
  Columns, Grid, Layout, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { sprintService, type Sprint, type WorkItem, type WorkflowColumn, type Project, type Team } from '@/services/api/SprintService';
import BoardColumn from './sprint/BoardColumn';
import WorkItemCard from './sprint/WorkItemCard';
import CreateWorkItemDialog from './sprint/CreateWorkItemDialog';
import MethodologyTemplates from './sprint/MethodologyTemplates';

interface AdaptableSprintBoardProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
  defaultTeamId?: string;
  defaultProjectId?: string;
}

interface ViewConfig {
  type: 'board' | 'list' | 'timeline' | 'gantt';
  groupBy: 'status' | 'assignee' | 'priority' | 'epic';
  filters: {
    status: string[];
    priority: string[];
    assignee: string[];
    itemType: string[];
  };
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
      itemType: []
    }
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [selectedWorkItems, setSelectedWorkItems] = useState<string[]>([]);
  const [showCreateWorkItem, setShowCreateWorkItem] = useState(false);
  const [showSprintSettings, setShowSprintSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showMethodologyTemplates, setShowMethodologyTemplates] = useState(false);
  const [draggedItem, setDraggedItem] = useState<WorkItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [editingWorkItem, setEditingWorkItem] = useState<WorkItem | null>(null);
  const [createWorkItemStatus, setCreateWorkItemStatus] = useState<string>('');

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const teamsResponse = await sprintService.getTeams();
        if (teamsResponse.success && teamsResponse.data) {
          setTeams(teamsResponse.data);
          if (!selectedTeam && teamsResponse.data.length > 0) {
            setSelectedTeam(teamsResponse.data[0].id);
          }
        }
      } catch (error) {
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
      const response = await sprintService.getSprints({ project_id: projectId || selectedProject });
      if (response.success && response.data) {
        const sprintItems = Array.isArray(response.data) ? response.data : response.data.data || [];
        setSprints(sprintItems);
        // Auto-select active sprint or latest sprint
        const activeSprint = sprintItems.find(s => s.status === 'active');
        const targetSprint = activeSprint || sprintItems[0];
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
      const workItemsResponse = await sprintService.getWorkItems({ sprint_id: selectedSprint });
      if (workItemsResponse.success && workItemsResponse.data) {
        const workItemsList = Array.isArray(workItemsResponse.data) ? workItemsResponse.data : workItemsResponse.data.data || [];
        setWorkItems(workItemsList);
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
    <div className="h-full flex flex-col space-y-4 p-6">
      {/* Header with controls */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold">Sprint Board</h1>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
            <Button onClick={() => setShowCreateWorkItem(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Work Item
            </Button>
          </div>
        </div>

        {/* Selectors Row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Team selector */}
          <div className="w-full sm:w-auto">
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {team.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project selector */}
          <div className="w-full sm:w-auto">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sprint selector */}
          <div className="w-full sm:w-auto">
            <Select value={selectedSprint} onValueChange={setSelectedSprint}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select sprint" />
              </SelectTrigger>
              <SelectContent>
                {sprints.map(sprint => (
                  <SelectItem key={sprint.id} value={sprint.id}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {sprint.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sprints.length > 0 && (
            <Separator orientation="vertical" className="hidden sm:block h-6" />
          )}

          {/* View controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant={viewConfig.type === 'board' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewConfig(prev => ({ ...prev, type: 'board' }))}
            >
              <Columns className="w-4 h-4 mr-1" />
              Board
            </Button>
            <Button 
              variant={viewConfig.type === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewConfig(prev => ({ ...prev, type: 'list' }))}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Sprint overview */}
      {currentSprint && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {currentSprint.name}
                  <Badge variant="outline" className={`ml-2 ${
                    currentSprint.status === 'active' ? 'text-green-700 bg-green-50' : 
                    currentSprint.status === 'completed' ? 'text-blue-700 bg-blue-50' :
                    'text-gray-700 bg-gray-50'
                  }`}>
                    {currentSprint.status}
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  {currentSprint.start_date} - {currentSprint.end_date}
                  {currentSprint.goal && ` • Goal: ${currentSprint.goal}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onNavigate?.('roadmap')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Roadmap
                </Button>
                {currentSprint.status === 'active' && (
                  <Button variant="outline" size="sm">
                    <Pause className="w-4 h-4 mr-2" />
                    End Sprint
                  </Button>
                )}
                {currentSprint.status === 'planned' && (
                  <Button size="sm">
                    <Play className="w-4 h-4 mr-2" />
                    Start Sprint
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Sprint metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{workItems.length}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {workItems.filter(item => workflowColumns.find(col => col.column_type === 'end')?.name === item.status).length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {workItems.reduce((sum, item) => sum + item.effort_estimate, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Story Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{currentSprint.committed}%</div>
                <div className="text-sm text-muted-foreground">Capacity Used</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sprint Progress</span>
                <span>{Math.round((currentSprint.completed / currentSprint.committed) * 100)}%</span>
              </div>
              <Progress value={(currentSprint.completed / currentSprint.committed) * 100} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main board/list view */}
      {viewConfig.type === 'board' && workflowColumns.length > 0 && (
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-4 overflow-x-auto h-full pb-4">
            {workflowColumns
              .sort((a, b) => a.position - b.position)
              .map((column) => (
                <div key={column.id} className="flex-shrink-0 w-80">
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
        <div className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Work Items</CardTitle>
            </CardHeader>
            <CardContent className="h-full overflow-y-auto">
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