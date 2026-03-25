import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

const SUBCATEGORY_KEYWORDS: Record<string, string[]> = {
  // Music
  Piano: ['piano', 'pianist'],
  Guitar: ['guitar', 'guitarist', 'acoustic', 'electric guitar'],
  Vocals: ['vocal', 'vocals', 'singing', 'sing', 'voice', 'choir', 'opera'],
  Drums: ['drum', 'drums', 'drumming', 'percussion', 'beats'],
  Violin: ['violin', 'violinist', 'fiddle'],
  Flute: ['flute', 'flutist'],
  Ukulele: ['ukulele', 'uke'],
  Bass: ['bass guitar', 'bass'],
  Saxophone: ['saxophone', 'sax'],
  Trumpet: ['trumpet', 'trumpeter'],
  Keyboard: ['keyboard', 'keys', 'synth'],
  Harp: ['harp', 'harpist'],
  // Sports
  Basketball: ['basketball', 'hoops', 'nba'],
  Soccer: ['soccer', 'football', 'futsal'],
  Tennis: ['tennis'],
  Swimming: ['swimming', 'swim', 'pool', 'aqua'],
  Yoga: ['yoga', 'yogi', 'vinyasa', 'hatha', 'ashtanga', 'yin yoga'],
  Pilates: ['pilates'],
  Boxing: ['boxing', 'box', 'kickboxing', 'muay thai'],
  'Martial Arts': ['martial arts', 'karate', 'judo', 'taekwondo', 'bjj', 'jiu jitsu', 'mma', 'kung fu'],
  Golf: ['golf'],
  Running: ['running', 'run', 'jogging', 'marathon', 'sprint'],
  Cycling: ['cycling', 'cycle', 'spin', 'spinning', 'bike'],
  CrossFit: ['crossfit', 'cross fit', 'hiit', 'wod'],
  Gymnastics: ['gymnastics', 'gymnast', 'acrobatics'],
  Skating: ['skating', 'skate', 'rollerblade', 'ice skating'],
  // Dance
  Ballet: ['ballet', 'pointe', 'barre'],
  'Hip Hop': ['hip hop', 'hiphop', 'hip-hop', 'breaking', 'breakdance'],
  Salsa: ['salsa', 'merengue', 'bachata'],
  Contemporary: ['contemporary', 'modern dance'],
  Ballroom: ['ballroom', 'waltz', 'tango', 'foxtrot', 'cha cha'],
  Jazz: ['jazz dance', 'jazz'],
  Tap: ['tap dance', 'tap'],
  'K-Pop': ['k-pop', 'kpop', 'k pop', 'korean pop'],
  Zumba: ['zumba'],
  Swing: ['swing dance', 'swing', 'lindy hop'],
  'Belly Dance': ['belly dance', 'bellydance', 'belly dancing'],
  Flamenco: ['flamenco'],
}

function detectSubcategory(text: string): string | null {
  const lower = text.toLowerCase()
  for (const [subcategory, keywords] of Object.entries(SUBCATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) return subcategory
  }
  return null
}

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
    await query(`ALTER TABLE classes ADD COLUMN IF NOT EXISTS subcategory TEXT`)
    await query(`UPDATE classes SET status = 'active' WHERE status IS NULL OR status = '' OR status = 'deleted'`)

    // Auto-detect subcategories for classes that don't have one yet
    const untagged = await query(
      `SELECT id, title, description FROM classes WHERE subcategory IS NULL AND status IS DISTINCT FROM 'deleted'`,
      []
    )
    let updated = 0
    for (const row of untagged.rows) {
      const searchText = `${row.title || ''} ${row.description || ''}`
      const detected = detectSubcategory(searchText)
      if (detected) {
        await query(`UPDATE classes SET subcategory = $1 WHERE id = $2`, [detected, row.id])
        updated++
      }
    }

    return NextResponse.json({ message: 'Migration successful', subcategoriesDetected: updated })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
  }
}
