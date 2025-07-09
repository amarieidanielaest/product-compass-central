import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'feedback' | 'article' | 'roadmap' | 'changelog' | 'board' | 'organization';
  url: string;
  createdAt: string;
  relevanceScore: number;
  metadata?: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { query, types, limit = 20 } = await req.json();
    
    if (!query || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'Query must be at least 2 characters long' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const searchQuery = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search feedback items
    if (!types || types.includes('feedback')) {
      const { data: feedbackItems } = await supabase
        .from('feedback_items')
        .select('id, title, description, created_at, status, priority')
        .or(`title.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%`)
        .limit(limit);

      if (feedbackItems) {
        feedbackItems.forEach(item => {
          const titleMatch = item.title?.toLowerCase().includes(searchQuery);
          const descMatch = item.description?.toLowerCase().includes(searchQuery);
          
          results.push({
            id: item.id,
            title: item.title || 'Untitled Feedback',
            description: item.description || 'No description',
            type: 'feedback',
            url: `/feedback/${item.id}`,
            createdAt: item.created_at,
            relevanceScore: titleMatch ? 10 : descMatch ? 5 : 1,
            metadata: {
              status: item.status,
              priority: item.priority
            }
          });
        });
      }
    }

    // Search help articles
    if (!types || types.includes('article')) {
      const { data: articles } = await supabase
        .from('help_articles')
        .select('id, title, description, content, created_at, is_published, category_id')
        .eq('is_published', true)
        .or(`title.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%, content.ilike.%${searchQuery}%`)
        .limit(limit);

      if (articles) {
        articles.forEach(article => {
          const titleMatch = article.title?.toLowerCase().includes(searchQuery);
          const descMatch = article.description?.toLowerCase().includes(searchQuery);
          const contentMatch = article.content?.toLowerCase().includes(searchQuery);
          
          results.push({
            id: article.id,
            title: article.title || 'Untitled Article',
            description: article.description || 'No description',
            type: 'article',
            url: `/help/article/${article.id}`,
            createdAt: article.created_at,
            relevanceScore: titleMatch ? 15 : descMatch ? 10 : contentMatch ? 5 : 1,
            metadata: {
              categoryId: article.category_id
            }
          });
        });
      }
    }

    // Search roadmap items
    if (!types || types.includes('roadmap')) {
      const { data: roadmapItems } = await supabase
        .from('roadmap_items')
        .select('id, title, description, created_at, status, priority')
        .or(`title.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%`)
        .limit(limit);

      if (roadmapItems) {
        roadmapItems.forEach(item => {
          const titleMatch = item.title?.toLowerCase().includes(searchQuery);
          const descMatch = item.description?.toLowerCase().includes(searchQuery);
          
          results.push({
            id: item.id,
            title: item.title || 'Untitled Roadmap Item',
            description: item.description || 'No description',
            type: 'roadmap',
            url: `/roadmap/${item.id}`,
            createdAt: item.created_at,
            relevanceScore: titleMatch ? 12 : descMatch ? 7 : 1,
            metadata: {
              status: item.status,
              priority: item.priority
            }
          });
        });
      }
    }

    // Search changelog entries
    if (!types || types.includes('changelog')) {
      const { data: changelogEntries } = await supabase
        .from('changelog_entries')
        .select('id, title, description, content, created_at, type, is_published')
        .eq('is_published', true)
        .or(`title.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%, content.ilike.%${searchQuery}%`)
        .limit(limit);

      if (changelogEntries) {
        changelogEntries.forEach(entry => {
          const titleMatch = entry.title?.toLowerCase().includes(searchQuery);
          const descMatch = entry.description?.toLowerCase().includes(searchQuery);
          
          results.push({
            id: entry.id,
            title: entry.title || 'Untitled Changelog',
            description: entry.description || 'No description',
            type: 'changelog',
            url: `/changelog/${entry.id}`,
            createdAt: entry.created_at,
            relevanceScore: titleMatch ? 8 : descMatch ? 4 : 1,
            metadata: {
              type: entry.type
            }
          });
        });
      }
    }

    // Search customer boards
    if (!types || types.includes('board')) {
      const { data: boards } = await supabase
        .from('customer_boards')
        .select('id, name, description, created_at, slug')
        .eq('is_active', true)
        .or(`name.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%`)
        .limit(limit);

      if (boards) {
        boards.forEach(board => {
          const nameMatch = board.name?.toLowerCase().includes(searchQuery);
          const descMatch = board.description?.toLowerCase().includes(searchQuery);
          
          results.push({
            id: board.id,
            title: board.name || 'Untitled Board',
            description: board.description || 'No description',
            type: 'board',
            url: `/boards/${board.slug}`,
            createdAt: board.created_at,
            relevanceScore: nameMatch ? 10 : descMatch ? 5 : 1,
            metadata: {
              slug: board.slug
            }
          });
        });
      }
    }

    // Search organizations
    if (!types || types.includes('organization')) {
      const { data: organizations } = await supabase
        .from('organizations')
        .select('id, name, description, created_at, slug')
        .eq('is_active', true)
        .or(`name.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%`)
        .limit(limit);

      if (organizations) {
        organizations.forEach(org => {
          const nameMatch = org.name?.toLowerCase().includes(searchQuery);
          const descMatch = org.description?.toLowerCase().includes(searchQuery);
          
          results.push({
            id: org.id,
            title: org.name || 'Untitled Organization',
            description: org.description || 'No description',
            type: 'organization',
            url: `/organizations/${org.slug}`,
            createdAt: org.created_at,
            relevanceScore: nameMatch ? 12 : descMatch ? 6 : 1,
            metadata: {
              slug: org.slug
            }
          });
        });
      }
    }

    // Sort by relevance score and date
    const sortedResults = results
      .sort((a, b) => {
        if (a.relevanceScore !== b.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, limit);

    console.log(`Search completed: "${query}" returned ${sortedResults.length} results`);

    return new Response(
      JSON.stringify({
        results: sortedResults,
        total: sortedResults.length,
        query: searchQuery
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});