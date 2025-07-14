import React, { useState } from 'react';
import { MoreHorizontal, Plus, Settings, Trash2, Edit, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { WorkItem, WorkflowColumn } from '@/services/api/SprintService';
import WorkItemCard from './WorkItemCard';

interface BoardColumnProps {
  column: WorkflowColumn;
  workItems: WorkItem[];
  onDrop?: (status: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onCreateWorkItem?: (status: string) => void;
  onEditColumn?: (column: WorkflowColumn) => void;
  onDeleteColumn?: (columnId: string) => void;
  onEditWorkItem?: (item: WorkItem) => void;
  onDeleteWorkItem?: (id: string) => void;
  onViewWorkItem?: (item: WorkItem) => void;
  onMoveWorkItem?: (item: WorkItem) => void;
  onDragStartWorkItem?: (item: WorkItem) => void;
  selectedWorkItems?: string[];
  onSelectWorkItem?: (id: string, selected: boolean) => void;
  isDragOver?: boolean;
}

const BoardColumn: React.FC<BoardColumnProps> = ({
  column,
  workItems,
  onDrop,
  onDragOver,
  onCreateWorkItem,
  onEditColumn,
  onDeleteColumn,
  onEditWorkItem,
  onDeleteWorkItem,
  onViewWorkItem,
  onMoveWorkItem,
  onDragStartWorkItem,
  selectedWorkItems = [],
  onSelectWorkItem,
  isDragOver
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop?.(column.name);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver?.(e);
  };

  const isWipLimitExceeded = column.wip_limit && workItems.length > column.wip_limit;
  const isNearWipLimit = column.wip_limit && workItems.length >= column.wip_limit * 0.8;

  return (
    <TooltipProvider>
      <Card 
        className={`
          flex flex-col min-h-[600px] w-80 transition-all duration-200
          ${isDragOver ? 'ring-2 ring-primary bg-primary/5' : ''}
          ${isHovered ? 'shadow-lg' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <h3 className="font-medium text-sm">{column.name}</h3>
              <Badge variant="outline" className="text-xs">
                {workItems.length}
              </Badge>
              
              {/* WIP Limit indicators */}
              {column.wip_limit && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className={`flex items-center gap-1 text-xs ${
                      isWipLimitExceeded ? 'text-red-600' : 
                      isNearWipLimit ? 'text-amber-600' : 'text-muted-foreground'
                    }`}>
                      {isWipLimitExceeded && <AlertCircle className="w-3 h-3" />}
                      <span>/{column.wip_limit}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      WIP Limit: {workItems.length}/{column.wip_limit}
                      {isWipLimitExceeded && ' (Exceeded!)'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onCreateWorkItem?.(column.name)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Work Item
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditColumn?.(column)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Column
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDeleteColumn?.(column.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-3 pt-0">
          <div className="space-y-3">
            {/* Work items */}
            {workItems.map((item) => (
              <WorkItemCard
                key={item.id}
                item={item}
                onEdit={onEditWorkItem}
                onDelete={onDeleteWorkItem}
                onView={onViewWorkItem}
                onMove={onMoveWorkItem}
                onDragStart={onDragStartWorkItem}
                isSelected={selectedWorkItems.includes(item.id)}
                onSelect={onSelectWorkItem}
              />
            ))}

            {/* Empty state */}
            {workItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6" />
                </div>
                <p className="text-sm">No items in {column.name}</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs"
                  onClick={() => onCreateWorkItem?.(column.name)}
                >
                  Add first item
                </Button>
              </div>
            )}

            {/* Drop zone indicator */}
            {isDragOver && (
              <div className="border-2 border-dashed border-primary rounded-lg p-4 text-center text-primary">
                <p className="text-sm">Drop item here</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default BoardColumn;