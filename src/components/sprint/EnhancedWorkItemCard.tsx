import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Target, CheckCircle, AlertTriangle, Zap, 
  Clock, User, Flag, MoreHorizontal, Edit, Trash2, Eye,
  Link, Move, ExternalLink, Calendar, Hash, ChevronDown,
  GitBranch, Timer, ThumbsUp, MessageCircle, Paperclip
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { WorkItem } from '@/services/api/SprintService';
import { cn } from '@/lib/utils';

interface EnhancedWorkItemCardProps {
  item: WorkItem;
  onEdit?: (item: WorkItem) => void;
  onDelete?: (id: string) => void;
  onView?: (item: WorkItem) => void;
  onMove?: (item: WorkItem) => void;
  onDragStart?: (item: WorkItem) => void;
  isDragging?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  showChildren?: boolean;
  onToggleChildren?: (id: string) => void;
  isCompact?: boolean;
  agingDays?: number;
}

const EnhancedWorkItemCard: React.FC<EnhancedWorkItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onView,
  onMove,
  onDragStart,
  isDragging,
  isSelected,
  onSelect,
  showChildren = false,
  onToggleChildren,
  isCompact = false,
  agingDays = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragHovered, setIsDragHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Progress calculation for subtasks
  const subtaskProgress = item.subtasks && item.subtasks.length > 0 
    ? (item.subtasks.filter(sub => sub.status === 'done').length / item.subtasks.length) * 100 
    : 0;

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
      case 'epic': return 'hsl(var(--primary))';
      case 'story': return 'hsl(220 70% 50%)';
      case 'task': return 'hsl(142 70% 45%)';
      case 'bug': return 'hsl(0 70% 50%)';
      case 'feature': return 'hsl(25 70% 50%)';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getAgingColor = (days: number) => {
    if (days > 14) return 'border-l-red-500';
    if (days > 7) return 'border-l-amber-500';
    if (days > 3) return 'border-l-yellow-500';
    return '';
  };

  const ItemTypeIcon = getItemTypeIcon(item.item_type);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    setIsDragHovered(true);
    onDragStart?.(item);
  };

  const handleDragEnd = () => {
    setIsDragHovered(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      onSelect?.(item.id, !isSelected);
      e.preventDefault();
    } else {
      onView?.(item);
    }
  };

  const handleQuickAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action) {
      case 'edit':
        onEdit?.(item);
        break;
      case 'move':
        onMove?.(item);
        break;
      case 'view':
        onView?.(item);
        break;
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSelected || !cardRef.current) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          onView?.(item);
          break;
        case 'e':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onEdit?.(item);
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (e.shiftKey) {
            e.preventDefault();
            onDelete?.(item.id);
          }
          break;
      }
    };

    if (isSelected) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSelected, item, onView, onEdit, onDelete]);

  const cardClasses = cn(
    "group cursor-pointer transition-all duration-200 border-l-4",
    "hover:shadow-lg hover:scale-[1.02] hover:z-10",
    {
      "opacity-60 rotate-1 scale-95 shadow-2xl z-20": isDragging || isDragHovered,
      "ring-2 ring-primary bg-primary/5 border-l-primary": isSelected,
      "border-l-transparent": !isSelected,
      "shadow-md": isHovered,
      "h-24": isCompact,
      "animate-pulse": agingDays > 14,
    },
    getAgingColor(agingDays)
  );

  const typeColor = getItemTypeColor(item.item_type);

  return (
    <TooltipProvider>
      <Card 
        ref={cardRef}
        className={cardClasses}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
        tabIndex={0}
        role="button"
        aria-label={`Work item: ${item.title}`}
      >
        <CardContent className={cn("space-y-3", isCompact ? "p-2" : "p-3")}>
          {/* Header with type, priority, and actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: typeColor }}
                />
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-1.5 py-0.5 border-none"
                  style={{ backgroundColor: `${typeColor}15`, color: typeColor }}
                >
                  <ItemTypeIcon className="w-2.5 h-2.5 mr-0.5" />
                  {item.item_type.toUpperCase()}
                </Badge>
              </div>
              
              {item.priority !== 'medium' && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5", getPriorityColor(item.priority))}>
                      <Flag className="w-2.5 h-2.5 mr-0.5" />
                      {item.priority.charAt(0).toUpperCase()}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="capitalize">{item.priority} priority</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Blocked indicator */}
              {item.status === 'blocked' && (
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Blocked - requires attention</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Epic has children indicator */}
              {item.item_type === 'epic' && item.subtasks && item.subtasks.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleChildren?.(item.id);
                  }}
                >
                  <ChevronDown className={cn("w-3 h-3 transition-transform", showChildren && "rotate-180")} />
                </Button>
              )}
            </div>

            {/* Quick actions on hover */}
            <div className={cn(
              "flex items-center gap-1 transition-opacity",
              isHovered ? "opacity-100" : "opacity-0"
            )}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={(e) => handleQuickAction('edit', e)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Edit (Ctrl+E)</p></TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
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
                    <DropdownMenuItem>
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
          </div>

          {!isCompact && (
            <>
              {/* Title with smart truncation */}
              <div className="space-y-1">
                <h4 className="font-medium text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                
                {/* Description preview */}
                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Progress bar for subtasks */}
              {item.subtasks && item.subtasks.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(subtaskProgress)}%</span>
                  </div>
                  <Progress value={subtaskProgress} className="h-1.5" />
                </div>
              )}

              {/* Tags with better design */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-muted/50">
                      <Hash className="w-2 h-2 mr-0.5" />
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 2 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-muted/50">
                      +{item.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </>
          )}

          {/* Footer with enhanced metadata */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {/* Effort estimate with better styling */}
              {item.effort_estimate > 0 && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 bg-background">
                      <Timer className="w-2.5 h-2.5 mr-0.5" />
                      {item.effort_estimate} {item.effort_unit}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Effort estimate</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Due date with urgency indication */}
              {item.due_date && (
                <Tooltip>
                  <TooltipTrigger>
                    <div className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]",
                      new Date(item.due_date) < new Date() 
                        ? 'text-red-600 bg-red-50' 
                        : new Date(item.due_date) < new Date(Date.now() + 24 * 60 * 60 * 1000)
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-muted-foreground bg-muted/30'
                    )}>
                      <Clock className="w-2.5 h-2.5" />
                      <span>{format(new Date(item.due_date), 'MMM dd')}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Due: {format(new Date(item.due_date), 'MMM dd, yyyy')}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* Activity indicators */}
              <div className="flex items-center gap-1">
                {item.linked_feedback_ids && item.linked_feedback_ids.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-0.5 text-muted-foreground">
                        <MessageCircle className="w-2.5 h-2.5" />
                        <span className="text-[10px]">{item.linked_feedback_ids.length}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.linked_feedback_ids.length} feedback items</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Git integration placeholder */}
                <Tooltip>
                  <TooltipTrigger>
                    <GitBranch className="w-2.5 h-2.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>2 commits</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Assignee with online status */}
            {item.assignee && (
              <Tooltip>
                <TooltipTrigger>
                  <div className="relative">
                    <Avatar className="w-6 h-6 ring-2 ring-background">
                      <AvatarImage src={item.assignee.avatar_url} />
                      <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary/20 to-primary/40">
                        {item.assignee.first_name?.[0]}{item.assignee.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.assignee.first_name} {item.assignee.last_name}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Dependencies and blockers */}
          {!isCompact && item.dependencies && item.dependencies.length > 0 && (
            <div className="flex items-center gap-1 text-xs p-2 bg-amber-50 rounded border border-amber-200">
              <Link className="w-3 h-3 text-amber-600" />
              <span className="text-amber-700">
                {item.dependencies.length} dependencies
              </span>
            </div>
          )}

          {/* Age indicator */}
          {agingDays > 7 && (
            <div className="text-[10px] text-muted-foreground border-t pt-1">
              Stale for {agingDays} days
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default EnhancedWorkItemCard;