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

    console.log('Boards API called:', method, pathParts)

    // GET /boards - List all accessible boards
    if (method === 'GET' && pathParts.length === 0) {
      const searchParams = url.searchParams;
      let query = supabase
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

      return new Response(JSON.stringify({ success: true, data: boards }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST /boards - Create new board
    if (method === 'POST' && pathParts.length === 0) {
      const body = await req.json()
      
      const { data: board, error } = await supabase
        .from('customer_boards')
        .insert([body])
        .select()
        .single()

      if (error) {
        console.error('Error creating board:', error)
        return new Response(JSON.stringify({ success: false, message: error.message, data: null }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

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
      const body = await req.json()
      
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
      const body = await req.json()
      
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
        .select('*')
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
      const { email, role } = await req.json()
      
      // TODO: Implement proper invitation system with email notifications
      // For now, create a basic membership record
      const { data: membership, error } = await supabase
        .from('board_memberships')
        .insert([{
          board_id: boardId,
          user_id: null, // Will be updated when user accepts
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