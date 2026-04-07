import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { generateAndStoreImage } from '@/lib/generate-image'

export async function GET(req: NextRequest) {
  // Auth temporarily disabled — re-enable after regenerating images
  const regenerate = req.nextUrl.searchParams.get('regenerate') === 'true'
  const titleFilter = req.nextUrl.searchParams.get('title')

  if (regenerate) {
    await query(`UPDATE classes SET image = NULL WHERE status IS DISTINCT FROM 'deleted'`, [])
    return NextResponse.json({ message: 'Images cleared. Now call /api/auto-images repeatedly until remaining reaches 0.' })
  }

  if (titleFilter) {
    await query(`UPDATE classes SET image = NULL WHERE LOWER(title) LIKE LOWER($1) AND status IS DISTINCT FROM 'deleted'`, [`%${titleFilter}%`])
  }

  // Process one image at a time to avoid timeouts (include previously skipped)
  const result = await query(
    `SELECT id, title, category, subcategory FROM classes WHERE (image IS NULL OR image = '' OR image = 'skip') AND status IS DISTINCT FROM 'deleted' LIMIT 1`,
    []
  )

  const remaining = await query(
    `SELECT COUNT(*) as count FROM classes WHERE (image IS NULL OR image = '' OR image = 'skip') AND status IS DISTINCT FROM 'deleted'`,
    []
  )
  const totalRemaining = parseInt(remaining.rows[0].count)

  if (result.rows.length === 0) {
    return NextResponse.json({ done: true, message: 'All images generated!' })
  }

  const row = result.rows[0]
  try {
    const imageUrl = await generateAndStoreImage(row.title || '', row.category || '', row.subcategory || '')
    if (imageUrl) {
      await query(`UPDATE classes SET image = $1 WHERE id = $2`, [imageUrl, row.id])
      return NextResponse.json({ generated: row.title, remaining: totalRemaining - 1 })
    } else {
      // Skip this class to avoid infinite loop
      await query(`UPDATE classes SET image = 'skip' WHERE id = $1`, [row.id])
      return NextResponse.json({ skipped: row.title, error: 'returned null', remaining: totalRemaining - 1 })
    }
  } catch (err: any) {
    // Skip this class to avoid infinite loop
    await query(`UPDATE classes SET image = 'skip' WHERE id = $1`, [row.id])
    return NextResponse.json({ skipped: row.title, error: err?.message || String(err), remaining: totalRemaining - 1 })
  }
}
