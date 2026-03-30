import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { generateAndStoreImage } from '@/lib/generate-image'

export async function GET(req: NextRequest) {
  const regenerate = req.nextUrl.searchParams.get('regenerate') === 'true'

  if (regenerate) {
    await query(`UPDATE classes SET image = NULL WHERE status IS DISTINCT FROM 'deleted'`, [])
  }

  const result = await query(
    `SELECT id, title, category, subcategory FROM classes WHERE (image IS NULL OR image = '') AND status IS DISTINCT FROM 'deleted'`,
    []
  )

  let success = 0
  const errors: { title: string, error: string }[] = []

  for (const row of result.rows) {
    try {
      const imageUrl = await generateAndStoreImage(row.title || '', row.category || '', row.subcategory || '')
      if (imageUrl) {
        await query(`UPDATE classes SET image = $1 WHERE id = $2`, [imageUrl, row.id])
        success++
      } else {
        errors.push({ title: row.title, error: 'generate-image returned null — check server logs' })
      }
    } catch (err: any) {
      errors.push({ title: row.title, error: err?.message || String(err) })
    }
  }

  return NextResponse.json({ generated: success, total: result.rows.length, errors })
}
