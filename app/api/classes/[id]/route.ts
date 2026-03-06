import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const result = await query('SELECT * FROM classes WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error fetching class:', error)
    return NextResponse.json({ error: 'Failed to fetch class' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await query('UPDATE classes SET status = $1 WHERE id = $2', ['deleted', id])
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 })
  }
}
