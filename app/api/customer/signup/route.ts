import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signCustomerToken } from '@/lib/customer-auth'

export async function POST(req: NextRequest) {
  const { firstName, lastName, email, password } = await req.json()

  if (!firstName || !lastName || !email || !password)
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })

  if (password.length < 8)
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

  const existing = await query('SELECT id FROM customers WHERE email = $1', [email])
  if (existing.rows.length > 0)
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)
  const result = await query(
    'INSERT INTO customers (email, first_name, last_name, password_hash) VALUES ($1, $2, $3, $4) RETURNING id',
    [email, firstName, lastName, passwordHash]
  )

  const customerId = result.rows[0].id
  const token = await signCustomerToken(customerId, email, firstName)

  const res = NextResponse.json({ success: true })
  res.cookies.set('customer_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
