import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts';

// Cryptographic HMAC SHA256 verification using Web Crypto API
async function verifyHmacSha256(rawBody: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));
  const hashHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex === signature;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || '';

    const rawBody = await req.text();

    // Verify cryptographic signature if secret is configured
    if (webhookSecret && signature) {
      const isValid = await verifyHmacSha256(rawBody, signature, webhookSecret);
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Invalid HMAC signature' }), { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // We process order.paid or payment.captured
    if (event !== 'order.paid' && event !== 'payment.captured') {
      return new Response(JSON.stringify({ status: 'ignored_event' }), { status: 200 });
    }

    const paymentEntity = payload.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id;
    const razorpayPaymentId = paymentEntity?.id;

    if (!razorpayOrderId) {
      return new Response(JSON.stringify({ error: 'Missing order_id in webhook payload' }), {
        status: 400,
      });
    }

    const supabase = getSupabaseAdmin();

    // 1. Fetch Order Record
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, user_id, status, total_inr, coupon_id')
      .eq('razorpay_order_id', razorpayOrderId)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'Order not found in database' }), { status: 404 });
    }

    // 2. IDEMPOTENCY CHECK: If already processed, exit cleanly
    if (order.status === 'paid') {
      return new Response(JSON.stringify({ status: 'already_fulfilled' }), { status: 200 });
    }

    // 3. Mark Order Paid
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        razorpay_payment_id: razorpayPaymentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    // If coupon used, increment coupon usage count
    if (order.coupon_id) {
      await supabase.rpc('increment_coupon_uses', { p_coupon_id: order.coupon_id }).catch(() => {});
    }

    // 4. Retrieve ordered prompt items
    const { data: items } = await supabase
      .from('order_items')
      .select('prompt_id, unit_price_inr')
      .eq('order_id', order.id);

    if (items && items.length > 0) {
      for (const item of items) {
        // Insert entitlement into purchases
        await supabase
          .from('purchases')
          .insert({
            user_id: order.user_id,
            prompt_id: item.prompt_id,
            order_id: order.id,
            price_paid_inr: item.unit_price_inr,
          })
          .catch(() => {}); // Unique constraint prevents duplicate entitlements

        // Increment sales count on prompt
        await supabase
          .from('prompts')
          .update({
            sales_count: (await supabase.from('prompts').select('sales_count').eq('id', item.prompt_id).single()).data?.sales_count + 1 || 1,
          })
          .eq('id', item.prompt_id);

        // Calculate seller earnings and credit balance
        const { data: promptData } = await supabase
          .from('prompts')
          .select('user_id')
          .eq('id', item.prompt_id)
          .single();

        if (promptData?.user_id) {
          const { data: seller } = await supabase
            .from('profiles')
            .select('commission_rate, seller_balance_inr')
            .eq('id', promptData.user_id)
            .single();

          if (seller) {
            const commission = Number(seller.commission_rate || 15);
            const netEarnings = Number(item.unit_price_inr) * (1 - commission / 100);
            const newBalance = Number(seller.seller_balance_inr || 0) + netEarnings;

            await supabase
              .from('profiles')
              .update({ seller_balance_inr: newBalance })
              .eq('id', promptData.user_id);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, order_id: order.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
