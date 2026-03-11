import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret')

export async function signStudioToken(studioId: string, email: string, studioName: string) {
  return await new SignJWT({ studioId, email, studioName })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyStudioToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { studioId: string; email: string; studioName: string }
  } catch {
    return null
  }
}

export async function getStudioSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('studio_token')?.value
  if (!token) return null
  return verifyStudioToken(token)
}
