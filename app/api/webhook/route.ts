import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any
    const { orderId } = paymentIntent.metadata

    if (orderId) {
      await query(
        `UPDATE bookings SET payment_status = 'paid' WHERE order_id = $1`,
        [orderId]
      )
    }
  }

  return NextResponse.json({ received: true })
}
