import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Settings, Filter } from 'lucide-react';

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="h-96">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

interface Team {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  teamId: string;
}

interface WorkItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee?: string;
}

export const AdaptableSprintBoard: React.FC = () => {
  // Initialize with loading state
  const [isLoading, setIsLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load mock data
      const mockTeams: Team[] = [
        { id: '1', name: 'Frontend Team' },
        { id: '2', name: 'Backend Team' },
        { id: '3', name: 'DevOps Team' }
      ];
      
      const mockProjects: Project[] = [
        { id: '1', name: 'User Dashboard', teamId: '1' },
        { id: '2', name: 'API Gateway', teamId: '2' },
        { id: '3', name: 'Infrastructure', teamId: '3' }
      ];
      
      const mockWorkItems: WorkItem[] = [
        { id: '1', title: 'Implement login form', status: 'todo', priority: 'high' },
        { id: '2', title: 'Add user validation', status: 'in-progress', priority: 'medium' },
        { id: '3', title: 'Setup authentication', status: 'done', priority: 'high' }
      ];
      
      setTeams(mockTeams);
      setProjects(mockProjects);
      setWorkItems(mockWorkItems);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const filteredProjects = projects.filter(project => 
    selectedTeam ? project.teamId === selectedTeam : true
  );

  const getItemsByStatus = (status: string) => 
    workItems.filter(item => item.status === status);

  const columns = [
    { id: 'todo', title: 'To Do', items: getItemsByStatus('todo') },
    { id: 'in-progress', title: 'In Progress', items: getItemsByStatus('in-progress') },
    { id: 'review', title: 'Review', items: getItemsByStatus('review') },
    { id: 'done', title: 'Done', items: getItemsByStatus('done') }
  ];

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <LoadingSkeleton />;
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
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent>
              {filteredProjects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Sprint Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {columns.map(column => (
          <Card key={column.id} className="h-fit min-h-96">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm font-medium">
                {column.title}
                <Badge variant="secondary" className="text-xs">
                  {column.items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {column.items.map(item => (
                <Card key={item.id} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium leading-tight">{item.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={item.priority === 'high' ? 'destructive' : 
                               item.priority === 'medium' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {item.priority}
                      </Badge>
                      {item.assignee && (
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {item.assignee.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {column.items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No items in {column.title.toLowerCase()}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};