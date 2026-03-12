import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getStudioSession } from '@/lib/studio-auth'
import { query } from '@/lib/db'

export async function POST() {
  const session = await getStudioSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if studio already has a Stripe account
  const existing = await query(
    'SELECT stripe_account_id, stripe_onboarded FROM studio_users WHERE id = $1',
    [session.studioId]
  )
  const studio = existing.rows[0]

  let accountId = studio.stripe_account_id

  // Create a new Express account if they don't have one
  if (!accountId) {
    const account = await stripe.accounts.create({ type: 'express' })
    accountId = account.id
    await query(
      'UPDATE studio_users SET stripe_account_id = $1 WHERE id = $2',
      [accountId, session.studioId]
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://joinfrolic.com'

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/studio/dashboard?stripe=refresh`,
    return_url: `${baseUrl}/studio/dashboard?stripe=success`,
    type: 'account_onboarding',
  })

  return NextResponse.json({ url: accountLink.url })
}

export async function GET() {
  const session = await getStudioSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await query(
    'SELECT stripe_account_id, stripe_onboarded FROM studio_users WHERE id = $1',
    [session.studioId]
  )
  const studio = result.rows[0]

  if (!studio.stripe_account_id) {
    return NextResponse.json({ connected: false })
  }

  // Verify account status with Stripe
  const account = await stripe.accounts.retrieve(studio.stripe_account_id)
  const onboarded = account.details_submitted

  if (onboarded && !studio.stripe_onboarded) {
    await query('UPDATE studio_users SET stripe_onboarded = true WHERE id = $1', [session.studioId])
  }

  return NextResponse.json({ connected: onboarded, accountId: studio.stripe_account_id })
}
