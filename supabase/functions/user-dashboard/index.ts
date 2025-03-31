// Edge Function: Get User Dashboard Data
// File: supabase/functions/user-dashboard/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the user ID from the request
    const { userId } = await req.json()
    
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      throw new Error(`Failed to get user profile: ${profileError.message}`)
    }

    // Get user's subscription status
    const { data: subscriptionData, error: subError } = await supabase.rpc(
      'get_user_subscription_status',
      { user_uuid: userId }
    )

    // Get reading history with progress
    const { data: readingHistory, error: historyError } = await supabase
      .from('reading_history')
      .select(`
        *,
        summaries:summary_id (
          id,
          title,
          reading_time,
          books:book_id (
            title,
            cover_image_url,
            authors:original_author_id (name)
          )
        )
      `)
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false })
      .limit(10)

    if (historyError) {
      console.error('Error fetching reading history:', historyError)
    }

    // Get bookmarks
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select(`
        id,
        created_at,
        summaries:summary_id (
          id,
          title,
          reading_time,
          books:book_id (
            title,
            cover_image_url,
            authors:original_author_id (name)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (bookmarksError) {
      console.error('Error fetching bookmarks:', bookmarksError)
    }

    // Get collections
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select(`
        id,
        name,
        description,
        is_public,
        items:collection_items (
          summaries:summary_id (
            id,
            title
          )
        )
      `)
      .eq('user_id', userId)

    if (collectionsError) {
      console.error('Error fetching collections:', collectionsError)
    }

    // Get personalized recommendations
    const { data: recommendations, error: recError } = await supabase.rpc(
      'get_recommendations',
      { user_uuid: userId, limit_count: 5 }
    )

    if (recError) {
      console.error('Error fetching recommendations:', recError)
    }

    // Get reading stats
    const { data: stats, error: statsError } = await supabase
      .from('reading_history')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)

    const totalMinutesRead = stats?.reduce((acc, item) => {
      return acc + (item.summaries?.reading_time || 0)
    }, 0) || 0

    const totalSummariesRead = stats?.length || 0

    // Compile all data
    const userData = {
      profile,
      subscription: subscriptionData?.[0] || { has_active_subscription: false },
      readingHistory: readingHistory || [],
      bookmarks: bookmarks || [],
      collections: collections || [],
      recommendations: recommendations || [],
      stats: {
        totalSummariesRead,
        totalMinutesRead,
        summariesThisMonth: stats?.filter(item => {
          const date = new Date(item.last_read_at)
          const now = new Date()
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        }).length || 0
      }
    }

    return new Response(
      JSON.stringify(userData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error fetching user data:', error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
