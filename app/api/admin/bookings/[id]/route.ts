import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Get the booking to find the class
  const booking = await query('SELECT class_id, slot_id FROM bookings WHERE id = $1', [id])
  if (booking.rows.length === 0) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const { class_id: classId, slot_id: slotId } = booking.rows[0]

  await query('DELETE FROM bookings WHERE id = $1', [id])

  if (slotId) {
    await query('UPDATE class_slots SET spots_left = spots_left + 1 WHERE id = $1', [slotId])
  } else if (classId) {
    await query('UPDATE classes SET spots_left = spots_left + 1 WHERE id = $1', [classId])
  }

  return NextResponse.json({ ok: true })
}
