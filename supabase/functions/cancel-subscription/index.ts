// Edge Function: Cancel Subscription
// File: supabase/functions/cancel-subscription/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Stripe from 'https://esm.sh/stripe@12.4.0'

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
    const { userId } = await req.json()
    
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Get the user's active subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (subError || !subscription || !subscription.subscription_id) {
      throw new Error(`No active subscription found: ${subError?.message || 'Subscription not found'}`)
    }

    // Cancel the subscription in Stripe
    await stripe.subscriptions.update(subscription.subscription_id, {
      cancel_at_period_end: true,
    })

    // Update the subscription in the database
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Subscription will be canceled at the end of the current billing period.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error canceling subscription:', error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
