import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

// Update all slots for classes matching instructor/title filters
export async function POST(req: NextRequest) {
  const { instructor, oldDay, newDay, oldTime, newTime } = await req.json()

  if (!instructor) return NextResponse.json({ error: 'instructor required' }, { status: 400 })

  // Find all classes for this instructor
  const classes = await query(
    `SELECT id FROM classes WHERE LOWER(instructor) LIKE LOWER($1) AND status IS DISTINCT FROM 'deleted'`,
    [`%${instructor}%`]
  )

  if (classes.rows.length === 0) return NextResponse.json({ error: 'No classes found for this instructor' }, { status: 404 })

  const classIds = classes.rows.map((c: any) => c.id)
  let updated = 0

  for (const classId of classIds) {
    // Build dynamic update conditions
    let updateQuery = `UPDATE class_slots SET`
    const setClauses: string[] = []
    const params: any[] = []
    let paramIdx = 1

    if (newDay) {
      setClauses.push(` date = $${paramIdx}`)
      params.push(newDay)
      paramIdx++
    }
    if (newTime) {
      setClauses.push(` time = $${paramIdx}`)
      params.push(newTime)
      paramIdx++
    }

    if (setClauses.length === 0) continue

    updateQuery += setClauses.join(',') + ` WHERE class_id = $${paramIdx}`
    params.push(classId)
    paramIdx++

    // Only update slots matching the old day/time if specified
    if (oldDay) {
      updateQuery += ` AND LOWER(date) = LOWER($${paramIdx})`
      params.push(oldDay)
      paramIdx++
    }
    if (oldTime) {
      updateQuery += ` AND LOWER(time) = LOWER($${paramIdx})`
      params.push(oldTime)
      paramIdx++
    }

    const result = await query(updateQuery, params)
    updated += result.rowCount || 0
  }

  // Also update the main date/time on the classes table
  if (newDay || newTime) {
    for (const classId of classIds) {
      const setClauses: string[] = []
      const params: any[] = []
      let paramIdx = 1
      if (newDay) { setClauses.push(`date = $${paramIdx}`); params.push(newDay); paramIdx++ }
      if (newTime) { setClauses.push(`time = $${paramIdx}`); params.push(newTime); paramIdx++ }
      params.push(classId)
      await query(`UPDATE classes SET ${setClauses.join(', ')} WHERE id = $${paramIdx}`, params)
    }
  }

  return NextResponse.json({ updated, classes: classes.rows.length })
}
