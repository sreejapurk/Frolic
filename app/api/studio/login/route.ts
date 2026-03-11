import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { signStudioToken } from '@/lib/studio-auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const result = await query('SELECT * FROM studio_users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const studio = result.rows[0]
    const valid = await bcrypt.compare(password, studio.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!studio.approved) {
      return NextResponse.json({ error: 'Your account is pending approval. You will be notified once approved.' }, { status: 403 })
    }

    const token = await signStudioToken(studio.id, studio.email, studio.studio_name)

    const res = NextResponse.json({ ok: true, studioName: studio.studio_name })
    res.cookies.set('studio_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  } catch (error) {
    console.error('Studio login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
