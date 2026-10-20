import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

async function verifyHmacSha256(data: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const hashHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex === signature;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseAdmin();
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { orderId, paymentId, signature } = await req.json();

    const { data: order, error: oErr } = await supabase
      .from('orders')
      .select('id, user_id, razorpay_order_id, status, total_inr')
      .eq('id', orderId)
      .single();

    if (oErr || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If order already paid via webhook, return success immediately
    if (order.status === 'paid') {
      return new Response(JSON.stringify({ success: true, message: 'Payment verified' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify HMAC signature
    const secret = Deno.env.get('RAZORPAY_KEY_SECRET') || '';
    if (secret && signature && order.razorpay_order_id) {
      const payload = `${order.razorpay_order_id}|${paymentId}`;
      const isValid = await verifyHmacSha256(payload, signature, secret);
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Signature mismatch' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Mark paid and grant entitlement
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        razorpay_payment_id: paymentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    const { data: items } = await supabase
      .from('order_items')
      .select('prompt_id, unit_price_inr')
      .eq('order_id', order.id);

    if (items) {
      for (const item of items) {
        await supabase
          .from('purchases')
          .insert({
            user_id: order.user_id,
            prompt_id: item.prompt_id,
            order_id: order.id,
            price_paid_inr: item.unit_price_inr,
          })
          .catch(() => {});
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Verification error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
