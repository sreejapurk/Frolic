import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getStudioSession } from '@/lib/studio-auth'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  const session = await getStudioSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const result = await query(
    `SELECT * FROM classes WHERE studio_user_id = $1 AND status != 'deleted' ORDER BY created_at DESC`,
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
    const result = await query(
      `INSERT INTO classes (id, title, studio, category, price, level, duration, date, time, spots, spots_left, distance, rating, image, instructor, room, room_maps_url, studio_user_id, recurring, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'active')
       RETURNING *`,
      [id, data.title, session.studioName, data.category, data.price, data.level,
       data.duration || '', data.date, data.time, data.spots, data.spots,
       data.distance || '', data.rating || '4.9', data.image || '', data.instructor, data.room, data.room_maps_url || null, session.studioId, data.recurring ?? false]
    )
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}
