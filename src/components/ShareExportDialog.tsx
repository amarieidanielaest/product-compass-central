import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Copy, Download, Share, Link, Mail, FileText, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'share' | 'export';
  roadmapData: any;
}

const ShareExportDialog = ({ open, onOpenChange, type, roadmapData }: ShareExportDialogProps) => {
  const { toast } = useToast();
  const [shareSettings, setShareSettings] = useState({
    access: 'view-only',
    expiration: '30-days',
    includeDetails: true,
    includeProgress: true,
    includeComments: false,
    password: '',
    customMessage: '',
    allowDownload: false
  });

  const [exportSettings, setExportSettings] = useState({
    format: 'pdf',
    template: 'executive',
    dateRange: 'all',
    includeMetrics: true,
    includeImages: true,
    orientation: 'landscape'
  });

  const generateShareLink = () => {
    const params = new URLSearchParams({
      access: shareSettings.access,
      details: shareSettings.includeDetails.toString(),
      progress: shareSettings.includeProgress.toString(),
      comments: shareSettings.includeComments.toString(),
      expires: shareSettings.expiration
    });
    
    return `${window.location.origin}/shared/roadmap?${params.toString()}`;
  };

  const handleCopyLink = () => {
    const link = generateShareLink();
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard"
    });
  };

  const handleEmailShare = () => {
    const link = generateShareLink();
    const subject = encodeURIComponent("Product Roadmap - Shared Access");
    const body = encodeURIComponent(`
${shareSettings.customMessage}

Access the roadmap here: ${link}

This link will expire in ${shareSettings.expiration}.
    `);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleExport = () => {
    // Simulate export process
    toast({
      title: "Export started",
      description: `Generating ${exportSettings.format.toUpperCase()} export...`
    });

    // In a real app, this would trigger the actual export
    setTimeout(() => {
      toast({
        title: "Export ready",
        description: "Your roadmap export has been generated and downloaded"
      });
      onOpenChange(false);
    }, 2000);
  };

  if (type === 'share') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Share className="w-5 h-5 mr-2" />
              Share Roadmap
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Access Level */}
            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select 
                value={shareSettings.access} 
                onValueChange={(value) => setShareSettings(prev => ({ ...prev, access: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view-only">View Only</SelectItem>
                  <SelectItem value="comment">View & Comment</SelectItem>
                  <SelectItem value="edit">Edit Access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label>Link Expiration</Label>
              <Select 
                value={shareSettings.expiration} 
                onValueChange={(value) => setShareSettings(prev => ({ ...prev, expiration: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-day">1 Day</SelectItem>
                  <SelectItem value="7-days">7 Days</SelectItem>
                  <SelectItem value="30-days">30 Days</SelectItem>
                  <SelectItem value="90-days">90 Days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Options */}
            <div className="space-y-3">
              <Label>Content Options</Label>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Include detailed descriptions</span>
                <Switch
                  checked={shareSettings.includeDetails}
                  onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, includeDetails: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Show progress metrics</span>
                <Switch
                  checked={shareSettings.includeProgress}
                  onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, includeProgress: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Allow comments</span>
                <Switch
                  checked={shareSettings.includeComments}
                  onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, includeComments: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Allow download</span>
                <Switch
                  checked={shareSettings.allowDownload}
                  onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, allowDownload: checked }))}
                />
              </div>
            </div>

            {/* Password Protection */}
            <div className="space-y-2">
              <Label htmlFor="password">Password (optional)</Label>
              <Input
                id="password"
                type="password"
                value={shareSettings.password}
                onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Add password protection"
              />
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Custom Message (optional)</Label>
              <Textarea
                id="message"
                value={shareSettings.customMessage}
                onChange={(e) => setShareSettings(prev => ({ ...prev, customMessage: e.target.value }))}
                placeholder="Add a message for recipients..."
                rows={3}
              />
            </div>

            {/* Share Link */}
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={generateShareLink()}
                  readOnly
                  className="text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleEmailShare} className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button onClick={handleCopyLink} className="flex-1">
                <Link className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Export Roadmap
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Export Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select 
              value={exportSettings.format} 
              onValueChange={(value) => setExportSettings(prev => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="png">
                  <div className="flex items-center">
                    <Image className="w-4 h-4 mr-2" />
                    PNG Image
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    CSV Data
                  </div>
                </SelectItem>
                <SelectItem value="pptx">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    PowerPoint
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Template */}
          <div className="space-y-2">
            <Label>Template</Label>
            <Select 
              value={exportSettings.template} 
              onValueChange={(value) => setExportSettings(prev => ({ ...prev, template: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive Summary</SelectItem>
                <SelectItem value="detailed">Detailed View</SelectItem>
                <SelectItem value="timeline">Timeline Focus</SelectItem>
                <SelectItem value="metrics">Metrics Dashboard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select 
              value={exportSettings.dateRange} 
              onValueChange={(value) => setExportSettings(prev => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="current-quarter">Current Quarter</SelectItem>
                <SelectItem value="next-quarter">Next Quarter</SelectItem>
                <SelectItem value="current-year">Current Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Export Options</Label>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Include metrics & progress</span>
              <Switch
                checked={exportSettings.includeMetrics}
                onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, includeMetrics: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Include images & charts</span>
              <Switch
                checked={exportSettings.includeImages}
                onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, includeImages: checked }))}
              />
            </div>
          </div>

          {/* Orientation (for PDF/PPT) */}
          {['pdf', 'pptx'].includes(exportSettings.format) && (
            <div className="space-y-2">
              <Label>Orientation</Label>
              <Select 
                value={exportSettings.orientation} 
                onValueChange={(value) => setExportSettings(prev => ({ ...prev, orientation: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Export Preview */}
          <div className="p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium mb-1">Export Preview:</p>
            <p className="text-gray-600">
              {exportSettings.template} template as {exportSettings.format.toUpperCase()} 
              {exportSettings.format !== 'csv' && ` (${exportSettings.orientation})`}
              <br />
              Content: {exportSettings.dateRange.replace('-', ' ')}
              {exportSettings.includeMetrics && ', with metrics'}
              {exportSettings.includeImages && ', with visuals'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleExport} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareExportDialog;