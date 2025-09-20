import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  AlertTriangle,
  Lightbulb,
  Calendar,
  Users,
  Activity,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { aiService } from '@/services/api';
import { useAnalytics } from '@/hooks/useAnalytics';
import { PredictiveAnalyticsSetupCard } from './PredictiveAnalyticsSetupCard';

interface PredictiveMetric {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  timeframe: string;
}

interface AIRecommendation {
  id: string;
  type: 'optimization' | 'warning' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  actions: string[];
}

export const PredictiveAnalyticsDashboard = () => {
  const [predictions, setPredictions] = useState<PredictiveMetric[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const { trackFeature } = useAnalytics();

  const handleSetupClick = () => {
    window.open('https://docs.lovable.dev/features/predictive-analytics-setup', '_blank');
  };

  useEffect(() => {
    trackFeature('predictive_analytics_dashboard');
    loadPredictiveAnalytics();
  }, []);

  const loadPredictiveAnalytics = async () => {
    setLoading(true);
    try {
      // Check if AI service is configured by making a test call
      const testResponse = await aiService.generateContent({
        prompt: "Test connection",
        type: "insights",
        context: { test: true }
      });

      if (!testResponse.success) {
        setNeedsSetup(true);
        return;
      }

      // Generate mock predictive data
      const mockPredictions: PredictiveMetric[] = [
        {
          metric: 'Monthly Active Users',
          currentValue: 2847,
          predictedValue: 3420,
          confidence: 0.87,
          trend: 'increasing',
          timeframe: '30 days'
        },
        {
          metric: 'Feature Adoption Rate',
          currentValue: 68,
          predictedValue: 78,
          confidence: 0.82,
          trend: 'increasing',
          timeframe: '14 days'
        },
        {
          metric: 'Churn Risk',
          currentValue: 12.5,
          predictedValue: 9.8,
          confidence: 0.75,
          trend: 'decreasing',
          timeframe: '30 days'
        },
        {
          metric: 'Sprint Velocity',
          currentValue: 42,
          predictedValue: 48,
          confidence: 0.91,
          trend: 'increasing',
          timeframe: '21 days'
        }
      ];

      const mockRecommendations: AIRecommendation[] = [
        {
          id: '1',
          type: 'opportunity',
          title: 'Optimize Sprint Planning Process',
          description: 'AI analysis shows 23% improvement potential in sprint velocity through better story point estimation.',
          impact: 'high',
          effort: 'medium',
          confidence: 0.84,
          actions: [
            'Implement AI-assisted story point estimation',
            'Add velocity tracking to sprint boards',
            'Create planning poker integration'
          ]
        },
        {
          id: '2',
          type: 'warning',
          title: 'Feature Adoption Plateau Risk',
          description: 'Customer portal usage growth is slowing. Risk of adoption plateau in 2-3 weeks.',
          impact: 'medium',
          effort: 'low',
          confidence: 0.78,
          actions: [
            'Launch targeted onboarding campaign',
            'Add in-app feature highlights',
            'Improve mobile experience'
          ]
        },
        {
          id: '3',
          type: 'optimization',
          title: 'Roadmap Prioritization Enhancement',
          description: 'ML models suggest reordering roadmap items could increase customer satisfaction by 15%.',
          impact: 'high',
          effort: 'low',
          confidence: 0.92,
          actions: [
            'Move mobile features up in priority',
            'Bundle integration requests',
            'Accelerate performance improvements'
          ]
        }
      ];

      // Generate forecast data
      const mockForecast = generateForecastData();

      setPredictions(mockPredictions);
      setRecommendations(mockRecommendations);
      setForecastData(mockForecast);
    } catch (error) {
      console.error('Failed to load predictive analytics:', error);
      // If it's a connection or setup issue, show setup card
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('API key') || errorMessage.includes('configuration') || errorMessage.includes('401')) {
        setNeedsSetup(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateForecastData = () => {
    const baseDate = new Date();
    const data = [];
    
    for (let i = -30; i <= 30; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      
      const isHistorical = i <= 0;
      const baseValue = 2847;
      const growth = 0.02; // 2% daily growth
      const noise = Math.random() * 50 - 25;
      
      data.push({
        date: date.toLocaleDateString(),
        historical: isHistorical ? baseValue + (i * baseValue * growth) + noise : null,
        predicted: !isHistorical ? baseValue + (i * baseValue * growth) + noise : null,
        confidence_upper: !isHistorical ? baseValue + (i * baseValue * growth) + noise + 100 : null,
        confidence_lower: !isHistorical ? baseValue + (i * baseValue * growth) + noise - 100 : null,
        isToday: i === 0
      });
    }
    
    return data;
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'optimization': return <TrendingUp className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'opportunity': return <Lightbulb className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  if (needsSetup) {
    return <PredictiveAnalyticsSetupCard onSetupClick={handleSetupClick} />;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI-Powered Predictions</h2>
          <p className="text-muted-foreground">Machine learning insights and forecasts</p>
        </div>
        <Button onClick={loadPredictiveAnalytics} variant="outline" size="sm">
          <Brain className="w-4 h-4 mr-2" />
          Refresh AI Analysis
        </Button>
      </div>

      {/* Predictive Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {predictions.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${
                  metric.trend === 'increasing' ? 'bg-green-100' : 
                  metric.trend === 'decreasing' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${
                    metric.trend === 'increasing' ? 'text-green-600' : 
                    metric.trend === 'decreasing' ? 'text-red-600' : 'text-gray-600'
                  }`} />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(metric.confidence * 100)}% confidence
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{metric.metric}</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">
                    {metric.predictedValue.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground mb-1">
                    (currently {metric.currentValue.toLocaleString()})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Predicted in {metric.timeframe}
                </p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 to-primary"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Growth Forecast
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            What-If Scenarios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                30-Day User Growth Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="confidence_upper"
                      stackId="1"
                      stroke="none"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.1}
                    />
                    <Area
                      type="monotone"
                      dataKey="confidence_lower"
                      stackId="1"
                      stroke="none"
                      fill="white"
                    />
                    <Line
                      type="monotone"
                      dataKey="historical"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  Historical Data
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-primary rounded-full"></div>
                  AI Prediction
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary/20 rounded-full"></div>
                  Confidence Interval
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      rec.type === 'optimization' ? 'bg-blue-100 text-blue-600' :
                      rec.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {getTypeIcon(rec.type)}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getImpactColor(rec.impact)}>
                            {rec.impact} impact
                          </Badge>
                          <Badge variant="outline">
                            {Math.round(rec.confidence * 100)}% confidence
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground">{rec.description}</p>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Suggested Actions:</p>
                        <ul className="space-y-1">
                          {rec.actions.map((action, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-muted-foreground">
                          Effort: <span className="font-medium">{rec.effort}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          Implement Suggestion
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scenarios">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Scenario: Accelerated Mobile Launch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Impact of launching mobile features 4 weeks earlier:
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-green-600">+28% adoption</div>
                      <div className="text-muted-foreground">Mobile users</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">+15% satisfaction</div>
                      <div className="text-muted-foreground">Customer NPS</div>
                    </div>
                    <div>
                      <div className="font-medium text-red-600">+2 weeks</div>
                      <div className="text-muted-foreground">Dev timeline</div>
                    </div>
                    <div>
                      <div className="font-medium">85% confidence</div>
                      <div className="text-muted-foreground">Prediction accuracy</div>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Run Detailed Analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Scenario: Team Capacity +20%
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Impact of adding 2 developers to the team:
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-green-600">+35% velocity</div>
                      <div className="text-muted-foreground">Sprint delivery</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">+3 features/month</div>
                      <div className="text-muted-foreground">Feature delivery</div>
                    </div>
                    <div>
                      <div className="font-medium text-orange-600">2-3 weeks</div>
                      <div className="text-muted-foreground">Onboarding time</div>
                    </div>
                    <div>
                      <div className="font-medium">78% confidence</div>
                      <div className="text-muted-foreground">Prediction accuracy</div>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="w-full">
                  Run Detailed Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};