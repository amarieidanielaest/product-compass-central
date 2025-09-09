import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EnhancedFeedbackItem } from '@/services/api/BoardService';
import { ChevronUp, MessageSquare, Calendar, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DragDropFeedbackProps {
  feedback: EnhancedFeedbackItem[];
  onReorder: (sourceIndex: number, destinationIndex: number) => void;
  onVote: (feedbackId: string, voteType: 'upvote' | 'downvote') => void;
  onFeedbackClick: (feedback: EnhancedFeedbackItem) => void;
  groupBy?: 'status' | 'priority' | 'category' | 'none';
}

const statusColumns = [
  { id: 'submitted', title: 'New', color: 'bg-gray-50' },
  { id: 'under_review', title: 'Under Review', color: 'bg-yellow-50' },
  { id: 'planned', title: 'Planned', color: 'bg-blue-50' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-orange-50' },
  { id: 'completed', title: 'Completed', color: 'bg-green-50' }
];

const priorityColumns = [
  { id: 'critical', title: 'Critical', color: 'bg-red-50' },
  { id: 'high', title: 'High', color: 'bg-orange-50' },
  { id: 'medium', title: 'Medium', color: 'bg-yellow-50' },
  { id: 'low', title: 'Low', color: 'bg-gray-50' }
];

export const DragDropFeedback: React.FC<DragDropFeedbackProps> = ({
  feedback,
  onReorder,
  onVote,
  onFeedbackClick,
  groupBy = 'status'
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    setDraggedId(null);
    
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex !== destinationIndex) {
      onReorder(sourceIndex, destinationIndex);
    }
  };

  const handleDragStart = (start: any) => {
    setDraggedId(start.draggableId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'default';
      case 'planned': return 'secondary';
      case 'under_review': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const groupFeedback = () => {
    if (groupBy === 'none') {
      return { 'all': feedback };
    }

    const columns = groupBy === 'status' ? statusColumns : priorityColumns;
    const grouped: Record<string, EnhancedFeedbackItem[]> = {};

    columns.forEach(column => {
      grouped[column.id] = feedback.filter(item => 
        groupBy === 'status' ? item.status === column.id : item.priority === column.id
      );
    });

    return grouped;
  };

  const getColumnConfig = () => {
    if (groupBy === 'none') {
      return [{ id: 'all', title: 'All Feedback', color: 'bg-gray-50' }];
    }
    return groupBy === 'status' ? statusColumns : priorityColumns;
  };

  const groupedFeedback = groupFeedback();
  const columns = getColumnConfig();

  if (groupBy === 'none') {
    // Single column layout
    return (
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <Droppable droppableId="feedback-list">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`space-y-4 transition-colors ${
                snapshot.isDraggingOver ? 'bg-blue-50' : ''
              }`}
            >
              {feedback.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-transform ${
                        snapshot.isDragging ? 'rotate-2 scale-105 shadow-lg' : ''
                      } ${draggedId === item.id ? 'opacity-50' : ''}`}
                    >
                      <FeedbackDragCard 
                        feedback={item}
                        onVote={onVote}
                        onFeedbackClick={onFeedbackClick}
                        isDragging={snapshot.isDragging}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

  // Multi-column layout
  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {columns.map(column => (
          <div key={column.id} className={`rounded-lg p-4 ${column.color}`}>
            <h3 className="font-medium mb-4 text-sm uppercase tracking-wide text-gray-700">
              {column.title} ({groupedFeedback[column.id]?.length || 0})
            </h3>
            
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-3 min-h-[200px] transition-colors ${
                    snapshot.isDraggingOver ? 'bg-white/50 rounded-lg' : ''
                  }`}
                >
                  {groupedFeedback[column.id]?.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`transition-transform ${
                            snapshot.isDragging ? 'rotate-1 scale-105 shadow-lg' : ''
                          } ${draggedId === item.id ? 'opacity-50' : ''}`}
                        >
                          <FeedbackDragCard 
                            feedback={item}
                            onVote={onVote}
                            onFeedbackClick={onFeedbackClick}
                            isDragging={snapshot.isDragging}
                            compact
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

interface FeedbackDragCardProps {
  feedback: EnhancedFeedbackItem;
  onVote: (feedbackId: string, voteType: 'upvote' | 'downvote') => void;
  onFeedbackClick: (feedback: EnhancedFeedbackItem) => void;
  isDragging: boolean;
  compact?: boolean;
}

const FeedbackDragCard: React.FC<FeedbackDragCardProps> = ({
  feedback,
  onVote,
  onFeedbackClick,
  isDragging,
  compact = false
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'default';
      case 'planned': return 'secondary';
      case 'under_review': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
      isDragging ? 'shadow-xl bg-white' : ''
    } ${compact ? 'text-sm' : ''}`}>
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 
              className={`font-medium line-clamp-2 cursor-pointer hover:text-primary ${
                compact ? 'text-sm' : ''
              }`}
              onClick={() => onFeedbackClick(feedback)}
            >
              {feedback.title}
            </h4>
            {!compact && feedback.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {feedback.description}
              </p>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 ml-2 ${compact ? 'h-6 text-xs' : 'h-8'}`}
            onClick={(e) => {
              e.stopPropagation();
              onVote(feedback.id, 'upvote');
            }}
          >
            <ChevronUp className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
            <span>{feedback.votes_count}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className={compact ? 'pt-0 pb-2' : 'pt-0'}>
        <div className="flex items-center gap-1 flex-wrap mb-2">
          {!compact && (
            <Badge variant={getStatusColor(feedback.status)} className="text-xs">
              {feedback.status.replace('_', ' ')}
            </Badge>
          )}
          
          <Badge variant={getPriorityColor(feedback.priority)} className="text-xs">
            <Flag className="h-2 w-2 mr-1" />
            {feedback.priority}
          </Badge>

          {feedback.category && (
            <Badge variant="outline" className="text-xs">
              {feedback.category}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{feedback.comments_count}</span>
            </div>
            {!compact && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};