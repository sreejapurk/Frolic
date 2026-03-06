import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM bookings ORDER BY created_at DESC'
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const result = await query(
      `INSERT INTO bookings (order_id, class_id, class_name, first_name, last_name, email, phone, amount, stripe_payment_id, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'paid')
       RETURNING *`,
      [
        data.orderId,
        data.classId,
        data.className,
        data.firstName,
        data.lastName,
        data.email,
        data.phone || null,
        data.amount,
        data.stripePaymentId || null,
      ]
    )
    // Decrement spots_left on the class
    await query(
      `UPDATE classes SET spots_left = spots_left - 1 WHERE id = $1 AND spots_left > 0`,
      [data.classId]
    )
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
