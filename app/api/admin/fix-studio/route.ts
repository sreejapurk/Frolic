import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const r1 = await query(
      `UPDATE classes SET studio = 'Ira Klein Music Lessons'
       WHERE LOWER(instructor) LIKE '%ira klein%'
          OR LOWER(studio) LIKE '%brooklyn guitar%'`
    )
    const r2 = await query(
      `UPDATE classes SET subcategory = 'Guitar'
       WHERE LOWER(instructor) LIKE '%ira klein%'
         AND LOWER(title) LIKE '%guitar%'
         AND (LOWER(title) NOT LIKE '%piano%')`
    )
    const r3 = await query(
      `UPDATE classes SET subcategory = 'Piano'
       WHERE LOWER(instructor) LIKE '%ira klein%'
         AND LOWER(title) LIKE '%piano%'
         AND (LOWER(title) NOT LIKE '%guitar%')`
    )
    // For "Guitar/Piano" classes that teach both, clear subcategory so title is used
    const r4 = await query(
      `UPDATE classes SET subcategory = NULL
       WHERE LOWER(instructor) LIKE '%ira klein%'
         AND LOWER(title) LIKE '%guitar%'
         AND LOWER(title) LIKE '%piano%'`
    )
    return NextResponse.json({ updated: { studio: r1.rowCount, guitar: r2.rowCount, piano: r3.rowCount, both: r4.rowCount } })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
