
import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Target, Brain, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { portfolioAnalyticsService, PredictiveAnalytics as PredictiveAnalyticsType } from '@/services/analytics/PortfolioAnalyticsService';
import { useToast } from '@/hooks/use-toast';

const PredictiveAnalytics = () => {
  const [analytics, setAnalytics] = useState<PredictiveAnalyticsType | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPredictiveAnalytics();
  }, []);

  const loadPredictiveAnalytics = async () => {
    try {
      setLoading(true);
      const response = await portfolioAnalyticsService.getPredictiveAnalytics();
      if (response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      toast({
        title: "Error loading predictive analytics",
        description: "Failed to load predictive analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Predictive Analytics
          </h2>
          <p className="text-slate-600">AI-powered forecasting and risk assessment</p>
        </div>
        <Button onClick={loadPredictiveAnalytics} disabled={loading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Predictions
        </Button>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Churn Prediction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Churn Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Predicted Churn Rate</span>
                  <span className="text-2xl font-bold text-red-600">
                    {(analytics.churnPrediction.predictedChurnRate * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={analytics.churnPrediction.predictedChurnRate * 100} 
                  className="h-2"
                />
              </div>

              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-red-900 mb-1">
                  High Risk Users
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {analytics.churnPrediction.highRiskUsers.toLocaleString()}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Prevention Actions</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  {analytics.churnPrediction.preventionActions.map((action, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Growth Forecast */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Growth Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Predicted Growth</span>
                  <span className="text-2xl font-bold text-green-600">
                    +{(analytics.growthForecast.predictedGrowth * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Timeframe: {analytics.growthForecast.timeframe}</span>
                  <Badge className={getConfidenceColor(analytics.growthForecast.confidence)}>
                    {(analytics.growthForecast.confidence * 100).toFixed(0)}% confidence
                  </Badge>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm font-medium text-green-900 mb-2">
                  Growth Drivers
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  {analytics.growthForecast.drivers.map((driver, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      {driver}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Market Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Target className="w-5 h-5 mr-2 text-blue-600" />
                Market Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                  <Brain className="w-4 h-4 mr-1 text-purple-600" />
                  Emerging Opportunities
                </h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  {analytics.marketTrends.emergingOpportunities.map((opportunity, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      {opportunity}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1 text-orange-600" />
                  Competitive Threats
                </h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  {analytics.marketTrends.competitiveThreat.map((threat, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                      {threat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">AI Recommendations</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  {analytics.marketTrends.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalytics;
