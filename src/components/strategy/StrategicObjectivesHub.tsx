import React, { useState } from 'react';
import { Target, Edit3, Save, Plus, X, Layers, Globe, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StrategicObjective {
  id: string;
  title: string;
  description: string;
  pillar: 'market-expansion' | 'operational-excellence' | 'customer-delight' | 'innovation';
  timeframe: string;
  owner: string;
  status: 'active' | 'planning' | 'completed' | 'archived';
  parentId?: string;
  children?: string[];
  progress: number;
  kpis: Array<{
    name: string;
    target: string;
    current: string;
    unit: string;
  }>;
}

interface StrategicObjectivesHubProps {
  objectives?: StrategicObjective[];
  onObjectiveUpdate?: (objectives: StrategicObjective[]) => void;
}

const StrategicObjectivesHub = ({ objectives: propObjectives, onObjectiveUpdate }: StrategicObjectivesHubProps) => {
  const [objectives, setObjectives] = useState<StrategicObjective[]>(propObjectives || [
    {
      id: 'obj-001',
      title: 'Become Market Leader in Unified Product Management',
      description: 'Achieve dominant market position by providing the most comprehensive, AI-powered product management platform that unifies strategy, execution, and customer feedback.',
      pillar: 'market-expansion',
      timeframe: '2024-2026',
      owner: 'CEO',
      status: 'active',
      progress: 45,
      kpis: [
        { name: 'Market Share', target: '25%', current: '12%', unit: '%' },
        { name: 'Enterprise Customers', target: '500', current: '180', unit: 'customers' }
      ]
    },
    {
      id: 'obj-002',
      title: 'Drive 30% International Revenue',
      description: 'Expand globally to achieve 30% of total revenue from international markets through localization and regional partnerships.',
      pillar: 'market-expansion',
      timeframe: '2024-2025',
      owner: 'VP Sales',
      status: 'active',
      progress: 22,
      kpis: [
        { name: 'International Revenue', target: '30%', current: '8%', unit: '%' },
        { name: 'Global Regions', target: '8', current: '3', unit: 'regions' }
      ]
    },
    {
      id: 'obj-003',
      title: 'AI-First Product Innovation',
      description: 'Establish industry leadership in AI-powered product management capabilities, setting new standards for intelligent automation.',
      pillar: 'innovation',
      timeframe: '2024-2027',
      owner: 'CTO',
      status: 'active',
      progress: 67,
      kpis: [
        { name: 'AI Features Released', target: '20', current: '8', unit: 'features' },
        { name: 'AI Adoption Rate', target: '85%', current: '42%', unit: '%' }
      ]
    }
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newObjective, setNewObjective] = useState<Partial<StrategicObjective>>({
    title: '',
    description: '',
    pillar: 'market-expansion',
    timeframe: '',
    owner: '',
    status: 'planning',
    progress: 0,
    kpis: []
  });

  const pillars = [
    { value: 'market-expansion', label: 'Market Expansion', icon: Globe, color: 'bg-blue-100 text-blue-700' },
    { value: 'operational-excellence', label: 'Operational Excellence', icon: TrendingUp, color: 'bg-green-100 text-green-700' },
    { value: 'customer-delight', label: 'Customer Delight', icon: Users, color: 'bg-purple-100 text-purple-700' },
    { value: 'innovation', label: 'Innovation', icon: Layers, color: 'bg-orange-100 text-orange-700' }
  ];

  const getPillarConfig = (pillar: string) => {
    return pillars.find(p => p.value === pillar) || pillars[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'planning': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'archived': return 'bg-gray-50 text-gray-500';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleSaveObjective = (objective: StrategicObjective) => {
    const updatedObjectives = objectives.map(obj => 
      obj.id === objective.id ? objective : obj
    );
    setObjectives(updatedObjectives);
    onObjectiveUpdate?.(updatedObjectives);
    setEditingId(null);
  };

  const handleAddObjective = () => {
    if (newObjective.title && newObjective.description) {
      const objective: StrategicObjective = {
        id: `obj-${Date.now()}`,
        title: newObjective.title,
        description: newObjective.description,
        pillar: newObjective.pillar as any,
        timeframe: newObjective.timeframe || '',
        owner: newObjective.owner || '',
        status: newObjective.status as any,
        progress: newObjective.progress || 0,
        kpis: newObjective.kpis || []
      };
      const updatedObjectives = [...objectives, objective];
      setObjectives(updatedObjectives);
      onObjectiveUpdate?.(updatedObjectives);
      setNewObjective({
        title: '',
        description: '',
        pillar: 'market-expansion',
        timeframe: '',
        owner: '',
        status: 'planning',
        progress: 0,
        kpis: []
      });
      setShowAddDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Strategic Objectives Hub</h2>
          <p className="text-gray-600 mt-1">Multi-year strategic goals aligned with company vision</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Strategic Objective
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add New Strategic Objective</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Objective Title</label>
                  <Input
                    value={newObjective.title}
                    onChange={(e) => setNewObjective(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter strategic objective..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Strategic Pillar</label>
                  <Select 
                    value={newObjective.pillar} 
                    onValueChange={(value) => setNewObjective(prev => ({ ...prev, pillar: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pillars.map(pillar => (
                        <SelectItem key={pillar.value} value={pillar.value}>
                          {pillar.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newObjective.description}
                  onChange={(e) => setNewObjective(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the strategic objective..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Timeframe</label>
                  <Input
                    value={newObjective.timeframe}
                    onChange={(e) => setNewObjective(prev => ({ ...prev, timeframe: e.target.value }))}
                    placeholder="2024-2026"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Owner</label>
                  <Input
                    value={newObjective.owner}
                    onChange={(e) => setNewObjective(prev => ({ ...prev, owner: e.target.value }))}
                    placeholder="CEO, CTO, etc."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={newObjective.status} 
                    onValueChange={(value) => setNewObjective(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddObjective}>
                  Add Objective
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Strategic Pillars Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {pillars.map(pillar => {
          const count = objectives.filter(obj => obj.pillar === pillar.value && obj.status === 'active').length;
          const Icon = pillar.icon;
          return (
            <Card key={pillar.value} className="border-2 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${pillar.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{pillar.label}</h3>
                    <p className="text-sm text-gray-500">{count} active objectives</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Objectives List */}
      <div className="space-y-4">
        {objectives.map((objective) => {
          const pillarConfig = getPillarConfig(objective.pillar);
          const Icon = pillarConfig.icon;
          const isEditing = editingId === objective.id;
          
          return (
            <Card key={objective.id} className="border-2 hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${pillarConfig.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{objective.title}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(objective.status)}>
                          {objective.status}
                        </Badge>
                        <Badge variant="outline">{objective.timeframe}</Badge>
                        <span className="text-sm text-gray-500">• {objective.owner}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingId(isEditing ? null : objective.id)}
                  >
                    {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{objective.description}</p>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{objective.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${objective.progress}%` }}
                    />
                  </div>
                </div>

                {/* KPIs */}
                {objective.kpis.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {objective.kpis.map((kpi, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-medium text-gray-900 text-sm">{kpi.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-lg font-bold text-blue-600">{kpi.current}</span>
                          <span className="text-sm text-gray-500">/ {kpi.target} {kpi.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StrategicObjectivesHub;