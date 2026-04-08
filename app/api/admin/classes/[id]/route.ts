import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()

  const slots: any[] = data.slots || []
  const firstSlot = slots[0] || {}
  const date = firstSlot.date || data.date || ''
  const time = firstSlot.time || data.time || ''
  const duration = firstSlot.duration || data.duration || '60 min'
  const spots = parseInt(firstSlot.spots || data.spots || '10') || 10

  await query(
    `UPDATE classes SET
      title=$1, studio=$2, category=$3, subcategory=$4, price=$5, level=$6,
      duration=$7, date=$8, time=$9, spots=$10, image=$11, instructor=$12,
      room=$13, room_maps_url=$14, recurring=$15, description=$16,
      location_type=$17, location_types=$18, price_location=$19, price_online=$20,
      price_residence=$21, instructor_background=$22, video_url=$23, distance=$24,
      video_urls=$25, video_thumbnail=$26
    WHERE id=$27`,
    [data.title, data.studio, data.category, data.subcategory || null, data.price, data.level,
     duration, date, time, spots, data.image || null, data.instructor,
     data.room || null, data.room_maps_url || null, data.recurring ?? false, data.description || null,
     data.location_type || 'location', data.location_types || null,
     data.price_location || null, data.price_online || null,
     data.price_residence || null, data.instructor_background || null,
     data.video_url || null, data.distance || '',
     data.video_urls?.filter(Boolean) || null, data.video_thumbnail || null, id]
  )

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

  return NextResponse.json({ ok: true })
}
