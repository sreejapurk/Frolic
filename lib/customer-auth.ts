import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

export async function signCustomerToken(customerId: string, email: string, firstName: string) {
  return await new SignJWT({ customerId, email, firstName })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyCustomerToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { customerId: string; email: string; firstName: string }
  } catch {
    return null
  }
}

export async function getCustomerSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('customer_token')?.value
  if (!token) return null
  return verifyCustomerToken(token)
}
