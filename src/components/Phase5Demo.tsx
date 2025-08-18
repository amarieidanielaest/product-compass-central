import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Book, 
  Search, 
  Lightbulb, 
  MessageCircle, 
  TrendingUp,
  ExternalLink,
  Zap,
  Target,
  Users
} from 'lucide-react';
import { SmartSearch } from './boards/SmartSearch';
import { AIInsightPanel } from './boards/AIInsightPanel';
import { EnhancedKnowledgeBase } from './boards/EnhancedKnowledgeBase';

interface Phase5DemoProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
}

export const Phase5Demo = ({ selectedProductId, onNavigate }: Phase5DemoProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Lightbulb className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Phase 5: AI-Powered Customer Portal</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience the latest enhancements to the unified product management ecosystem with 
          AI insights, smart search, and enhanced knowledge base capabilities.
        </p>
        <Badge variant="secondary" className="px-4 py-2">
          ✨ All New Features Active
        </Badge>
      </div>

      {/* Feature Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="text-center">
            <Brain className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>AI Insights Panel</CardTitle>
            <CardDescription>
              Real-time analysis of feedback patterns, sentiment trends, and actionable recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Sentiment analysis with confidence scores</li>
              <li>• Pattern recognition for categories</li>
              <li>• Automated priority suggestions</li>
              <li>• Trend visualization and forecasting</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-secondary/5">
          <CardHeader className="text-center">
            <Search className="h-12 w-12 mx-auto text-secondary-foreground mb-2" />
            <CardTitle>Smart Search</CardTitle>
            <CardDescription>
              Advanced filtering with search suggestions, active filter management, and instant results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Intelligent search suggestions</li>
              <li>• Multi-dimensional filtering</li>
              <li>• Real-time result updates</li>
              <li>• Advanced date range options</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-accent/5">
          <CardHeader className="text-center">
            <Book className="h-12 w-12 mx-auto text-accent-foreground mb-2" />
            <CardTitle>Enhanced Knowledge Base</CardTitle>
            <CardDescription>
              Comprehensive help center with categorized articles, featured content, and popularity tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Categorized article browsing</li>
              <li>• Featured and popular content</li>
              <li>• Advanced article search</li>
              <li>• Rating and feedback system</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Demo Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Interactive Feature Demo
          </CardTitle>
          <CardDescription>
            Try out each of the new Phase 5 features in this interactive demonstration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="smart-search">Smart Search</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              <TabsTrigger value="knowledge-base">Knowledge Base</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Features</CardTitle>
                    <Lightbulb className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">5</div>
                    <p className="text-xs text-muted-foreground">
                      New Phase 5 enhancements
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
                    <Brain className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">✓</div>
                    <p className="text-xs text-muted-foreground">
                      Real-time analysis ready
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Smart Search</CardTitle>
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">✓</div>
                    <p className="text-xs text-muted-foreground">
                      Advanced filtering active
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Knowledge Base</CardTitle>
                    <Book className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">✓</div>
                    <p className="text-xs text-muted-foreground">
                      Enhanced help center
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">What's New in Phase 5</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">AI-Powered Insights</h4>
                        <p className="text-sm text-muted-foreground">
                          Automated analysis of feedback patterns, sentiment tracking, and predictive recommendations
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Search className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">Smart Search & Filtering</h4>
                        <p className="text-sm text-muted-foreground">
                          Intelligent search suggestions, advanced multi-dimensional filtering, and real-time results
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Book className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">Enhanced Knowledge Base</h4>
                        <p className="text-sm text-muted-foreground">
                          Comprehensive help center with categorized browsing, featured articles, and advanced search
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Target className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Real-time Collaboration</h4>
                        <p className="text-sm text-muted-foreground">
                          Live updates, team collaboration features, and synchronized data across all users
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-secondary-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">Advanced Analytics</h4>
                        <p className="text-sm text-muted-foreground">
                          Comprehensive metrics, trend analysis, and data-driven insights for better decision making
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Users className="h-4 w-4 text-accent-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">Integration Hub</h4>
                        <p className="text-sm text-muted-foreground">
                          Seamless integration with external tools, webhooks, and third-party services
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="smart-search" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Smart Search Demo</h3>
                  <Badge variant="outline">Interactive Demo</Badge>
                </div>
                <p className="text-muted-foreground">
                  Try the new intelligent search and filtering system. This demo shows real search suggestions, 
                  active filter management, and instant result updates.
                </p>
              </div>
              
              <SmartSearch
                onSearchChange={(query, filters) => {
                  console.log('Search:', query, 'Filters:', filters);
                }}
                availableCategories={['Feature Request', 'Bug Report', 'Integration', 'UI/UX', 'Performance', 'Security']}
                availableAssignees={[
                  { id: '1', name: 'Sarah Johnson' },
                  { id: '2', name: 'Mike Chen' },
                  { id: '3', name: 'Alex Rivera' },
                  { id: '4', name: 'Emma Thompson' }
                ]}
                availableTags={['urgent', 'mobile', 'api', 'dashboard', 'auth', 'export', 'analytics']}
                totalResults={42}
              />
            </TabsContent>

            <TabsContent value="ai-insights" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">AI Insights Demo</h3>
                  <Badge variant="outline">Live Analysis</Badge>
                </div>
                <p className="text-muted-foreground">
                  Experience real-time AI analysis of feedback data with sentiment tracking, 
                  pattern recognition, and actionable recommendations.
                </p>
              </div>

              <AIInsightPanel
                boardId="demo-board"
                feedbackItems={[]}
                className="w-full"
              />
            </TabsContent>

            <TabsContent value="knowledge-base" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Enhanced Knowledge Base Demo</h3>
                  <Badge variant="outline">Comprehensive Help</Badge>
                </div>
                <p className="text-muted-foreground">
                  Explore the new knowledge base with categorized articles, advanced search, 
                  featured content, and popularity tracking.
                </p>
              </div>

              <EnhancedKnowledgeBase
                boardId="demo-board"
                className="w-full"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-semibold mb-2">Ready to experience the full portal?</h3>
          <p className="text-muted-foreground mb-4">
            Create your first customer board to unlock all the new AI-powered features in a real environment.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => onNavigate?.('customer')} className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Go to Customer Boards
            </Button>
            <Button variant="outline" onClick={() => onNavigate?.('dashboard')} className="gap-2">
              <TrendingUp className="h-4 w-4" />
              View Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};