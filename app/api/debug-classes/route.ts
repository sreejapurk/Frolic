import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const result = await query('SELECT id, title, status, studio_user_id, created_at FROM classes ORDER BY created_at DESC', [])
  return NextResponse.json(result.rows)
}
