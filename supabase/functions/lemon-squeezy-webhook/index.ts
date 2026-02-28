import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6"

const Deno = globalThis.Deno;

// Initialize Supabase Client with Service Role Key for Admin Access
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('MY_SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Webhook Secret from Lemon Squeezy
const WEBHOOK_SECRET = Deno.env.get('LEMON_SQUEEZY_WEBHOOK_SECRET') || '';

serve(async (req) => {
    // 1. Verify Method and Secret Presence
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const signature = req.headers.get('x-signature');
    if (!signature || !WEBHOOK_SECRET) {
        return new Response('Unauthorized', { status: 401 });
    }

    // 2. Read Request Body
    const body = await req.text();

    // 3. Verify Lemon Squeezy Signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(WEBHOOK_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(body)
    );

    const hexSignature = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    if (signature !== hexSignature) {
        return new Response('Signature mismatch', { status: 401 });
    }

    // 4. Parse Webhook Event
    const payload = JSON.parse(body);
    const eventName = payload.meta.event_name;
    const { id, attributes } = payload.data;
    const customData = payload.meta.custom_data || {};

    // Custom data passed from the frontend checkout URL 
    // e.g. ?checkout[custom][user_id]=user_uuid
    const userId = customData.user_id;

    if (!userId) {
        console.warn('Webhook received without associated user_id in custom data.', id);
        return new Response('No User ID provided in custom data', { status: 200 });
    }

    console.log(`Processing ${eventName} for user ${userId}`);

    // 5. Handle Specific Events
    try {
        if (eventName === 'subscription_created' || eventName === 'subscription_updated' || eventName === 'order_created') {
            const status = attributes.status; // 'active', 'past_due', 'unpaid', 'cancelled', 'expired', or 'paid' for orders
            const customerId = attributes.customer_id;

            let subscriptionStatus = 'free';
            if (status === 'active' || status === 'past_due' || status === 'paid') {
                subscriptionStatus = 'pro';
            }

            // Update user profile in Supabase
            const { error } = await supabase
                .from('profiles')
                .update({
                    subscription_status: subscriptionStatus,
                    lemon_customer_id: customerId.toString()
                })
                .eq('id', userId);

            if (error) throw error;
            console.log(`Successfully updated user ${userId} to status ${subscriptionStatus}`);
        }
        else if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
            // Revert back to free tier
            const { error } = await supabase
                .from('profiles')
                .update({
                    subscription_status: 'free'
                })
                .eq('id', userId);

            if (error) throw error;
            console.log(`Successfully downgraded user ${userId} to free`);
        }

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        console.error('Error processing webhook:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});
