
import { useState } from 'react';
import { DollarSign, CreditCard, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface RevenueMetricsWidgetProps {
  timeframe?: '7d' | '30d' | '90d';
  showCharts?: boolean;
}

const RevenueMetricsWidget = ({ timeframe = '30d', showCharts = true }: RevenueMetricsWidgetProps) => {
  const [activeTab, setActiveTab] = useState('revenue');

  const revenueData = [
    { month: 'Jan', mrr: 45000, arr: 540000, new_revenue: 8500, churn: -2100 },
    { month: 'Feb', mrr: 48500, arr: 582000, new_revenue: 9200, churn: -2400 },
    { month: 'Mar', mrr: 52300, arr: 627600, new_revenue: 10100, churn: -2300 },
    { month: 'Apr', mrr: 56800, arr: 681600, new_revenue: 11200, churn: -2700 },
    { month: 'May', mrr: 61200, arr: 734400, new_revenue: 12100, churn: -2800 },
    { month: 'Jun', mrr: 66500, arr: 798000, new_revenue: 13400, churn: -2900 },
  ];

  const customerMetrics = [
    { month: 'Jan', new_customers: 45, churned: 8, net_new: 37 },
    { month: 'Feb', new_customers: 52, churned: 9, net_new: 43 },
    { month: 'Mar', new_customers: 48, churned: 7, net_new: 41 },
    { month: 'Apr', new_customers: 57, churned: 11, net_new: 46 },
    { month: 'May', new_customers: 63, churned: 12, net_new: 51 },
    { month: 'Jun', new_customers: 68, churned: 10, net_new: 58 },
  ];

  const cohortData = [
    { tier: 'Enterprise', customers: 12, arpu: 2500, ltv: 45000 },
    { tier: 'Professional', customers: 89, arpu: 299, ltv: 8970 },
    { tier: 'Starter', customers: 234, arpu: 49, ltv: 1470 },
    { tier: 'Free', customers: 1456, arpu: 0, ltv: 0 },
  ];

  const chartConfig = {
    mrr: { label: "Monthly Recurring Revenue", color: "#8b5cf6" },
    new_revenue: { label: "New Revenue", color: "#10b981" },
    churn: { label: "Churn", color: "#ef4444" },
    new_customers: { label: "New Customers", color: "#06b6d4" },
    churned: { label: "Churned Customers", color: "#f59e0b" },
    arpu: { label: "ARPU", color: "#8b5cf6" }
  };

  const revenueMetrics = [
    { label: 'Monthly Recurring Revenue', value: '$66.5K', change: '+8.6%', trend: 'up', icon: DollarSign },
    { label: 'Annual Recurring Revenue', value: '$798K', change: '+17.1%', trend: 'up', icon: TrendingUp },
    { label: 'Average Revenue per User', value: '$187', change: '+4.2%', trend: 'up', icon: CreditCard },
    { label: 'Customer Lifetime Value', value: '$5,642', change: '+6.8%', trend: 'up', icon: Users },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-green-600" />
          Revenue Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {revenueMetrics.map((metric, index) => (
                <div key={index} className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <metric.icon className="w-4 h-4 text-green-600" />
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-900">{metric.value}</p>
                  <p className="text-xs text-green-700">{metric.label}</p>
                </div>
              ))}
            </div>
            {showCharts && (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <AreaChart data={revenueData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="mrr" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </AreaChart>
              </ChartContainer>
            )}
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            {showCharts && (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart data={customerMetrics}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="new_customers" fill="#06b6d4" />
                  <Bar dataKey="churned" fill="#f59e0b" />
                </BarChart>
              </ChartContainer>
            )}
          </TabsContent>

          <TabsContent value="cohorts" className="space-y-4">
            <div className="space-y-3">
              {cohortData.map((tier, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-blue-900">{tier.tier}</h4>
                    <span className="text-sm text-blue-600">{tier.customers} customers</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-lg font-bold text-blue-900">${tier.arpu}</span>
                      <span className="text-sm text-blue-600 ml-1">ARPU</span>
                    </div>
                    <div>
                      <span className="text-lg font-bold text-blue-900">${tier.ltv.toLocaleString()}</span>
                      <span className="text-sm text-blue-600 ml-1">LTV</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RevenueMetricsWidget;
