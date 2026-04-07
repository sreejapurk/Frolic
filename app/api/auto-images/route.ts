import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { generateAndStoreImage } from '@/lib/generate-image'

export async function GET(req: NextRequest) {
  // Auth temporarily disabled — re-enable after regenerating images
  const regenerate = req.nextUrl.searchParams.get('regenerate') === 'true'
  const titleFilter = req.nextUrl.searchParams.get('title')

  if (regenerate) {
    await query(`UPDATE classes SET image = NULL WHERE status IS DISTINCT FROM 'deleted'`, [])
    return NextResponse.json({ message: 'Images cleared. Now call /api/auto-images?all=true to regenerate all.' })
  }

  if (titleFilter) {
    await query(`UPDATE classes SET image = NULL WHERE LOWER(title) LIKE LOWER($1) AND status IS DISTINCT FROM 'deleted'`, [`%${titleFilter}%`])
  }

  const allMode = req.nextUrl.searchParams.get('all') === 'true'

  const pending = await query(
    `SELECT id, title, category, subcategory FROM classes WHERE (image IS NULL OR image = '' OR image = 'skip') AND status IS DISTINCT FROM 'deleted'`,
    []
  )

  if (pending.rows.length === 0) {
    return NextResponse.json({ done: true, message: 'All images generated!' })
  }

  const toProcess = allMode ? pending.rows : [pending.rows[0]]
  const results: any[] = []

  for (const row of toProcess) {
    try {
      const imageUrl = await generateAndStoreImage(row.title || '', row.category || '', row.subcategory || '')
      if (imageUrl) {
        await query(`UPDATE classes SET image = $1 WHERE id = $2`, [imageUrl, row.id])
        results.push({ generated: row.title })
      } else {
        await query(`UPDATE classes SET image = 'skip' WHERE id = $1`, [row.id])
        results.push({ skipped: row.title, error: 'returned null' })
      }
    } catch (err: any) {
      await query(`UPDATE classes SET image = 'skip' WHERE id = $1`, [row.id])
      results.push({ skipped: row.title, error: err?.message || String(err) })
    }
  }

  return NextResponse.json(allMode ? { done: true, results } : results[0])
}
