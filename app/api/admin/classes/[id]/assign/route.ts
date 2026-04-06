import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { studio_user_id } = await req.json()
  await query(
    `UPDATE classes SET studio_user_id = $1 WHERE id = $2`,
    [studio_user_id || null, id]
  )
  return NextResponse.json({ ok: true })
}
