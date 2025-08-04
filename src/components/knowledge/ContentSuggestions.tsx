import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Users, 
  AlertCircle,
  Plus,
  Brain,
  BarChart3,
  Search
} from 'lucide-react';

interface KBArticle {
  id: string;
  title: string;
  views_count: number;
  rating_average: number;
  category?: { name: string };
}

interface ContentGap {
  id: string;
  topic: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  searchVolume: number;
  completeness: number;
}

interface ContentSuggestionsProps {
  articles: KBArticle[];
  onCreateFromSuggestion: () => void;
}

export const ContentSuggestions = ({ articles, onCreateFromSuggestion }: ContentSuggestionsProps) => {
  const [contentGaps, setContentGaps] = useState<ContentGap[]>([]);
  const [popularQueries, setPopularQueries] = useState<string[]>([]);
  const [performanceInsights, setPerformanceInsights] = useState({
    topPerforming: [] as KBArticle[],
    underPerforming: [] as KBArticle[],
    trending: [] as KBArticle[]
  });

  useEffect(() => {
    analyzeContent();
  }, [articles]);

  const analyzeContent = () => {
    // Simulate AI analysis of content gaps
    const gaps: ContentGap[] = [
      {
        id: '1',
        topic: 'Advanced API Authentication',
        priority: 'high',
        reason: 'High search volume, no existing content',
        searchVolume: 150,
        completeness: 0
      },
      {
        id: '2',
        topic: 'Mobile App Integration Guide',
        priority: 'high',
        reason: 'Frequently requested, basic coverage only',
        searchVolume: 120,
        completeness: 25
      },
      {
        id: '3',
        topic: 'Troubleshooting Common Errors',
        priority: 'medium',
        reason: 'Support ticket patterns indicate need',
        searchVolume: 80,
        completeness: 40
      },
      {
        id: '4',
        topic: 'Enterprise Security Best Practices',
        priority: 'medium',
        reason: 'Growing enterprise user base',
        searchVolume: 60,
        completeness: 60
      },
      {
        id: '5',
        topic: 'Data Export and Backup Procedures',
        priority: 'low',
        reason: 'Compliance requirements',
        searchVolume: 30,
        completeness: 80
      }
    ];

    setContentGaps(gaps);

    // Analyze article performance
    const sorted = [...articles].sort((a, b) => b.views_count - a.views_count);
    const topPerforming = sorted.slice(0, 5);
    const underPerforming = sorted.slice(-5).reverse();
    const trending = sorted.filter(article => article.views_count > 50).slice(0, 3);

    setPerformanceInsights({
      topPerforming,
      underPerforming,
      trending
    });

    // Simulate popular search queries
    setPopularQueries([
      'How to set up webhooks',
      'Custom field configuration',
      'Team permissions management',
      'Bulk data import',
      'API rate limits'
    ]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCompletenessColor = (completeness: number) => {
    if (completeness < 30) return 'bg-red-500';
    if (completeness < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">AI Content Suggestions</h2>
        <p className="text-lg text-muted-foreground">
          AI-powered insights to help you create more effective content
        </p>
      </div>

      {/* Content Gaps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Content Gaps & Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contentGaps.map((gap) => (
              <div key={gap.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{gap.topic}</h4>
                    <p className="text-muted-foreground text-sm mt-1">{gap.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(gap.priority)}>
                      {gap.priority} priority
                    </Badge>
                    <Button size="sm" onClick={onCreateFromSuggestion}>
                      <Plus className="h-4 w-4 mr-1" />
                      Create
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="h-4 w-4" />
                      <span className="text-sm font-medium">Search Volume</span>
                    </div>
                    <div className="text-2xl font-bold">{gap.searchVolume}</div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4" />
                      <span className="text-sm font-medium">Content Completeness</span>
                    </div>
                    <div className="space-y-2">
                      <Progress value={gap.completeness} className="h-2" />
                      <span className="text-sm text-muted-foreground">{gap.completeness}% covered</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Top Performing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceInsights.topPerforming.slice(0, 3).map((article, index) => (
                <div key={article.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {article.views_count} views • {article.rating_average.toFixed(1)} rating
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performanceInsights.underPerforming.slice(0, 3).map((article) => (
                <div key={article.id} className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {article.views_count} views • Consider updating
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Brain className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">Create Video Tutorials</p>
                <p className="text-xs text-blue-600">Visual content has 3x higher engagement</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <p className="text-sm font-medium text-purple-800">Add Interactive Examples</p>
                <p className="text-xs text-purple-600">Code samples increase user satisfaction</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">Update Legacy Content</p>
                <p className="text-xs text-green-600">5 articles need version updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Search Queries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Popular Search Queries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {popularQueries.map((query, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={onCreateFromSuggestion}
              >
                <span className="font-medium">{query}</span>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Strategy Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Content Strategy Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Quick Wins</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Add FAQ sections to popular articles
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Include code examples in technical guides
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Create category landing pages
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Add related articles suggestions
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Long-term Strategy</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Develop comprehensive learning paths
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Create role-based content tracks
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Build interactive tutorials
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Implement content versioning
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};