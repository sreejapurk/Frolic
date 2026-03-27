import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const result = await query('UPDATE studio_users SET approved = true WHERE id = $1 RETURNING email, studio_name', [id])
    const studio = result.rows[0]

    let emailError = null
    if (studio) {
      const { error } = await resend.emails.send({
        from: 'Frolic <hello@joinfrolic.com>',
        to: studio.email,
        subject: 'Your Frolic studio account has been approved!',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0F1624; color: white; padding: 48px 40px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 36px;">
              <div style="display: inline-block; background: #F97316; width: 64px; height: 64px; border-radius: 16px; line-height: 64px; font-size: 34px; font-weight: 900; color: white;">F</div>
            </div>
            <h1 style="color: white; font-size: 30px; font-weight: 900; margin: 0 0 20px; text-align: center;">Congratulations! 🎉</h1>
            <p style="color: #D1D5DB; font-size: 16px; line-height: 1.7; margin-bottom: 16px;">
              Hi ${studio.studio_name},
            </p>
            <p style="color: #D1D5DB; font-size: 16px; line-height: 1.7; margin-bottom: 16px;">
              Your account has been approved!
            </p>
            <p style="color: #D1D5DB; font-size: 16px; line-height: 1.7; margin-bottom: 16px;">
              Please let me know if you have any questions or concerns about the process — I'm always happy to help.
            </p>
            <p style="color: #D1D5DB; font-size: 16px; line-height: 1.7; margin-bottom: 32px;">
              Excited for you to fill all your classes and be a part of the Frolic community! 🧡
            </p>
            <div style="text-align: center; margin-bottom: 36px;">
              <a href="https://www.joinfrolic.com/studio/login" style="display: inline-block; background: #F97316; color: white; padding: 16px 36px; border-radius: 12px; font-weight: 700; font-size: 16px; text-decoration: none;">
                Go to your dashboard →
              </a>
            </div>
            <p style="color: #6B7280; font-size: 13px; text-align: center; margin: 0;">
              hello@joinfrolic.com · <a href="https://www.joinfrolic.com" style="color: #F97316; text-decoration: none;">joinfrolic.com</a>
            </p>
          </div>
        `,
      })
      if (error) emailError = error.message
    }

    return NextResponse.json({ ok: true, emailError })
  } catch (error) {
    console.error('Approve error:', error)
    return NextResponse.json({ error: 'Failed to approve studio' }, { status: 500 })
  }
}
