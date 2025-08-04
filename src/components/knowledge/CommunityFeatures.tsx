import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Star, 
  Award, 
  TrendingUp,
  Eye,
  Heart,
  BookOpen,
  Crown
} from 'lucide-react';

interface KBArticle {
  id: string;
  title: string;
  views_count: number;
  rating_average: number;
  category?: { name: string };
  author?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface CommunityMember {
  id: string;
  name: string;
  avatar_url?: string;
  title: string;
  contributions: number;
  reputation: number;
  badge: string;
}

interface CommunityFeaturesProps {
  articles: KBArticle[];
  onViewArticle: (article: KBArticle) => void;
}

export const CommunityFeatures = ({ articles, onViewArticle }: CommunityFeaturesProps) => {
  const [activeTab, setActiveTab] = useState<'discussions' | 'contributors' | 'leaderboard'>('discussions');

  // Mock community data
  const topContributors: CommunityMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Product Manager',
      contributions: 45,
      reputation: 2850,
      badge: 'Expert',
      avatar_url: undefined
    },
    {
      id: '2',
      name: 'Mike Chen',
      title: 'Senior Developer',
      contributions: 38,
      reputation: 2340,
      badge: 'Mentor',
      avatar_url: undefined
    },
    {
      id: '3',
      name: 'Lisa Rodriguez',
      title: 'Technical Writer',
      contributions: 32,
      reputation: 1980,
      badge: 'Contributor',
      avatar_url: undefined
    },
    {
      id: '4',
      name: 'David Park',
      title: 'Solutions Engineer',
      contributions: 28,
      reputation: 1650,
      badge: 'Helper',
      avatar_url: undefined
    }
  ];

  const recentDiscussions = [
    {
      id: '1',
      title: 'Best practices for API rate limiting',
      author: 'Sarah Johnson',
      replies: 12,
      views: 234,
      lastActive: '2 hours ago',
      tags: ['API', 'Performance']
    },
    {
      id: '2',
      title: 'How to handle large data imports?',
      author: 'Mike Chen',
      replies: 8,
      views: 156,
      lastActive: '4 hours ago',
      tags: ['Data', 'Import']
    },
    {
      id: '3',
      title: 'Custom field validation examples',
      author: 'Lisa Rodriguez',
      replies: 15,
      views: 289,
      lastActive: '6 hours ago',
      tags: ['Validation', 'Forms']
    },
    {
      id: '4',
      title: 'Webhook troubleshooting guide',
      author: 'David Park',
      replies: 6,
      views: 98,
      lastActive: '1 day ago',
      tags: ['Webhooks', 'Integration']
    }
  ];

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'Expert':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'Mentor':
        return <Award className="h-4 w-4 text-purple-500" />;
      case 'Contributor':
        return <Star className="h-4 w-4 text-blue-500" />;
      default:
        return <Heart className="h-4 w-4 text-pink-500" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'Expert':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Mentor':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Contributor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-pink-100 text-pink-800 border-pink-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Community Hub</h2>
        <p className="text-lg text-muted-foreground">
          Connect with other users, share knowledge, and get help from the community
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-sm text-muted-foreground">Active Members</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">3,892</div>
            <p className="text-sm text-muted-foreground">Discussions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{articles.length}</div>
            <p className="text-sm text-muted-foreground">Articles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <ThumbsUp className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">12,436</div>
            <p className="text-sm text-muted-foreground">Total Votes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1 w-fit">
        <Button
          variant={activeTab === 'discussions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('discussions')}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Discussions
        </Button>
        <Button
          variant={activeTab === 'contributors' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('contributors')}
        >
          <Users className="h-4 w-4 mr-2" />
          Contributors
        </Button>
        <Button
          variant={activeTab === 'leaderboard' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('leaderboard')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Leaderboard
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'discussions' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Discussions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDiscussions.map((discussion) => (
                    <div key={discussion.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-lg">{discussion.title}</h4>
                        <div className="flex flex-wrap gap-1">
                          {discussion.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span>by {discussion.author}</span>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {discussion.replies} replies
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {discussion.views} views
                          </div>
                        </div>
                        <span>{discussion.lastActive}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {articles
                    .sort((a, b) => b.views_count - a.views_count)
                    .slice(0, 5)
                    .map((article, index) => (
                      <div 
                        key={article.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                        onClick={() => onViewArticle(article)}
                      >
                        <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{article.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {article.views_count} views
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start a Discussion
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Categories
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Find Experts
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'contributors' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topContributors.map((contributor, index) => (
            <Card key={contributor.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarImage src={contributor.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {contributor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {index < 3 && (
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      'bg-orange-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                  )}
                </div>
                
                <h4 className="font-semibold text-lg mb-1">{contributor.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{contributor.title}</p>
                
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(contributor.badge)}`}>
                  {getBadgeIcon(contributor.badge)}
                  {contributor.badge}
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Contributions:</span>
                    <span className="font-semibold">{contributor.contributions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Reputation:</span>
                    <span className="font-semibold">{contributor.reputation.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>This Month's Top Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <div key={contributor.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' :
                      'bg-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contributor.avatar_url} />
                      <AvatarFallback>
                        {contributor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{contributor.name}</span>
                        {getBadgeIcon(contributor.badge)}
                      </div>
                      <p className="text-sm text-muted-foreground">{contributor.title}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">{contributor.reputation}</div>
                      <div className="text-sm text-muted-foreground">points</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievement Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Expert</h4>
                  <p className="text-sm text-muted-foreground">50+ contributions</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Mentor</h4>
                  <p className="text-sm text-muted-foreground">Help others learn</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Contributor</h4>
                  <p className="text-sm text-muted-foreground">20+ articles</p>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                  <h4 className="font-semibold">Helper</h4>
                  <p className="text-sm text-muted-foreground">Community support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};