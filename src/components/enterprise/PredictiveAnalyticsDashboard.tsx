import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, AlertTriangle, Lightbulb, BarChart3, PieChart, LineChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart as RechartsBarChart, Bar } from 'recharts';
import { useToast } from '@/hooks/use-toast';

interface Prediction {
  id: string;
  type: 'churn' | 'conversion' | 'growth' | 'engagement' | 'revenue';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timeframe: string;
  predictedValue: number;
  currentValue: number;
  factors: string[];
  recommendations: string[];
  createdAt: string;
}

interface TrendForecast {
  metric: string;
  historical: Array<{ date: string; value: number }>;
  forecast: Array<{ date: string; value: number; confidence: number }>;
  accuracy: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface RiskAssessment {
  id: string;
  category: string;
  risk: string;
  probability: number;
  impact: number;
  score: number;
  mitigation: string[];
  status: 'active' | 'monitoring' | 'resolved';
}

interface OpportunityInsight {
  id: string;
  title: string;
  description: string;
  potentialImpact: number;
  confidenceLevel: number;
  effort: 'low' | 'medium' | 'high';
  category: 'feature' | 'marketing' | 'product' | 'user_experience';
  timeline: string;
}

const PredictiveAnalyticsDashboard: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [trendForecasts, setTrendForecasts] = useState<TrendForecast[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [opportunities, setOpportunities] = useState<OpportunityInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelAccuracy, setModelAccuracy] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    loadPredictiveData();
  }, []);

  const loadPredictiveData = async () => {
    try {
      setLoading(true);

      // Mock predictions data
      const mockPredictions: Prediction[] = [
        {
          id: '1',
          type: 'churn',
          title: 'Customer Churn Risk Increase',
          description: 'Model predicts 15% increase in churn rate over next 30 days based on engagement patterns',
          confidence: 0.87,
          impact: 'high',
          timeframe: '30 days',
          predictedValue: 12.5,
          currentValue: 10.8,
          factors: ['Decreased session duration', 'Reduced feature usage', 'Support ticket volume increase'],
          recommendations: ['Implement retention campaign', 'Improve onboarding flow', 'Address top support issues'],
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          type: 'conversion',
          title: 'Trial-to-Paid Conversion Improvement',
          description: 'Expected 8% improvement in conversion rate with upcoming feature releases',
          confidence: 0.72,
          impact: 'medium',
          timeframe: '60 days',
          predictedValue: 23.2,
          currentValue: 21.5,
          factors: ['New dashboard features', 'Improved integration capabilities', 'Better mobile experience'],
          recommendations: ['Highlight new features in trials', 'Optimize conversion funnel', 'Enhance feature discovery'],
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          type: 'revenue',
          title: 'Monthly Recurring Revenue Growth',
          description: 'Projected 18% MRR growth based on current expansion trends and new customer acquisition',
          confidence: 0.91,
          impact: 'high',
          timeframe: '90 days',
          predictedValue: 145000,
          currentValue: 123000,
          factors: ['Successful enterprise deals', 'Expansion in existing accounts', 'New pricing tier performance'],
          recommendations: ['Focus on enterprise expansion', 'Optimize pricing strategy', 'Accelerate new feature adoption'],
          createdAt: new Date().toISOString()
        }
      ];
      setPredictions(mockPredictions);

      // Mock trend forecasts
      const generateTrendData = (baseValue: number, trend: number, days: number) => {
        const data = [];
        const now = new Date();
        for (let i = -30; i <= days; i++) {
          const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
          const value = baseValue + (trend * i) + (Math.random() - 0.5) * baseValue * 0.1;
          data.push({
            date: date.toISOString().split('T')[0],
            value: Math.max(0, Math.round(value)),
            confidence: i > 0 ? Math.max(0.5, 1 - (i / days) * 0.4) : 1
          });
        }
        return data;
      };

      const mockForecasts: TrendForecast[] = [
        {
          metric: 'Daily Active Users',
          historical: generateTrendData(1250, 5, 0).slice(0, 30),
          forecast: generateTrendData(1250, 5, 30).slice(30),
          accuracy: 0.89,
          trend: 'increasing'
        },
        {
          metric: 'Feature Adoption Rate',
          historical: generateTrendData(65, 0.2, 0).slice(0, 30),
          forecast: generateTrendData(65, 0.2, 30).slice(30),
          accuracy: 0.76,
          trend: 'stable'
        }
      ];
      setTrendForecasts(mockForecasts);

      // Mock risk assessments
      const mockRisks: RiskAssessment[] = [
        {
          id: '1',
          category: 'Customer Success',
          risk: 'High-value customer showing decreased engagement',
          probability: 0.75,
          impact: 0.85,
          score: 0.8,
          mitigation: ['Schedule executive check-in', 'Provide dedicated success manager', 'Offer advanced training'],
          status: 'active'
        },
        {
          id: '2',
          category: 'Technical',
          risk: 'API response times increasing above SLA thresholds',
          probability: 0.45,
          impact: 0.7,
          score: 0.58,
          mitigation: ['Scale infrastructure', 'Optimize database queries', 'Implement caching layer'],
          status: 'monitoring'
        }
      ];
      setRiskAssessments(mockRisks);

      // Mock opportunities
      const mockOpportunities: OpportunityInsight[] = [
        {
          id: '1',
          title: 'Mobile App Feature Gap',
          description: 'Analysis shows 67% of users request mobile access for key features',
          potentialImpact: 0.85,
          confidenceLevel: 0.92,
          effort: 'high',
          category: 'product',
          timeline: '3-6 months'
        },
        {
          id: '2',
          title: 'Integration Marketplace Opportunity',
          description: 'Customers frequently request integrations with 5 specific tools',
          potentialImpact: 0.72,
          confidenceLevel: 0.88,
          effort: 'medium',
          category: 'feature',
          timeline: '2-3 months'
        }
      ];
      setOpportunities(mockOpportunities);

      // Calculate overall model accuracy
      const accuracy = mockForecasts.reduce((sum, f) => sum + f.accuracy, 0) / mockForecasts.length;
      setModelAccuracy(Math.round(accuracy * 100));

    } catch (error) {
      console.error('Failed to load predictive data:', error);
      toast({
        title: "Error loading predictive analytics",
        description: "Failed to fetch predictive models data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPredictionTypeIcon = (type: string) => {
    switch (type) {
      case 'churn':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'conversion':
        return <Target className="w-4 h-4 text-green-600" />;
      case 'growth':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'engagement':
        return <Brain className="w-4 h-4 text-purple-600" />;
      case 'revenue':
        return <BarChart3 className="w-4 h-4 text-green-600" />;
      default:
        return <Lightbulb className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 0.8) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 0.6) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const pieChartColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Predictive Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">AI-powered predictions and forecasting models</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadPredictiveData} disabled={loading}>
            <Brain className="w-4 h-4 mr-2" />
            Refresh Models
          </Button>
        </div>
      </div>

      {/* Model Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            AI Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {modelAccuracy}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {predictions.length}
              </div>
              <div className="text-sm text-muted-foreground">Active Predictions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {riskAssessments.filter(r => r.status === 'active').length}
              </div>
              <div className="text-sm text-muted-foreground">Active Risks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="forecasts">Trend Forecasts</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid gap-4">
            {predictions.map((prediction) => (
              <Card key={prediction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getPredictionTypeIcon(prediction.type)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{prediction.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{prediction.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getImpactColor(prediction.impact)}>
                        {prediction.impact} impact
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(prediction.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Current Value:</span>
                      <div className="font-medium">{prediction.currentValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Predicted Value:</span>
                      <div className="font-medium text-blue-600">{prediction.predictedValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Timeframe:</span>
                      <div className="font-medium">{prediction.timeframe}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Key Factors:</h4>
                      <div className="flex flex-wrap gap-2">
                        {prediction.factors.map((factor, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Recommendations:</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {prediction.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          {trendForecasts.map((forecast, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <LineChart className="w-5 h-5 mr-2 text-blue-600" />
                    {forecast.metric}
                  </span>
                  <Badge variant="outline">
                    {Math.round(forecast.accuracy * 100)}% accuracy
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={[...forecast.historical, ...forecast.forecast]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      strokeDasharray="none"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Historical data (solid) | Forecast (dashed)</span>
                  <Badge variant="outline" className={
                    forecast.trend === 'increasing' ? 'text-green-600' :
                    forecast.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                  }>
                    {forecast.trend}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="grid gap-4">
            {riskAssessments.map((risk) => (
              <Card key={risk.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{risk.risk}</h3>
                        <Badge className={getRiskColor(risk.score)}>
                          Risk Score: {Math.round(risk.score * 100)}
                        </Badge>
                      </div>
                      <Badge variant="outline">{risk.category}</Badge>
                    </div>
                    <Badge variant={risk.status === 'active' ? 'destructive' : 'secondary'}>
                      {risk.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Probability:</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={risk.probability * 100} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{Math.round(risk.probability * 100)}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Impact:</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={risk.impact * 100} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{Math.round(risk.impact * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Mitigation Strategies:</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {risk.mitigation.map((strategy, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid gap-4">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2">{opportunity.title}</h3>
                      <p className="text-sm text-slate-600">{opportunity.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{opportunity.category}</Badge>
                      <Badge className={
                        opportunity.effort === 'low' ? 'bg-green-50 text-green-600' :
                        opportunity.effort === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-red-50 text-red-600'
                      }>
                        {opportunity.effort} effort
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Potential Impact:</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={opportunity.potentialImpact * 100} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{Math.round(opportunity.potentialImpact * 100)}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={opportunity.confidenceLevel * 100} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{Math.round(opportunity.confidenceLevel * 100)}%</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Timeline:</span>
                      <div className="font-medium">{opportunity.timeline}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalyticsDashboard;