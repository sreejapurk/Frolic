import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { generateAndStoreImage } from '@/lib/generate-image'

export async function GET() {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 })
  }

  const result = await query(
    `SELECT id, title, category, subcategory FROM classes WHERE (image IS NULL OR image = '') AND status IS DISTINCT FROM 'deleted'`,
    []
  )

  let success = 0
  const errors: string[] = []

  for (const row of result.rows) {
    const imageUrl = await generateAndStoreImage(row.title || '', row.category || '', row.subcategory || '')
    if (imageUrl) {
      await query(`UPDATE classes SET image = $1 WHERE id = $2`, [imageUrl, row.id])
      success++
    } else {
      errors.push(row.title)
    }
  }

  return NextResponse.json({ generated: success, total: result.rows.length, failed: errors })
}
