import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Fix a class's stored date directly in the DB
// Usage: GET /api/admin/fix-date?secret=...&title=Guitar Trial Lesson&date=2026-06-04&time=4:00 PM
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const title = req.nextUrl.searchParams.get('title')
  const date = req.nextUrl.searchParams.get('date')   // ISO: YYYY-MM-DD
  const time = req.nextUrl.searchParams.get('time')   // e.g. "4:00 PM"

  if (!title || !date) {
    return NextResponse.json({ error: 'Missing title or date' }, { status: 400 })
  }

  // Find matching classes
  const found = await query(
    `SELECT id, title, date, time FROM classes WHERE LOWER(title) LIKE LOWER($1) AND status IS DISTINCT FROM 'deleted'`,
    [`%${title}%`]
  )

  if (found.rows.length === 0) {
    return NextResponse.json({ error: 'No matching class found', searched: title })
  }

  const results = []
  for (const cls of found.rows) {
    // Update class date/time
    const updateFields = time
      ? `date = $1, time = $2`
      : `date = $1`
    const updateParams = time ? [date, time, cls.id] : [date, cls.id]
    await query(`UPDATE classes SET ${updateFields} WHERE id = $${updateParams.length}`, updateParams)

    // Update any existing slots too
    const slotResult = await query(`SELECT id FROM class_slots WHERE class_id = $1`, [cls.id])
    if (slotResult.rows.length > 0) {
      const slotUpdate = time
        ? `UPDATE class_slots SET date = $1, time = $2 WHERE class_id = $3`
        : `UPDATE class_slots SET date = $1 WHERE class_id = $2`
      const slotParams = time ? [date, time, cls.id] : [date, cls.id]
      await query(slotUpdate, slotParams)
    } else if (time) {
      // No slot exists — create one with the correct date/time
      const spotRes = await query(`SELECT spots, spots_left, duration FROM classes WHERE id = $1`, [cls.id])
      const { spots, spots_left, duration } = spotRes.rows[0]
      await query(
        `INSERT INTO class_slots (class_id, date, time, duration, spots, spots_left) VALUES ($1, $2, $3, $4, $5, $6)`,
        [cls.id, date, time, duration || '60 min', spots || 10, spots_left || 10]
      )
    }

    results.push({ id: cls.id, title: cls.title, oldDate: cls.date, newDate: date, time: time || cls.time })
  }

  return NextResponse.json({ fixed: results })
}
