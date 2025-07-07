import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[INVITE-TEAM-MEMBER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { team_id, email, role = 'member' } = await req.json();
    if (!team_id || !email) throw new Error("Team ID and email are required");

    // Verify user has permission to invite
    const { data: membership } = await supabaseClient
      .from('team_memberships')
      .select('role')
      .eq('team_id', team_id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      throw new Error("Insufficient permissions to invite team members");
    }

    // Check team limits
    const { data: team } = await supabaseClient
      .from('teams')
      .select(`
        *,
        pricing_plan:pricing_plans(max_team_members),
        team_memberships!inner(count)
      `)
      .eq('id', team_id)
      .single();

    if (team?.pricing_plan?.max_team_members && team.pricing_plan.max_team_members > 0) {
      const { count: currentMembers } = await supabaseClient
        .from('team_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team_id)
        .eq('status', 'active');

      if (currentMembers && currentMembers >= team.pricing_plan.max_team_members) {
        throw new Error("Team has reached maximum member limit for current plan");
      }
    }

    // Generate invitation token
    const invitationToken = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('team_invitations')
      .insert({
        team_id,
        email: email.toLowerCase(),
        role,
        invited_by: user.id,
        token: invitationToken,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      if (inviteError.code === '23505') { // Unique constraint violation
        throw new Error("User is already invited to this team");
      }
      throw inviteError;
    }

    logStep("Invitation created", { invitationId: invitation.id, token: invitationToken });

    // In a real app, you'd send an email here with the invitation link
    const invitationLink = `${req.headers.get("origin")}/invite/${invitationToken}`;
    
    return new Response(JSON.stringify({ 
      success: true, 
      invitation_id: invitation.id,
      invitation_link: invitationLink 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});