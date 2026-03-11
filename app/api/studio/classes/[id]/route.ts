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
    `UPDATE classes SET title=$1, category=$2, price=$3, level=$4, duration=$5, date=$6, time=$7, spots=$8, distance=$9, image=$10, instructor=$11, room=$12
     WHERE id=$13 AND studio_user_id=$14 RETURNING *`,
    [data.title, data.category, data.price, data.level, data.duration,
     data.date, data.time, data.spots, data.distance, data.image, data.instructor, data.room, id, session.studioId]
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
