import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { amount, classId, className, customerInfo } = await req.json()

    const orderId = `FRO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    // Look up the studio's Stripe account for this class
    const classResult = await query(
      `SELECT su.stripe_account_id, su.stripe_onboarded
       FROM classes c
       JOIN studio_users su ON c.studio_user_id = su.id
       WHERE c.id = $1`,
      [classId]
    )

    const studioStripeAccount = classResult.rows[0]?.stripe_account_id
    const studioOnboarded = classResult.rows[0]?.stripe_onboarded

    // 25% platform fee
    const applicationFee = Math.round(amount * 0.25)

    const intentParams: any = {
      amount,
      currency: 'usd',
      metadata: {
        orderId,
        classId,
        className,
        customerEmail: customerInfo.email,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
      },
    }

    // Only apply Stripe Connect split if studio has connected their account
    // Skip in test mode (test keys can't transfer to live Connect accounts)
    const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')
    if (studioStripeAccount && studioOnboarded && !isTestMode) {
      intentParams.application_fee_amount = applicationFee
      intentParams.transfer_data = { destination: studioStripeAccount }
    }

    const paymentIntent = await stripe.paymentIntents.create(intentParams)

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, orderId })
  } catch (error: any) {
    console.error('Payment intent error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to create payment intent' }, { status: 500 })
  }
}
