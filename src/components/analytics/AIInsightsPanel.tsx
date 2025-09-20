import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  AlertTriangle, 
  Lightbulb, 
  TrendingUp, 
  Target,
  MessageCircle,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { aiService, AIInsight } from '@/services/api';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AIInsightsSetupCard } from './AIInsightsSetupCard';

interface InsightCategory {
  category: 'product' | 'roadmap' | 'feedback' | 'strategy';
  insights: AIInsight[];
  loading: boolean;
}

export const AIInsightsPanel = () => {
  const [categories, setCategories] = useState<InsightCategory[]>([
    { category: 'product', insights: [], loading: true },
    { category: 'feedback', insights: [], loading: true },
    { category: 'roadmap', insights: [], loading: true },
    { category: 'strategy', insights: [], loading: true },
  ]);
  const [chatMode, setChatMode] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState<any>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const { trackFeature } = useAnalytics();

  const handleSetupClick = () => {
    window.open('https://docs.lovable.dev/features/ai-insights-setup', '_blank');
  };

  useEffect(() => {
    trackFeature('ai_insights_panel');
    loadAllInsights();
  }, []);

  const loadAllInsights = async () => {
    let allFailed = true;
    
    const updatedCategories = await Promise.all(
      categories.map(async (cat) => {
        try {
          const response = await aiService.getInsights(cat.category, {
            filters: { boardId: 'main' },
            productId: 'main'
          });
          
          if (response.success) {
            allFailed = false;
          }
          
          return {
            ...cat,
            insights: response.success ? response.data : [],
            loading: false
          };
        } catch (error) {
          console.error(`Failed to load ${cat.category} insights:`, error);
          return { ...cat, loading: false };
        }
      })
    );

    // If all categories failed, show setup instead of empty state
    if (allFailed) {
      setNeedsSetup(true);
    }

    setCategories(updatedCategories);
  };

  const handleChatSubmit = async () => {
    if (!chatMessage.trim()) return;
    
    try {
      trackFeature('ai_chat_assistant');
      const response = await aiService.chatWithAssistant(chatMessage, {
        currentView: 'analytics',
        userRole: 'product_manager'
      });

      if (response.success) {
        setChatResponse(response.data);
        setChatMessage('');
      }
    } catch (error) {
      console.error('Chat error:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'opportunity': return <Lightbulb className="w-4 h-4" />;
      case 'recommendation': return <Target className="w-4 h-4" />;
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'opportunity': return 'bg-green-100 text-green-600 border-green-200';
      case 'recommendation': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'trend': return 'bg-purple-100 text-purple-600 border-purple-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'product': return '📊';
      case 'feedback': return '💬';
      case 'roadmap': return '🗺️';
      case 'strategy': return '🎯';
      default: return '🤖';
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'product': return 'Product Analytics';
      case 'feedback': return 'Customer Feedback';
      case 'roadmap': return 'Roadmap Planning';
      case 'strategy': return 'Strategic Insights';
      default: return category;
    }
  };

  if (needsSetup) {
    return <AIInsightsSetupCard onSetupClick={handleSetupClick} />;
  }

  if (chatMode) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Assistant Chat
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {setChatMode(false); setChatResponse(null);}}
            >
              Back to Insights
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4">
          <ScrollArea className="flex-1 max-h-80">
            <div className="space-y-4">
              {chatResponse && (
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="font-medium">AI Assistant</span>
                    </div>
                    <p className="text-sm">{chatResponse.response}</p>
                  </div>
                  
                  {chatResponse.followUpQuestions && chatResponse.followUpQuestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Follow-up questions:</p>
                      <div className="space-y-1">
                        {chatResponse.followUpQuestions.map((question: string, idx: number) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-left h-auto py-2 px-3"
                            onClick={() => setChatMessage(question)}
                          >
                            <MessageCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span className="text-xs">{question}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {chatResponse.actionsSuggested && chatResponse.actionsSuggested.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Suggested actions:</p>
                      <div className="space-y-1">
                        {chatResponse.actionsSuggested.map((action: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs p-2 bg-primary/5 rounded">
                            <ArrowRight className="w-3 h-3 text-primary" />
                            <div>
                              <div className="font-medium">{action.action}</div>
                              <div className="text-muted-foreground">{action.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
              placeholder="Ask me anything about your analytics..."
              className="flex-1 px-3 py-2 text-sm border rounded-md"
            />
            <Button size="sm" onClick={handleChatSubmit}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Insights
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setChatMode(true)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadAllInsights}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-6">
            {categories.map((category, catIndex) => (
              <div key={category.category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCategoryIcon(category.category)}</span>
                  <h4 className="font-medium">{getCategoryTitle(category.category)}</h4>
                  {category.loading && (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                
                {category.insights.length > 0 ? (
                  <div className="space-y-2">
                    {category.insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getInsightIcon(insight.type)}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-sm">{insight.title}</h5>
                              <Badge variant="secondary" className="text-xs">
                                {Math.round(insight.confidence * 100)}%
                              </Badge>
                            </div>
                            <p className="text-xs opacity-90">{insight.description}</p>
                            
                            {insight.actionable && insight.suggestedActions && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium">Actions:</p>
                                <ul className="space-y-1">
                                  {insight.suggestedActions.slice(0, 2).map((action, actionIdx) => (
                                    <li key={actionIdx} className="text-xs opacity-90 flex items-center gap-1">
                                      <div className="w-1 h-1 bg-current rounded-full"></div>
                                      {action}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !category.loading ? (
                  <p className="text-sm text-muted-foreground italic">
                    No insights available for {category.category}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};