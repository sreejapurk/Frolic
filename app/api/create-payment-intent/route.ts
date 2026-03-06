import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { amount, classId, className, customerInfo } = await req.json()

    const orderId = `FRO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: {
        orderId,
        classId,
        className,
        customerEmail: customerInfo.email,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId,
    })
  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}