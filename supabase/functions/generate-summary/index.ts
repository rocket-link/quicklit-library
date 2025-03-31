// Edge Function: Generate Book Summary
// File: supabase/functions/generate-summary/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.2.1'

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
    const { bookId, bookText, settings } = await req.json()

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ?? ''

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Initialize OpenAI
    const configuration = new Configuration({ apiKey: openaiApiKey })
    const openai = new OpenAIApi(configuration)

    // First, update request status to processing
    const { error: updateError } = await supabase
      .from('generation_requests')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('book_id', bookId)
      .eq('status', 'pending')

    if (updateError) {
      throw new Error(`Failed to update request status: ${updateError.message}`)
    }

    // Get book information
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*, authors(*)')
      .eq('id', bookId)
      .single()

    if (bookError || !book) {
      throw new Error(`Failed to get book info: ${bookError?.message || 'Book not found'}`)
    }

    // Prepare prompt for summary generation
    const prompt = `
      Create a comprehensive summary of the book "${book.title}" by ${book.authors.name}.
      
      The summary should include:
      1. Key insights (5-7 main points)
      2. Chapter-by-chapter summary
      3. Practical takeaways
      4. Who should read this book
      
      Make the summary engaging and actionable. Target reading time: ${settings.readingTime || 15} minutes.
      
      Book text excerpt: ${bookText.substring(0, 2000)}...
    `

    // Generate summary using OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are an expert book summarizer who creates concise, valuable summaries that capture the essence of books.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const summaryText = completion.data.choices[0]?.message?.content || ''
    
    if (!summaryText) {
      throw new Error('Failed to generate summary content')
    }

    // Split the content to extract key insights
    const sections = summaryText.split(/(?=\d\.\s+)/g)
    const mainSummary = sections.join('\n\n')
    
    // Create new summary in the database
    const { data: newSummary, error: summaryError } = await supabase
      .from('summaries')
      .insert({
        book_id: bookId,
        title: `Summary of ${book.title}`,
        text_content: mainSummary,
        reading_time: settings.readingTime || 15,
        is_premium: true,
        is_published: false,
        created_by: settings.requestedBy
      })
      .select()
      .single()

    if (summaryError || !newSummary) {
      throw new Error(`Failed to create summary: ${summaryError?.message}`)
    }

    // Extract and insert key insights
    const keyInsights = sections.slice(0, Math.min(sections.length, 7))
    
    for (let i = 0; i < keyInsights.length; i++) {
      const insightText = keyInsights[i].trim()
      if (insightText) {
        await supabase
          .from('key_insights')
          .insert({
            summary_id: newSummary.id,
            title: `Insight ${i + 1}`,
            content: insightText,
            order_index: i
          })
      }
    }

    // Update generation request with completed status
    await supabase
      .from('generation_requests')
      .update({ 
        status: 'completed',
        result_summary_id: newSummary.id,
        updated_at: new Date().toISOString()
      })
      .eq('book_id', bookId)

    return new Response(
      JSON.stringify({
        success: true,
        summaryId: newSummary.id,
        message: 'Summary generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    // Handle errors
    console.error('Error generating summary:', error.message)
    
    // Try to update the generation request with error status
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      
      await supabase
        .from('generation_requests')
        .update({ 
          status: 'failed',
          error_message: error.message,
          updated_at: new Date().toISOString()
        })
        .eq('status', 'processing')
    } catch (dbError) {
      console.error('Failed to update request with error:', dbError)
    }

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
