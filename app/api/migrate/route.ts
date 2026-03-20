import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    await query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS studio_user_id UUID REFERENCES studio_users(id)`)
    await query(`ALTER TABLE studio_users ADD COLUMN IF NOT EXISTS stripe_account_id TEXT`)
    await query(`ALTER TABLE studio_users ADD COLUMN IF NOT EXISTS stripe_onboarded BOOLEAN DEFAULT false`)
    await query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS recurring BOOLEAN DEFAULT false`)
    await query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS room_maps_url TEXT`)
    await query(`UPDATE classes SET status = 'active' WHERE status IS NULL OR status = ''`)
    return NextResponse.json({ message: 'Migration successful' })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
}
