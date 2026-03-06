import { NextRequest, NextResponse } from 'next/server'
import { isValidAdminPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    if (isValidAdminPassword(password)) {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 })
  }
}
