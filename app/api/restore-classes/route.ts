import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  await query(`UPDATE classes SET status = 'active'`)
  const result = await query(`SELECT id, title, status FROM classes`)
  return NextResponse.json({ updated: result.rows })
}
