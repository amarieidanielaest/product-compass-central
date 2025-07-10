import React, { useState } from 'react';
import { Download, Share, FileText, Presentation, ExternalLink, Calendar, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'board' | 'qbr' | 'strategy' | 'portfolio';
  lastGenerated?: string;
  frequency: 'quarterly' | 'monthly' | 'on-demand';
  recipients: string[];
  sections: string[];
  status: 'ready' | 'generating' | 'scheduled';
}

interface ShareableDashboard {
  id: string;
  name: string;
  description: string;
  viewType: 'strategic' | 'operational' | 'financial';
  lastAccessed?: string;
  accessLevel: 'public' | 'restricted' | 'confidential';
  viewers: number;
  link: string;
}

interface ExecutiveReportingProps {
  templates?: ReportTemplate[];
  dashboards?: ShareableDashboard[];
}

const ExecutiveReporting = ({ templates: propTemplates, dashboards: propDashboards }: ExecutiveReportingProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null);

  const templates: ReportTemplate[] = propTemplates || [
    {
      id: 'template-001',
      name: 'Quarterly Board Update',
      description: 'Comprehensive quarterly review for board meetings including strategy progress, financial metrics, and key initiatives',
      type: 'board',
      lastGenerated: '2024-09-15',
      frequency: 'quarterly',
      recipients: ['board@company.com', 'ceo@company.com'],
      sections: ['Strategic Progress', 'Financial Performance', 'Key Metrics', 'Risk Assessment', 'Next Quarter Focus'],
      status: 'ready'
    },
    {
      id: 'template-002',
      name: 'Product Strategy Review',
      description: 'Deep dive into product strategy execution, roadmap progress, and competitive positioning',
      type: 'strategy',
      lastGenerated: '2024-09-01',
      frequency: 'quarterly',
      recipients: ['executive-team@company.com'],
      sections: ['Strategic Alignment', 'Roadmap Progress', 'Competitive Analysis', 'Customer Insights', 'Resource Allocation'],
      status: 'ready'
    },
    {
      id: 'template-003',
      name: 'Portfolio Health Report',
      description: 'Monthly overview of product portfolio performance and health metrics',
      type: 'portfolio',
      lastGenerated: '2024-09-20',
      frequency: 'monthly',
      recipients: ['cpo@company.com', 'product-leads@company.com'],
      sections: ['Portfolio Overview', 'Health Metrics', 'Investment Analysis', 'Risk Indicators'],
      status: 'ready'
    },
    {
      id: 'template-004',
      name: 'Company-Wide Strategy Update',
      description: 'Quarterly all-hands presentation on strategy progress and organizational alignment',
      type: 'qbr',
      frequency: 'quarterly',
      recipients: ['all-hands@company.com'],
      sections: ['Vision Progress', 'OKR Status', 'Key Wins', 'Challenges', 'Upcoming Priorities'],
      status: 'scheduled'
    }
  ];

  const dashboards: ShareableDashboard[] = propDashboards || [
    {
      id: 'dash-001',
      name: 'Executive Strategy Dashboard',
      description: 'High-level view of strategic objectives, OKR progress, and portfolio health',
      viewType: 'strategic',
      lastAccessed: '2024-09-22',
      accessLevel: 'restricted',
      viewers: 12,
      link: 'https://strategy.company.com/executive-view'
    },
    {
      id: 'dash-002',
      name: 'Product Portfolio Overview',
      description: 'Real-time portfolio metrics, investment allocation, and performance indicators',
      viewType: 'operational',
      lastAccessed: '2024-09-21',
      accessLevel: 'restricted',
      viewers: 8,
      link: 'https://strategy.company.com/portfolio-view'
    },
    {
      id: 'dash-003',
      name: 'Board Financial Metrics',
      description: 'Financial performance dashboard with ROI, revenue, and investment tracking',
      viewType: 'financial',
      lastAccessed: '2024-09-15',
      accessLevel: 'confidential',
      viewers: 5,
      link: 'https://strategy.company.com/financial-view'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'board': return 'bg-purple-100 text-purple-700';
      case 'qbr': return 'bg-blue-100 text-blue-700';
      case 'strategy': return 'bg-green-100 text-green-700';
      case 'portfolio': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-700';
      case 'generating': return 'bg-yellow-100 text-yellow-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAccessColor = (access: string) => {
    switch (access) {
      case 'public': return 'bg-green-100 text-green-700';
      case 'restricted': return 'bg-yellow-100 text-yellow-700';
      case 'confidential': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleGenerateReport = (templateId: string) => {
    // Simulate report generation
    console.log(`Generating report for template: ${templateId}`);
    // In real implementation, this would trigger the report generation process
  };

  const handleShareDashboard = (dashboardId: string) => {
    setSelectedDashboard(dashboardId);
    setShowShareDialog(true);
  };

  const renderReportTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Report Templates</h3>
          <p className="text-gray-600">Pre-configured reports for executive communication</p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map(template => (
          <Card key={template.id} className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(template.type)}>
                    {template.type.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(template.status)}>
                    {template.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-sm">{template.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Frequency:</span>
                  <span className="font-medium">{template.frequency}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Recipients:</span>
                  <span className="font-medium">{template.recipients.length} recipients</span>
                </div>
                {template.lastGenerated && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Generated:</span>
                    <span className="font-medium">{template.lastGenerated}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Report Sections:</h5>
                <div className="flex flex-wrap gap-1">
                  {template.sections.map((section, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {section}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  size="sm" 
                  onClick={() => handleGenerateReport(template.id)}
                  disabled={template.status === 'generating'}
                >
                  <Presentation className="w-4 h-4 mr-1" />
                  Generate
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderShareableDashboards = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Shareable Dashboards</h3>
          <p className="text-gray-600">Live dashboards for executive and board access</p>
        </div>
        <Button>
          <Share className="w-4 h-4 mr-2" />
          Create Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {dashboards.map(dashboard => (
          <Card key={dashboard.id} className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{dashboard.name}</h4>
                    <Badge className={getTypeColor(dashboard.viewType)}>
                      {dashboard.viewType}
                    </Badge>
                    <Badge className={getAccessColor(dashboard.accessLevel)}>
                      {dashboard.accessLevel}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{dashboard.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Last accessed: {dashboard.lastAccessed}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>{dashboard.viewers} viewers</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(dashboard.link, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShareDashboard(dashboard.id)}
                  >
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Dashboard Link */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Dashboard URL:</div>
                <div className="flex items-center justify-between">
                  <code className="text-sm text-gray-800 bg-white px-2 py-1 rounded border">
                    {dashboard.link}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(dashboard.link)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPresentationExport = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Presentation Export</h3>
        <p className="text-gray-600">Export dashboards and reports to presentation formats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Presentation className="w-5 h-5 mr-2 text-blue-600" />
              PowerPoint Export
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              Export any dashboard view directly to a clean PowerPoint presentation with charts and data.
            </p>
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Features:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatic slide layout</li>
                <li>• Chart export with data</li>
                <li>• Corporate branding</li>
                <li>• Speaker notes included</li>
              </ul>
            </div>
            <Button className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export to PowerPoint
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              PDF Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm">
              Generate comprehensive PDF reports with executive summaries and detailed analysis.
            </p>
            <div className="space-y-2">
              <h5 className="text-sm font-medium">Features:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Executive summary</li>
                <li>• Detailed charts and tables</li>
                <li>• Appendix with raw data</li>
                <li>• Professional formatting</li>
              </ul>
            </div>
            <Button className="w-full" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export to PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Presentation className="w-6 h-6 mb-2" />
              <span>Current View</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="w-6 h-6 mb-2" />
              <span>Full Dashboard</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Share className="w-6 h-6 mb-2" />
              <span>Custom Selection</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Executive Reporting & Communication</h2>
          <p className="text-gray-600 mt-1">Automated reports and shareable dashboards for executive audiences</p>
        </div>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Report Templates
          </TabsTrigger>
          <TabsTrigger value="dashboards" className="flex items-center">
            <Share className="w-4 h-4 mr-2" />
            Shareable Dashboards
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Presentation Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          {renderReportTemplates()}
        </TabsContent>

        <TabsContent value="dashboards">
          {renderShareableDashboards()}
        </TabsContent>

        <TabsContent value="export">
          {renderPresentationExport()}
        </TabsContent>
      </Tabs>

      {/* Share Dashboard Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Dashboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Configure sharing settings for this dashboard.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Access Level</label>
                <select className="w-full p-2 border rounded-md mt-1">
                  <option>Restricted - Executive Team Only</option>
                  <option>Confidential - Board Members Only</option>
                  <option>Public - Company Wide</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Expiration</label>
                <select className="w-full p-2 border rounded-md mt-1">
                  <option>No Expiration</option>
                  <option>30 Days</option>
                  <option>90 Days</option>
                  <option>1 Year</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowShareDialog(false)}>
                Cancel
              </Button>
              <Button>
                Generate Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExecutiveReporting;