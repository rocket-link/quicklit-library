// Edge Function: Handle Subscription Webhook
// File: supabase/functions/subscription-webhook/index.ts

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

  // Get environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
  const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''

  // Initialize Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  
  // Initialize Stripe
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2023-10-16',
  })

  try {
    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature')
    
    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    // Get request body as text
    const body = await req.text()
    
    // Verify and construct the event
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeWebhookSecret
    )

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        
        // Get the customer ID and retrieve the user from Supabase
        const { data: users, error: userError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('customer_id', subscription.customer)
          .limit(1)
        
        if (userError || !users || users.length === 0) {
          // Try to find by email if direct customer ID lookup fails
          const customer = await stripe.customers.retrieve(subscription.customer)
          
          if (!customer.deleted && customer.email) {
            const { data: usersByEmail, error: emailError } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', customer.email)
              .limit(1)
            
            if (emailError || !usersByEmail || usersByEmail.length === 0) {
              throw new Error('No user found for this subscription')
            }
            
            const userId = usersByEmail[0].id
            
            // Update or insert subscription record
            await handleSubscriptionChange(supabase, userId, subscription)
          }
        } else {
          const userId = users[0].user_id
          
          // Update or insert subscription record
          await handleSubscriptionChange(supabase, userId, subscription)
        }
        
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        // Get the subscription from Supabase
        const { data: subscriptions, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('subscription_id', subscription.id)
          .limit(1)
        
        if (!subError && subscriptions && subscriptions.length > 0) {
          // Update the subscription status to canceled
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('subscription_id', subscription.id)
        }
        
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        
        if (invoice.subscription) {
          // Get the subscription from Supabase
          const { data: subscriptions, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('subscription_id', invoice.subscription)
            .limit(1)
          
          if (!subError && subscriptions && subscriptions.length > 0) {
            // Update the subscription period
            const stripeSubscription = await stripe.subscriptions.retrieve(
              invoice.subscription
            )
            
            await supabase
              .from('subscriptions')
              .update({
                current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                status: stripeSubscription.status,
                updated_at: new Date().toISOString()
              })
              .eq('subscription_id', invoice.subscription)
          }
        }
        
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object
        
        if (invoice.subscription) {
          // Update the subscription status
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('subscription_id', invoice.subscription)
        }
        
        break
      }
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing webhook:', error.message)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Helper function to handle subscription changes
async function handleSubscriptionChange(supabase, userId, subscription) {
  // Get the plan ID for this subscription
  const { data: plans, error: planError } = await supabase
    .from('plans')
    .select('id')
    .eq('name', subscription.items.data[0]?.price.product.name || 'Premium')
    .limit(1)
  
  if (planError || !plans || plans.length === 0) {
    throw new Error('No matching plan found')
  }
  
  const planId = plans[0].id
  
  // Check if subscription already exists
  const { data: existingSub, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('subscription_id', subscription.id)
    .limit(1)
  
  if (!existingSub || existingSub.length === 0) {
    // Insert new subscription
    await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: subscription.status,
        payment_provider: 'stripe',
        customer_id: subscription.customer,
        subscription_id: subscription.id,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end
      })
  } else {
    // Update existing subscription
    await supabase
      .from('subscriptions')
      .update({
        plan_id: planId,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscription.id)
  }
}
