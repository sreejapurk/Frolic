import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await query(`UPDATE classes SET status = 'active' WHERE id = $1`, [id])
  return NextResponse.json({ ok: true })
}
