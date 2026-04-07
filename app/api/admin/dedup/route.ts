import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST() {
  // Find groups of classes with same title + instructor
  const dupes = await query(`
    SELECT LOWER(title) as title, LOWER(instructor) as instructor, array_agg(id ORDER BY created_at ASC) as ids
    FROM classes
    WHERE status IS DISTINCT FROM 'deleted'
    GROUP BY LOWER(title), LOWER(instructor)
    HAVING COUNT(*) > 1
  `)

  let merged = 0
  let removed = 0

  for (const group of dupes.rows) {
    const [masterId, ...dupeIds] = group.ids

    for (const dupeId of dupeIds) {
      // Move slots from duplicate to master (skip exact date+time duplicates)
      await query(`
        INSERT INTO class_slots (class_id, date, time, duration, spots, spots_left)
        SELECT $1, date, time, duration, spots, spots_left
        FROM class_slots
        WHERE class_id = $2
          AND (date, time) NOT IN (
            SELECT date, time FROM class_slots WHERE class_id = $1
          )
      `, [masterId, dupeId])

      // Mark duplicate as deleted
      await query(`UPDATE classes SET status = 'deleted' WHERE id = $1`, [dupeId])
      removed++
    }
    merged++
  }

  return NextResponse.json({ merged, removed, message: `Merged ${merged} duplicate group(s), removed ${removed} duplicate class(es)` })
}
