
import { useState } from 'react';
import { 
  ArrowLeft, ThumbsUp, MessageCircle, Share, Flag, Tag, 
  Clock, User, Building2, ExternalLink, Edit, Archive,
  Calendar, TrendingUp, Users, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TicketDetailProps {
  ticket: {
    id: string;
    title: string;
    description: string;
    customer: string;
    customerId?: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in-progress' | 'planned' | 'resolved' | 'closed';
    category: 'feature' | 'bug' | 'improvement' | 'integration';
    created: string;
    votes: number;
    comments: number;
    views: number;
    linkedSprint?: string;
    tags: string[];
    submittedBy: string;
    estimatedEffort?: string;
    businessValue?: 'low' | 'medium' | 'high';
  };
  onBack: () => void;
  onNavigate: (module: string) => void;
}

interface Comment {
  id: string;
  author: string;
  role: 'customer' | 'team' | 'admin';
  content: string;
  timestamp: string;
  likes: number;
  isPrivate?: boolean;
}

const TicketDetail = ({ ticket, onBack, onNavigate }: TicketDetailProps) => {
  const [newComment, setNewComment] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const mockComments: Comment[] = [
    {
      id: 'c1',
      author: 'Sarah Tech',
      role: 'customer',
      content: 'This would be incredibly valuable for our workflow. We process large datasets daily and the current export limitation is a major bottleneck.',
      timestamp: '2024-06-14 10:30',
      likes: 8
    },
    {
      id: 'c2',
      author: 'John Smith',
      role: 'team',
      content: 'Thanks for the detailed feedback! We\'re investigating the root cause. Initial analysis suggests it\'s related to memory optimization during large data processing.',
      timestamp: '2024-06-14 14:15',
      likes: 3,
      isPrivate: false
    },
    {
      id: 'c3',
      author: 'Mike Manager',
      role: 'customer',
      content: 'Any timeline estimates? This is blocking our monthly reporting process.',
      timestamp: '2024-06-15 09:20',
      likes: 5
    },
    {
      id: 'c4',
      author: 'Product Team',
      role: 'admin',
      content: 'Update: We\'ve identified the issue and are implementing a streaming solution. Target delivery is Sprint 24 (next 2 weeks).',
      timestamp: '2024-06-16 11:45',
      likes: 12
    }
  ];

  const mockUpdates = [
    {
      timestamp: '2024-06-16 11:45',
      action: 'Status changed to In Progress',
      author: 'Product Team'
    },
    {
      timestamp: '2024-06-15 16:30',
      action: 'Linked to Sprint 24',
      author: 'Product Team'
    },
    {
      timestamp: '2024-06-14 09:15',
      action: 'Priority updated to Critical',
      author: 'Sarah Tech'
    },
    {
      timestamp: '2024-06-14 08:30',
      action: 'Ticket created',
      author: 'Sarah Tech'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'planned': return 'bg-cyan-100 text-cyan-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'customer': return 'bg-blue-100 text-blue-800';
      case 'team': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleVote = () => {
    setHasVoted(!hasVoted);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      console.log('Adding comment:', newComment);
      setNewComment('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Board
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {ticket.id}
                    </Badge>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">{ticket.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {ticket.customer}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {ticket.created}
                    </span>
                    <span className="flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
                      {ticket.customerId || 'Public'}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed mb-4">{ticket.description}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {ticket.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 pt-4 border-t border-slate-100">
                <Button
                  variant={hasVoted ? "default" : "outline"}
                  size="sm"
                  onClick={handleVote}
                  className="flex items-center space-x-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{ticket.votes + (hasVoted ? 1 : 0)}</span>
                </Button>
                <span className="flex items-center space-x-1 text-slate-500">
                  <MessageCircle className="w-4 h-4" />
                  <span>{ticket.comments} comments</span>
                </span>
                <span className="text-slate-500 text-sm">{ticket.views} views</span>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments ({mockComments.length})</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Submitted by</label>
                      <p className="text-slate-900">{ticket.submittedBy}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Category</label>
                      <p className="text-slate-900 capitalize">{ticket.category}</p>
                    </div>
                    {ticket.estimatedEffort && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Estimated Effort</label>
                        <p className="text-slate-900">{ticket.estimatedEffort}</p>
                      </div>
                    )}
                    {ticket.businessValue && (
                      <div>
                        <label className="text-sm font-medium text-slate-600">Business Value</label>
                        <Badge className={ticket.businessValue === 'high' ? 'bg-green-100 text-green-800' : 
                                         ticket.businessValue === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                         'bg-gray-100 text-gray-800'}>
                          {ticket.businessValue}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {ticket.linkedSprint && (
                    <div className="pt-4 border-t border-slate-100">
                      <label className="text-sm font-medium text-slate-600 block mb-2">Development Status</label>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-purple-600 border-purple-200">
                          Linked to {ticket.linkedSprint}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => onNavigate('sprints')}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View Sprint
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              {/* Add Comment */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">
                        Comments are visible to all board members
                      </span>
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comments List */}
              <div className="space-y-4">
                {mockComments.map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-6">
                      <div className="flex space-x-4">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                            {comment.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-slate-900">{comment.author}</span>
                            <Badge className={getRoleColor(comment.role)} variant="outline">
                              {comment.role}
                            </Badge>
                            <span className="text-sm text-slate-500">{comment.timestamp}</span>
                          </div>
                          <p className="text-slate-700 mb-3">{comment.content}</p>
                          <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockUpdates.map((update, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-slate-700">{update.action}</p>
                          <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <span>by {update.author}</span>
                            <span>•</span>
                            <span>{update.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Votes</span>
                <span className="font-semibold">{ticket.votes + (hasVoted ? 1 : 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Comments</span>
                <span className="font-semibold">{mockComments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Views</span>
                <span className="font-semibold">{ticket.views}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Created</span>
                <span className="text-sm">{ticket.created}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Last Updated</span>
                <span className="text-sm">2 hours ago</span>
              </div>
            </CardContent>
          </Card>

          {/* Related Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="w-4 h-4 mr-2" />
                Edit Ticket
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Add to Roadmap
              </Button>
              {!ticket.linkedSprint && (
                <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('sprints')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Link to Sprint
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start">
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </Button>
            </CardContent>
          </Card>

          {/* Similar Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Similar Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">Enhanced export options</p>
                <p className="text-xs text-slate-600">12 votes • Open</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">Bulk data processing improvements</p>
                <p className="text-xs text-slate-600">8 votes • Planned</p>
              </div>
              <Button variant="link" className="text-sm p-0 h-auto">
                View all related feedback →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
