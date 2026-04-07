import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

const DAY_NAMES: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function nextOccurrence(dateStr: string): string {
  if (!dateStr) return dateStr
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Try to parse as a real date first (handles "Apr 7", "Mon, Apr 7", "2025-04-07", etc.)
  const attempted = new Date(dateStr)
  if (!isNaN(attempted.getTime())) {
    // It's a real date — if in the future, show it; if past, roll forward by week
    attempted.setHours(0, 0, 0, 0)
    if (attempted >= today) {
      return `${SHORT_DAYS[attempted.getDay()]}, ${SHORT_MONTHS[attempted.getMonth()]} ${attempted.getDate()}`
    }
    // Past date: find next occurrence of that same day of week
    const targetDay = attempted.getDay()
    const currentDay = today.getDay()
    let daysAhead = targetDay - currentDay
    if (daysAhead <= 0) daysAhead += 7
    const next = new Date(today)
    next.setDate(today.getDate() + daysAhead)
    return `${SHORT_DAYS[next.getDay()]}, ${SHORT_MONTHS[next.getMonth()]} ${next.getDate()}`
  }

  // Fall back to day-name matching ("Mon", "Tuesday", etc.)
  const firstWord = dateStr.trim().split(/[\s,]+/)[0].toLowerCase()
  const targetDay = DAY_NAMES[firstWord]
  if (targetDay === undefined) return dateStr

  const currentDay = today.getDay()
  let daysAhead = targetDay - currentDay
  if (daysAhead < 0) daysAhead += 7
  const next = new Date(today)
  next.setDate(today.getDate() + daysAhead)
  return `${SHORT_DAYS[next.getDay()]}, ${SHORT_MONTHS[next.getMonth()]} ${next.getDate()}`
}

export async function GET() {
  try {
    // Auto-reset spots for all class slots that are 7+ days old
    try {
      await query(`
        UPDATE class_slots s
        SET spots_left = s.spots, spots_reset_at = NOW()
        FROM classes c
        WHERE s.class_id = c.id
          AND c.status IS DISTINCT FROM 'deleted'
          AND (s.spots_reset_at IS NULL OR s.spots_reset_at < NOW() - INTERVAL '7 days')
      `)
    } catch (e) {
      console.error('Spot reset skipped:', e)
    }

    const result = await query(
      `SELECT c.*,
        COALESCE(
          json_agg(
            json_build_object('id', s.id, 'date', s.date, 'time', s.time, 'duration', s.duration, 'spots', s.spots, 'spots_left', s.spots_left)
            ORDER BY s.time
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) as slots
       FROM classes c
       LEFT JOIN class_slots s ON s.class_id = c.id
       WHERE c.status IS DISTINCT FROM 'deleted'
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      []
    )
    const rows = result.rows.map((c: any) => ({
      ...c,
      date: nextOccurrence(c.date),
      slots: (c.slots || []).map((s: any) => ({ ...s, date: nextOccurrence(s.date) })),
    }))

    // Sort by soonest upcoming slot date
    const parseDate = (dateStr: string) => {
      try { const d = new Date(dateStr); return isNaN(d.getTime()) ? Infinity : d.getTime() } catch { return Infinity }
    }
    rows.sort((a: any, b: any) => {
      const aDate = a.slots?.length > 0 ? Math.min(...a.slots.map((s: any) => parseDate(s.date))) : parseDate(a.date)
      const bDate = b.slots?.length > 0 ? Math.min(...b.slots.map((s: any) => parseDate(s.date))) : parseDate(b.date)
      return aDate - bDate
    })

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const id = uuidv4()

    const slots: any[] = data.slots || []
    const firstSlot = slots[0] || {}
    const date = firstSlot.date || data.date || ''
    const time = firstSlot.time || data.time || ''
    const duration = firstSlot.duration || data.duration || '60 min'
    const spots = parseInt(firstSlot.spots || data.spots || '10') || 10

    // Resolve studio_user_id from email if provided
    let studioUserId = data.studio_user_id || null
    if (!studioUserId && data.studio_email) {
      const su = await query('SELECT id FROM studio_users WHERE LOWER(email) = LOWER($1)', [data.studio_email])
      if (su.rows.length > 0) studioUserId = su.rows[0].id
    }

    const result = await query(
      `INSERT INTO classes (id, title, studio, category, subcategory, price, level, duration, date, time, spots, spots_left, distance, rating, image, instructor, room, room_maps_url, recurring, status, description, location_type, location_types, price_location, price_online, price_residence, instructor_background, studio_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 'active', $20, $21, $22, $23, $24, $25, $26, $27)
       RETURNING *`,
      [id, data.title, data.studio, data.category, data.subcategory || null, data.price, data.level,
       duration, date, time, spots, spots,
       data.distance || '', data.rating || '4.9', data.image || '', data.instructor, data.room || null, data.room_maps_url || null,
       data.recurring ?? false, data.description || null, data.location_type || 'location', data.location_types || null,
       data.price_location || null, data.price_online || null, data.price_residence || null, data.instructor_background || null,
       studioUserId]
    )

    for (const slot of slots) {
      if (!slot.date || !slot.time) continue
      const slotSpots = parseInt(slot.spots) || 10
      await query(
        `INSERT INTO class_slots (class_id, date, time, duration, spots, spots_left) VALUES ($1, $2, $3, $4, $5, $5)`,
        [id, slot.date, slot.time, slot.duration || '60 min', slotSpots]
      )
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}