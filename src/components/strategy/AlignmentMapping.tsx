import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { roadmapService, RoadmapItem } from '@/services/api/RoadmapService';
import { sprintService, WorkItem } from '@/services/api/SprintService';
import { GitBranch, Target, TrendingUp, AlertTriangle, Link2 } from 'lucide-react';

interface AlignmentMappingProps {
  sprintId?: string;
  projectId?: string;
}

export const AlignmentMapping: React.FC<AlignmentMappingProps> = ({ 
  sprintId, 
  projectId 
}) => {
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [selectedRoadmapItem, setSelectedRoadmapItem] = useState<string>('');
  const [selectedWorkItems, setSelectedWorkItems] = useState<string[]>([]);
  const [isLinkingDialogOpen, setIsLinkingDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [sprintId, projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roadmapResponse, workItemsResponse] = await Promise.all([
        roadmapService.getRoadmapItems(),
        sprintId ? sprintService.getWorkItems(sprintId) : Promise.resolve({ success: true, data: [] })
      ]);

      if (roadmapResponse.success) {
        setRoadmapItems(roadmapResponse.data);
      }
      if (workItemsResponse.success) {
        setWorkItems(workItemsResponse.data || []);
      }
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load roadmap and work items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (roadmapItemId: string) => {
    const linkedWorkItems = workItems.filter(item => 
      item.roadmap_item_id === roadmapItemId
    );
    
    if (linkedWorkItems.length === 0) return 0;
    
    const completedItems = linkedWorkItems.filter(item => 
      item.status === 'done' || item.status === 'completed'
    );
    
    return Math.round((completedItems.length / linkedWorkItems.length) * 100);
  };

  const handleLinkWorkItems = async () => {
    if (!selectedRoadmapItem || selectedWorkItems.length === 0) return;

    try {
      await Promise.all(
        selectedWorkItems.map(workItemId =>
          sprintService.updateWorkItem(workItemId, {
            roadmap_item_id: selectedRoadmapItem
          })
        )
      );

      toast({
        title: "Success",
        description: `Linked ${selectedWorkItems.length} work items to roadmap initiative`
      });

      setIsLinkingDialogOpen(false);
      setSelectedWorkItems([]);
      setSelectedRoadmapItem('');
      loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to link work items",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Strategic Alignment
          </h3>
          <p className="text-sm text-muted-foreground">
            Connect work items to roadmap initiatives for strategic visibility
          </p>
        </div>
        
        <Dialog open={isLinkingDialogOpen} onOpenChange={setIsLinkingDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Link2 className="h-4 w-4 mr-2" />
              Link Items
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Link Work Items to Roadmap</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Roadmap Initiative</Label>
                <Select value={selectedRoadmapItem} onValueChange={setSelectedRoadmapItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select initiative" />
                  </SelectTrigger>
                  <SelectContent>
                    {roadmapItems.map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Work Items</Label>
                <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-2">
                  {workItems
                    .filter(item => !item.roadmap_item_id)
                    .map(item => (
                      <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedWorkItems.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedWorkItems([...selectedWorkItems, item.id]);
                            } else {
                              setSelectedWorkItems(selectedWorkItems.filter(id => id !== item.id));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{item.title}</span>
                      </label>
                    ))
                  }
                </div>
              </div>
              
              <Button 
                onClick={handleLinkWorkItems}
                disabled={!selectedRoadmapItem || selectedWorkItems.length === 0}
                className="w-full"
              >
                Link Items
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {roadmapItems.map(roadmapItem => {
          const progress = calculateProgress(roadmapItem.id);
          const linkedItems = workItems.filter(item => item.roadmap_item_id === roadmapItem.id);
          
          return (
            <Card key={roadmapItem.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{roadmapItem.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {roadmapItem.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {roadmapItem.status}
                    </Badge>
                    <Badge variant="outline">
                      {roadmapItem.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {linkedItems.length} linked items
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {roadmapItem.effort} effort points
                    </span>
                  </div>
                  
                  {progress < 50 && linkedItems.length > 0 && (
                    <div className="flex items-center gap-1 text-red-500">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs">At Risk</span>
                    </div>
                  )}
                </div>
                
                {linkedItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Linked Work Items</h4>
                    <div className="space-y-1">
                      {linkedItems.slice(0, 3).map(item => (
                        <div key={item.id} className="flex items-center justify-between text-xs bg-muted/50 rounded p-2">
                          <span>{item.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                      {linkedItems.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center py-1">
                          +{linkedItems.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};