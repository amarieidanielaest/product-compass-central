import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { roadmapService, RoadmapItem } from '@/services/api';
import { Calendar, CheckCircle2, Clock, AlertCircle, Target, TrendingUp } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, addMonths } from 'date-fns';

interface RoadmapViewProps {
  boardId: string;
}

export const RoadmapView = ({ boardId }: RoadmapViewProps) => {
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'timeline' | 'status' | 'priority'>('timeline');
  const [timeframe, setTimeframe] = useState<'quarter' | 'half' | 'year'>('quarter');

  useEffect(() => {
    loadRoadmapData();
  }, [boardId]);

  const loadRoadmapData = async () => {
    try {
      setLoading(true);
      const response = await roadmapService.getRoadmapItems();
      if (response.success && response.data) {
        // Filter items that might be linked to this board's feedback
        setRoadmapItems(response.data);
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'planned':
        return <Calendar className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-orange-100 text-orange-800';
      case 'idea':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'initiative':
        return <Target className="h-4 w-4" />;
      case 'epic':
        return <TrendingUp className="h-4 w-4" />;
      case 'feature':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'milestone':
        return <Calendar className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filterItemsByTimeframe = (items: RoadmapItem[]) => {
    const now = new Date();
    let endDate: Date;

    switch (timeframe) {
      case 'quarter':
        endDate = addMonths(now, 3);
        break;
      case 'half':
        endDate = addMonths(now, 6);
        break;
      case 'year':
        endDate = addMonths(now, 12);
        break;
      default:
        endDate = addMonths(now, 3);
    }

    return items.filter(item => {
      if (!item.endDate) return true;
      const itemEndDate = parseISO(item.endDate);
      return isBefore(itemEndDate, endDate) || item.status === 'in-progress';
    });
  };

  const groupItemsByStatus = (items: RoadmapItem[]) => {
    return items.reduce((acc, item) => {
      if (!acc[item.status]) acc[item.status] = [];
      acc[item.status].push(item);
      return acc;
    }, {} as Record<string, RoadmapItem[]>);
  };

  const groupItemsByPriority = (items: RoadmapItem[]) => {
    return items.reduce((acc, item) => {
      if (!acc[item.priority]) acc[item.priority] = [];
      acc[item.priority].push(item);
      return acc;
    }, {} as Record<string, RoadmapItem[]>);
  };

  const calculateProgress = (item: RoadmapItem) => {
    if (item.status === 'delivered') return 100;
    if (item.status === 'in-progress') return 60;
    if (item.status === 'planned') return 20;
    return 0;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const filteredItems = filterItemsByTimeframe(roadmapItems);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={(value: 'quarter' | 'half' | 'year') => setTimeframe(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="quarter">Next Quarter</SelectItem>
              <SelectItem value="half">Next 6 Months</SelectItem>
              <SelectItem value="year">Next Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs value={viewType} onValueChange={(value: 'timeline' | 'status' | 'priority') => setViewType(value)}>
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="status">By Status</TabsTrigger>
            <TabsTrigger value="priority">By Priority</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Roadmap Content */}
      {viewType === 'timeline' && (
        <div className="space-y-4">
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No roadmap items</h3>
                <p className="text-gray-600 text-center">
                  Roadmap items will appear here as they are planned and developed.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredItems
              .sort((a, b) => {
                if (!a.startDate && !b.startDate) return 0;
                if (!a.startDate) return 1;
                if (!b.startDate) return -1;
                return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
              })
              .map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(item.type)}
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status.replace('-', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm">
                          {item.description}
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {item.effort} {item.effort === 1 ? 'point' : 'points'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{calculateProgress(item)}%</span>
                      </div>
                      <Progress value={calculateProgress(item)} className="h-2" />
                      
                      {(item.startDate || item.endDate) && (
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          {item.startDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Start: {format(parseISO(item.startDate), 'MMM dd, yyyy')}</span>
                            </div>
                          )}
                          {item.endDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>End: {format(parseISO(item.endDate), 'MMM dd, yyyy')}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {item.linkedFeedback.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Linked feedback:</span>
                          <Badge variant="secondary">{item.linkedFeedback.length} items</Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      )}

      {viewType === 'status' && (
        <div className="space-y-6">
          {Object.entries(groupItemsByStatus(filteredItems)).map(([status, items]) => (
            <div key={status}>
              <div className="flex items-center gap-2 mb-4">
                {getStatusIcon(status)}
                <h3 className="text-lg font-semibold capitalize">{status.replace('-', ' ')}</h3>
                <Badge variant="secondary">{items.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(item.type)}
                        <CardTitle className="text-base">{item.title}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(item.priority) + " text-xs"}>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {item.effort} pts
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewType === 'priority' && (
        <div className="space-y-6">
          {['critical', 'high', 'medium', 'low'].map((priority) => {
            const items = groupItemsByPriority(filteredItems)[priority] || [];
            if (items.length === 0) return null;

            return (
              <div key={priority}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold capitalize">{priority} Priority</h3>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          {getTypeIcon(item.type)}
                          <CardTitle className="text-base">{item.title}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(item.status) + " text-xs"}>
                            {item.status.replace('-', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.effort} pts
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                        {item.endDate && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {format(parseISO(item.endDate), 'MMM dd, yyyy')}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};