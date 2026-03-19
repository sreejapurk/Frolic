import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await query('SELECT data, mime_type FROM images WHERE id = $1', [id])
  if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data, mime_type } = result.rows[0]
  const buffer = Buffer.from(data, 'base64')
  return new NextResponse(buffer, {
    headers: { 'Content-Type': mime_type, 'Cache-Control': 'public, max-age=31536000' },
  })
}
