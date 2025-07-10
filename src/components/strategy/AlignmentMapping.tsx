import React, { useState } from 'react';
import { GitBranch, Target, Package, CheckCircle, AlertCircle, ArrowRight, Layers, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AlignmentNode {
  id: string;
  title: string;
  type: 'strategic' | 'okr' | 'initiative' | 'epic' | 'story';
  status: 'on-track' | 'at-risk' | 'blocked' | 'completed';
  progress: number;
  children: string[];
  parentId?: string;
  owner: string;
  effort?: string;
  businessValue?: 'low' | 'medium' | 'high' | 'critical';
}

interface AlignmentMappingProps {
  onNavigateToItem?: (itemId: string, type: string) => void;
}

const AlignmentMapping = ({ onNavigateToItem }: AlignmentMappingProps) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'matrix'>('tree');

  // Sample alignment data - represents the golden thread from strategy to execution
  const alignmentData: AlignmentNode[] = [
    {
      id: 'strategic-001',
      title: 'Become Market Leader in Unified Product Management',
      type: 'strategic',
      status: 'on-track',
      progress: 45,
      children: ['okr-001', 'okr-002'],
      owner: 'CEO'
    },
    {
      id: 'okr-001',
      title: 'Achieve 25% Market Share by Q4 2024',
      type: 'okr',
      status: 'on-track',
      progress: 38,
      children: ['init-001', 'init-002'],
      parentId: 'strategic-001',
      owner: 'VP Product'
    },
    {
      id: 'okr-002',
      title: 'Launch AI-First Product Suite',
      type: 'okr',
      status: 'at-risk',
      progress: 52,
      children: ['init-003'],
      parentId: 'strategic-001',
      owner: 'CTO'
    },
    {
      id: 'init-001',
      title: 'Enterprise Customer Acquisition',
      type: 'initiative',
      status: 'on-track',
      progress: 65,
      children: ['epic-001', 'epic-002'],
      parentId: 'okr-001',
      owner: 'Sales Team',
      businessValue: 'critical'
    },
    {
      id: 'init-002',
      title: 'Product-Led Growth Optimization',
      type: 'initiative',
      status: 'on-track',
      progress: 72,
      children: ['epic-003'],
      parentId: 'okr-001',
      owner: 'Growth Team',
      businessValue: 'high'
    },
    {
      id: 'init-003',
      title: 'AI Copilot Development',
      type: 'initiative',
      status: 'at-risk',
      progress: 30,
      children: ['epic-004', 'epic-005'],
      parentId: 'okr-002',
      owner: 'AI Team',
      businessValue: 'critical'
    },
    {
      id: 'epic-001',
      title: 'Enterprise SSO & Security',
      type: 'epic',
      status: 'completed',
      progress: 100,
      children: [],
      parentId: 'init-001',
      owner: 'Platform Team',
      effort: '8 weeks',
      businessValue: 'high'
    },
    {
      id: 'epic-002',
      title: 'Enterprise Onboarding Flow',
      type: 'epic',
      status: 'on-track',
      progress: 75,
      children: [],
      parentId: 'init-001',
      owner: 'UX Team',
      effort: '6 weeks',
      businessValue: 'medium'
    },
    {
      id: 'epic-003',
      title: 'Self-Service Analytics Dashboard',
      type: 'epic',
      status: 'on-track',
      progress: 90,
      children: [],
      parentId: 'init-002',
      owner: 'Analytics Team',
      effort: '4 weeks',
      businessValue: 'high'
    },
    {
      id: 'epic-004',
      title: 'Natural Language Query Interface',
      type: 'epic',
      status: 'blocked',
      progress: 20,
      children: [],
      parentId: 'init-003',
      owner: 'AI Team',
      effort: '12 weeks',
      businessValue: 'critical'
    },
    {
      id: 'epic-005',
      title: 'Smart Recommendation Engine',
      type: 'epic',
      status: 'at-risk',
      progress: 40,
      children: [],
      parentId: 'init-003',
      owner: 'AI Team',
      effort: '10 weeks',
      businessValue: 'high'
    }
  ];

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'strategic': return Target;
      case 'okr': return GitBranch;
      case 'initiative': return Layers;
      case 'epic': return Package;
      case 'story': return CheckCircle;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-700 border-green-200';
      case 'at-risk': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'blocked': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getBusinessValueColor = (value?: string) => {
    switch (value) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAlignmentScore = () => {
    const totalItems = alignmentData.length;
    const alignedItems = alignmentData.filter(item => item.parentId || item.children.length > 0).length;
    return Math.round((alignedItems / totalItems) * 100);
  };

  const renderTreeView = () => {
    const rootNodes = alignmentData.filter(node => !node.parentId);
    
    const renderNode = (node: AlignmentNode, level: number = 0) => {
      const Icon = getNodeIcon(node.type);
      const children = alignmentData.filter(child => child.parentId === node.id);
      const isSelected = selectedNode === node.id;
      
      return (
        <div key={node.id} className="space-y-2">
          <div 
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            style={{ marginLeft: `${level * 24}px` }}
            onClick={() => setSelectedNode(isSelected ? null : node.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {level > 0 && <ArrowRight className="w-4 h-4 text-gray-400" />}
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{node.title}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getStatusColor(node.status)} variant="outline">
                      {node.status.replace('-', ' ')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {node.type}
                    </Badge>
                    {node.businessValue && (
                      <Badge className={getBusinessValueColor(node.businessValue)} variant="outline">
                        {node.businessValue} value
                      </Badge>
                    )}
                    <span className="text-sm text-gray-500">• {node.owner}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">{node.progress}%</div>
                {node.effort && <div className="text-sm text-gray-500">{node.effort}</div>}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    node.status === 'completed' ? 'bg-green-500' :
                    node.status === 'on-track' ? 'bg-blue-500' :
                    node.status === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${node.progress}%` }}
                />
              </div>
            </div>
          </div>
          
          {children.map(child => renderNode(child, level + 1))}
        </div>
      );
    };
    
    return (
      <div className="space-y-4">
        {rootNodes.map(node => renderNode(node))}
      </div>
    );
  };

  const renderMatrixView = () => {
    const strategicNodes = alignmentData.filter(node => node.type === 'strategic');
    const okrNodes = alignmentData.filter(node => node.type === 'okr');
    const initiativeNodes = alignmentData.filter(node => node.type === 'initiative');
    const epicNodes = alignmentData.filter(node => node.type === 'epic');

    return (
      <div className="space-y-6">
        {strategicNodes.map(strategic => {
          const relatedOKRs = okrNodes.filter(okr => okr.parentId === strategic.id);
          
          return (
            <Card key={strategic.id} className="border-2">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span>{strategic.title}</span>
                  <Badge className={getStatusColor(strategic.status)}>
                    {strategic.progress}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {relatedOKRs.map(okr => {
                    const relatedInitiatives = initiativeNodes.filter(init => init.parentId === okr.id);
                    
                    return (
                      <div key={okr.id} className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-blue-900">{okr.title}</h4>
                            <Badge className={getStatusColor(okr.status)}>
                              {okr.progress}%
                            </Badge>
                          </div>
                        </div>
                        
                        {relatedInitiatives.map(initiative => {
                          const relatedEpics = epicNodes.filter(epic => epic.parentId === initiative.id);
                          
                          return (
                            <div key={initiative.id} className="ml-4 space-y-3">
                              <div className="p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-green-900">{initiative.title}</h5>
                                  <Badge className={getStatusColor(initiative.status)}>
                                    {initiative.progress}%
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="ml-4 space-y-2">
                                {relatedEpics.map(epic => (
                                  <div key={epic.id} className="p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">{epic.title}</span>
                                      <div className="flex items-center space-x-2">
                                        <Badge className={getStatusColor(epic.status)} variant="outline">
                                          {epic.progress}%
                                        </Badge>
                                        {epic.businessValue && (
                                          <Badge className={getBusinessValueColor(epic.businessValue)} variant="outline">
                                            {epic.businessValue}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Alignment Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Strategic Objectives</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active OKRs</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Initiatives</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">At Risk Items</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alignment Visualization */}
      <Card>
        <CardContent className="p-6">
          {viewMode === 'tree' ? renderTreeView() : renderMatrixView()}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlignmentMapping;