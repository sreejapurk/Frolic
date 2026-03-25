import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getStudioSession } from '@/lib/studio-auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getStudioSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const data = await req.json()

  // Only update if this class belongs to the studio
  const result = await query(
    `UPDATE classes SET title=$1, category=$2, subcategory=$3, price=$4, level=$5, duration=$6, date=$7, time=$8, spots=$9, distance=$10, image=$11, instructor=$12, room=$13, room_maps_url=$14, recurring=$15, description=$16, location_type=$17, location_types=$18, price_location=$19, price_online=$20, price_residence=$21
     WHERE id=$22 AND studio_user_id=$23 RETURNING *`,
    [data.title, data.category, data.subcategory || null, data.price, data.level, data.duration,
     data.date, data.time, data.spots, data.distance, data.image, data.instructor, data.room, data.room_maps_url || null, data.recurring ?? false, data.description || null, data.location_type || 'location', data.location_types || null,
     data.price_location || null, data.price_online || null, data.price_residence || null, id, session.studioId]
  )

  if (result.rows.length === 0) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 })
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
