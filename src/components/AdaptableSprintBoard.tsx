import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Settings, Plus, Filter, Users, Activity, 
  BarChart3, TrendingUp, Clock, Target,
  Kanban, GitBranch, Zap, Layers
} from 'lucide-react';

import BoardColumn from './sprint/BoardColumn';
import WorkItemCard from './sprint/WorkItemCard';
import MethodologyTemplates from './sprint/MethodologyTemplates';
import CreateWorkItemDialog from './sprint/CreateWorkItemDialog';
import SprintPlanning from './sprint/SprintPlanning';
import SprintAnalytics from './sprint/SprintAnalytics';
import AdvancedFilters from './sprint/AdvancedFilters';
import { toast } from 'sonner';

// Loading skeleton for the sprint board
const SprintBoardSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>

    {/* Methodology tabs skeleton */}
    <div className="flex gap-2">
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-8 w-20" />
      ))}
    </div>

    {/* Board columns skeleton */}
    <div className="flex gap-4 overflow-x-auto pb-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i} className="min-w-80 h-96">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-8" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map(j => (
              <Skeleton key={j} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const AdaptableSprintBoard: React.FC = () => {
  // Initialize with loading state to prevent flash
  const [isInitializing, setIsInitializing] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedSprint, setSelectedSprint] = useState<string>('');
  const [activeView, setActiveView] = useState<'board' | 'planning' | 'analytics'>('board');
  const [selectedMethodology, setSelectedMethodology] = useState<'scrum' | 'kanban' | 'waterfall' | 'hybrid'>('scrum');
  const [showMethodologySetup, setShowMethodologySetup] = useState(false);
  const [showCreateWorkItem, setShowCreateWorkItem] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [selectedWorkItems, setSelectedWorkItems] = useState<string[]>([]);

  // Mock data for now - will be replaced with real service
  const [teams] = useState([
    { id: '1', name: 'Frontend Team' },
    { id: '2', name: 'Backend Team' },
    { id: '3', name: 'DevOps Team' }
  ]);
  
  const [projects] = useState([
    { id: '1', name: 'User Dashboard', team_id: '1' },
    { id: '2', name: 'API Gateway', team_id: '2' },
    { id: '3', name: 'Infrastructure', team_id: '3' }
  ]);
  
  const [sprints] = useState([
    { id: '1', name: 'Sprint 1', project_id: '1', status: 'active' },
    { id: '2', name: 'Sprint 2', project_id: '1', status: 'planning' },
    { id: '3', name: 'Sprint 3', project_id: '2', status: 'active' }
  ]);
  
  const [workItems] = useState([
    { id: '1', title: 'Implement login form', status: 'Todo', item_type: 'story', priority: 'high' },
    { id: '2', title: 'Add user validation', status: 'In Progress', item_type: 'task', priority: 'medium' },
    { id: '3', title: 'Setup authentication', status: 'Done', item_type: 'feature', priority: 'high' }
  ]);
  
  const [columns] = useState([
    { 
      id: '1', 
      name: 'Todo', 
      color: '#6b7280', 
      position: 0, 
      sprint_id: '1',
      column_type: 'start' as const,
      created_at: new Date().toISOString()
    },
    { 
      id: '2', 
      name: 'In Progress', 
      color: '#f59e0b', 
      position: 1, 
      wip_limit: 3,
      sprint_id: '1',
      column_type: 'standard' as const,
      created_at: new Date().toISOString()
    },
    { 
      id: '3', 
      name: 'Review', 
      color: '#8b5cf6', 
      position: 2,
      sprint_id: '1',
      column_type: 'standard' as const,
      created_at: new Date().toISOString()
    },
    { 
      id: '4', 
      name: 'Done', 
      color: '#10b981', 
      position: 3,
      sprint_id: '1',
      column_type: 'end' as const,
      created_at: new Date().toISOString()
    }
  ]);

  // Initial data loading
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsInitializing(true);
        // Simulate minimum loading time to prevent flash
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        console.error('Failed to initialize sprint board:', error);
        toast.error('Failed to load teams');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeData();
  }, []);

  // Filter data based on selections
  const filteredProjects = useMemo(() => 
    projects.filter(project => selectedTeam ? project.team_id === selectedTeam : true),
    [projects, selectedTeam]
  );

  const filteredSprints = useMemo(() =>
    sprints.filter(sprint => selectedProject ? sprint.project_id === selectedProject : true),
    [sprints, selectedProject]
  );

  // Group work items by column
  const workItemsByColumn = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    columns.forEach(column => {
      grouped[column.name] = workItems.filter(item => item.status === column.name);
    });
    return grouped;
  }, [workItems, columns]);

  // Drag and drop handlers
  const handleDragStart = (item: any) => {
    setDraggedItem(item);
  };

  const handleDrop = async (newStatus: string) => {
    if (!draggedItem) return;
    
    console.log('Moving item', draggedItem.id, 'to', newStatus);
    toast.success('Work item moved successfully');
    setDraggedItem(null);
  };

  const handleCreateWorkItem = (status?: string) => {
    setShowCreateWorkItem(true);
  };

  const handleEditWorkItem = (item: any) => {
    // Handle edit work item
    console.log('Edit work item:', item);
  };

  const handleDeleteWorkItem = async (id: string) => {
    console.log('Delete work item:', id);
    toast.success('Work item deleted successfully');
  };

  const handleSelectWorkItem = (id: string, selected: boolean) => {
    setSelectedWorkItems(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(itemId => itemId !== id)
    );
  };

  // Show loading skeleton during initialization
  if (isInitializing) {
    return <SprintBoardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Team" />
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

          <Select value={selectedProject} onValueChange={setSelectedProject} disabled={!selectedTeam}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {filteredProjects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {project.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSprint} onValueChange={setSelectedSprint} disabled={!selectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Sprint" />
            </SelectTrigger>
            <SelectContent>
              {filteredSprints.map(sprint => (
                <SelectItem key={sprint.id} value={sprint.id}>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {sprint.name}
                    <Badge variant="outline" className="ml-2">
                      {sprint.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <Sheet open={showMethodologySetup} onOpenChange={setShowMethodologySetup}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Methodology
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Sprint Board Configuration</SheetTitle>
                <SheetDescription>
                  Choose your methodology and configure your board workflow.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <MethodologyTemplates
                  onSelectTemplate={(template) => {
                    console.log('Selected template:', template);
                    setSelectedMethodology(template.methodology_type as any);
                    setShowMethodologySetup(false);
                    toast.success(`Board configured for ${template.name}`);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Button size="sm" onClick={() => handleCreateWorkItem()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Work Item
          </Button>
        </div>
      </div>

      {/* Methodology Indicator */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-2">
          {selectedMethodology === 'scrum' && <Zap className="w-3 h-3" />}
          {selectedMethodology === 'kanban' && <Kanban className="w-3 h-3" />}
          {selectedMethodology === 'waterfall' && <Layers className="w-3 h-3" />}
          {selectedMethodology === 'hybrid' && <GitBranch className="w-3 h-3" />}
          {selectedMethodology.charAt(0).toUpperCase() + selectedMethodology.slice(1)} Methodology
        </Badge>
        {selectedWorkItems.length > 0 && (
          <Badge variant="secondary">
            {selectedWorkItems.length} items selected
          </Badge>
        )}
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
        <TabsList className="grid w-fit grid-cols-3">
          <TabsTrigger value="board" className="flex items-center gap-2">
            <Kanban className="w-4 h-4" />
            Board
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Planning
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-6">
          {selectedSprint ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {columns.map((column) => (
                <BoardColumn
                  key={column.id}
                  column={column}
                  workItems={workItemsByColumn[column.name] || []}
                  onDrop={handleDrop}
                  onCreateWorkItem={handleCreateWorkItem}
                  onEditWorkItem={handleEditWorkItem}
                  onDeleteWorkItem={handleDeleteWorkItem}
                  onViewWorkItem={handleEditWorkItem}
                  onMoveWorkItem={handleEditWorkItem}
                  onDragStartWorkItem={handleDragStart}
                  selectedWorkItems={selectedWorkItems}
                  onSelectWorkItem={handleSelectWorkItem}
                  isDragOver={draggedItem !== null}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <Kanban className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">Select a Sprint</h3>
                  <p className="text-muted-foreground">
                    Choose a team, project, and sprint to view the board
                  </p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="planning" className="mt-6">
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Sprint Planning</h3>
            <p className="text-muted-foreground">Planning features coming soon</p>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Sprint Analytics</h3>
            <p className="text-muted-foreground">Analytics features coming soon</p>
          </Card>
        </TabsContent>
      </Tabs>

      {showCreateWorkItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 p-6">
            <h3 className="text-lg font-medium mb-4">Create Work Item</h3>
            <p className="text-muted-foreground mb-4">Work item creation dialog coming soon</p>
            <Button onClick={() => setShowCreateWorkItem(false)}>Close</Button>
          </Card>
        </div>
      )}

      {showFilters && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 p-6">
            <h3 className="text-lg font-medium mb-4">Advanced Filters</h3>
            <p className="text-muted-foreground mb-4">Filter options coming soon</p>
            <Button onClick={() => setShowFilters(false)}>Close</Button>
          </Card>
        </div>
      )}
    </div>
  );
};