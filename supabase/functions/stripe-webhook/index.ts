// @ts-expect-error - Deno runtime imports from URLs
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error - Deno runtime imports from URLs
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
// @ts-expect-error - Deno runtime imports from URLs
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )

    console.log(`🔔 Webhook received: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('💳 Checkout session completed:', session.id)
        
        // Obtener información del cliente y suscripción
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const priceId = subscription.items.data[0]?.price.id
          
          // Determinar el tipo de plan basado en el price_id
          let planType = 'monthly'
          if (priceId === Deno.env.get('STRIPE_PRICE_ID_YEARLY')) {
            planType = 'yearly'
          } else if (priceId === Deno.env.get('STRIPE_PRICE_ID_QUARTERLY')) {
            planType = 'quarterly'
          }
          
          // Buscar el perfil del usuario por customer_id
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('stripe_customer_id', customerId)
            .single()
            
          if (profileError) {
            console.error('❌ Error finding profile:', profileError)
            break
          }
          
          // Actualizar el perfil con la suscripción Premium
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              is_premium: true,
              premium_plan: planType,
              stripe_subscription_id: subscriptionId,
              premium_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', profile.id)
            
          if (updateError) {
            console.error('❌ Error updating profile:', updateError)
          } else {
            console.log('✅ Premium activated for user:', profile.id)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('🔄 Subscription updated:', subscription.id)
        
        const { error } = await supabase
          .from('profiles')
          .update({
            premium_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)
          
        if (error) {
          console.error('❌ Error updating subscription:', error)
        } else {
          console.log('✅ Subscription updated successfully')
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('❌ Subscription cancelled:', subscription.id)
        
        // Desactivar membresía Premium
        const { error } = await supabase
          .from('profiles')
          .update({
            is_premium: false,
            premium_plan: null,
            stripe_subscription_id: null,
            premium_expires_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id)
          
        if (error) {
          console.error('❌ Error cancelling premium:', error)
        } else {
          console.log('✅ Premium cancelled successfully')
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('💰 Payment succeeded:', invoice.id)
        
        if (invoice.subscription) {
          // Renovar suscripción
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          
          const { error } = await supabase
            .from('profiles')
            .update({
              premium_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)
            
          if (error) {
            console.error('❌ Error renewing subscription:', error)
          } else {
            console.log('✅ Subscription renewed successfully')
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('💸 Payment failed:', invoice.id)
        
        // Opcional: Marcar como pago fallido pero mantener acceso por período de gracia
        if (invoice.subscription) {
          const { error } = await supabase
            .from('profiles')
            .update({
              payment_failed: true,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoice.subscription as string)
            
          if (error) {
            console.error('❌ Error marking payment failed:', error)
          }
        }
        break
      }

      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer
        console.log('👤 Customer created:', customer.id)
        
        // Opcional: Actualizar perfil con customer_id si se puede identificar por email
        if (customer.email) {
          const { error } = await supabase
            .from('profiles')
            .update({
              stripe_customer_id: customer.id,
              updated_at: new Date().toISOString()
            })
            .eq('email', customer.email)
            
          if (error) {
            console.error('❌ Error linking customer:', error)
          }
        }
        break
      }

      default:
        console.log(`🤷 Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ 
      received: true, 
      event_type: event.type,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('🚨 Webhook error:', err.message)
    return new Response(`Webhook error: ${err.message}`, { 
      status: 400,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
})
