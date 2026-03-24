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
  // Extract day of week from strings like "Mon, Mar 24" or "Monday" or "Mon"
  const firstWord = dateStr.trim().split(/[\s,]+/)[0].toLowerCase()
  const targetDay = DAY_NAMES[firstWord]
  if (targetDay === undefined) return dateStr // can't parse, return as-is

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentDay = today.getDay()
  let daysAhead = targetDay - currentDay
  if (daysAhead <= 0) daysAhead += 7 // always show next upcoming, not today
  const next = new Date(today)
  next.setDate(today.getDate() + daysAhead)
  return `${SHORT_DAYS[next.getDay()]}, ${SHORT_MONTHS[next.getMonth()]} ${next.getDate()}`
}

export async function GET() {
  try {
    const result = await query(
      "SELECT * FROM classes WHERE status IS DISTINCT FROM 'deleted' ORDER BY created_at DESC",
      []
    )
    const rows = result.rows.map((c: any) => {
      if (c.recurring) {
        return { ...c, date: nextOccurrence(c.date) }
      }
      return c
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
    const result = await query(
      `INSERT INTO classes (id, title, studio, category, price, level, duration, date, time, spots, spots_left, distance, rating, image, instructor, room)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [id, data.title, data.studio, data.category, data.price, data.level,
       data.duration, data.date, data.time, data.spots, data.spots,
       data.distance, data.rating || '4.9', data.image, data.instructor, data.room]
    )
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 })
  }
}