import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Calendar, Users, Target, Clock, Plus, Filter, 
  ArrowRight, CheckCircle, AlertCircle, MoreHorizontal,
  ExternalLink, MessageSquare, Settings, BarChart3,
  Edit, Trash2, Link, Move, Eye, Copy, Flag,
  ChevronDown, ChevronRight, Kanban, List, CalendarIcon,
  Zap, TrendingUp, AlertTriangle, Play, Pause, Square
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
  const [draggedItem, setDraggedItem] = useState<WorkItem | null>(null);

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

  const loadSprints = async () => {
    try {
      const response = await sprintService.getSprints({ project_id: selectedProject });
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(async (targetStatus: string) => {
    if (!draggedItem || draggedItem.status === targetStatus) {
      setDraggedItem(null);
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
    }
  }, [draggedItem, toast]);

  // Work item actions
  const handleCreateWorkItem = useCallback(async (workItemData: Partial<WorkItem>) => {
    try {
      const response = await sprintService.createWorkItem({
        ...workItemData,
        sprint_id: selectedSprint,
        status: workflowColumns[0]?.name || 'todo',
        effort_estimate: 0,
        effort_unit: 'points',
        custom_fields: {},
        tags: [],
        linked_feedback_ids: [],
      } as Omit<WorkItem, 'id' | 'created_at' | 'updated_at'>);

      if (response.success && response.data) {
        setWorkItems(prev => [...prev, response.data]);
        setShowCreateWorkItem(false);
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
  }, [selectedSprint, workflowColumns, toast]);

  const handleUpdateWorkItem = useCallback(async (id: string, updates: Partial<WorkItem>) => {
    try {
      const response = await sprintService.updateWorkItem(id, updates);
      if (response.success && response.data) {
        setWorkItems(prev => prev.map(item => 
          item.id === id ? { ...item, ...updates } : item
        ));
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
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Team selector */}
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-[180px]">
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

          {/* Project selector */}
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[180px]">
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

          {/* Sprint selector */}
          <Select value={selectedSprint} onValueChange={setSelectedSprint}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select sprint" />
            </SelectTrigger>
            <SelectContent>
              {sprints.map(sprint => (
                <SelectItem key={sprint.id} value={sprint.id}>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {sprint.name}
                    <Badge variant="outline" className={`ml-2 ${
                      sprint.status === 'active' ? 'text-green-700 bg-green-50' : 
                      sprint.status === 'completed' ? 'text-blue-700 bg-blue-50' :
                      'text-gray-700 bg-gray-50'
                    }`}>
                      {sprint.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* View type selector */}
          <Select value={viewConfig.type} onValueChange={(type) => setViewConfig(prev => ({ ...prev, type: type as any }))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="board">
                <div className="flex items-center gap-2">
                  <Kanban className="w-4 h-4" />
                  Board
                </div>
              </SelectItem>
              <SelectItem value="list">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  List
                </div>
              </SelectItem>
              <SelectItem value="timeline">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Timeline
                </div>
              </SelectItem>
              <SelectItem value="gantt">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Gantt
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowAnalytics(true)}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowSprintSettings(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>

          <Button onClick={() => setShowCreateWorkItem(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Work Item
          </Button>
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
        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${workflowColumns.length}, minmax(300px, 1fr))` }}>
          {workflowColumns
            .sort((a, b) => a.position - b.position)
            .map((column) => (
              <div 
                key={column.id} 
                className="space-y-4"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.name)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: column.color }}
                    />
                    {column.name}
                    <Badge variant="outline" className="ml-2">
                      {groupedWorkItems[column.name]?.length || 0}
                    </Badge>
                    {column.wip_limit && (
                      <Badge variant="outline" className={
                        (groupedWorkItems[column.name]?.length || 0) > column.wip_limit 
                          ? 'text-red-700 bg-red-50 border-red-200' 
                          : 'text-gray-700 bg-gray-50'
                      }>
                        WIP: {column.wip_limit}
                      </Badge>
                    )}
                  </h3>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3 min-h-[200px] p-2 bg-gray-50 rounded-lg">
                  {groupedWorkItems[column.name]?.map((item) => {
                    const ItemIcon = getItemTypeIcon(item.item_type);
                    return (
                      <Card 
                        key={item.id} 
                        className="cursor-move hover:shadow-md transition-shadow bg-white"
                        draggable
                        onDragStart={() => handleDragStart(item)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-2 flex-1">
                                <ItemIcon className="w-4 h-4 mt-0.5 text-gray-500" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                                    {item.title}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {item.item_type.toUpperCase()}-{item.id.slice(-4)}
                                  </p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Priority and effort */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getPriorityColor(item.priority)} variant="outline">
                                {item.priority}
                              </Badge>
                              {item.effort_estimate > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {item.effort_estimate} {item.effort_unit}
                                </Badge>
                              )}
                              {item.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {/* Assignee and due date */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {item.assignee?.name || 'Unassigned'}
                              </div>
                              {item.due_date && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(item.due_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            {/* Linked feedback */}
                            {item.linked_feedback_ids.length > 0 && (
                              <div className="pt-2 border-t border-gray-100">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onNavigate?.('customer')}
                                  className="h-6 p-0 text-xs text-purple-600 hover:text-purple-800"
                                >
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  {item.linked_feedback_ids.length} feedback
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                              </div>
                            )}

                            {/* Dependencies indicator */}
                            {item.dependencies && item.dependencies.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-orange-600">
                                <Link className="w-3 h-3" />
                                {item.dependencies.length} dependencies
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}

                  {(!groupedWorkItems[column.name] || groupedWorkItems[column.name].length === 0) && (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                      <p className="text-gray-500 text-sm">No items in {column.name}</p>
                      <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShowCreateWorkItem(true)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* List view */}
      {viewConfig.type === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Work Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredWorkItems.map((item) => {
                const ItemIcon = getItemTypeIcon(item.item_type);
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <ItemIcon className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{item.title}</span>
                      <Badge variant="outline" style={{ backgroundColor: getStatusColor(item.status), color: 'white' }}>
                        {item.status}
                      </Badge>
                      <Badge className={getPriorityColor(item.priority)} variant="outline">
                        {item.priority}
                      </Badge>
                      {item.effort_estimate > 0 && (
                        <span className="text-sm text-gray-500">
                          {item.effort_estimate} {item.effort_unit}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {item.assignee?.name || 'Unassigned'}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => {}}>
                        <Edit className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No sprint selected state */}
      {!selectedSprint && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Sprint</h3>
            <p className="text-gray-600 mb-4">
              Choose a sprint from the dropdown above to start managing your work items
            </p>
            <Button onClick={() => setShowCreateWorkItem(true)}>
              Create New Sprint
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdaptableSprintBoard;