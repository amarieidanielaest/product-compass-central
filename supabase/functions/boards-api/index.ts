import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    const method = req.method
    const bodyText = await req.text();

    console.log('Boards API called:', method, pathParts, 'Body length:', bodyText?.length || 0)

    // GET /boards - List all accessible boards (handle both GET and POST with empty/list body)
    if ((method === 'GET' && (pathParts.length === 0 || pathParts.length === 1)) || 
        (method === 'POST' && (pathParts.length === 0 || pathParts.length === 1) && (!bodyText || bodyText.trim() === '' || bodyText === '{}' || JSON.parse(bodyText || '{}').action === 'list'))) {
      console.log('Fetching boards via', method, 'method...');
      const searchParams = url.searchParams;
      
      // Use service role client for board listing to bypass RLS temporarily
      const serviceSupabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      let query = serviceSupabase
        .from('customer_boards')
        .select('*')
        .eq('is_active', true);

      // Apply filters
      for (const [key, value] of searchParams.entries()) {
        if (key !== 'page' && key !== 'limit') {
          query = query.eq(key, value);
        }
      }

      const { data: boards, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching boards:', error)
        return new Response(JSON.stringify({ success: false, message: error.message, data: null }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      console.log('Successfully fetched boards:', boards?.length || 0);
      return new Response(JSON.stringify({ success: true, data: boards }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /boards - Create new board (only when body contains actual board data)
    if (method === 'POST' && (pathParts.length === 0 || pathParts.length === 1) && bodyText && bodyText.trim() !== '' && bodyText !== '{}') {
      console.log('Raw request body:', bodyText);
      
      let body;
      try {
        body = JSON.parse(bodyText);
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid JSON in request body', data: null }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Skip if this is a list request
      if (body.action === 'list') {
        return new Response(JSON.stringify({ success: false, message: 'Use list endpoint', data: null }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log('Parsed board data:', body);
      
      // Use service role client for board creation to bypass RLS temporarily
      const serviceSupabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Create board with service role permissions
      const boardData = {
        ...body,
        organization_id: body.organization_id || null,
      };
      
      const { data: board, error } = await serviceSupabase
        .from('customer_boards')
        .insert([boardData])
        .select()
        .single()

      if (error) {
        console.error('Error creating board:', error)
        return new Response(JSON.stringify({ success: false, message: error.message, data: null }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      console.log('Successfully created board:', board);
      return new Response(JSON.stringify({ success: true, data: board }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

      // PATCH /boards/{boardId} - Update board
      if (method === 'PATCH' && pathParts.length >= 1) {
        const boardId = pathParts[0]
        console.log('Updating board:', boardId);
        console.log('PATCH body received:', bodyText);
        
        if (!bodyText) {
          return new Response(JSON.stringify({ success: false, message: 'Request body is empty', data: null }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const body = JSON.parse(bodyText);
        console.log('Parsed PATCH body:', body);
        
        // Use service role client for board updates to bypass RLS temporarily
        const serviceSupabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        const { data: board, error } = await serviceSupabase
          .from('customer_boards')
          .update(body)
          .eq('id', boardId)
          .select()
          .single()

        if (error) {
          console.error('Error updating board:', error)
          return new Response(JSON.stringify({ success: false, message: error.message, data: null }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        console.log('Successfully updated board:', board);
        return new Response(JSON.stringify({ success: true, data: board }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

    // GET /boards/{boardId}/feedback - Get feedback for a board
    if (method === 'GET' && pathParts.length === 2 && pathParts[1] === 'feedback') {
      const boardId = pathParts[0]
      const searchParams = url.searchParams
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')
      const status = searchParams.get('status')
      const priority = searchParams.get('priority')

      let query = supabase
        .from('feedback_items')
        .select('*', { count: 'exact' })
        .eq('board_id', boardId)

      if (status) {
        query = query.eq('status', status)
      }
      if (priority) {
        query = query.eq('priority', priority)
      }

      const { data: feedback, count, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) {
        console.error('Error fetching feedback:', error)
        return new Response(JSON.stringify({ success: false, message: error.message, data: null }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const paginatedResponse = {
        data: feedback,
        meta: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }

      return new Response(JSON.stringify({ success: true, data: paginatedResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /boards/{boardId}/feedback - Create feedback for a board
    if (method === 'POST' && pathParts.length === 2 && pathParts[1] === 'feedback') {
      const boardId = pathParts[0]
      
      if (!bodyText) {
        return new Response(JSON.stringify({ success: false, message: 'Request body is empty', data: null }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const body = JSON.parse(bodyText);
      
      const { data: feedback, error } = await supabase
        .from('feedback_items')
        .insert([{ ...body, board_id: boardId }])
        .select()
        .single()

      if (error) {
        console.error('Error creating feedback:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true, data: feedback }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // PATCH /boards/{boardId}/feedback/{feedbackId} - Update feedback
    if (method === 'PATCH' && pathParts.length === 3 && pathParts[1] === 'feedback') {
      const boardId = pathParts[0]
      const feedbackId = pathParts[2]
      
      if (!bodyText) {
        return new Response(JSON.stringify({ success: false, message: 'Request body is empty', data: null }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const body = JSON.parse(bodyText);
      
      const { data: feedback, error } = await supabase
        .from('feedback_items')
        .update(body)
        .eq('id', feedbackId)
        .eq('board_id', boardId)
        .select()
        .single()

      if (error) {
        console.error('Error updating feedback:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true, data: feedback }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET /boards/{boardId}/members - Get board members
    if (method === 'GET' && pathParts.length === 2 && pathParts[1] === 'members') {
      const boardId = pathParts[0]
      
      const { data: members, error } = await supabase
        .from('board_memberships')
        .select(`
          *,
          profile:profiles(
            id,
            email,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('board_id', boardId)

      if (error) {
        console.error('Error fetching members:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true, data: members }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

      // POST /boards/{boardId}/invite - Invite user to board  
      if (method === 'POST' && pathParts.length === 2 && pathParts[1] === 'invite') {
        const boardId = pathParts[0]
        
        if (!bodyText) {
          return new Response(JSON.stringify({ success: false, message: 'Request body is empty', data: null }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const { email, role } = JSON.parse(bodyText);
        
        // Find user by email
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single()

        if (userError || !user) {
          return new Response(JSON.stringify({ error: 'User not found with this email' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        
        // Create membership record
        const { data: membership, error } = await supabase
          .from('board_memberships')
          .insert([{
            board_id: boardId,
            user_id: user.id,
            role: role || 'viewer'
          }])
          .select()
          .single()

        if (error) {
          console.error('Error creating invitation:', error)
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        return new Response(JSON.stringify({ success: true, data: membership }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})