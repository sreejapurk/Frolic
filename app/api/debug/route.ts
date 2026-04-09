import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const result = await query(
    `SELECT id, title, video_url, video_urls FROM classes WHERE status IS DISTINCT FROM 'deleted' ORDER BY created_at DESC LIMIT 20`,
    []
  )
  return NextResponse.json(result.rows)
}
