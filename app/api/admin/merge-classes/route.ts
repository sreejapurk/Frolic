import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const instructor = req.nextUrl.searchParams.get('instructor')
  if (!instructor) return NextResponse.json({ error: 'instructor param required' }, { status: 400 })

  const result = await query(
    `SELECT c.*, COALESCE(json_agg(s ORDER BY s.date, s.time) FILTER (WHERE s.id IS NOT NULL), '[]'::json) as slots
     FROM classes c
     LEFT JOIN class_slots s ON s.class_id = c.id
     WHERE LOWER(c.instructor) LIKE LOWER($1) AND c.status IS DISTINCT FROM 'deleted'
     GROUP BY c.id ORDER BY c.created_at ASC`,
    [`%${instructor}%`]
  )
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const { instructor } = await req.json()
  if (!instructor) return NextResponse.json({ error: 'instructor required' }, { status: 400 })

  // Get all classes for this instructor
  const result = await query(
    `SELECT c.*, COALESCE(json_agg(s ORDER BY s.date, s.time) FILTER (WHERE s.id IS NOT NULL), '[]'::json) as slots
     FROM classes c
     LEFT JOIN class_slots s ON s.class_id = c.id
     WHERE LOWER(c.instructor) LIKE LOWER($1) AND c.status IS DISTINCT FROM 'deleted'
     GROUP BY c.id ORDER BY c.created_at ASC`,
    [`%${instructor}%`]
  )

  const classes = result.rows
  if (classes.length <= 1) return NextResponse.json({ message: 'Nothing to merge', classes: classes.length })

  // Keep the first class as master
  const master = classes[0]
  const toMerge = classes.slice(1)

  // Collect all slots from the other classes and add to master
  for (const cls of toMerge) {
    for (const slot of cls.slots) {
      // Check if this slot already exists on the master
      await query(
        `INSERT INTO class_slots (class_id, date, time, duration, spots, spots_left)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [master.id, slot.date, slot.time, slot.duration || '60 min', slot.spots || 10, slot.spots_left ?? slot.spots ?? 10]
      )
    }
    // Mark the merged class as deleted
    await query(`UPDATE classes SET status = 'deleted' WHERE id = $1`, [cls.id])
  }

  return NextResponse.json({
    message: `Merged ${toMerge.length} classes into "${master.title}"`,
    masterId: master.id,
    merged: toMerge.map(c => c.title)
  })
}
