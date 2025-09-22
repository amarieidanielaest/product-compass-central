import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertTriangle,
  Download,
  RotateCcw,
  Trash2,
  UserX,
  ArrowRight,
  Shield,
  Database,
  Users,
  Clock
} from 'lucide-react';

export const DangerZone = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleDataExport = async () => {
    setIsExporting(true);
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Data Export Started",
        description: "Your data export has been initiated. You'll receive a download link via email within 24 hours.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to start data export. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetSettings = () => {
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  const handleDeleteAccount = () => {
    if (confirmText !== 'DELETE') {
      toast({
        title: "Confirmation Required",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Account Deletion Initiated",
      description: "Your account deletion request has been submitted. This action will take effect in 7 days.",
      variant: "destructive",
    });
  };

  const dangerActions = [
    {
      id: 'export',
      title: 'Export Account Data',
      description: 'Download all your account data including feedback, roadmaps, and user data',
      icon: Download,
      buttonText: 'Request Export',
      buttonVariant: 'outline' as const,
      onClick: handleDataExport,
      loading: isExporting
    },
    {
      id: 'reset',
      title: 'Reset All Settings',
      description: 'Reset all settings to default values. This cannot be undone.',
      icon: RotateCcw,
      buttonText: 'Reset Settings',
      buttonVariant: 'outline' as const,
      onClick: handleResetSettings
    },
    {
      id: 'transfer',
      title: 'Transfer Team Ownership',
      description: 'Transfer ownership of your teams to another member',
      icon: Users,
      buttonText: 'Transfer Teams',
      buttonVariant: 'outline' as const,
      comingSoon: true
    },
    {
      id: 'delete',
      title: 'Delete Account',
      description: 'Permanently delete your account and all associated data. This action cannot be undone.',
      icon: Trash2,
      buttonText: 'Delete Account',
      buttonVariant: 'destructive' as const,
      requiresConfirmation: true
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
          Danger Zone
        </h2>
        <p className="text-muted-foreground">
          Irreversible and destructive actions. Proceed with caution.
        </p>
      </div>

      <Alert className="border-destructive/20 bg-destructive/5">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          These actions are permanent and cannot be undone. Make sure you understand the consequences before proceeding.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {dangerActions.map((action) => (
          <Card key={action.id} className="border-destructive/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="mt-0.5">
                    <action.icon className="h-5 w-5 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold">{action.title}</h3>
                      {action.comingSoon && (
                        <Badge variant="secondary" className="text-xs">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
                
                <div className="ml-4">
                  {action.requiresConfirmation ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant={action.buttonVariant}
                          disabled={action.comingSoon}
                          className="min-w-[120px]"
                        >
                          {action.buttonText}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center text-destructive">
                            <AlertTriangle className="mr-2 h-5 w-5" />
                            Confirm Account Deletion
                          </DialogTitle>
                          <DialogDescription className="space-y-3">
                            <p>
                              This action will permanently delete your account and all associated data, including:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>All feedback boards and submitted feedback</li>
                              <li>Product roadmaps and strategic documents</li>
                              <li>Team memberships and organizations</li>
                              <li>User analytics and engagement data</li>
                              <li>Integration configurations</li>
                            </ul>
                            <p className="font-medium">
                              This action cannot be undone and you will lose access immediately.
                            </p>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="confirm-delete">
                              Type <code className="bg-muted px-1 py-0.5 rounded text-sm">DELETE</code> to confirm:
                            </Label>
                            <Input
                              id="confirm-delete"
                              value={confirmText}
                              onChange={(e) => setConfirmText(e.target.value)}
                              placeholder="Type DELETE here"
                              className="mt-2"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                            disabled={confirmText !== 'DELETE'}
                          >
                            Delete Account Permanently
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button 
                      variant={action.buttonVariant}
                      onClick={action.onClick}
                      disabled={action.comingSoon || action.loading}
                      className="min-w-[120px]"
                    >
                      {action.loading ? 'Processing...' : action.buttonText}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4" />
            Account Retention Policy
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • Account deletion requests are processed after a 7-day grace period
          </p>
          <p>
            • Data exports are available for 30 days after account deletion
          </p>
          <p>
            • Billing information is retained for 7 years for compliance purposes
          </p>
          <p>
            • Some anonymized analytics data may be retained for product improvement
          </p>
        </CardContent>
      </Card>
    </div>
  );
};