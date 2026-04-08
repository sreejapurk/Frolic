import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getCustomerSession } from '@/lib/customer-auth'

async function getStudioIdForCustomer(customerId: string) {
  const customer = await query('SELECT email FROM customers WHERE id = $1', [customerId])
  if (customer.rows.length === 0) return null
  const studio = await query('SELECT id FROM studio_users WHERE LOWER(email) = LOWER($1)', [customer.rows[0].email])
  return studio.rows[0]?.id || null
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const studioId = await getStudioIdForCustomer(session.customerId)
  if (!studioId) return NextResponse.json({ error: 'No studio account linked to this email' }, { status: 403 })

  const { id } = await params
  const data = await req.json()

  const slots: any[] = data.slots || []
  const firstSlot = slots[0] || {}
  const date = firstSlot.date || data.date || ''
  const time = firstSlot.time || data.time || ''
  const duration = firstSlot.duration || data.duration || '60 min'
  const spots = parseInt(firstSlot.spots || data.spots || '10') || 10

  const result = await query(
    `UPDATE classes SET title=$1, category=$2, subcategory=$3, price=$4, level=$5, duration=$6, date=$7, time=$8, spots=$9, image=$10, instructor=$11, room=$12, room_maps_url=$13, recurring=$14, description=$15, location_type=$16, location_types=$17, price_location=$18, price_online=$19, price_residence=$20, instructor_background=$21, video_url=$22, video_urls=$23, video_thumbnail=$24
     WHERE id=$25 AND studio_user_id=$26 RETURNING *`,
    [data.title, data.category, data.subcategory || null, data.price, data.level, duration,
     date, time, spots, data.image, data.instructor, data.room, data.room_maps_url || null,
     data.recurring ?? false, data.description || null, data.location_type || 'location',
     data.location_types || null, data.price_location || null, data.price_online || null,
     data.price_residence || null, data.instructor_background || null, data.video_url || null,
     data.video_urls?.filter(Boolean) || null, data.video_thumbnail || null, id, studioId]
  )

  if (result.rows.length === 0) return NextResponse.json({ error: 'Class not found' }, { status: 404 })

  await query('DELETE FROM class_slots WHERE class_id = $1', [id])
  for (const slot of slots) {
    if (!slot.date || !slot.time) continue
    const slotSpots = parseInt(slot.spots) || 10
    await query(
      `INSERT INTO class_slots (class_id, date, time, duration, spots, spots_left) VALUES ($1, $2, $3, $4, $5, $5)`,
      [id, slot.date, slot.time, slot.duration || '60 min', slotSpots]
    )
  }

  return NextResponse.json(result.rows[0])
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCustomerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const studioId = await getStudioIdForCustomer(session.customerId)
  if (!studioId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await query(`UPDATE classes SET status='deleted' WHERE id=$1 AND studio_user_id=$2`, [id, studioId])
  return NextResponse.json({ ok: true })
}
