import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const result = await query('UPDATE studio_users SET approved = true WHERE id = $1 RETURNING email, studio_name', [id])
    const studio = result.rows[0]

    if (studio) {
      await resend.emails.send({
        from: 'Frolic <hello@joinfrolic.com>',
        to: studio.email,
        subject: 'Your Frolic studio account has been approved!',
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; background: #0F1624; color: white; padding: 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: #F97316; width: 60px; height: 60px; border-radius: 14px; line-height: 60px; font-size: 32px; font-weight: 900; color: white;">F</div>
            </div>
            <h1 style="color: white; font-size: 28px; font-weight: 900; margin-bottom: 16px;">You're approved! 🎉</h1>
            <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hi ${studio.studio_name}, your Frolic studio account has been approved. You can now log in and start listing your classes.
            </p>
            <a href="https://joinfrolic.com/studio/login" style="display: inline-block; background: #F97316; color: white; padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 16px; text-decoration: none; margin-bottom: 32px;">
              Log in to your dashboard →
            </a>
            <p style="color: #6B7280; font-size: 14px;">
              If you have any questions, just reply to this email.
            </p>
          </div>
        `,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Approve error:', error)
    return NextResponse.json({ error: 'Failed to approve studio' }, { status: 500 })
  }
}
