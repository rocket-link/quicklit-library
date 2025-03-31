// Edge Function: Create Checkout Session
// File: supabase/functions/create-checkout-session/index.ts

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
    const { planId, userId, isYearly } = await req.json()
    
    if (!planId || !userId) {
      throw new Error('Plan ID and User ID are required')
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
    const frontendUrl = Deno.env.get('FRONTEND_URL') ?? ''

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Get user information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      throw new Error(`Failed to get user profile: ${profileError?.message || 'Profile not found'}`)
    }

    // Get the plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      throw new Error(`Failed to get plan: ${planError?.message || 'Plan not found'}`)
    }

    // Get user auth details to get email
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({
      perPage: 1,
      page: 1,
      filters: {
        id: userId
      }
    })

    if (authError || !users || users.length === 0) {
      throw new Error(`Failed to get user details: ${authError?.message || 'User not found'}`)
    }

    const userEmail = users[0].email

    // Check if user already has a subscription and customer ID
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('customer_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1)

    let customerId = existingSub?.[0]?.customer_id

    // Create a new customer if one doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        name: profile.full_name || profile.username,
        metadata: {
          userId
        }
      })
      
      customerId = customer.id
    }

    // Select the correct price based on billing interval
    const amount = isYearly ? plan.price_yearly : plan.price_monthly
    const interval = isYearly ? 'year' : 'month'

    // Create or get product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description || `${plan.name} Subscription`,
      metadata: {
        planId
      }
    })

    // Create price object
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      recurring: {
        interval
      },
      metadata: {
        planId
      }
    })

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/subscription/cancel`,
      metadata: {
        userId,
        planId
      }
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
