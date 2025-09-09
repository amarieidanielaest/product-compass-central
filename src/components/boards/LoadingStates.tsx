import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const FeedbackCardSkeleton = () => (
  <Card className="animate-fade-in">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center gap-2 ml-3">
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
);

export const BoardHeaderSkeleton = () => (
  <div className="bg-white border-b animate-fade-in">
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  </div>
);

export const TabsSkeleton = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex space-x-1 bg-muted p-1 rounded-lg">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-9 w-24" />
      ))}
    </div>
    <div className="space-y-4">
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  </div>
);

export const AnalyticsCardSkeleton = () => (
  <Card className="animate-fade-in">
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-4 w-24" />
      <div className="mt-4">
        <Skeleton className="h-24 w-full" />
      </div>
    </CardContent>
  </Card>
);

interface LoadingGridProps {
  count?: number;
  component?: 'feedback' | 'analytics' | 'board';
}

export const LoadingGrid: React.FC<LoadingGridProps> = ({ 
  count = 6, 
  component = 'feedback' 
}) => {
  const SkeletonComponent = {
    feedback: FeedbackCardSkeleton,
    analytics: AnalyticsCardSkeleton,
    board: FeedbackCardSkeleton
  }[component];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
};