
import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Lightbulb, MessageSquare, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AIInsight {
  id: string;
  type: 'sentiment' | 'theme' | 'priority' | 'suggestion';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

interface AIInsightsPanelProps {
  feedbackData: any[];
  onCreateTask?: (insight: AIInsight) => void;
  className?: string;
}

const AIInsightsPanel = ({ feedbackData, onCreateTask, className }: AIInsightsPanelProps) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock AI analysis - in real implementation, this would call your AI service
  const analyzeFeeback = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockInsights: AIInsight[] = [
      {
        id: '1',
        type: 'sentiment',
        title: 'Sentiment Trend: Improving',
        description: 'Customer sentiment has improved 23% this month, with positive feedback outweighing negative 3:1',
        confidence: 89,
        actionable: false
      },
      {
        id: '2',
        type: 'theme',
        title: 'Recurring Theme: Export Functionality',
        description: 'Export limitations mentioned in 15 tickets. High impact opportunity identified.',
        confidence: 94,
        actionable: true
      },
      {
        id: '3',
        type: 'priority',
        title: 'High Priority: Mobile Experience',
        description: 'Mobile-related feedback shows 67% critical priority score based on customer segment value',
        confidence: 82,
        actionable: true
      },
      {
        id: '4',
        type: 'suggestion',
        title: 'AI Suggestion: Feature Bundling',
        description: 'Customers requesting feature A also frequently mention feature B. Consider bundling.',
        confidence: 76,
        actionable: true
      }
    ];
    
    setInsights(mockInsights);
    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (feedbackData.length > 0) {
      analyzeFeeback();
    }
  }, [feedbackData]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'sentiment': return <TrendingUp className="w-4 h-4" />;
      case 'theme': return <MessageSquare className="w-4 h-4" />;
      case 'priority': return <Target className="w-4 h-4" />;
      case 'suggestion': return <Lightbulb className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'sentiment': return 'text-green-600 bg-green-100';
      case 'theme': return 'text-blue-600 bg-blue-100';
      case 'priority': return 'text-red-600 bg-red-100';
      case 'suggestion': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isAnalyzing) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600 animate-pulse" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-purple-600 animate-pulse" />
            <span className="text-sm text-slate-600">Analyzing feedback patterns...</span>
          </div>
          <Progress value={65} className="h-2" />
          <p className="text-xs text-slate-500">
            Processing {feedbackData.length} feedback items with AI
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            AI Insights
          </div>
          <Badge variant="outline" className="text-xs">
            {insights.length} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`p-1 rounded ${getInsightColor(insight.type)}`}>
                  {getInsightIcon(insight.type)}
                </div>
                <h4 className="font-medium text-slate-900 text-sm">{insight.title}</h4>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">{insight.confidence}%</span>
                <div className="w-12 h-1 bg-slate-200 rounded-full">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${insight.confidence}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-3">{insight.description}</p>
            {insight.actionable && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs"
                onClick={() => onCreateTask?.(insight)}
              >
                Create Task
              </Button>
            )}
          </div>
        ))}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          onClick={analyzeFeeback}
        >
          <Brain className="w-4 h-4 mr-2" />
          Refresh AI Analysis
        </Button>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
