import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    await query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS studio_user_id UUID REFERENCES studio_users(id)`)
    await query(`ALTER TABLE studio_users ADD COLUMN IF NOT EXISTS stripe_account_id TEXT`)
    await query(`ALTER TABLE studio_users ADD COLUMN IF NOT EXISTS stripe_onboarded BOOLEAN DEFAULT false`)
    await query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS recurring BOOLEAN DEFAULT false`)
    await query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS room_maps_url TEXT`)
    await query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS description TEXT`)
    await query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'location'`)
    await query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS location_types TEXT[]`)
    await query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS price_location NUMERIC`)
    await query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS price_online NUMERIC`)
    await query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS price_residence NUMERIC`)
    await query(`UPDATE classes SET status = 'active' WHERE status IS NULL OR status = '' OR status = 'deleted'`)
    return NextResponse.json({ message: 'Migration successful' })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
}
