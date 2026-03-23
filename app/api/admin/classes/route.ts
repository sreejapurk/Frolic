import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  const result = await query("SELECT * FROM classes WHERE status IS DISTINCT FROM 'deleted' ORDER BY created_at DESC", [])
  return NextResponse.json(result.rows)
}
