import { NextResponse } from 'next/server'
import { getCustomerSession } from '@/lib/customer-auth'
import { query } from '@/lib/db'

export async function GET() {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await query(
    'SELECT id, email, first_name, last_name, created_at FROM customers WHERE id = $1',
    [session.customerId]
  )
  if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const bookings = await query(
    'SELECT * FROM bookings WHERE email = $1 ORDER BY created_at DESC',
    [result.rows[0].email]
  )

  return NextResponse.json({ customer: result.rows[0], bookings: bookings.rows })
}
