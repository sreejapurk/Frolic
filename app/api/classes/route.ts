import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM classes WHERE status = $1 ORDER BY created_at DESC',
      ['active']
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const id = uuidv4()
    const result = await query(
      `INSERT INTO classes (id, title, studio, category, price, level, duration, date, time, spots, spots_left, distance, rating, image, instructor, room)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [id, data.title, data.studio, data.category, data.price, data.level,
       data.duration, data.date, data.time, data.spots, data.spots,
       data.distance, data.rating || '4.9', data.image, data.instructor, data.room]
    )
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}