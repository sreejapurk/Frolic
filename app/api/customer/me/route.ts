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

  // Check if this customer email also has a studio account
  const studioUser = await query(
    `SELECT id, studio_name FROM studio_users WHERE LOWER(email) = LOWER($1)`,
    [result.rows[0].email]
  )
  let studioClasses: any[] = []
  if (studioUser.rows.length > 0) {
    const studioId = studioUser.rows[0].id
    const classResult = await query(
      `SELECT c.*,
        COALESCE(
          json_agg(
            json_build_object('id', s.id, 'date', s.date, 'time', s.time, 'duration', s.duration, 'spots', s.spots, 'spots_left', s.spots_left)
            ORDER BY s.time
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) as slots
       FROM classes c
       LEFT JOIN class_slots s ON s.class_id = c.id
       WHERE c.studio_user_id = $1 AND c.status IS DISTINCT FROM 'deleted'
       GROUP BY c.id ORDER BY c.created_at DESC`,
      [studioId]
    )
    studioClasses = classResult.rows
  }

  return NextResponse.json({
    customer: result.rows[0],
    bookings: bookings.rows,
    studioName: studioUser.rows[0]?.studio_name || null,
    studioClasses,
  })
}
