import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { query } from '@/lib/db'
import { getCustomerSession } from '@/lib/customer-auth'

export async function GET() {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ methods: [] })

  const result = await query('SELECT stripe_customer_id FROM customers WHERE id = $1', [session.customerId])
  const stripeCustomerId = result.rows[0]?.stripe_customer_id
  if (!stripeCustomerId) return NextResponse.json({ methods: [] })

  try {
    const methods = await stripe.paymentMethods.list({ customer: stripeCustomerId, type: 'card' })
    return NextResponse.json({
      methods: methods.data.map(m => ({
        id: m.id,
        brand: m.card?.brand,
        last4: m.card?.last4,
        exp_month: m.card?.exp_month,
        exp_year: m.card?.exp_year,
      }))
    })
  } catch {
    return NextResponse.json({ methods: [] })
  }
}
