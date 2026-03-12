import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getStudioSession } from '@/lib/studio-auth'

export async function GET() {
  const session = await getStudioSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await query(
    `SELECT
      b.id, b.order_id, b.class_name, b.first_name, b.last_name,
      b.amount, b.payment_status, b.created_at
     FROM bookings b
     JOIN classes c ON b.class_id = c.id
     WHERE c.studio_user_id = $1
     ORDER BY b.created_at DESC`,
    [session.studioId]
  )

  const bookings = result.rows
  const totalRevenue = bookings
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + parseFloat(b.amount), 0)

  const totalBookings = bookings.filter(b => b.payment_status === 'paid').length

  return NextResponse.json({ bookings, totalRevenue, totalBookings })
}
