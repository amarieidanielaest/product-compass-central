import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Search, Calendar, Zap, Bug, Wrench, Star, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  content: string;
  version: string;
  type: string;
  published_at: string;
  created_at: string;
  visibility: string;
}

interface ChangelogViewProps {
  boardId: string;
}

export const ChangelogView = ({ boardId }: ChangelogViewProps) => {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadChangelogEntries();
  }, [boardId]);

  const loadChangelogEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('changelog_entries')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading changelog:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'improvement':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'bugfix':
        return <Bug className="h-4 w-4 text-green-500" />;
      case 'breaking':
        return <Wrench className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feature':
        return 'bg-yellow-100 text-yellow-800';
      case 'improvement':
        return 'bg-blue-100 text-blue-800';
      case 'bugfix':
        return 'bg-green-100 text-green-800';
      case 'breaking':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'feature':
        return 'New Feature';
      case 'improvement':
        return 'Improvement';
      case 'bugfix':
        return 'Bug Fix';
      case 'breaking':
        return 'Breaking Change';
      default:
        return type;
    }
  };

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product Updates</h2>
        <p className="text-gray-600 mt-2">
          Stay up to date with the latest features, improvements, and fixes.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search updates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="feature">New Features</SelectItem>
            <SelectItem value="improvement">Improvements</SelectItem>
            <SelectItem value="bugfix">Bug Fixes</SelectItem>
            <SelectItem value="breaking">Breaking Changes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Changelog Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No updates found</h3>
              <p className="text-gray-600 text-center">
                {entries.length === 0 
                  ? "Product updates will appear here as they are released."
                  : "Try adjusting your search or filter to find what you're looking for."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => {
            const isExpanded = expandedEntries.has(entry.id);
            const publishedDate = entry.published_at ? parseISO(entry.published_at) : parseISO(entry.created_at);
            
            return (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(entry.type)}
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                        <Badge className={getTypeColor(entry.type)}>
                          {getTypeLabel(entry.type)}
                        </Badge>
                        {entry.version && (
                          <Badge variant="outline">
                            v{entry.version}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {entry.description}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(publishedDate, 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                {(entry.content || isExpanded) && (
                  <CardContent className="pt-0">
                    {entry.content && (
                      <div className="prose prose-sm max-w-none">
                        {isExpanded ? (
                          <div 
                            className="text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: entry.content }}
                          />
                        ) : (
                          <p className="text-gray-600 line-clamp-3">
                            {entry.content.replace(/<[^>]*>/g, '')}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mt-4">
                      {entry.content && entry.content.length > 200 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(entry.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {isExpanded ? 'Show Less' : 'Read More'}
                        </Button>
                      )}
                      
                      <div className="flex gap-2 ml-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};