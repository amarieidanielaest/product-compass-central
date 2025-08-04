import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, Target, Flag, User, Calendar, 
  ChevronDown, ChevronRight, Plus 
} from 'lucide-react';
import { WorkItem, WorkflowColumn } from '@/services/api/SprintService';
import EnhancedWorkItemCard from './EnhancedWorkItemCard';
import { cn } from '@/lib/utils';

interface SwimlaneProps {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: WorkItem[];
  columns: WorkflowColumn[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCreateWorkItem?: (status: string) => void;
  onEditWorkItem?: (item: WorkItem) => void;
  onDeleteWorkItem?: (id: string) => void;
  onViewWorkItem?: (item: WorkItem) => void;
  onMoveWorkItem?: (item: WorkItem) => void;
  onDragStartWorkItem?: (item: WorkItem) => void;
  selectedWorkItems?: string[];
  onSelectWorkItem?: (id: string, selected: boolean) => void;
  dragOverColumn?: string | null;
  onDrop?: (targetStatus: string) => void;
  onDragOver?: (e: React.DragEvent, columnName?: string) => void;
  color?: string;
  subtitle?: string;
}

const Swimlane: React.FC<SwimlaneProps> = ({
  title,
  icon: Icon = Users,
  items,
  columns,
  isCollapsed = false,
  onToggleCollapse,
  onCreateWorkItem,
  onEditWorkItem,
  onDeleteWorkItem,
  onViewWorkItem,
  onMoveWorkItem,
  onDragStartWorkItem,
  selectedWorkItems = [],
  onSelectWorkItem,
  dragOverColumn,
  onDrop,
  onDragOver,
  color = 'hsl(var(--primary))',
  subtitle
}) => {
  // Group items by status/column
  const itemsByColumn = useMemo(() => {
    const grouped: Record<string, WorkItem[]> = {};
    columns.forEach(col => {
      grouped[col.name] = items.filter(item => item.status === col.name);
    });
    return grouped;
  }, [items, columns]);

  const totalItems = items.length;
  const completedItems = items.filter(item => item.status === 'done' || item.status === 'completed').length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const handleDrop = (e: React.DragEvent, columnName: string) => {
    e.preventDefault();
    onDrop?.(columnName);
  };

  const handleDragOver = (e: React.DragEvent, columnName: string) => {
    e.preventDefault();
    onDragOver?.(e, columnName);
  };

  return (
    <Card className="mb-4">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              {isCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
            
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <Icon className="w-4 h-4" />
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              {subtitle && (
                <span className="text-xs text-muted-foreground">({subtitle})</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {totalItems} items
            </Badge>
            {totalItems > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {columns.map((column) => {
              const columnItems = itemsByColumn[column.name] || [];
              const isDragOver = dragOverColumn === column.name;
              
              return (
                <div 
                  key={column.id}
                  className={cn(
                    "min-h-[200px] p-3 rounded-lg border-2 border-dashed transition-all",
                    isDragOver 
                      ? "border-primary bg-primary/5" 
                      : "border-muted hover:border-muted-foreground/50"
                  )}
                  onDrop={(e) => handleDrop(e, column.name)}
                  onDragOver={(e) => handleDragOver(e, column.name)}
                >
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <span className="text-sm font-medium text-muted-foreground">
                        {column.name}
                      </span>
                      <Badge variant="outline" className="text-xs h-5">
                        {columnItems.length}
                      </Badge>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      onClick={() => onCreateWorkItem?.(column.name)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {columnItems.map((item) => (
                      <EnhancedWorkItemCard
                        key={item.id}
                        item={item}
                        onEdit={onEditWorkItem}
                        onDelete={onDeleteWorkItem}
                        onView={onViewWorkItem}
                        onMove={onMoveWorkItem}
                        onDragStart={onDragStartWorkItem}
                        isSelected={selectedWorkItems.includes(item.id)}
                        onSelect={onSelectWorkItem}
                        isCompact={true}
                      />
                    ))}
                    
                    {columnItems.length === 0 && !isDragOver && (
                      <div className="text-center text-muted-foreground text-xs py-4">
                        No items
                      </div>
                    )}
                    
                    {isDragOver && (
                      <div className="border-2 border-dashed border-primary rounded-lg p-4 text-center text-primary">
                        <p className="text-xs">Drop item here</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

interface SmartSwimlanesProps {
  workItems: WorkItem[];
  columns: WorkflowColumn[];
  groupBy: 'assignee' | 'priority' | 'epic' | 'item_type';
  onCreateWorkItem?: (status: string) => void;
  onEditWorkItem?: (item: WorkItem) => void;
  onDeleteWorkItem?: (id: string) => void;
  onViewWorkItem?: (item: WorkItem) => void;
  onMoveWorkItem?: (item: WorkItem) => void;
  onDragStartWorkItem?: (item: WorkItem) => void;
  selectedWorkItems?: string[];
  onSelectWorkItem?: (id: string, selected: boolean) => void;
  dragOverColumn?: string | null;
  onDrop?: (targetStatus: string) => void;
  onDragOver?: (e: React.DragEvent, columnName?: string) => void;
}

const SmartSwimlanes: React.FC<SmartSwimlanesProps> = ({
  workItems,
  columns,
  groupBy,
  onCreateWorkItem,
  onEditWorkItem,
  onDeleteWorkItem,
  onViewWorkItem,
  onMoveWorkItem,
  onDragStartWorkItem,
  selectedWorkItems = [],
  onSelectWorkItem,
  dragOverColumn,
  onDrop,
  onDragOver
}) => {
  const [collapsedSwimlanes, setCollapsedSwimlanes] = React.useState<Set<string>>(new Set());

  // Group work items by selected criteria
  const groupedItems = useMemo(() => {
    const grouped: Record<string, { items: WorkItem[]; metadata?: any }> = {};
    
    workItems.forEach(item => {
      let groupKey = '';
      let metadata: any = {};
      
      switch (groupBy) {
        case 'assignee':
          if (item.assignee) {
            groupKey = `${item.assignee.first_name} ${item.assignee.last_name}`;
            metadata = item.assignee;
          } else {
            groupKey = 'Unassigned';
            metadata = { avatar_url: null, first_name: 'Unassigned' };
          }
          break;
        case 'priority':
          groupKey = item.priority;
          metadata = { priority: item.priority };
          break;
        case 'epic':
          groupKey = item.parent?.title || 'No Epic';
          metadata = item.parent;
          break;
        case 'item_type':
          groupKey = item.item_type;
          metadata = { item_type: item.item_type };
          break;
        default:
          groupKey = 'All Items';
      }
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = { items: [], metadata };
      }
      grouped[groupKey].items.push(item);
    });
    
    return grouped;
  }, [workItems, groupBy]);

  const getGroupIcon = (key: string, metadata: any) => {
    switch (groupBy) {
      case 'assignee':
        return User;
      case 'priority':
        return Flag;
      case 'epic':
        return Target;
      case 'item_type':
        return Target;
      default:
        return Users;
    }
  };

  const getGroupColor = (key: string, metadata: any) => {
    switch (groupBy) {
      case 'priority':
        switch (metadata.priority) {
          case 'critical': return '#ef4444';
          case 'high': return '#f97316';
          case 'medium': return '#eab308';
          case 'low': return '#22c55e';
          default: return 'hsl(var(--primary))';
        }
      case 'item_type':
        switch (metadata.item_type) {
          case 'epic': return '#8b5cf6';
          case 'story': return '#3b82f6';
          case 'task': return '#10b981';
          case 'bug': return '#ef4444';
          case 'feature': return '#f59e0b';
          default: return 'hsl(var(--primary))';
        }
      default:
        return 'hsl(var(--primary))';
    }
  };

  const getGroupSubtitle = (key: string, metadata: any, items: WorkItem[]) => {
    const completed = items.filter(item => item.status === 'done' || item.status === 'completed').length;
    return `${completed}/${items.length} completed`;
  };

  const renderGroupHeader = (key: string, metadata: any) => {
    if (groupBy === 'assignee' && metadata.avatar_url) {
      return (
        <div className="flex items-center gap-2">
          <Avatar className="w-5 h-5">
            <AvatarImage src={metadata.avatar_url} />
            <AvatarFallback className="text-xs">
              {metadata.first_name?.[0]}{metadata.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <span>{key}</span>
        </div>
      );
    }
    return key;
  };

  const toggleSwimlane = (key: string) => {
    const newCollapsed = new Set(collapsedSwimlanes);
    if (newCollapsed.has(key)) {
      newCollapsed.delete(key);
    } else {
      newCollapsed.add(key);
    }
    setCollapsedSwimlanes(newCollapsed);
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedItems)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([groupKey, { items, metadata }]) => (
          <Swimlane
            key={groupKey}
            title={renderGroupHeader(groupKey, metadata) as string}
            icon={getGroupIcon(groupKey, metadata)}
            items={items}
            columns={columns}
            isCollapsed={collapsedSwimlanes.has(groupKey)}
            onToggleCollapse={() => toggleSwimlane(groupKey)}
            onCreateWorkItem={onCreateWorkItem}
            onEditWorkItem={onEditWorkItem}
            onDeleteWorkItem={onDeleteWorkItem}
            onViewWorkItem={onViewWorkItem}
            onMoveWorkItem={onMoveWorkItem}
            onDragStartWorkItem={onDragStartWorkItem}
            selectedWorkItems={selectedWorkItems}
            onSelectWorkItem={onSelectWorkItem}
            dragOverColumn={dragOverColumn}
            onDrop={onDrop}
            onDragOver={onDragOver}
            color={getGroupColor(groupKey, metadata)}
            subtitle={getGroupSubtitle(groupKey, metadata, items)}
          />
        ))}
      
      {Object.keys(groupedItems).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No work items found</p>
        </div>
      )}
    </div>
  );
};

export default SmartSwimlanes;