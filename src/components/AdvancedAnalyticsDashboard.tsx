
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, Brain, Download, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { portfolioAnalyticsService, PortfolioInsight, CrossProductMetrics, PortfolioHealthScore } from '@/services/analytics/PortfolioAnalyticsService';
import { useToast } from '@/hooks/use-toast';
import { PredictiveAnalyticsSetupCard } from './analytics/PredictiveAnalyticsSetupCard';

const AdvancedAnalyticsDashboard = () => {
  const [insights, setInsights] = useState<PortfolioInsight[]>([]);
  const [crossProductMetrics, setCrossProductMetrics] = useState<CrossProductMetrics | null>(null);
  const [healthScore, setHealthScore] = useState<PortfolioHealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const { toast } = useToast();

  const handleSetupClick = () => {
    window.open('https://docs.lovable.dev/features/advanced-analytics-setup', '_blank');
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [insightsResponse, metricsResponse, healthResponse] = await Promise.all([
        portfolioAnalyticsService.getPortfolioInsights('30d'),
        portfolioAnalyticsService.getCrossProductMetrics(),
        portfolioAnalyticsService.getPortfolioHealthScore()
      ]);

      if (insightsResponse.data) setInsights(insightsResponse.data);
      if (metricsResponse.data) setCrossProductMetrics(metricsResponse.data);
      if (healthResponse.data) setHealthScore(healthResponse.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        setNeedsSetup(true);
      } else {
        toast({
          title: "Error loading analytics",
          description: "Failed to load portfolio analytics data",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const response = await portfolioAnalyticsService.generatePortfolioReport({
        reportType: 'executive',
        timeRange: '30d',
        includeProducts: ['all'],
        sections: ['overview', 'insights', 'recommendations']
      });

      if (response.data) {
        toast({
          title: "Report Generated",
          description: "Portfolio report is ready for download",
        });
      }
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Unable to generate portfolio report",
        variant: "destructive"
      });
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'risk': return <Target className="w-4 h-4 text-red-600" />;
      case 'recommendation': return <Brain className="w-4 h-4 text-purple-600" />;
      default: return <BarChart3 className="w-4 h-4 text-blue-600" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (needsSetup) {
    return <PredictiveAnalyticsSetupCard onSetupClick={handleSetupClick} />;
  }

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
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Advanced Portfolio Analytics
          </h2>
          <p className="text-slate-600">AI-powered insights and cross-product analysis</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={generateReport}>
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="cross-product">Cross-Product</TabsTrigger>
          <TabsTrigger value="health">Health Score</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Portfolio Health Overview */}
          {healthScore && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
                  Portfolio Health Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {healthScore.overall}
                    </div>
                    <div className="text-sm text-slate-600">Overall Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {healthScore.breakdown.technical}
                    </div>
                    <div className="text-sm text-slate-600">Technical</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {healthScore.breakdown.business}
                    </div>
                    <div className="text-sm text-slate-600">Business</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-2">
                      {healthScore.breakdown.strategic}
                    </div>
                    <div className="text-sm text-slate-600">Strategic</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics */}
          {crossProductMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cross-Product Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {crossProductMetrics.userOverlap.totalCrossProductUsers.toLocaleString()}
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    Users active across multiple products
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cross-Sell Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ${(crossProductMetrics.revenueAttribution.crossSellRevenue / 1000).toFixed(1)}K
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    Revenue from cross-product adoption
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feature Adoption</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(crossProductMetrics.featureAdoption.crossProductFeatures.reduce((avg, f) => avg + f.adoptionRate, 0) / crossProductMetrics.featureAdoption.crossProductFeatures.length)}%
                  </div>
                  <p className="text-sm text-slate-600 mt-2">
                    Average cross-product feature adoption
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getInsightIcon(insight.type)}
                      <h3 className="font-semibold text-slate-900">{insight.title}</h3>
                      {insight.aiGenerated && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          <Brain className="w-3 h-3 mr-1" />
                          AI Generated
                        </Badge>
                      )}
                    </div>
                    <Badge className={`border ${getImpactColor(insight.impact)}`}>
                      {insight.impact}
                    </Badge>
                  </div>
                  
                  <p className="text-slate-600 mb-4">{insight.description}</p>
                  
                  {insight.actionItems.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Recommended Actions:</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {insight.actionItems.map((action, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4 text-xs text-slate-500">
                    <span>Confidence: {Math.round(insight.confidence * 100)}%</span>
                    <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cross-product" className="space-y-6">
          {crossProductMetrics && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Product Overlap Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {crossProductMetrics.userOverlap.productPairs.map((pair, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{pair.productA} ↔ {pair.productB}</h4>
                          <p className="text-sm text-slate-600">{pair.overlapUsers.toLocaleString()} shared users</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-600">
                            {pair.overlapPercentage.toFixed(1)}%
                          </div>
                          <div className="text-xs text-slate-500">overlap rate</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cross-Product Feature Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {crossProductMetrics.featureAdoption.crossProductFeatures.map((feature, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{feature.feature}</h4>
                          <Badge variant="outline">{feature.adoptionRate.toFixed(1)}% adoption</Badge>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">
                          Active in: {feature.products.join(', ')}
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>Satisfaction: {feature.userSatisfaction.toFixed(1)}/5.0</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {healthScore && (
            <Card>
              <CardHeader>
                <CardTitle>Risk Factors & Mitigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthScore.riskFactors.map((risk, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{risk.factor}</h4>
                        <Badge className={`${getImpactColor(risk.severity)}`}>
                          {risk.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{risk.description}</p>
                      <div className="bg-blue-50 p-3 rounded text-sm">
                        <strong>Mitigation:</strong> {risk.mitigation}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
