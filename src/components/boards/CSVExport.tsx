import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { EnhancedFeedbackItem } from '@/services/api/BoardService';
import { useToast } from '@/hooks/use-toast';

interface CSVExportProps {
  feedback: EnhancedFeedbackItem[];
  boardName: string;
}

interface ExportOptions {
  includeComments: boolean;
  includeVotes: boolean;
  includeAnalytics: boolean;
  dateRange: 'all' | '7d' | '30d' | '90d';
  statusFilter: string[];
  priorityFilter: string[];
  columns: string[];
}

const DEFAULT_COLUMNS = [
  'title',
  'description', 
  'status',
  'priority',
  'category',
  'votes_count',
  'comments_count',
  'created_at',
  'updated_at'
];

const COLUMN_LABELS: Record<string, string> = {
  title: 'Title',
  description: 'Description',
  status: 'Status',
  priority: 'Priority',
  category: 'Category',
  votes_count: 'Votes',
  comments_count: 'Comments',
  created_at: 'Created At',
  updated_at: 'Updated At',
  impact_score: 'Impact Score',
  effort_estimate: 'Effort Estimate',
  tags: 'Tags',
  submitted_by: 'Submitted By'
};

export const CSVExport: React.FC<CSVExportProps> = ({ feedback, boardName }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const [options, setOptions] = useState<ExportOptions>({
    includeComments: false,
    includeVotes: true,
    includeAnalytics: false,
    dateRange: 'all',
    statusFilter: [],
    priorityFilter: [],
    columns: DEFAULT_COLUMNS
  });

  const filterFeedbackByDate = (items: EnhancedFeedbackItem[]) => {
    if (options.dateRange === 'all') return items;
    
    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[options.dateRange] || 0;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return items.filter(item => new Date(item.created_at) >= cutoffDate);
  };

  const filterFeedbackByStatus = (items: EnhancedFeedbackItem[]) => {
    if (options.statusFilter.length === 0) return items;
    return items.filter(item => options.statusFilter.includes(item.status));
  };

  const filterFeedbackByPriority = (items: EnhancedFeedbackItem[]) => {
    if (options.priorityFilter.length === 0) return items;
    return items.filter(item => options.priorityFilter.includes(item.priority));
  };

  const getFilteredFeedback = () => {
    let filtered = feedback;
    filtered = filterFeedbackByDate(filtered);
    filtered = filterFeedbackByStatus(filtered);
    filtered = filterFeedbackByPriority(filtered);
    return filtered;
  };

  const generateCSV = (data: EnhancedFeedbackItem[]) => {
    if (data.length === 0) {
      return 'No data to export';
    }

    // Create headers
    const headers = options.columns.map(col => COLUMN_LABELS[col] || col);
    
    // Create rows
    const rows = data.map(item => {
      return options.columns.map(column => {
        let value = (item as any)[column];
        
        // Handle special formatting
        if (column === 'created_at' || column === 'updated_at') {
          value = new Date(value).toLocaleString();
        } else if (column === 'tags' && Array.isArray(value)) {
          value = value.join('; ');
        } else if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'string' && value.includes(',')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        
        return value;
      });
    });

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    return csvContent;
  };

  const generateAnalyticsCSV = (data: EnhancedFeedbackItem[]) => {
    const analytics = {
      totalFeedback: data.length,
      byStatus: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      avgVotes: data.reduce((sum, item) => sum + (item.votes_count || 0), 0) / data.length || 0,
      avgComments: data.reduce((sum, item) => sum + (item.comments_count || 0), 0) / data.length || 0
    };

    // Count by status
    data.forEach(item => {
      analytics.byStatus[item.status] = (analytics.byStatus[item.status] || 0) + 1;
    });

    // Count by priority
    data.forEach(item => {
      analytics.byPriority[item.priority] = (analytics.byPriority[item.priority] || 0) + 1;
    });

    // Count by category
    data.forEach(item => {
      if (item.category) {
        analytics.byCategory[item.category] = (analytics.byCategory[item.category] || 0) + 1;
      }
    });

    // Create analytics CSV
    const analyticsRows = [
      ['Metric', 'Value'],
      ['Total Feedback', analytics.totalFeedback.toString()],
      ['Average Votes', analytics.avgVotes.toFixed(2)],
      ['Average Comments', analytics.avgComments.toFixed(2)],
      ['', ''],
      ['Status Distribution', ''],
      ...Object.entries(analytics.byStatus).map(([status, count]) => [status, count.toString()]),
      ['', ''],
      ['Priority Distribution', ''],
      ...Object.entries(analytics.byPriority).map(([priority, count]) => [priority, count.toString()]),
      ['', ''],
      ['Category Distribution', ''],
      ...Object.entries(analytics.byCategory).map(([category, count]) => [category, count.toString()])
    ];

    return analyticsRows.map(row => row.join(',')).join('\n');
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const filteredData = getFilteredFeedback();
      
      if (filteredData.length === 0) {
        toast({
          title: 'No Data',
          description: 'No feedback items match the selected filters.',
          variant: 'destructive'
        });
        return;
      }

      // Generate main CSV
      const csvContent = generateCSV(filteredData);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${boardName.toLowerCase().replace(/\s+/g, '-')}-feedback-${timestamp}.csv`;
      
      // Download main CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Generate analytics CSV if requested
      if (options.includeAnalytics) {
        const analyticsContent = generateAnalyticsCSV(filteredData);
        const analyticsFilename = `${boardName.toLowerCase().replace(/\s+/g, '-')}-analytics-${timestamp}.csv`;
        
        const analyticsBlob = new Blob([analyticsContent], { type: 'text/csv;charset=utf-8;' });
        const analyticsLink = document.createElement('a');
        const analyticsUrl = URL.createObjectURL(analyticsBlob);
        analyticsLink.setAttribute('href', analyticsUrl);
        analyticsLink.setAttribute('download', analyticsFilename);
        analyticsLink.style.visibility = 'hidden';
        document.body.appendChild(analyticsLink);
        analyticsLink.click();
        document.body.removeChild(analyticsLink);
      }

      toast({
        title: 'Export Complete',
        description: `Exported ${filteredData.length} feedback items to CSV.`
      });

      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'An error occurred while exporting the data.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const toggleColumn = (column: string) => {
    setOptions(prev => ({
      ...prev,
      columns: prev.columns.includes(column)
        ? prev.columns.filter(c => c !== column)
        : [...prev.columns, column]
    }));
  };

  const toggleStatusFilter = (status: string) => {
    setOptions(prev => ({
      ...prev,
      statusFilter: prev.statusFilter.includes(status)
        ? prev.statusFilter.filter(s => s !== status)
        : [...prev.statusFilter, status]
    }));
  };

  const togglePriorityFilter = (priority: string) => {
    setOptions(prev => ({
      ...prev,
      priorityFilter: prev.priorityFilter.includes(priority)
        ? prev.priorityFilter.filter(p => p !== priority)
        : [...prev.priorityFilter, priority]
    }));
  };

  const filteredCount = getFilteredFeedback().length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Feedback to CSV</DialogTitle>
          <DialogDescription>
            Configure your export options and download feedback data as CSV files.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Select value={options.dateRange} onValueChange={(value: any) => setOptions(prev => ({ ...prev, dateRange: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status Filter</label>
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {['submitted', 'under_review', 'planned', 'in_progress', 'completed'].map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={options.statusFilter.includes(status)}
                      onCheckedChange={() => toggleStatusFilter(status)}
                    />
                    <label htmlFor={`status-${status}`} className="text-sm capitalize">
                      {status.replace('_', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority Filter</label>
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {['low', 'medium', 'high', 'critical'].map(priority => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority}`}
                      checked={options.priorityFilter.includes(priority)}
                      onCheckedChange={() => togglePriorityFilter(priority)}
                    />
                    <label htmlFor={`priority-${priority}`} className="text-sm capitalize">
                      {priority}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columns */}
          <div>
            <label className="text-sm font-medium mb-2 block">Columns to Export</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {Object.entries(COLUMN_LABELS).map(([column, label]) => (
                <div key={column} className="flex items-center space-x-2">
                  <Checkbox
                    id={`column-${column}`}
                    checked={options.columns.includes(column)}
                    onCheckedChange={() => toggleColumn(column)}
                  />
                  <label htmlFor={`column-${column}`} className="text-sm">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeAnalytics"
                checked={options.includeAnalytics}
                onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeAnalytics: checked as boolean }))}
              />
              <label htmlFor="includeAnalytics" className="text-sm">
                Include separate analytics summary file
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-muted p-3 rounded">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>
                {filteredCount} feedback items will be exported
                {options.includeAnalytics && ' + analytics summary'}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || filteredCount === 0}>
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};