import React, { useState } from 'react';
import { 
  MessageSquare, Target, CheckCircle, AlertTriangle, Zap, 
  Clock, User, Flag, MoreHorizontal, Edit, Trash2, Eye,
  Link, Move, ExternalLink, Calendar, Hash
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { WorkItem } from '@/services/api/SprintService';

interface WorkItemCardProps {
  item: WorkItem;
  onEdit?: (item: WorkItem) => void;
  onDelete?: (id: string) => void;
  onView?: (item: WorkItem) => void;
  onMove?: (item: WorkItem) => void;
  onDragStart?: (item: WorkItem) => void;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

const WorkItemCard: React.FC<WorkItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onView,
  onMove,
  onDragStart,
  isDragging,
  isSelected,
  onSelect
}) => {
  const [isHovered, setIsHovered] = useState(false);

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

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'epic': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'story': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'task': return 'text-green-700 bg-green-50 border-green-200';
      case 'bug': return 'text-red-700 bg-red-50 border-red-200';
      case 'feature': return 'text-orange-700 bg-orange-50 border-orange-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const ItemTypeIcon = getItemTypeIcon(item.item_type);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    onDragStart?.(item);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Multi-select with Ctrl/Cmd
      onSelect?.(item.id, !isSelected);
      e.preventDefault();
    } else {
      onView?.(item);
    }
  };

  return (
    <TooltipProvider>
      <Card 
        className={`
          cursor-pointer transition-all duration-200 hover:shadow-md
          ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''}
          ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}
          ${isHovered ? 'shadow-lg' : ''}
        `}
        draggable
        onDragStart={handleDragStart}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        <CardContent className="p-3 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <Badge variant="outline" className={`${getItemTypeColor(item.item_type)} text-xs px-2 py-0.5`}>
                <ItemTypeIcon className="w-3 h-3 mr-1" />
                {item.item_type}
              </Badge>
              
              {item.priority !== 'medium' && (
                <Tooltip>
                  <TooltipTrigger>
                    <Flag className={`w-3 h-3 ${getPriorityColor(item.priority)}`} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="capitalize">{item.priority} priority</p>
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
                <DropdownMenuItem onClick={() => onView?.(item)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(item)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMove?.(item)}>
                  <Move className="w-4 h-4 mr-2" />
                  Move to Sprint
                </DropdownMenuItem>
                {item.roadmap_item_id && (
                  <DropdownMenuItem onClick={() => console.log('Navigate to roadmap')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View in Roadmap
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDelete?.(item.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title */}
          <h4 className="font-medium text-sm line-clamp-2 leading-tight">
            {item.title}
          </h4>

          {/* Description preview */}
          {item.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">
                  <Hash className="w-2 h-2 mr-0.5" />
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {/* Effort estimate */}
              {item.effort_estimate > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      {item.effort_estimate} {item.effort_unit}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Effort estimate</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Due date */}
              {item.due_date && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className={`flex items-center gap-1 ${
                      new Date(item.due_date) < new Date() ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(item.due_date), 'MMM dd')}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Due: {format(new Date(item.due_date), 'MMM dd, yyyy')}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* Assignee */}
            {item.assignee && (
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={item.assignee.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {item.assignee.first_name?.[0]}{item.assignee.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.assignee.first_name} {item.assignee.last_name}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Subtasks indicator */}
          {item.subtasks && item.subtasks.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3" />
              <span>
                {item.subtasks.filter(sub => sub.status === 'done').length}/{item.subtasks.length} subtasks
              </span>
            </div>
          )}

          {/* Dependencies indicator */}
          {item.dependencies && item.dependencies.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Link className="w-3 h-3" />
              <span>{item.dependencies.length} dependencies</span>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default WorkItemCard;