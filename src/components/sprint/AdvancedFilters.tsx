import React, { useState, useCallback, useMemo } from 'react';
import { Search, Filter, X, ChevronDown, Users, Calendar, Flag, Target, Hash, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { WorkItem } from '@/services/api/SprintService';
import { cn } from '@/lib/utils';

interface FilterValue {
  id: string;
  label: string;
  count?: number;
  color?: string;
}

interface FilterGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  values: FilterValue[];
  multiSelect: boolean;
  searchable?: boolean;
}

interface AdvancedFiltersProps {
  workItems: WorkItem[];
  onFiltersChange: (filters: Record<string, string[]>) => void;
  onSearchChange: (search: string) => void;
  currentFilters: Record<string, string[]>;
  currentSearch: string;
  savedViews?: SavedView[];
  onSaveView?: (view: SavedView) => void;
  onLoadView?: (view: SavedView) => void;
  onDeleteView?: (viewId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface SavedView {
  id: string;
  name: string;
  filters: Record<string, string[]>;
  search: string;
  groupBy: string;
  viewType: string;
  isDefault?: boolean;
  createdAt: Date;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  workItems,
  onFiltersChange,
  onSearchChange,
  currentFilters,
  currentSearch,
  savedViews = [],
  onSaveView,
  onLoadView,
  onDeleteView,
  isOpen,
  onToggle
}) => {
  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['status', 'assignee']));

  // Generate filter groups based on work items
  const filterGroups: FilterGroup[] = useMemo(() => {
    const statusCounts = new Map<string, number>();
    const priorityCounts = new Map<string, number>();
    const assigneeCounts = new Map<string, number>();
    const typeCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();

    workItems.forEach(item => {
      // Count statuses
      statusCounts.set(item.status, (statusCounts.get(item.status) || 0) + 1);
      
      // Count priorities
      priorityCounts.set(item.priority, (priorityCounts.get(item.priority) || 0) + 1);
      
      // Count assignees
      const assigneeKey = item.assignee ? `${item.assignee.first_name} ${item.assignee.last_name}` : 'Unassigned';
      assigneeCounts.set(assigneeKey, (assigneeCounts.get(assigneeKey) || 0) + 1);
      
      // Count types
      typeCounts.set(item.item_type, (typeCounts.get(item.item_type) || 0) + 1);
      
      // Count tags
      if (item.tags) {
        item.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });

    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'critical': return '#ef4444';
        case 'high': return '#f97316';
        case 'medium': return '#eab308';
        case 'low': return '#22c55e';
        default: return '#6b7280';
      }
    };

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'epic': return '#8b5cf6';
        case 'story': return '#3b82f6';
        case 'task': return '#10b981';
        case 'bug': return '#ef4444';
        case 'feature': return '#f59e0b';
        default: return '#6b7280';
      }
    };

    return [
      {
        id: 'status',
        label: 'Status',
        icon: Target,
        multiSelect: true,
        values: Array.from(statusCounts.entries()).map(([status, count]) => ({
          id: status,
          label: status.charAt(0).toUpperCase() + status.slice(1),
          count
        }))
      },
      {
        id: 'priority',
        label: 'Priority',
        icon: Flag,
        multiSelect: true,
        values: Array.from(priorityCounts.entries()).map(([priority, count]) => ({
          id: priority,
          label: priority.charAt(0).toUpperCase() + priority.slice(1),
          count,
          color: getPriorityColor(priority)
        }))
      },
      {
        id: 'assignee',
        label: 'Assignee',
        icon: Users,
        multiSelect: true,
        searchable: true,
        values: Array.from(assigneeCounts.entries()).map(([assignee, count]) => ({
          id: assignee,
          label: assignee,
          count
        }))
      },
      {
        id: 'item_type',
        label: 'Type',
        icon: Target,
        multiSelect: true,
        values: Array.from(typeCounts.entries()).map(([type, count]) => ({
          id: type,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          count,
          color: getTypeColor(type)
        }))
      },
      {
        id: 'tags',
        label: 'Tags',
        icon: Hash,
        multiSelect: true,
        searchable: true,
        values: Array.from(tagCounts.entries()).map(([tag, count]) => ({
          id: tag,
          label: tag,
          count
        }))
      }
    ];
  }, [workItems]);

  const activeFilterCount = useMemo(() => {
    return Object.values(currentFilters).reduce((sum, filters) => sum + filters.length, 0);
  }, [currentFilters]);

  const handleFilterChange = useCallback((groupId: string, valueId: string, checked: boolean) => {
    const currentGroupFilters = currentFilters[groupId] || [];
    const newGroupFilters = checked
      ? [...currentGroupFilters, valueId]
      : currentGroupFilters.filter(id => id !== valueId);

    onFiltersChange({
      ...currentFilters,
      [groupId]: newGroupFilters
    });
  }, [currentFilters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({});
    setSearchQuery('');
    onSearchChange('');
  }, [onFiltersChange, onSearchChange]);

  const clearFilterGroup = useCallback((groupId: string) => {
    const newFilters = { ...currentFilters };
    delete newFilters[groupId];
    onFiltersChange(newFilters);
  }, [currentFilters, onFiltersChange]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchQuery);
  }, [searchQuery, onSearchChange]);

  const toggleGroupExpanded = useCallback((groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  }, [expandedGroups]);

  const handleSaveView = useCallback(() => {
    if (!newViewName.trim() || !onSaveView) return;

    const view: SavedView = {
      id: Date.now().toString(),
      name: newViewName.trim(),
      filters: currentFilters,
      search: currentSearch,
      groupBy: 'status', // This would come from parent component
      viewType: 'board', // This would come from parent component
      createdAt: new Date()
    };

    onSaveView(view);
    setNewViewName('');
    setShowSaveDialog(false);
  }, [newViewName, currentFilters, currentSearch, onSaveView]);

  return (
    <Card className={cn("transition-all duration-200", isOpen ? "shadow-lg" : "")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
              <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
            </Button>
          </div>

          {isOpen && (
            <div className="flex items-center gap-2">
              {onSaveView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                  disabled={activeFilterCount === 0 && !currentSearch}
                >
                  Save View
                </Button>
              )}
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground"
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0 space-y-4">
          {/* Smart Search */}
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search titles, descriptions, tags, assignees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => {
                    setSearchQuery('');
                    onSearchChange('');
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            {searchQuery !== currentSearch && (
              <Button type="submit" size="sm" className="w-full">
                Apply Search
              </Button>
            )}
          </form>

          {/* Saved Views */}
          {savedViews.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Saved Views</h4>
              <div className="flex flex-wrap gap-2">
                {savedViews.map((view) => (
                  <div key={view.id} className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLoadView?.(view)}
                      className="text-xs"
                    >
                      {view.name}
                      {view.isDefault && <Badge variant="secondary" className="ml-1 text-xs">Default</Badge>}
                    </Button>
                    {onDeleteView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteView(view.id)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Filter Groups */}
          <div className="space-y-3">
            {filterGroups.map((group) => {
              const isExpanded = expandedGroups.has(group.id);
              const activeFilters = currentFilters[group.id] || [];
              const Icon = group.icon;

              return (
                <Collapsible key={group.id} open={isExpanded} onOpenChange={() => toggleGroupExpanded(group.id)}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{group.label}</span>
                        {activeFilters.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {activeFilters.length}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {activeFilters.length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearFilterGroup(group.id);
                            }}
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                        <ChevronDown className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-180")} />
                      </div>
                    </Button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-2 mt-2 ml-6">
                    {group.values.map((value) => (
                      <div key={value.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${group.id}-${value.id}`}
                            checked={activeFilters.includes(value.id)}
                            onCheckedChange={(checked) => handleFilterChange(group.id, value.id, checked as boolean)}
                          />
                          <div className="flex items-center gap-2">
                            {value.color && (
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: value.color }}
                              />
                            )}
                            <label
                              htmlFor={`${group.id}-${value.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {value.label}
                            </label>
                          </div>
                        </div>
                        {value.count !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {value.count}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>

          {/* Save View Dialog */}
          {showSaveDialog && (
            <div className="space-y-3 p-3 border rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium">Save Current View</h4>
              <Input
                placeholder="Enter view name..."
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveView();
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setNewViewName('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveView}
                  disabled={!newViewName.trim()}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default AdvancedFilters;