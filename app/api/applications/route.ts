import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM applications ORDER BY created_at DESC'
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const result = await query(
      `INSERT INTO applications (name, studio_name, email, instagram, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.name, data.studio, data.email, data.instagram, data.phone]
    )
    return NextResponse.json(result.rows[0])
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}