import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { query } from '@/lib/db'
import { getCustomerSession } from '@/lib/customer-auth'

export async function POST(req: NextRequest) {
  try {
    const { amount, classId, className, customerInfo, savedPaymentMethodId } = await req.json()

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
    const applicationFee = Math.round(amount * 0.25)

    // Get or create Stripe Customer for logged-in users
    let stripeCustomerId: string | undefined
    const session = await getCustomerSession()
    if (session) {
      const customerResult = await query(
        'SELECT stripe_customer_id, email, first_name, last_name FROM customers WHERE id = $1',
        [session.customerId]
      )
      const customer = customerResult.rows[0]
      if (customer?.stripe_customer_id) {
        stripeCustomerId = customer.stripe_customer_id
      } else if (customer) {
        const stripeCustomer = await stripe.customers.create({
          email: customer.email,
          name: `${customer.first_name} ${customer.last_name}`,
        })
        stripeCustomerId = stripeCustomer.id
        await query('UPDATE customers SET stripe_customer_id = $1 WHERE id = $2', [stripeCustomerId, session.customerId])
      }
    }

    const intentParams: any = {
      amount,
      currency: 'usd',
      metadata: { orderId, classId, className, customerEmail: customerInfo.email, customerName: `${customerInfo.firstName} ${customerInfo.lastName}` },
    }

    if (stripeCustomerId) {
      intentParams.customer = stripeCustomerId
      if (savedPaymentMethodId) {
        intentParams.payment_method = savedPaymentMethodId
      } else {
        intentParams.setup_future_usage = 'off_session'
      }
    }

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
