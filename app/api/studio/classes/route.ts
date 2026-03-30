import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getStudioSession } from '@/lib/studio-auth'
import { v4 as uuidv4 } from 'uuid'
import { generateAndStoreImage } from '@/lib/generate-image'

export async function GET() {
  const session = await getStudioSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await query(
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
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
    [session.studioId]
  )
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const session = await getStudioSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const data = await req.json()
    const id = uuidv4()
    // Auto-generate image if none provided
    let image = data.image || ''
    if (!image) {
      const generated = await generateAndStoreImage(data.title || '', data.category || '', data.subcategory || '')
      if (generated) image = generated
    }

    const slots: any[] = data.slots || []
    const firstSlot = slots[0] || {}
    const date = firstSlot.date || data.date || ''
    const time = firstSlot.time || data.time || ''
    const duration = firstSlot.duration || data.duration || '60 min'
    const spots = parseInt(firstSlot.spots || data.spots || '10') || 10

    const result = await query(
      `INSERT INTO classes (id, title, studio, category, subcategory, price, level, duration, date, time, spots, spots_left, distance, rating, image, instructor, room, room_maps_url, studio_user_id, recurring, status, description, location_type, location_types, price_location, price_online, price_residence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'active', $21, $22, $23, $24, $25, $26)
       RETURNING *`,
      [id, data.title, session.studioName, data.category, data.subcategory || null, data.price, data.level,
       duration, date, time, spots, spots,
       data.distance || '', data.rating || '4.9', image, data.instructor, data.room, data.room_maps_url || null, session.studioId, data.recurring ?? false, data.description || null, data.location_type || 'location', data.location_types || null,
       data.price_location || null, data.price_online || null, data.price_residence || null]
    )

    // Insert slots
    for (const slot of slots) {
      if (!slot.date || !slot.time) continue
      const slotSpots = parseInt(slot.spots) || 10
      await query(
        `INSERT INTO class_slots (class_id, date, time, duration, spots, spots_left) VALUES ($1, $2, $3, $4, $5, $5)`,
        [id, slot.date, slot.time, slot.duration || '60 min', slotSpots]
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}
