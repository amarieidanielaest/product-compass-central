import React, { useState, useCallback, useEffect } from 'react';
import { Calendar, Users, Target, Clock, Plus, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sprint, WorkItem, sprintService } from '@/services/api/SprintService';
import { cn } from '@/lib/utils';

interface SprintPlanningProps {
  sprint: Sprint | null;
  workItems: WorkItem[];
  availableWorkItems: WorkItem[]; // Backlog items
  onUpdateSprint: (sprintData: Partial<Sprint>) => void;
  onUpdateWorkItem: (id: string, updates: Partial<WorkItem>) => void;
  onCreateWorkItem: (workItem: Partial<WorkItem>) => void;
  teamVelocity: number;
  teamCapacity: number;
  onRefresh?: () => void;
}

interface SprintMetrics {
  committedPoints: number;
  completedPoints: number;
  totalItems: number;
  completedItems: number;
  velocityTrend: number;
  burndownData: Array<{ day: string; planned: number; actual: number }>;
}

const SprintPlanning: React.FC<SprintPlanningProps> = ({
  sprint,
  workItems,
  availableWorkItems,
  onUpdateSprint,
  onUpdateWorkItem,
  onCreateWorkItem,
  teamVelocity,
  teamCapacity,
  onRefresh
}) => {
  const { toast } = useToast();
  const [showBacklog, setShowBacklog] = useState(false);
  const [showSprintGoalDialog, setShowSprintGoalDialog] = useState(false);
  const [sprintGoal, setSprintGoal] = useState(sprint?.goal || '');
  const [draggedItem, setDraggedItem] = useState<WorkItem | null>(null);
  const [metrics, setMetrics] = useState<SprintMetrics | null>(null);

  // Calculate sprint metrics
  const sprintMetrics = React.useMemo((): SprintMetrics => {
    const committedPoints = workItems.reduce((sum, item) => sum + (item.effort_estimate || 0), 0);
    const completedPoints = workItems
      .filter(item => item.status === 'done' || item.status === 'completed')
      .reduce((sum, item) => sum + (item.effort_estimate || 0), 0);
    
    const completedItems = workItems.filter(item => 
      item.status === 'done' || item.status === 'completed'
    ).length;

    // Calculate velocity trend (simplified)
    const velocityTrend = teamVelocity > 0 ? (committedPoints / teamVelocity) * 100 : 0;

    // Generate mock burndown data
    const burndownData = [];
    if (sprint?.start_date && sprint?.end_date) {
      const startDate = new Date(sprint.start_date);
      const endDate = new Date(sprint.end_date);
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i <= totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const planned = Math.max(0, committedPoints - (committedPoints / totalDays) * i);
        const actual = i === totalDays ? completedPoints : planned - Math.random() * 2;
        
        burndownData.push({
          day: `Day ${i + 1}`,
          planned: Math.round(planned),
          actual: Math.round(Math.max(0, actual))
        });
      }
    }

    return {
      committedPoints,
      completedPoints,
      totalItems: workItems.length,
      completedItems,
      velocityTrend,
      burndownData
    };
  }, [workItems, teamVelocity, sprint]);

  const commitmentStatus = React.useMemo(() => {
    const ratio = sprintMetrics.committedPoints / teamCapacity;
    if (ratio > 1.2) return { status: 'over', color: 'text-red-600', message: 'Over-committed' };
    if (ratio > 1.0) return { status: 'warning', color: 'text-amber-600', message: 'At capacity' };
    if (ratio > 0.8) return { status: 'good', color: 'text-green-600', message: 'Well planned' };
    return { status: 'under', color: 'text-blue-600', message: 'Under-committed' };
  }, [sprintMetrics.committedPoints, teamCapacity]);

  // Drag and drop handlers
  const handleDragStart = useCallback((item: WorkItem) => {
    setDraggedItem(item);
  }, []);

  const handleDrop = useCallback(async (targetType: 'sprint' | 'backlog') => {
    if (!draggedItem) return;

    try {
      if (targetType === 'sprint' && !draggedItem.sprint_id) {
        // Move from backlog to sprint
        await onUpdateWorkItem(draggedItem.id, { sprint_id: sprint?.id });
        toast({
          title: "Item added to sprint",
          description: `${draggedItem.title} has been added to the sprint`,
        });
      } else if (targetType === 'backlog' && draggedItem.sprint_id) {
        // Move from sprint to backlog
        await onUpdateWorkItem(draggedItem.id, { sprint_id: null });
        toast({
          title: "Item moved to backlog",
          description: `${draggedItem.title} has been moved back to the backlog`,
        });
      }
    } catch (error) {
      toast({
        title: "Error moving item",
        description: "Failed to move the work item",
        variant: "destructive",
      });
    } finally {
      setDraggedItem(null);
    }
  }, [draggedItem, sprint, onUpdateWorkItem, toast]);

  const handleUpdateSprintGoal = useCallback(async () => {
    if (!sprint) return;

    try {
      await onUpdateSprint({ goal: sprintGoal });
      setShowSprintGoalDialog(false);
      toast({
        title: "Sprint goal updated",
        description: "The sprint goal has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error updating goal",
        description: "Failed to update sprint goal",
        variant: "destructive",
      });
    }
  }, [sprint, sprintGoal, onUpdateSprint, toast]);

  const handleQuickEstimate = useCallback(async (itemId: string, estimate: number) => {
    try {
      await onUpdateWorkItem(itemId, { effort_estimate: estimate });
      toast({
        title: "Estimate updated",
        description: `Effort estimate set to ${estimate} points`,
      });
    } catch (error) {
      toast({
        title: "Error updating estimate",
        description: "Failed to update effort estimate",
        variant: "destructive",
      });
    }
  }, [onUpdateWorkItem, toast]);

  if (!sprint) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No sprint selected for planning</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sprint Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                {sprint.name}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {sprintMetrics.totalItems} items
                </span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  {sprintMetrics.committedPoints} points
                </span>
              </div>
            </div>
            <Dialog open={showSprintGoalDialog} onOpenChange={setShowSprintGoalDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  {sprint.goal ? 'Edit Goal' : 'Set Goal'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sprint Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal">What do you want to achieve this sprint?</Label>
                    <Textarea
                      id="goal"
                      value={sprintGoal}
                      onChange={(e) => setSprintGoal(e.target.value)}
                      placeholder="Enter the sprint goal..."
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowSprintGoalDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateSprintGoal}>
                      Save Goal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Sprint Goal */}
          {sprint.goal && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-1">Sprint Goal</h4>
              <p className="text-sm text-muted-foreground">{sprint.goal}</p>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Commitment</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{sprintMetrics.committedPoints}</span>
                  <Badge variant={commitmentStatus.status === 'good' ? 'default' : 'secondary'} className={commitmentStatus.color}>
                    {commitmentStatus.message}
                  </Badge>
                </div>
                <Progress 
                  value={(sprintMetrics.committedPoints / teamCapacity) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {sprintMetrics.committedPoints} / {teamCapacity} capacity
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Progress</span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-bold">{Math.round((sprintMetrics.completedPoints / sprintMetrics.committedPoints) * 100)}%</span>
                <Progress 
                  value={(sprintMetrics.completedPoints / sprintMetrics.committedPoints) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {sprintMetrics.completedPoints} / {sprintMetrics.committedPoints} points
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-bold">{sprintMetrics.completedItems}</span>
                <Progress 
                  value={(sprintMetrics.completedItems / sprintMetrics.totalItems) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {sprintMetrics.completedItems} / {sprintMetrics.totalItems} items
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Velocity</span>
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-bold">{teamVelocity}</span>
                <div className={cn("text-xs", sprintMetrics.velocityTrend > 100 ? "text-amber-600" : "text-green-600")}>
                  {sprintMetrics.velocityTrend > 100 ? '↗' : '↘'} {Math.abs(100 - sprintMetrics.velocityTrend).toFixed(0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  vs. last sprint
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planning Tabs */}
      <Tabs defaultValue="backlog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backlog">Backlog Planning</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
          <TabsTrigger value="estimation">Estimation Session</TabsTrigger>
        </TabsList>

        <TabsContent value="backlog" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sprint Commitment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sprint Commitment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    className="p-3 border rounded-lg cursor-move hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.item_type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.effort_estimate || 0} pts
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickEstimate(item.id, (item.effort_estimate || 0) + 1)}
                        className="h-6 w-6 p-0"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
                
                {workItems.length === 0 && (
                  <div 
                    className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop('sprint')}
                  >
                    <p className="text-muted-foreground">Drag items here to add to sprint</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Backlog */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Product Backlog</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {availableWorkItems.slice(0, 20).map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    className="p-3 border rounded-lg cursor-move hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.item_type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {item.effort_estimate || 0} pts
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDrop('sprint')}
                        className="text-xs"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="capacity">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Sprint Duration</Label>
                    <div className="text-2xl font-bold">
                      {Math.ceil((new Date(sprint.end_date).getTime() - new Date(sprint.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Team Velocity</Label>
                    <div className="text-2xl font-bold">{teamVelocity} pts/sprint</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Available Capacity</Label>
                    <div className="text-2xl font-bold">{teamCapacity} pts</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estimation">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Story Point Poker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Story point estimation session coming soon...</p>
                <p className="text-sm mt-2">Real-time collaborative estimation with your team</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SprintPlanning;