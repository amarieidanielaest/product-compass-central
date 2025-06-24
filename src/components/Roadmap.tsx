
import { Calendar, Clock, User, Plus, Target, Layers, Brain, ExternalLink, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const Roadmap = () => {
  // Strategic roadmap - high-level outcomes and themes
  const strategicRoadmap = [
    {
      quarter: 'Q2 2024',
      theme: 'Product-Led Growth Foundation',
      outcomes: [
        { title: 'Increase User Activation', target: '40% activation rate', progress: 72, linkedDeliverables: 3 },
        { title: 'Reduce Time-to-Value', target: '<60s first value', progress: 45, linkedDeliverables: 2 }
      ]
    },
    {
      quarter: 'Q3 2024', 
      theme: 'Unified Experience',
      outcomes: [
        { title: 'Cross-Product Integration', target: '50% cross-usage', progress: 23, linkedDeliverables: 4 },
        { title: 'Enterprise Scalability', target: '99.9% uptime', progress: 67, linkedDeliverables: 3 }
      ]
    },
    {
      quarter: 'Q4 2024',
      theme: 'AI-Powered Intelligence', 
      outcomes: [
        { title: 'Intelligent Automation', target: '75% auto-processing', progress: 12, linkedDeliverables: 5 },
        { title: 'Predictive Insights', target: '90% accuracy', progress: 8, linkedDeliverables: 2 }
      ]
    }
  ];

  // Delivery roadmap - specific features and implementations
  const deliveryRoadmap = [
    {
      name: 'Q2 2024',
      features: [
        { 
          title: 'Self-Service Onboarding v2', 
          status: 'in-progress', 
          assignee: 'Alex Chen', 
          priority: 'high',
          linkedStrategic: 'Increase User Activation',
          businessValue: 'high',
          effort: '3 sprints',
          aiSuggestion: 'Consider A/B testing welcome flows'
        },
        { 
          title: 'Smart Feedback Processing', 
          status: 'completed', 
          assignee: 'Sarah Kim', 
          priority: 'high',
          linkedStrategic: 'Reduce Time-to-Value',
          businessValue: 'high',
          effort: '2 sprints'
        },
        { 
          title: 'Mobile Experience Enhancement', 
          status: 'planned', 
          assignee: 'Mike Johnson', 
          priority: 'medium',
          linkedStrategic: 'Increase User Activation',
          businessValue: 'medium',
          effort: '1.5 sprints'
        },
      ],
    },
    {
      name: 'Q3 2024',
      features: [
        { 
          title: 'Cross-Product Navigation', 
          status: 'planned', 
          assignee: 'Emily Rodriguez', 
          priority: 'high',
          linkedStrategic: 'Cross-Product Integration',
          businessValue: 'high',
          effort: '2 sprints',
          aiSuggestion: 'Leverage user behavior data for optimal flow'
        },
        { 
          title: 'Enterprise SSO Integration', 
          status: 'planned', 
          assignee: 'David Park', 
          priority: 'high',
          linkedStrategic: 'Enterprise Scalability',
          businessValue: 'high',
          effort: '3 sprints'
        },
        { 
          title: 'Advanced Analytics Dashboard', 
          status: 'planned', 
          assignee: 'Lisa Wong', 
          priority: 'medium',
          linkedStrategic: 'Cross-Product Integration',
          businessValue: 'medium',
          effort: '2.5 sprints'
        },
      ],
    }
  ];

  // Current sprint with enhanced details
  const currentSprint = {
    name: 'Sprint 24',
    startDate: '2024-01-15',
    endDate: '2024-01-29',
    progress: 65,
    linkedStrategicOutcomes: 2,
    aiRecommendations: 3,
    tasks: [
      { 
        id: 1, 
        title: 'Implement onboarding progress tracking', 
        status: 'completed', 
        assignee: 'Alex',
        linkedStrategic: 'Increase User Activation',
        businessImpact: 'high'
      },
      { 
        id: 2, 
        title: 'Add smart feedback categorization', 
        status: 'in-progress', 
        assignee: 'Sarah',
        linkedStrategic: 'Reduce Time-to-Value',
        businessImpact: 'high'
      },
      { 
        id: 3, 
        title: 'Optimize dashboard load times', 
        status: 'in-progress', 
        assignee: 'Mike',
        linkedStrategic: 'Enterprise Scalability',
        businessImpact: 'medium'
      },
      { 
        id: 4, 
        title: 'Design cross-product navigation', 
        status: 'todo', 
        assignee: 'Emily',
        linkedStrategic: 'Cross-Product Integration',
        businessImpact: 'high'
      },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'planned':
        return 'bg-gray-100 text-gray-700';
      case 'todo':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getBusinessValueColor = (value: string) => {
    switch (value) {
      case 'high':
        return 'bg-emerald-100 text-emerald-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Product Roadmap & Execution</h2>
        <div className="flex items-center space-x-4 text-sm text-slate-600">
          <span className="flex items-center">
            <Target className="w-4 h-4 mr-1" />
            Strategic & Delivery Alignment
          </span>
          <span className="flex items-center">
            <Brain className="w-4 h-4 mr-1 text-purple-600" />
            AI-powered insights
          </span>
        </div>
      </div>

      <Tabs defaultValue="strategic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="strategic" className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Strategic Roadmap
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center">
            <Layers className="w-4 h-4 mr-2" />
            Delivery Roadmap
          </TabsTrigger>
          <TabsTrigger value="current" className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Current Sprint
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Strategic Outcomes & Themes
                </div>
                <Button variant="outline" size="sm">
                  <Brain className="w-4 h-4 mr-1" />
                  AI Strategy Review
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {strategicRoadmap.map((quarter, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">{quarter.quarter}</h3>
                        <p className="text-purple-600 font-medium">{quarter.theme}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {quarter.outcomes.map((outcome, outcomeIndex) => (
                        <div key={outcomeIndex} className="p-4 bg-white border rounded-lg shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-slate-900">{outcome.title}</h4>
                              <p className="text-sm text-slate-600 mt-1">Target: {outcome.target}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="bg-blue-50">
                                {outcome.linkedDeliverables} deliverables
                              </Badge>
                              <ArrowRight className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex-1 mr-4">
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${outcome.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-slate-700">{outcome.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-blue-600" />
                  Delivery Roadmap
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Strategic
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deliveryRoadmap.map((quarter, index) => (
                  <div key={index} className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">{quarter.name}</h3>
                    {quarter.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <h4 className="font-medium text-slate-900 mb-2">{feature.title}</h4>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                            {feature.status.replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feature.priority)}`}>
                            {feature.priority}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs text-slate-600">
                          <div className="flex justify-between">
                            <span>Business Value:</span>
                            <span className={`px-1 py-0.5 rounded text-xs ${getBusinessValueColor(feature.businessValue)}`}>
                              {feature.businessValue}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Effort:</span>
                            <span>{feature.effort}</span>
                          </div>
                          {feature.linkedStrategic && (
                            <div className="flex justify-between">
                              <span>Strategic Link:</span>
                              <span className="text-purple-600 font-medium">{feature.linkedStrategic}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center text-xs text-slate-500 mt-3">
                          <User className="w-3 h-3 mr-1" />
                          {feature.assignee}
                        </div>

                        {feature.aiSuggestion && (
                          <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded text-xs">
                            <span className="flex items-center text-purple-700">
                              <Brain className="w-3 h-3 mr-1" />
                              AI: {feature.aiSuggestion}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="current" className="space-y-6">
          {/* Enhanced Current Sprint */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Current Sprint: {currentSprint.name}
                </div>
                <div className="text-sm text-slate-600">
                  {currentSprint.startDate} - {currentSprint.endDate}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-900">{currentSprint.progress}%</div>
                  <div className="text-sm text-blue-700">Sprint Progress</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-900">{currentSprint.linkedStrategicOutcomes}</div>
                  <div className="text-sm text-purple-700">Strategic Links</div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-900">{currentSprint.aiRecommendations}</div>
                  <div className="text-sm text-emerald-700">AI Recommendations</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${currentSprint.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSprint.tasks.map((task) => (
                  <div key={task.id} className="p-4 bg-slate-50 rounded-lg border">
                    <h4 className="font-medium text-slate-900 mb-2">{task.title}</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                      <div className="flex items-center text-xs text-slate-500">
                        <User className="w-3 h-3 mr-1" />
                        {task.assignee}
                      </div>
                    </div>
                    {task.linkedStrategic && (
                      <div className="text-xs text-purple-600 mb-1">
                        → {task.linkedStrategic}
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Impact:</span>
                      <span className={`px-1 py-0.5 rounded ${getBusinessValueColor(task.businessImpact)}`}>
                        {task.businessImpact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Roadmap;
