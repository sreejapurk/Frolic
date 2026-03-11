import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password, studioName } = await req.json()
    if (!email || !password || !studioName) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const existing = await query('SELECT id FROM studio_users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await query(
      `INSERT INTO studio_users (email, studio_name, password_hash, approved) VALUES ($1, $2, $3, false)`,
      [email, studioName, passwordHash]
    )

    return NextResponse.json({ message: 'Application submitted! You will be notified once approved.' })
  } catch (error) {
    console.error('Studio signup error:', error)
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
  }
}
