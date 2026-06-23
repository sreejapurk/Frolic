import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST() {
  try {
    await resend.emails.send({
      from: 'Frolic <hello@joinfrolic.com>',
      to: 'hello@joinfrolic.com',
      subject: 'Booking Confirmed — Sample Vocal Class with Erene',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0F1624; color: white; padding: 40px; border-radius: 16px;">
          <h1 style="color: #F97316; font-size: 28px; margin-bottom: 8px;">You're booked!</h1>
          <p style="color: #9CA3AF; font-size: 16px; margin-bottom: 32px;">Hi Jane, your booking is confirmed.</p>

          <div style="background-color: #1A2332; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1);">
            <h2 style="color: white; font-size: 20px; margin-bottom: 16px;">Sample Vocal Class with Erene</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #9CA3AF; padding: 8px 0; font-size: 14px;">Order ID</td>
                <td style="color: white; padding: 8px 0; font-size: 14px; text-align: right; font-family: monospace;">FRO-SAMPLE-001</td>
              </tr>
              <tr>
                <td style="color: #9CA3AF; padding: 8px 0; font-size: 14px;">Name</td>
                <td style="color: white; padding: 8px 0; font-size: 14px; text-align: right;">Jane Doe</td>
              </tr>
              <tr>
                <td style="color: #9CA3AF; padding: 8px 0; font-size: 14px;">Email</td>
                <td style="color: white; padding: 8px 0; font-size: 14px; text-align: right;">jane@example.com</td>
              </tr>
              <tr style="border-top: 1px solid rgba(255,255,255,0.1);">
                <td style="color: white; padding: 12px 0; font-size: 16px; font-weight: bold;">Total Paid</td>
                <td style="color: #F97316; padding: 12px 0; font-size: 16px; font-weight: bold; text-align: right;">$49.99</td>
              </tr>
            </table>
          </div>

          <p style="color: #9CA3AF; font-size: 14px; margin-bottom: 8px;">Cancellation Policy: Full refund if cancelled 24 hours before the class starts.</p>
          <p style="color: #6B7280; font-size: 13px;">See you at class!</p>
          <p style="color: #F97316; font-size: 18px; font-weight: bold; margin-top: 24px;">Frolic</p>
        </div>
      `,
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
