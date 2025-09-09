import React from 'react';
import { Skeleton } from '@/components/ui/loading-skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const LoadingSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`space-y-4 ${className}`}>
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-6 w-1/2" />
  </div>
);

export const FeedbackCardSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    </CardContent>
  </Card>
);

export const BoardHeaderSkeleton = () => (
  <div className="bg-white border-b">
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