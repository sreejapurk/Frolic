import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getStudioSession } from '@/lib/studio-auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStudioSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const data = await req.json()

  const slots: any[] = data.slots || []
  const firstSlot = slots[0] || {}
  const date = firstSlot.date || data.date || ''
  const time = firstSlot.time || data.time || ''
  const duration = firstSlot.duration || data.duration || '60 min'
  const spots = parseInt(firstSlot.spots || data.spots || '10') || 10

  const result = await query(
    `UPDATE classes SET title=$1, category=$2, subcategory=$3, price=$4, level=$5, duration=$6, date=$7, time=$8, spots=$9, distance=$10, image=$11, instructor=$12, room=$13, room_maps_url=$14, recurring=$15, description=$16, location_type=$17, location_types=$18, price_location=$19, price_online=$20, price_residence=$21
     WHERE id=$22 AND studio_user_id=$23 RETURNING *`,
    [data.title, data.category, data.subcategory || null, data.price, data.level, duration,
     date, time, spots, data.distance, data.image, data.instructor, data.room, data.room_maps_url || null, data.recurring ?? false, data.description || null, data.location_type || 'location', data.location_types || null,
     data.price_location || null, data.price_online || null, data.price_residence || null, id, session.studioId]
  )

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 })
  }

  // Replace slots
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
  const session = await getStudioSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  await query(
    `UPDATE classes SET status='deleted' WHERE id=$1 AND studio_user_id=$2`,
    [id, session.studioId]
  )
  return NextResponse.json({ ok: true })
}
