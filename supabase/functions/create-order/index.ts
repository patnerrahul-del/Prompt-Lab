import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseAdmin();
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Authenticate user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized user token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { promptId, bundleId, couponCode } = await req.json();

    if (!promptId && !bundleId) {
      return new Response(JSON.stringify({ error: 'promptId or bundleId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let subtotalInr = 0;
    let targetPrompt = null;
    let targetBundle = null;

    if (promptId) {
      // Fetch authoritative prompt price
      const { data: p, error: pErr } = await supabase
        .from('prompts')
        .select('id, title, price_inr, status, user_id')
        .eq('id', promptId)
        .single();

      if (pErr || !p) throw new Error('Prompt item not found');
      if (p.status !== 'published') throw new Error('Prompt is not available for acquisition');

      subtotalInr = Number(p.price_inr);
      targetPrompt = p;
    } else if (bundleId) {
      const { data: b, error: bErr } = await supabase
        .from('bundles')
        .select('id, title, price_inr, is_active')
        .eq('id', bundleId)
        .single();

      if (bErr || !b || !b.is_active) throw new Error('Bundle is currently inactive');
      subtotalInr = Number(b.price_inr);
      targetBundle = b;
    }

    // Check Coupon if supplied
    let discountInr = 0;
    let couponRow = null;

    if (couponCode) {
      const { data: c } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (c) {
        if (!c.expires_at || new Date(c.expires_at) > new Date()) {
          if (!c.max_uses || c.uses_count < c.max_uses) {
            if (subtotalInr >= Number(c.min_order_value_inr)) {
              couponRow = c;
              if (c.discount_type === 'percentage') {
                discountInr = (subtotalInr * Number(c.discount_value)) / 100;
              } else {
                discountInr = Number(c.discount_value);
              }
            }
          }
        }
      }
    }

    const totalInr = Math.max(0, subtotalInr - discountInr);
    const amountInPaise = Math.round(totalInr * 100);

    const razorpayKey = Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_test_placeholder';
    const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || '';

    // Create Razorpay Order via API
    let razorpayOrderId = 'order_simulated_' + Math.random().toString(36).substring(2, 9);

    if (razorpaySecret) {
      const authCredentials = btoa(`${razorpayKey}:${razorpaySecret}`);
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authCredentials}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`,
          notes: {
            user_id: user.id,
            prompt_id: promptId || '',
            bundle_id: bundleId || '',
          },
        }),
      });

      if (!rzpRes.ok) {
        const errText = await rzpRes.text();
        throw new Error(`Razorpay API error: ${errText}`);
      }

      const rzpData = await rzpRes.json();
      razorpayOrderId = rzpData.id;
    }

    // Insert pending order into database
    const { data: orderRecord, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        coupon_id: couponRow?.id || null,
        razorpay_order_id: razorpayOrderId,
        subtotal_inr: subtotalInr,
        discount_inr: discountInr,
        total_inr: totalInr,
        currency: 'INR',
        status: 'pending',
        metadata: {
          prompt_title: targetPrompt?.title || targetBundle?.title,
          customer_email: user.email,
        },
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    if (targetPrompt) {
      await supabase.from('order_items').insert({
        order_id: orderRecord.id,
        prompt_id: targetPrompt.id,
        unit_price_inr: subtotalInr,
      });
    }

    return new Response(
      JSON.stringify({
        order_id: orderRecord.id,
        razorpay_order_id: razorpayOrderId,
        amount: amountInPaise,
        currency: 'INR',
        key_id: razorpayKey,
        total_inr: totalInr,
        discount_inr: discountInr,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown payment error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
