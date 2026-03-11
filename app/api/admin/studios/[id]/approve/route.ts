import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await query('UPDATE studio_users SET approved = true WHERE id = $1', [id])
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to approve studio' }, { status: 500 })
  }
}
