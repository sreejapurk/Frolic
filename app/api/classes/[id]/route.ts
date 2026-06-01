import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

const DAY_NAMES: Record<string, number> = { sun:0,sunday:0,mon:1,monday:1,tue:2,tuesday:2,wed:3,wednesday:3,thu:4,thursday:4,fri:5,friday:5,sat:6,saturday:6 }
const MONTH_NAMES: Record<string, number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 }
const SHORT_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function nextOccurrence(dateStr: string): string {
  if (!dateStr) return dateStr
  const today = new Date(); today.setHours(0,0,0,0)
  // Only use new Date() for ISO format (YYYY-MM-DD) — V8 misparses "Thu, Jun 4" as a wrong year
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const attempted = new Date(dateStr + 'T00:00:00')
    if (!isNaN(attempted.getTime())) {
      attempted.setHours(0,0,0,0)
      if (attempted >= today) return `${SHORT_DAYS[attempted.getDay()]}, ${SHORT_MONTHS[attempted.getMonth()]} ${attempted.getDate()}`
      const targetDay = attempted.getDay(); const currentDay = today.getDay()
      let daysAhead = targetDay - currentDay; if (daysAhead <= 0) daysAhead += 7
      const next = new Date(today); next.setDate(today.getDate() + daysAhead)
      return `${SHORT_DAYS[next.getDay()]}, ${SHORT_MONTHS[next.getMonth()]} ${next.getDate()}`
    }
  }
  const monthDayMatch = dateStr.match(/(?:(\w+),\s*)?(\w+)\s+(\d+)/)
  if (monthDayMatch) {
    const dayNameHint = monthDayMatch[1]?.toLowerCase()
    const monthIdx = MONTH_NAMES[monthDayMatch[2].toLowerCase().slice(0,3)]
    const day = parseInt(monthDayMatch[3])
    if (monthIdx !== undefined && day) {
      const candidate = new Date(today.getFullYear(), monthIdx, day); candidate.setHours(0,0,0,0)
      if (candidate >= today) return `${SHORT_DAYS[candidate.getDay()]}, ${SHORT_MONTHS[candidate.getMonth()]} ${candidate.getDate()}`
      const targetDay = (dayNameHint && DAY_NAMES[dayNameHint] !== undefined) ? DAY_NAMES[dayNameHint] : candidate.getDay()
      const currentDay = today.getDay(); let daysAhead = targetDay - currentDay; if (daysAhead <= 0) daysAhead += 7
      const next = new Date(today); next.setDate(today.getDate() + daysAhead)
      return `${SHORT_DAYS[next.getDay()]}, ${SHORT_MONTHS[next.getMonth()]} ${next.getDate()}`
    }
  }
  const firstWord = dateStr.trim().split(/[\s,]+/)[0].toLowerCase()
  const targetDay = DAY_NAMES[firstWord]; if (targetDay === undefined) return dateStr
  const currentDay = today.getDay(); let daysAhead = targetDay - currentDay; if (daysAhead < 0) daysAhead += 7
  const next = new Date(today); next.setDate(today.getDate() + daysAhead)
  return `${SHORT_DAYS[next.getDay()]}, ${SHORT_MONTHS[next.getMonth()]} ${next.getDate()}`
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const result = await query(
      `SELECT c.*,
        COALESCE(
          json_agg(
            json_build_object('id', s.id, 'date', s.date, 'time', s.time, 'duration', s.duration, 'spots', s.spots, 'spots_left', s.spots_left, 'label', s.label)
            ORDER BY s.time
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) as slots
       FROM classes c
       LEFT JOIN class_slots s ON s.class_id = c.id
       WHERE c.id = $1
       GROUP BY c.id`,
      [id]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }
    const row = result.rows[0]
    const processed = {
      ...row,
      date: nextOccurrence(row.date),
      slots: (row.slots || []).map((s: any) => ({ ...s, date: nextOccurrence(s.date) })),
    }
    return NextResponse.json(processed)
  } catch (error) {
    console.error('Error fetching class:', error)
    return NextResponse.json({ error: 'Failed to fetch class' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await query('UPDATE classes SET status = $1 WHERE id = $2', ['deleted', id])
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 })
  }
}
