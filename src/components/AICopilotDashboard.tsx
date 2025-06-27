
import React, { useState } from 'react';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Target, Zap, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAICopilot } from '@/hooks/useAICopilot';
import { AICopilotInsight, AICopilotRecommendation } from '@/services/ai/AICopilotService';

interface AICopilotDashboardProps {
  onNavigate?: (module: string) => void;
}

const AICopilotDashboard: React.FC<AICopilotDashboardProps> = ({ onNavigate }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d'>('7d');
  const {
    insights,
    recommendations,
    loading,
    error,
    generateInsights,
    generateRecommendations,
    createExperimentFromRecommendation,
    optimizeExperiments
  } = useAICopilot();

  const handleRefreshInsights = () => {
    generateInsights(selectedTimeRange);
  };

  const handleRefreshRecommendations = () => {
    generateRecommendations();
  };

  const handleCreateExperiment = async (recommendation: AICopilotRecommendation) => {
    const experimentId = await createExperimentFromRecommendation(recommendation);
    if (experimentId && onNavigate) {
      onNavigate('experiments');
    }
  };

  const getPriorityColor = (priority: AICopilotInsight['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getTypeIcon = (type: AICopilotInsight['type']) => {
    switch (type) {
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      case 'experiment': return <Target className="w-4 h-4" />;
      case 'user_behavior': return <Brain className="w-4 h-4" />;
      case 'conversion': return <Zap className="w-4 h-4" />;
      case 'feature_adoption': return <Lightbulb className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            AI Co-pilot Dashboard
          </h2>
          <p className="text-slate-600">
            Intelligent insights and recommendations powered by AI analytics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={optimizeExperiments}
            disabled={loading}
          >
            <Brain className="w-4 h-4 mr-2" />
            Optimize Experiments
          </Button>
          <Button
            onClick={handleRefreshInsights}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh AI Analysis
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="recommendations">Experiment Recommendations</TabsTrigger>
          <TabsTrigger value="optimization">Performance Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Current Insights</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTimeRange('7d')}
                className={selectedTimeRange === '7d' ? 'bg-purple-100' : ''}
              >
                7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTimeRange('30d')}
                className={selectedTimeRange === '30d' ? 'bg-purple-100' : ''}
              >
                30 Days
              </Button>
            </div>
          </div>

          {loading && insights.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
                  <span className="text-slate-600">AI is analyzing your data...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {insights.map((insight) => (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(insight.type)}
                        <div>
                          <h4 className="font-semibold text-slate-900">{insight.title}</h4>
                          <p className="text-sm text-slate-600 mt-1">{insight.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>

                    {insight.actionable && insight.suggestedActions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <h5 className="text-sm font-medium text-slate-700 mb-2">Suggested Actions:</h5>
                        <div className="space-y-2">
                          {insight.suggestedActions.map((action, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <span className="text-sm text-slate-700">{action.action}</span>
                              <div className="flex space-x-1">
                                <Badge variant="outline" className="text-xs">
                                  Impact: {action.impact}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Effort: {action.effort}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Experiment Recommendations</h3>
            <Button
              variant="outline"
              onClick={handleRefreshRecommendations}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Generate New
            </Button>
          </div>

          <div className="grid gap-4">
            {recommendations.map((recommendation) => (
              <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{recommendation.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{recommendation.description}</p>
                      <p className="text-sm text-green-600 mt-2">{recommendation.expectedImpact}</p>
                    </div>
                    <Badge variant="outline">
                      {Math.round(recommendation.confidence * 100)}% confidence
                    </Badge>
                  </div>

                  {recommendation.experimentSuggestion && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-1">Hypothesis:</h5>
                          <p className="text-sm text-slate-600">{recommendation.experimentSuggestion.hypothesis}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-slate-700 mb-1">Duration:</h5>
                          <p className="text-sm text-slate-600">{recommendation.experimentSuggestion.duration}</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCreateExperiment(recommendation)}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Create Experiment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                Performance Optimization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-4">
                AI-powered optimization suggestions for your active experiments and user flows.
              </p>
              <Button
                onClick={optimizeExperiments}
                disabled={loading}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <Brain className="w-4 h-4 mr-2" />
                Run Optimization Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AICopilotDashboard;
