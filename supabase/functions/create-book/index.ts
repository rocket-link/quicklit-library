
// Edge Function: Create Book
// File: supabase/functions/create-book/index.ts

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
    // Get the request body and authorization header
    const { 
      title, 
      description, 
      isbn, 
      published_year, 
      author_name, 
      cover_image_url,
      category_ids 
    } = await req.json()
    
    // Get authorization header from request
    const authorization = req.headers.get('Authorization')
    
    if (!authorization) {
      throw new Error('Missing authorization header')
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify the user is authenticated and has admin rights
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    )
    
    if (authError || !user) {
      throw new Error('Invalid authorization token')
    }
    
    // Check if user has admin role in user_metadata
    const userRole = user.user_metadata?.role
    
    if (userRole !== 'admin') {
      throw new Error('User does not have admin privileges')
    }
    
    console.log("Validated admin user, creating book with data:", { 
      title, description, isbn, published_year, cover_image_url 
    });
    
    // First, create the book entry
    const bookPayload = {
      title,
      description: description || null,
      isbn: isbn || null,
      published_year: published_year || new Date().getFullYear(),
      language: 'en', // Default value
      cover_image_url: cover_image_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    
    // Insert the book
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .insert(bookPayload)
      .select()
      .single()
    
    if (bookError) {
      console.error("Error inserting book:", bookError);
      throw bookError;
    }
    
    // If we have author info, we need to create or find the author
    if (author_name) {
      // Look for existing author
      const { data: authorData, error: authorFetchError } = await supabase
        .from('authors')
        .select('*')
        .ilike('name', author_name)
        .limit(1)
      
      let authorId;
      
      if (authorFetchError) throw authorFetchError
      
      if (authorData && authorData.length > 0) {
        // Use existing author
        authorId = authorData[0].id
      } else {
        // Create new author
        const { data: newAuthor, error: newAuthorError } = await supabase
          .from('authors')
          .insert({
            name: author_name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (newAuthorError) throw newAuthorError
        authorId = newAuthor.id
      }
      
      // Update book with author ID
      const { error: updateAuthorError } = await supabase
        .from('books')
        .update({ original_author_id: authorId })
        .eq('id', bookData.id)
      
      if (updateAuthorError) throw updateAuthorError
    }
    
    // If we have category IDs, link them to the book
    if (category_ids && category_ids.length > 0) {
      const categoryLinks = category_ids.map(categoryId => ({
        book_id: bookData.id,
        category_id: categoryId
      }))
      
      const { error: categoryError } = await supabase
        .from('book_categories')
        .insert(categoryLinks)
      
      if (categoryError) throw categoryError
    }
    
    // Get the complete book data with author info
    const { data: completeBook, error: fetchError } = await supabase
      .from('books')
      .select(`
        *,
        authors:original_author_id (
          name
        )
      `)
      .eq('id', bookData.id)
      .single()
    
    if (fetchError) throw fetchError
    
    return new Response(
      JSON.stringify({
        success: true,
        book: completeBook
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    // Handle errors
    console.error('Error creating book:', error.message)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
