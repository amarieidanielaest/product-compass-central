import { useState } from 'react';
import { MoreHorizontal, Settings, Trash2, Maximize2, BarChart3, PieChart, LineChart, TrendingUp, Database, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';
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

interface ConfigurableWidgetProps {
  config: WidgetConfig;
  onEdit?: (config: WidgetConfig) => void;
  onDelete?: (id: string) => void;
  onResize?: (id: string, size: WidgetConfig['size']) => void;
  className?: string;
}

// Mock data generators based on data source
const generateMockData = (dataSource: string, visualization: string) => {
  switch (dataSource) {
    case 'user_metrics':
      if (visualization === 'metric_card') {
        return { value: 2847, change: 12.5, trend: 'up' };
      }
      return [
        { month: 'Jan', users: 1200, active: 980 },
        { month: 'Feb', users: 1350, active: 1100 },
        { month: 'Mar', users: 1500, active: 1250 },
        { month: 'Apr', users: 1680, active: 1400 },
        { month: 'May', users: 1850, active: 1550 },
        { month: 'Jun', users: 2100, active: 1800 },
      ];
    
    case 'feedback_data':
      if (visualization === 'pie_chart') {
        return [
          { name: 'Feature Request', value: 45, color: 'hsl(var(--primary))' },
          { name: 'Bug Report', value: 30, color: 'hsl(var(--coral))' },
          { name: 'Improvement', value: 25, color: 'hsl(var(--amber))' }
        ];
      }
      return [
        { category: 'Feature Request', count: 45, priority: 'high' },
        { category: 'Bug Report', count: 30, priority: 'critical' },
        { category: 'Improvement', count: 25, priority: 'medium' },
      ];
    
    case 'revenue_data':
      if (visualization === 'metric_card') {
        return { value: 125000, change: 8.2, trend: 'up', format: 'currency' };
      }
      return [
        { month: 'Jan', revenue: 85000, arr: 1020000 },
        { month: 'Feb', revenue: 92000, arr: 1104000 },
        { month: 'Mar', revenue: 98000, arr: 1176000 },
        { month: 'Apr', revenue: 105000, arr: 1260000 },
        { month: 'May', revenue: 118000, arr: 1416000 },
        { month: 'Jun', revenue: 125000, arr: 1500000 },
      ];
    
    default:
      return [];
  }
};

const formatValue = (value: number, format?: string) => {
  if (format === 'currency') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
  return new Intl.NumberFormat('en-US').format(value);
};

export const ConfigurableWidget = ({ config, onEdit, onDelete, onResize, className }: ConfigurableWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const data = generateMockData(config.dataSource, config.visualization);
  
  const sizeClasses = {
    sm: 'col-span-1 row-span-1',
    md: 'col-span-1 md:col-span-2 row-span-1',
    lg: 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2',
    xl: 'col-span-1 md:col-span-2 lg:col-span-4 row-span-2'
  };

  const renderVisualization = () => {
    switch (config.visualization) {
      case 'line_chart':
        return (
          <ChartContainer config={{
            users: { label: "Users", color: "hsl(var(--primary))" },
            active: { label: "Active", color: "hsl(var(--accent))" }
          }}>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsLineChart data={data as any[]}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="active" stroke="hsl(var(--accent))" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      
      case 'bar_chart':
        return (
          <ChartContainer config={{
            count: { label: "Count", color: "hsl(var(--primary))" }
          }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data as any[]}>
                <XAxis dataKey="category" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" className="loom-rounded" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      
      case 'pie_chart':
        return (
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height={200}>
              <RechartsPieChart>
                <Pie
                  data={data as any[]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                >
                  {(data as any[]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </ChartContainer>
        );
      
      case 'metric_card':
        const metricData = data as any;
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <div className="text-3xl font-bold font-headline text-foreground">
              {formatValue(metricData.value, metricData.format)}
            </div>
            <div className={cn(
              "flex items-center space-x-1 text-sm font-body",
              metricData.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
            )}>
              <TrendingUp className={cn(
                "w-4 h-4", 
                metricData.trend === 'down' && 'rotate-180'
              )} />
              <span>{metricData.change}%</span>
            </div>
          </div>
        );
      
      case 'data_table':
        return (
          <div className="space-y-2">
            {(data as any[]).slice(0, 5).map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 loom-rounded bg-muted/30">
                <span className="text-sm font-body">{item.category || item.month}</span>
                <span className="text-sm font-medium">{item.count || item.users || item.revenue}</span>
              </div>
            ))}
          </div>
        );
      
      case 'ai_insight':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium font-body">AI Insight</span>
            </div>
            <p className="text-sm text-muted-foreground font-body">
              Based on recent data patterns, user engagement has increased by 15% this month. 
              Consider expanding successful features to maintain growth momentum.
            </p>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <span className="text-sm font-body">Visualization not implemented</span>
          </div>
        );
    }
  };

  const getVisualizationIcon = () => {
    switch (config.visualization) {
      case 'line_chart': return LineChart;
      case 'bar_chart': return BarChart3;
      case 'pie_chart': return PieChart;
      case 'metric_card': return TrendingUp;
      case 'data_table': return Database;
      case 'ai_insight': return Zap;
      default: return BarChart3;
    }
  };

  const VisualizationIcon = getVisualizationIcon();

  return (
    <Card className={cn(
      'loom-glass border border-border/30 loom-hover-lift transition-all duration-300 overflow-hidden',
      sizeClasses[config.size],
      isExpanded && 'fixed inset-4 z-50 col-span-full row-span-full',
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm font-headline">
          <VisualizationIcon className="w-4 h-4 text-primary" />
          <span>{config.title}</span>
        </CardTitle>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="loom-rounded">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="loom-glass">
            <DropdownMenuItem onClick={() => setIsExpanded(!isExpanded)}>
              <Maximize2 className="w-4 h-4 mr-2" />
              {isExpanded ? 'Minimize' : 'Expand'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(config)}>
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(config.id)} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="flex-1">
        {renderVisualization()}
      </CardContent>
    </Card>
  );
};

export default ConfigurableWidget;