import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
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
     WHERE c.status IS DISTINCT FROM 'deleted'
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
    []
  )
  return NextResponse.json(result.rows)
}
