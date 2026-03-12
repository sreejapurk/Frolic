import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { query } from '@/lib/db'
import { signCustomerToken } from '@/lib/customer-auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password)
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })

  const result = await query('SELECT * FROM customers WHERE email = $1', [email])
  if (result.rows.length === 0)
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

  const customer = result.rows[0]
  const valid = await bcrypt.compare(password, customer.password_hash)
  if (!valid)
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

  const token = await signCustomerToken(customer.id, customer.email, customer.first_name)

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
