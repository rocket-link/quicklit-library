// Edge Function: Advanced Search
// File: supabase/functions/advanced-search/index.ts

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
    const { 
      query, 
      categories = [], 
      readingTimeMax, 
      includeAudioOnly = false,
      includePremium = true,
      page = 1, 
      limit = 20 
    } = await req.json()

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get userId if auth header is provided
    let userId = null
    const authHeader = req.headers.get('authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const { data } = await supabase.auth.getUser(token)
      userId = data?.user?.id
    }

    // Check subscription status if including premium content
    let hasPremiumAccess = false
    
    if (userId && includePremium) {
      const { data: subscriptionData } = await supabase.rpc(
        'get_user_subscription_status',
        { user_uuid: userId }
      )
      
      hasPremiumAccess = subscriptionData?.[0]?.has_active_subscription || false
    }

    // Base SQL for the search
    let sql = `
      WITH matching_summaries AS (
        SELECT 
          s.id,
          s.title,
          s.subtitle,
          s.reading_time,
          s.audio_url,
          s.audio_duration,
          s.is_premium,
          b.title as book_title,
          b.cover_image_url,
          a.name as author_name,
          to_tsvector('english', 
            s.title || ' ' || 
            COALESCE(s.subtitle, '') || ' ' || 
            b.title || ' ' || 
            a.name || ' ' || 
            s.text_content
          ) as document
        FROM 
          summaries s
          JOIN books b ON s.book_id = b.id
          LEFT JOIN authors a ON b.original_author_id = a.id
        WHERE 
          s.is_published = true
          ${!includePremium && !hasPremiumAccess ? "AND s.is_premium = false" : ""}
          ${includeAudioOnly ? "AND s.audio_url IS NOT NULL" : ""}
          ${readingTimeMax ? `AND s.reading_time <= ${readingTimeMax}` : ""}
      )
      SELECT 
        id,
        title,
        subtitle,
        reading_time,
        audio_url,
        audio_duration,
        is_premium,
        book_title,
        cover_image_url,
        author_name
      FROM 
        matching_summaries
      ${query ? `WHERE document @@ plainto_tsquery('english', '${query.replace(/'/g, "''")}')` : ""}
      ORDER BY 
        ${query ? `ts_rank(document, plainto_tsquery('english', '${query.replace(/'/g, "''")}')) DESC,` : ""}
        created_at DESC
      LIMIT ${limit}
      OFFSET ${(page - 1) * limit}
    `

    // If we have categories, we need to join with the book_categories table
    if (categories.length > 0) {
      sql = `
        WITH matching_summaries AS (
          SELECT 
            s.id,
            s.title,
            s.subtitle,
            s.reading_time,
            s.audio_url,
            s.audio_duration,
            s.is_premium,
            b.title as book_title,
            b.cover_image_url,
            a.name as author_name,
            to_tsvector('english', 
              s.title || ' ' || 
              COALESCE(s.subtitle, '') || ' ' || 
              b.title || ' ' || 
              a.name || ' ' || 
              s.text_content
            ) as document
          FROM 
            summaries s
            JOIN books b ON s.book_id = b.id
            LEFT JOIN authors a ON b.original_author_id = a.id
            JOIN book_categories bc ON b.id = bc.book_id
            JOIN categories c ON bc.category_id = c.id
          WHERE 
            s.is_published = true
            ${!includePremium && !hasPremiumAccess ? "AND s.is_premium = false" : ""}
            ${includeAudioOnly ? "AND s.audio_url IS NOT NULL" : ""}
            ${readingTimeMax ? `AND s.reading_time <= ${readingTimeMax}` : ""}
            AND c.slug IN (${categories.map(cat => `'${cat.replace(/'/g, "''")}'`).join(',')})
        )
        SELECT 
          id,
          title,
          subtitle,
          reading_time,
          audio_url,
          audio_duration,
          is_premium,
          book_title,
          cover_image_url,
          author_name
        FROM 
          matching_summaries
        ${query ? `WHERE document @@ plainto_tsquery('english', '${query.replace(/'/g, "''")}')` : ""}
        ORDER BY 
          ${query ? `ts_rank(document, plainto_tsquery('english', '${query.replace(/'/g, "''")}')) DESC,` : ""}
          created_at DESC
        LIMIT ${limit}
        OFFSET ${(page - 1) * limit}
      `
    }

    // Execute the query
    const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql })

    if (error) {
      throw new Error(`Search query error: ${error.message}`)
    }

    // Count total matches for pagination (with a simplified query for performance)
    let countSql = `
      SELECT COUNT(*) as total
      FROM summaries s
      JOIN books b ON s.book_id = b.id
      LEFT JOIN authors a ON b.original_author_id = a.id
      WHERE 
        s.is_published = true
        ${!includePremium && !hasPremiumAccess ? "AND s.is_premium = false" : ""}
        ${includeAudioOnly ? "AND s.audio_url IS NOT NULL" : ""}
        ${readingTimeMax ? `AND s.reading_time <= ${readingTimeMax}` : ""}
    `

    // If we have categories, adjust the count query
    if (categories.length > 0) {
      countSql = `
        SELECT COUNT(*) as total
        FROM summaries s
        JOIN books b ON s.book_id = b.id
        LEFT JOIN authors a ON b.original_author_id = a.id
        JOIN book_categories bc ON b.id = bc.book_id
        JOIN categories c ON bc.category_id = c.id
        WHERE 
          s.is_published = true
          ${!includePremium && !hasPremiumAccess ? "AND s.is_premium = false" : ""}
          ${includeAudioOnly ? "AND s.audio_url IS NOT NULL" : ""}
          ${readingTimeMax ? `AND s.reading_time <= ${readingTimeMax}` : ""}
          AND c.slug IN (${categories.map(cat => `'${cat.replace(/'/g, "''")}'`).join(',')})
      `
    }

    // Add full-text search condition if query is provided
    if (query) {
      countSql += `
        AND to_tsvector('english', 
          s.title || ' ' || 
          COALESCE(s.subtitle, '') || ' ' || 
          b.title || ' ' || 
          a.name || ' ' || 
          s.text_content
        ) @@ plainto_tsquery('english', '${query.replace(/'/g, "''")}')
      `
    }

    const { data: countData, error: countError } = await supabase.rpc('execute_sql', { sql_query: countSql })

    if (countError) {
      throw new Error(`Count query error: ${countError.message}`)
    }

    const total = parseInt(countData?.[0]?.total || '0')

    return new Response(
      JSON.stringify({
        results: data || [],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: (page * limit) < total
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in search:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
