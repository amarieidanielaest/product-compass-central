import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Target, 
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FeedbackInsight {
  id: string;
  type: 'sentiment' | 'trend' | 'priority' | 'category';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  relatedFeedbackCount: number;
  suggestedAction?: string;
}

interface TrendData {
  period: string;
  submissions: number;
  satisfaction: number;
  resolution_rate: number;
}

interface AIInsightPanelProps {
  boardId: string;
  feedbackItems: any[];
  className?: string;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
  boardId,
  feedbackItems,
  className
}) => {
  const [insights, setInsights] = useState<FeedbackInsight[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  // Mock AI insights generation
  useEffect(() => {
    const generateInsights = () => {
      const mockInsights: FeedbackInsight[] = [
        {
          id: '1',
          type: 'sentiment',
          title: 'Declining User Satisfaction',
          description: 'User sentiment has decreased by 15% in the last 30 days, primarily due to mobile app performance issues.',
          confidence: 87,
          impact: 'high',
          actionable: true,
          relatedFeedbackCount: 23,
          suggestedAction: 'Prioritize mobile performance optimization in next sprint'
        },
        {
          id: '2',
          type: 'trend',
          title: 'Rising Authentication Requests',
          description: 'SSO and authentication-related feedback has increased 40% this quarter.',
          confidence: 92,
          impact: 'medium',
          actionable: true,
          relatedFeedbackCount: 18,
          suggestedAction: 'Consider expanding SSO provider options'
        },
        {
          id: '3',
          type: 'category',
          title: 'Dashboard Feature Clustering',
          description: 'Multiple feedback items suggest users want consolidated dashboard views.',
          confidence: 78,
          impact: 'medium',
          actionable: true,
          relatedFeedbackCount: 31,
          suggestedAction: 'Design unified dashboard mockups'
        },
        {
          id: '4',
          type: 'priority',
          title: 'Critical Bug Pattern',
          description: 'Similar data export failures reported across different user segments.',
          confidence: 95,
          impact: 'critical',
          actionable: true,
          relatedFeedbackCount: 12,
          suggestedAction: 'Immediate investigation required'
        }
      ];

      const mockTrends: TrendData[] = [
        { period: 'Week 1', submissions: 42, satisfaction: 78, resolution_rate: 85 },
        { period: 'Week 2', submissions: 38, satisfaction: 82, resolution_rate: 88 },
        { period: 'Week 3', submissions: 45, satisfaction: 75, resolution_rate: 82 },
        { period: 'Week 4', submissions: 51, satisfaction: 73, resolution_rate: 79 }
      ];

      setInsights(mockInsights);
      setTrends(mockTrends);
      setIsLoading(false);
    };

    const timer = setTimeout(generateInsights, 1500);
    return () => clearTimeout(timer);
  }, [feedbackItems]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <TrendingUp className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sentiment': return <Users className="h-4 w-4" />;
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'category': return <Target className="h-4 w-4" />;
      case 'priority': return <AlertTriangle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            <CardTitle>AI Insights</CardTitle>
          </div>
          <CardDescription>Analyzing feedback patterns...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Insights</CardTitle>
          </div>
          <Badge variant="outline" className="gap-1">
            <Lightbulb className="h-3 w-3" />
            {insights.filter(i => i.actionable).length} actionable
          </Badge>
        </div>
        <CardDescription>
          AI-powered insights from your feedback data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="insights">Key Insights</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            {insights.map(insight => (
              <div key={insight.id} className="space-y-3">
                <Alert className={`cursor-pointer transition-colors ${
                  selectedInsight === insight.id ? 'bg-muted' : ''
                }`}>
                  <div className="flex items-start gap-3">
                    {getTypeIcon(insight.type)}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{insight.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={getImpactColor(insight.impact)} className="gap-1">
                            {getImpactIcon(insight.impact)}
                            {insight.impact}
                          </Badge>
                        </div>
                      </div>
                      <AlertDescription>{insight.description}</AlertDescription>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">
                            Confidence: {insight.confidence}%
                          </span>
                          <span className="text-muted-foreground">
                            <MessageSquare className="inline h-3 w-3 mr-1" />
                            {insight.relatedFeedbackCount} related
                          </span>
                        </div>
                        <Progress value={insight.confidence} className="w-20 h-2" />
                      </div>

                      {insight.suggestedAction && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-primary">
                              Suggested Action: {insight.suggestedAction}
                            </p>
                            <Button size="sm" variant="outline">
                              Take Action
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Feedback Volume Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{trend.period}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(trend.submissions / 60) * 100} className="w-20 h-2" />
                          <span className="text-sm font-medium">{trend.submissions}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Satisfaction Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{trend.period}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={trend.satisfaction} className="w-20 h-2" />
                          <span className="text-sm font-medium">{trend.satisfaction}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Resolution Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {trends.map((trend, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{trend.period}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={trend.resolution_rate} className="w-20 h-2" />
                          <span className="text-sm font-medium">{trend.resolution_rate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};