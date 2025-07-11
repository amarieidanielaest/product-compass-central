import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, X, Trash2 } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EditRoadmapItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any;
  onItemUpdated: (item: any) => void;
  onItemDeleted: (itemId: string) => void;
}

const EditRoadmapItemDialog = ({ 
  open, 
  onOpenChange, 
  item,
  onItemUpdated,
  onItemDeleted
}: EditRoadmapItemDialogProps) => {
  const [formData, setFormData] = useState({
    type: 'delivery',
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'planned',
    assignee: '',
    team: '',
    release: '',
    effort: '',
    businessValue: 'medium',
    theme: '',
    timeframe: '',
    linkedOKRs: [] as string[],
    tags: [] as string[],
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    dependencies: [] as string[],
    progress: 0
  });

  const [newOKR, setNewOKR] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newDependency, setNewDependency] = useState('');

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        type: item.type || (item.theme ? 'strategic' : 'delivery'),
        title: item.title || '',
        description: item.description || '',
        category: item.category || '',
        priority: item.priority || 'medium',
        status: item.status || 'planned',
        assignee: item.assignee || '',
        team: item.team || '',
        release: item.release || '',
        effort: item.effort || '',
        businessValue: item.businessValue || 'medium',
        theme: item.theme || '',
        timeframe: item.timeframe || '',
        linkedOKRs: item.linkedOKRs || [],
        tags: item.tags || [],
        startDate: item.startDate ? new Date(item.startDate) : undefined,
        endDate: item.endDate ? new Date(item.endDate) : undefined,
        dependencies: item.dependencies || [],
        progress: item.progress || 0
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedItem = {
      ...item,
      ...formData,
      updatedAt: new Date().toISOString()
    };

    onItemUpdated(updatedItem);
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this item?')) {
      onItemDeleted(item.id);
      onOpenChange(false);
    }
  };

  const addListItem = (field: 'linkedOKRs' | 'tags' | 'dependencies', value: string, setValue: (val: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setValue('');
    }
  };

  const removeListItem = (field: 'linkedOKRs' | 'tags' | 'dependencies', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (!item) return null;

  const isStrategic = formData.type === 'strategic';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit {isStrategic ? 'Strategic Initiative' : 'Delivery Item'}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder={isStrategic ? "Strategic initiative name" : "Feature or epic name"}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={isStrategic ? "Strategic initiative objectives and scope" : "Feature description and requirements"}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="on-track">On Track</SelectItem>
                  <SelectItem value="needs-attention">Needs Attention</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {isStrategic ? (
            <>
              {/* Strategic Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Input
                    id="theme"
                    value={formData.theme}
                    onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                    placeholder="e.g., Growth, Experience, Platform"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Input
                    id="timeframe"
                    value={formData.timeframe}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value }))}
                    placeholder="e.g., Q3-Q4 2024"
                  />
                </div>
              </div>

              {/* Linked OKRs */}
              <div className="space-y-2">
                <Label>Linked OKRs</Label>
                <div className="flex gap-2">
                  <Input
                    value={newOKR}
                    onChange={(e) => setNewOKR(e.target.value)}
                    placeholder="Add OKR"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addListItem('linkedOKRs', newOKR, setNewOKR);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addListItem('linkedOKRs', newOKR, setNewOKR)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.linkedOKRs.map((okr, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-50">
                      {okr}
                      <button
                        type="button"
                        onClick={() => removeListItem('linkedOKRs', index)}
                        className="ml-2 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Delivery Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature">Feature</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="improvement">Improvement</SelectItem>
                      <SelectItem value="bug-fix">Bug Fix</SelectItem>
                      <SelectItem value="technical-debt">Technical Debt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessValue">Business Value</Label>
                  <Select value={formData.businessValue} onValueChange={(value) => setFormData(prev => ({ ...prev, businessValue: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Input
                    id="assignee"
                    value={formData.assignee}
                    onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
                    placeholder="Team member"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team">Team</Label>
                  <Select value={formData.team} onValueChange={(value) => setFormData(prev => ({ ...prev, team: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frontend">Frontend</SelectItem>
                      <SelectItem value="Backend">Backend</SelectItem>
                      <SelectItem value="Platform">Platform</SelectItem>
                      <SelectItem value="AI/ML">AI/ML</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effort">Effort</Label>
                  <Input
                    id="effort"
                    value={formData.effort}
                    onChange={(e) => setFormData(prev => ({ ...prev, effort: e.target.value }))}
                    placeholder="e.g., 5 story points"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="release">Release</Label>
                <Input
                  id="release"
                  value={formData.release}
                  onChange={(e) => setFormData(prev => ({ ...prev, release: e.target.value }))}
                  placeholder="e.g., Q3 2024"
                />
              </div>
            </>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addListItem('tags', newTag, setNewTag);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addListItem('tags', newTag, setNewTag)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeListItem('tags', index)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Dependencies */}
          <div className="space-y-2">
            <Label>Dependencies</Label>
            <div className="flex gap-2">
              <Input
                value={newDependency}
                onChange={(e) => setNewDependency(e.target.value)}
                placeholder="Add dependency"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addListItem('dependencies', newDependency, setNewDependency);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addListItem('dependencies', newDependency, setNewDependency)}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.dependencies.map((dep, index) => (
                <Badge key={index} variant="outline" className="bg-orange-50">
                  {dep}
                  <button
                    type="button"
                    onClick={() => removeListItem('dependencies', index)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update {isStrategic ? 'Initiative' : 'Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoadmapItemDialog;