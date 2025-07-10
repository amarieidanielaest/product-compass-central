
import React, { useState } from 'react';
import { Target, TrendingUp, Users, Calendar, Package, Globe, Eye, Layers, ExternalLink, Brain, Zap, Edit3, Save, X, Plus, Sparkles, ChevronDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { H1, H2, H3, H4, Body, BodySmall, Muted } from '@/components/ui/typography';
import { PageContainer, PageContent, Section, Grid, Stack } from '@/components/PageLayout';
import OKRAlignmentWidget from './widgets/OKRAlignmentWidget';
import StrategicObjectivesHub from './strategy/StrategicObjectivesHub';
import AlignmentMapping from './strategy/AlignmentMapping';
import PortfolioHealthDashboard from './strategy/PortfolioHealthDashboard';
import ResourceManagement from './strategy/ResourceManagement';
import ExecutiveReporting from './strategy/ExecutiveReporting';
import QuickActions from './QuickActions';

interface StrategyProps {
  selectedProductId?: string;
  onNavigate?: (module: string) => void;
}

const Strategy = ({ selectedProductId, onNavigate }: StrategyProps) => {
  // Edit states
  const [isEditingVision, setIsEditingVision] = useState(false);
  const [isEditingInitiatives, setIsEditingInitiatives] = useState(false);
  const [editingInitiativeId, setEditingInitiativeId] = useState<string | null>(null);
  const [showAddInitiative, setShowAddInitiative] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);

  // Vision state
  const [visionTitle, setVisionTitle] = useState("Empowering product organizations through unified, AI-driven collaboration");
  const [visionDescription, setVisionDescription] = useState("We create a seamless ecosystem where product strategy, customer feedback, and execution align perfectly, enhanced by intelligent automation that transforms complexity into clarity.");

  // Strategic initiatives state
  const [strategicInitiatives, setStrategicInitiatives] = useState([
    {
      id: 'si-001',
      title: 'Product-Led Growth Expansion',
      description: 'Scale self-service adoption across enterprise and SMB segments',
      progress: 72,
      deadline: 'Q4 2024',
      owner: 'Growth Team',
      linkedOKRs: ['okr-001', 'okr-002'],
      linkedDeliverables: 5,
      status: 'on-track',
      aiInsights: 'Strong momentum in user activation metrics'
    },
    {
      id: 'si-002', 
      title: 'Unified Customer Experience',
      description: 'Create seamless cross-product user journey with AI assistance',
      progress: 55,
      deadline: 'Q3 2024',
      owner: 'Product Team',
      linkedOKRs: ['okr-003'],
      linkedDeliverables: 8,
      status: 'needs-attention',
      aiInsights: 'Integration complexity higher than estimated'
    }
  ]);

  // New initiative form state
  const [newInitiative, setNewInitiative] = useState({
    title: '',
    description: '',
    deadline: '',
    owner: '',
    status: 'planned'
  });

  // Delivery roadmap items linked to strategic initiatives
  const deliveryItems = [
    {
      id: 'del-001',
      title: 'Self-Service Onboarding v2',
      quarter: 'Q2 2024',
      status: 'in-progress',
      linkedStrategic: 'si-001',
      effort: '3 sprints',
      businessValue: 'high'
    },
    {
      id: 'del-002',  
      title: 'Cross-Product Navigation',
      quarter: 'Q3 2024',
      status: 'planned',
      linkedStrategic: 'si-002',
      effort: '2 sprints', 
      businessValue: 'medium'
    }
  ];

  const portfolioMetrics = [
    { metric: 'Strategic Alignment', current: '89%', target: '95%', trend: 'improving' },
    { metric: 'OKR Progress', current: '67%', target: '80%', trend: 'improving' },
    { metric: 'Initiative Velocity', current: '1.2x', target: '1.5x', trend: 'stable' },
    { metric: 'Cross-Product Synergy', current: '34%', target: '50%', trend: 'improving' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'bg-green-100 text-green-700 border-green-200';
      case 'needs-attention': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'at-risk': return 'bg-red-100 text-red-700 border-red-200';
      case 'planned': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Edit handlers
  const handleSaveVision = () => {
    setIsEditingVision(false);
  };

  const handleUpdateInitiative = (id: string, updates: Partial<typeof strategicInitiatives[0]>) => {
    setStrategicInitiatives(prev => 
      prev.map(init => init.id === id ? { ...init, ...updates } : init)
    );
  };

  const handleAddInitiative = () => {
    if (newInitiative.title && newInitiative.description) {
      const initiative = {
        id: `si-${Date.now()}`,
        ...newInitiative,
        progress: 0,
        linkedOKRs: [],
        linkedDeliverables: 0,
        aiInsights: ''
      };
      setStrategicInitiatives(prev => [...prev, initiative]);
      setNewInitiative({ title: '', description: '', deadline: '', owner: '', status: 'planned' });
      setShowAddInitiative(false);
    }
  };

  const handleDeleteInitiative = (id: string) => {
    setStrategicInitiatives(prev => prev.filter(init => init.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">Strategy</h1>
          <p className="text-gray-600 mt-1">Define objectives, track alignment, and manage your strategic portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              onClick={() => setShowAIInsights(!showAIInsights)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI-powered insights
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            {showAIInsights && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Strong Alignment</p>
                      <p className="text-xs text-gray-600">87% of initiatives are linked to strategic objectives</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Resource Opportunity</p>
                      <p className="text-xs text-gray-600">Mobile initiatives are under-resourced by 23%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Trend Alert</p>
                      <p className="text-xs text-gray-600">Portfolio health improved 12% this quarter</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Quick Create
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      <Tabs defaultValue="objectives" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="objectives" className="flex items-center">
            <Target className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Objectives</span>
          </TabsTrigger>
          <TabsTrigger value="alignment" className="flex items-center">
            <Layers className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Alignment</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center">
            <Globe className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Resources</span>
          </TabsTrigger>
          <TabsTrigger value="reporting" className="flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Reporting</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="objectives" className="mt-8">
          <StrategicObjectivesHub />
        </TabsContent>

        <TabsContent value="alignment" className="mt-8">
          <AlignmentMapping />
        </TabsContent>

        <TabsContent value="portfolio" className="mt-8">
          <PortfolioHealthDashboard />
        </TabsContent>

        <TabsContent value="resources" className="mt-8">
          <ResourceManagement />
        </TabsContent>

        <TabsContent value="reporting" className="mt-8">
          <ExecutiveReporting />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default Strategy;