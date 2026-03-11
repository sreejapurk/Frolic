import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    await query(`
      ALTER TABLE classes ADD COLUMN IF NOT EXISTS studio_user_id UUID REFERENCES studio_users(id)
    `)
    return NextResponse.json({ message: 'Migration successful' })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
}
