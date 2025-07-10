import React, { useState } from 'react';
import { 
  Target, 
  Layers, 
  Clock, 
  Plus, 
  Filter, 
  Share, 
  Download, 
  Users, 
  ArrowRight, 
  Brain, 
  ExternalLink,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Circle,
  User,
  MessageSquare,
  Settings,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RoadmapProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
}

const Roadmap = ({ selectedProductId, onNavigate }: RoadmapProps) => {
  const [viewMode, setViewMode] = useState('timeline');
  const [filterBy, setFilterBy] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Strategic Roadmap Data (Quarterly/Yearly)
  const strategicInitiatives = [
    {
      id: 'si-001',
      title: 'Product-Led Growth Expansion',
      description: 'Scale self-service adoption across enterprise and SMB segments',
      theme: 'Growth',
      timeframe: 'Q3-Q4 2024',
      progress: 72,
      status: 'on-track',
      owner: 'Product Team',
      linkedOKRs: ['Increase activation by 40%', 'Reduce time-to-value < 60s'],
      deliverables: 8,
      capacity: { allocated: 85, required: 100 },
      risks: ['Integration complexity', 'Resource constraints'],
      metrics: {
        userActivation: { current: 32, target: 40 },
        timeToValue: { current: 75, target: 60 }
      }
    },
    {
      id: 'si-002',
      title: 'Unified Customer Experience',
      description: 'Create seamless cross-product user journey with AI assistance',
      theme: 'Experience',
      timeframe: 'Q4 2024',
      progress: 45,
      status: 'needs-attention',
      owner: 'UX Team',
      linkedOKRs: ['Increase cross-product usage by 50%'],
      deliverables: 5,
      capacity: { allocated: 65, required: 80 },
      risks: ['Design system alignment'],
      metrics: {
        crossUsage: { current: 28, target: 50 }
      }
    }
  ];

  // Delivery Roadmap Data (Features & Releases)
  const deliveryRoadmap = [
    {
      id: 'dr-001',
      title: 'Self-Service Onboarding v2',
      type: 'feature',
      status: 'in-progress',
      priority: 'high',
      release: 'Q3 2024',
      assignee: 'Alex Chen',
      team: 'Frontend',
      effort: '5 story points',
      businessValue: 'high',
      linkedStrategic: 'si-001',
      dependencies: [],
      feedback: {
        count: 23,
        sentiment: 'positive'
      },
      progress: 65,
      tasks: {
        total: 12,
        completed: 8,
        inProgress: 3,
        todo: 1
      }
    },
    {
      id: 'dr-002',
      title: 'Cross-Product Navigation',
      type: 'feature',
      status: 'planned',
      priority: 'high',
      release: 'Q4 2024',
      assignee: 'Emily Rodriguez',
      team: 'Platform',
      effort: '8 story points',
      businessValue: 'high',
      linkedStrategic: 'si-002',
      dependencies: ['dr-001'],
      feedback: {
        count: 15,
        sentiment: 'mixed'
      },
      progress: 0,
      tasks: {
        total: 0,
        completed: 0,
        inProgress: 0,
        todo: 0
      }
    },
    {
      id: 'dr-003',
      title: 'AI-Powered Feedback Analysis',
      type: 'epic',
      status: 'planned',
      priority: 'medium',
      release: 'Q4 2024',
      assignee: 'Sarah Kim',
      team: 'AI/ML',
      effort: '13 story points',
      businessValue: 'medium',
      linkedStrategic: 'si-001',
      dependencies: [],
      feedback: {
        count: 8,
        sentiment: 'positive'
      },
      progress: 10,
      tasks: {
        total: 3,
        completed: 0,
        inProgress: 1,
        todo: 2
      }
    }
  ];

  // Integration status for display (simplified)
  const integrationStatus = {
    jira: { connected: true, itemsCount: 45 },
    azureDevops: { connected: true, itemsCount: 23 }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': case 'on-track':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'planned':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'needs-attention':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'at-risk':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBusinessValueColor = (value: string) => {
    switch (value) {
      case 'high':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timeline">Timeline View</SelectItem>
              <SelectItem value="board">Board View</SelectItem>
              <SelectItem value="list">List View</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="strategic">Strategic</SelectItem>
              <SelectItem value="delivery">Delivery</SelectItem>
              <SelectItem value="my-items">My Items</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Roadmap Item</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-gray-600">Create new strategic initiative, feature, or release...</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="strategic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strategic" className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Strategic</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center">
            <Layers className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Delivery</span>
          </TabsTrigger>
          <TabsTrigger value="capacity" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Capacity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategic" className="mt-8 space-y-6">
          {/* Strategic Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Strategic Initiatives & Outcomes
                </div>
                <Button variant="outline" size="sm" onClick={() => onNavigate?.('strategy')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Strategy Hub
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {strategicInitiatives.map((initiative) => (
                  <div key={initiative.id} className="p-6 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{initiative.title}</h3>
                        <p className="text-gray-600 mt-1">{initiative.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="bg-purple-50">
                            {initiative.theme}
                          </Badge>
                          <span className="text-sm text-gray-500">{initiative.timeframe}</span>
                          <span className="text-sm text-gray-500">Owner: {initiative.owner}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(initiative.status)}>
                          {initiative.status.replace('-', ' ')}
                        </Badge>
                        <span className="text-sm font-medium">{initiative.progress}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${initiative.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics and KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-700">Linked Deliverables</div>
                        <div className="text-xl font-bold text-blue-900">{initiative.deliverables}</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-700">Capacity Allocation</div>
                        <div className="text-xl font-bold text-green-900">
                          {initiative.capacity.allocated}%
                        </div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm text-orange-700">Active Risks</div>
                        <div className="text-xl font-bold text-orange-900">{initiative.risks.length}</div>
                      </div>
                    </div>

                    {/* OKRs */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Linked OKRs:</h4>
                      <div className="flex flex-wrap gap-2">
                        {initiative.linkedOKRs.map((okr, index) => (
                          <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700">
                            {okr}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <ArrowRight className="w-4 h-4 mr-2" />
                          View Deliverables
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Comments
                        </Button>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="mt-8 space-y-6">
          {/* Delivery Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-blue-600" />
                  Features & Releases
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onNavigate?.('settings')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage Integrations
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onNavigate?.('customer')}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Customer Feedback
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onNavigate?.('sprints')}>
                    <Clock className="w-4 h-4 mr-2" />
                    Sprint Board
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deliveryRoadmap.map((item) => (
                  <div key={item.id} className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Release: {item.release}</span>
                          <span>Team: {item.team}</span>
                          <span>Effort: {item.effort}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress and Tasks */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="p-2 bg-gray-50 rounded">
                        <div className="text-xs text-gray-600">Progress</div>
                        <div className="text-lg font-bold text-gray-900">{item.progress}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <div className="text-xs text-green-700">Tasks Complete</div>
                        <div className="text-lg font-bold text-green-900">
                          {item.tasks.completed}/{item.tasks.total}
                        </div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded">
                        <div className="text-xs text-blue-700">Customer Feedback</div>
                        <div className="text-lg font-bold text-blue-900">{item.feedback.count}</div>
                      </div>
                    </div>

                    {/* Strategic Link */}
                    {item.linkedStrategic && (
                      <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded">
                        <div className="text-xs text-purple-700 flex items-center">
                          <ArrowRight className="w-3 h-3 mr-1" />
                          Linked to: {strategicInitiatives.find(si => si.id === item.linkedStrategic)?.title}
                        </div>
                      </div>
                    )}

                    {/* Dependencies */}
                    {item.dependencies.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-orange-700 flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Dependencies: {item.dependencies.join(', ')}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View in Jira
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Feedback ({item.feedback.count})
                        </Button>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="w-3 h-3 mr-1" />
                        {item.assignee}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="mt-8 space-y-6">
          {/* Capacity Planning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Team Capacity & Resource Planning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Frontend Team</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Capacity:</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <div className="text-xs text-green-700">3 active initiatives</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Platform Team</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Capacity:</span>
                      <span className="font-medium">65%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }} />
                    </div>
                    <div className="text-xs text-blue-700">2 active initiatives</div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-medium text-orange-900 mb-2">AI/ML Team</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Capacity:</span>
                      <span className="font-medium">90%</span>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '90%' }} />
                    </div>
                    <div className="text-xs text-orange-700">1 active initiative</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Capacity Alert</h4>
                    <p className="text-sm text-yellow-700">AI/ML team is over-allocated by 10%. Consider redistributing or delaying lower-priority work.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Roadmap;