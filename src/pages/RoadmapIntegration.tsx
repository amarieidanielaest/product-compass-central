import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlignmentMapping } from '@/components/strategy/AlignmentMapping';
import { PortfolioHealthDashboard } from '@/components/strategy/PortfolioHealthDashboard';
import { ExecutiveReporting } from '@/components/strategy/ExecutiveReporting';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RoadmapIntegration: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sprint Board
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Roadmap Integration</h1>
          <p className="text-muted-foreground">
            Strategic alignment and portfolio management
          </p>
        </div>
      </div>

      <Tabs defaultValue="alignment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alignment">Strategic Alignment</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Health</TabsTrigger>
          <TabsTrigger value="executive">Executive Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alignment">
          <AlignmentMapping />
        </TabsContent>
        
        <TabsContent value="portfolio">
          <PortfolioHealthDashboard />
        </TabsContent>
        
        <TabsContent value="executive">
          <ExecutiveReporting />
        </TabsContent>
      </Tabs>
    </div>
  );
};