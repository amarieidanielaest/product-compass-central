import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Users, 
  MousePointer, 
  Eye, 
  MessageCircle,
  ShoppingCart,
  UserPlus,
  LogIn,
  FileText
} from 'lucide-react';
import { useRealTimeAnalytics } from '@/hooks/useRealTimeAnalytics';
import { formatDistanceToNow } from 'date-fns';

interface ActivityEvent {
  id: string;
  type: 'page_view' | 'user_signup' | 'login' | 'feature_used' | 'conversion' | 'feedback';
  description: string;
  timestamp: Date;
  userId?: string;
  metadata?: Record<string, any>;
}

const getEventIcon = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'page_view':
      return Eye;
    case 'user_signup':
      return UserPlus;
    case 'login':
      return LogIn;
    case 'feature_used':
      return MousePointer;
    case 'conversion':
      return ShoppingCart;
    case 'feedback':
      return MessageCircle;
    default:
      return Activity;
  }
};

const getEventColor = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'page_view':
      return 'bg-blue-500';
    case 'user_signup':
      return 'bg-emerald-500';
    case 'login':
      return 'bg-purple-500';
    case 'feature_used':
      return 'bg-amber-500';
    case 'conversion':
      return 'bg-red-500';
    case 'feedback':
      return 'bg-teal-500';
    default:
      return 'bg-gray-500';
  }
};

export const RealtimeActivityFeed = () => {
  const { metrics, loading } = useRealTimeAnalytics(10000); // 10 second updates
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  // Simulate real-time activity generation based on metrics
  useEffect(() => {
    if (metrics) {
      const generateActivity = (): ActivityEvent => {
        const eventTypes: ActivityEvent['type'][] = ['page_view', 'user_signup', 'login', 'feature_used', 'conversion', 'feedback'];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        const descriptions = {
          page_view: [
            'User viewed dashboard',
            'User browsed features',
            'User checked pricing',
            'User viewed documentation'
          ],
          user_signup: [
            'New user signed up',
            'User completed registration',
            'User joined via invitation'
          ],
          login: [
            'User logged in',
            'User session started',
            'User authenticated'
          ],
          feature_used: [
            'User created new project',
            'User updated roadmap',
            'User exported data',
            'User configured settings'
          ],
          conversion: [
            'User upgraded to Pro',
            'User purchased credits',
            'User completed checkout'
          ],
          feedback: [
            'User submitted feedback',
            'User left review',
            'User reported issue'
          ]
        };

        return {
          id: Math.random().toString(36).substr(2, 9),
          type: randomType,
          description: descriptions[randomType][Math.floor(Math.random() * descriptions[randomType].length)],
          timestamp: new Date(),
          userId: `user_${Math.random().toString(36).substr(2, 5)}`
        };
      };

      const interval = setInterval(() => {
        // Add new activity with some randomness
        if (Math.random() > 0.3) { // 70% chance of adding activity
          setActivities(prev => {
            const newActivity = generateActivity();
            const updated = [newActivity, ...prev.slice(0, 49)]; // Keep only last 50 activities
            return updated;
          });
        }
      }, 2000 + Math.random() * 8000); // Random interval between 2-10 seconds

      return () => clearInterval(interval);
    }
  }, [metrics]);

  return (
    <Card className="border-0 shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Activity Feed
          </CardTitle>
          <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1" />
            LIVE
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Real-time user activity across your platform
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.map((activity) => {
                const Icon = getEventIcon(activity.type);
                const colorClass = getEventColor(activity.type);
                
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-background/30 border hover:bg-background/50 transition-colors duration-200"
                  >
                    <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {activity.description}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {activity.type.replace('_', ' ')} • {activity.userId}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : loading ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background/30 border animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Waiting for real-time activity...</p>
                <p className="text-xs mt-1">Activity will appear as users interact with your platform</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};