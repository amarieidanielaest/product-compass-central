import { useState } from 'react';
import { Plus, Settings, BarChart3, PieChart, LineChart, TrendingUp, Users, Target, DollarSign, Activity, Zap, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WidgetConfig {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'ai-insight';
  title: string;
  dataSource: string;
  visualization: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  filters?: Record<string, any>;
  customOptions?: Record<string, any>;
}

interface WidgetManagerProps {
  onAddWidget: (config: WidgetConfig) => void;
  className?: string;
}

const availableDataSources = [
  { 
    id: 'user_metrics', 
    name: 'User Metrics',
    icon: Users,
    columns: ['user_count', 'active_users', 'new_signups', 'retention_rate', 'churn_rate'],
    tables: ['profiles', 'user_roles']
  },
  { 
    id: 'feedback_data', 
    name: 'Feedback Analytics',
    icon: Activity,
    columns: ['title', 'status', 'priority', 'category', 'upvotes_count', 'created_at'],
    tables: ['feedback_items']
  },
  { 
    id: 'roadmap_metrics', 
    name: 'Roadmap Progress',
    icon: Target,
    columns: ['title', 'status', 'priority', 'estimated_date', 'completion_date', 'category'],
    tables: ['roadmap_items']
  },
  { 
    id: 'revenue_data', 
    name: 'Revenue Metrics',
    icon: DollarSign,
    columns: ['monthly_revenue', 'arr', 'mrr', 'churn_revenue', 'expansion_revenue'],
    tables: ['teams', 'pricing_plans']
  },
  { 
    id: 'organization_stats', 
    name: 'Organization Data',
    icon: Database,
    columns: ['name', 'is_active', 'created_at', 'member_count'],
    tables: ['organizations', 'organization_memberships']
  },
  { 
    id: 'help_center_analytics', 
    name: 'Help Center',
    icon: Zap,
    columns: ['title', 'views_count', 'is_featured', 'category_id', 'read_time'],
    tables: ['help_articles', 'help_categories']
  }
];

const visualizationTypes = [
  { id: 'line_chart', name: 'Line Chart', icon: LineChart, types: ['chart'] },
  { id: 'bar_chart', name: 'Bar Chart', icon: BarChart3, types: ['chart'] },
  { id: 'pie_chart', name: 'Pie Chart', icon: PieChart, types: ['chart'] },
  { id: 'metric_card', name: 'Metric Card', icon: TrendingUp, types: ['metric'] },
  { id: 'data_table', name: 'Data Table', icon: Database, types: ['table'] },
  { id: 'ai_insight', name: 'AI Insight', icon: Zap, types: ['ai-insight'] }
];

export const WidgetManager = ({ onAddWidget, className }: WidgetManagerProps) => {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('chart');
  const [selectedDataSource, setSelectedDataSource] = useState<string>('');
  const [selectedVisualization, setSelectedVisualization] = useState<string>('');
  const [widgetTitle, setWidgetTitle] = useState<string>('');
  const [widgetSize, setWidgetSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  const handleCreateWidget = () => {
    if (!selectedDataSource || !selectedVisualization || !widgetTitle) return;

    const config: WidgetConfig = {
      id: `widget_${Date.now()}`,
      type: selectedType as WidgetConfig['type'],
      title: widgetTitle,
      dataSource: selectedDataSource,
      visualization: selectedVisualization,
      size: widgetSize,
      filters: {},
      customOptions: {}
    };

    onAddWidget(config);
    setOpen(false);
    
    // Reset form
    setSelectedDataSource('');
    setSelectedVisualization('');
    setWidgetTitle('');
    setWidgetSize('md');
  };

  const filteredVisualizations = visualizationTypes.filter(viz => 
    viz.types.includes(selectedType)
  );

  const selectedDataSourceInfo = availableDataSources.find(ds => ds.id === selectedDataSource);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="loom-accent" 
          className={cn("loom-rounded loom-hover-scale transition-all duration-200", className)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Widget
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto loom-glass">
        <DialogHeader>
          <DialogTitle className="flex items-center font-headline text-xl">
            <Settings className="w-5 h-5 mr-2 text-primary" />
            Create New Widget
          </DialogTitle>
        </DialogHeader>

        <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
          <TabsList className="grid w-full grid-cols-4 loom-rounded">
            <TabsTrigger value="chart" className="loom-rounded">Charts</TabsTrigger>
            <TabsTrigger value="metric" className="loom-rounded">Metrics</TabsTrigger>
            <TabsTrigger value="table" className="loom-rounded">Tables</TabsTrigger>
            <TabsTrigger value="ai-insight" className="loom-rounded">AI Insights</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6">
            {/* Widget Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="widget-title" className="text-sm font-medium font-body">
                    Widget Title
                  </Label>
                  <Input
                    id="widget-title"
                    value={widgetTitle}
                    onChange={(e) => setWidgetTitle(e.target.value)}
                    placeholder="Enter widget title..."
                    className="loom-rounded mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium font-body">Widget Size</Label>
                  <Select value={widgetSize} onValueChange={(value: any) => setWidgetSize(value)}>
                    <SelectTrigger className="loom-rounded mt-1">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small (1 column)</SelectItem>
                      <SelectItem value="md">Medium (2 columns)</SelectItem>
                      <SelectItem value="lg">Large (3 columns)</SelectItem>
                      <SelectItem value="xl">Extra Large (4 columns)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium font-body">Data Source</Label>
                  <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                    <SelectTrigger className="loom-rounded mt-1">
                      <SelectValue placeholder="Select data source" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDataSources.map((source) => (
                        <SelectItem key={source.id} value={source.id}>
                          <div className="flex items-center">
                            <source.icon className="w-4 h-4 mr-2" />
                            {source.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium font-body">Visualization</Label>
                  <Select value={selectedVisualization} onValueChange={setSelectedVisualization}>
                    <SelectTrigger className="loom-rounded mt-1">
                      <SelectValue placeholder="Select visualization" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredVisualizations.map((viz) => (
                        <SelectItem key={viz.id} value={viz.id}>
                          <div className="flex items-center">
                            <viz.icon className="w-4 h-4 mr-2" />
                            {viz.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Data Source Details */}
            {selectedDataSourceInfo && (
              <Card className="loom-glass border border-border/30">
                <CardHeader>
                  <CardTitle className="text-sm font-headline flex items-center">
                    <selectedDataSourceInfo.icon className="w-4 h-4 mr-2 text-primary" />
                    Available Data Columns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedDataSourceInfo.columns.map((column) => (
                      <Badge key={column} variant="secondary" className="loom-rounded font-body">
                        {column}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground font-body">
                    Tables: {selectedDataSourceInfo.tables.join(', ')}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Widget Type Content */}
            <TabsContent value="chart" className="space-y-4">
              <Card className="clay-card border border-border/30">
                <CardHeader>
                  <CardTitle className="text-sm font-headline">Chart Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-body">
                    Charts visualize data trends and patterns over time. Select your data source and chart type to create interactive visualizations.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metric" className="space-y-4">
              <Card className="clay-card border border-border/30">
                <CardHeader>
                  <CardTitle className="text-sm font-headline">Metric Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-body">
                    Metric cards display key performance indicators and important numbers at a glance.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="table" className="space-y-4">
              <Card className="clay-card border border-border/30">
                <CardHeader>
                  <CardTitle className="text-sm font-headline">Table Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-body">
                    Data tables provide detailed, sortable views of your data with filtering capabilities.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai-insight" className="space-y-4">
              <Card className="gradient-clarity border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm font-headline flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-primary" />
                    AI Insight Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-body">
                    AI insights analyze your data patterns and provide intelligent recommendations and observations.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-border/30">
            <Button variant="outline" onClick={() => setOpen(false)} className="loom-rounded">
              Cancel
            </Button>
            <Button 
              onClick={handleCreateWidget}
              disabled={!selectedDataSource || !selectedVisualization || !widgetTitle}
              className="loom-rounded loom-hover-scale"
            >
              Create Widget
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WidgetManager;