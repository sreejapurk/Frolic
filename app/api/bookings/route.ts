import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM bookings ORDER BY created_at DESC'
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const result = await query(
      `INSERT INTO bookings (order_id, class_id, class_name, first_name, last_name, email, phone, amount, stripe_payment_id, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'paid')
       RETURNING *`,
      [
        data.orderId,
        data.classId,
        data.className,
        data.firstName,
        data.lastName,
        data.email,
        data.phone || null,
        data.amount,
        data.stripePaymentId || null,
      ]
    )

    await query(
      `UPDATE classes SET spots_left = spots_left - 1 WHERE id = $1 AND spots_left > 0`,
      [data.classId]
    )

    // Send confirmation email
    try {
      await resend.emails.send({
        from: 'Frolic <hello@joinfrolic.com>',
        to: data.email,
        subject: `Booking Confirmed — ${data.className}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0F1624; color: white; padding: 40px; border-radius: 16px;">
            <h1 style="color: #F97316; font-size: 28px; margin-bottom: 8px;">You're booked!</h1>
            <p style="color: #9CA3AF; font-size: 16px; margin-bottom: 32px;">Hi ${data.firstName}, your booking is confirmed.</p>

            <div style="background-color: #1A2332; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1);">
              <h2 style="color: white; font-size: 20px; margin-bottom: 16px;">${data.className}</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #9CA3AF; padding: 8px 0; font-size: 14px;">Order ID</td>
                  <td style="color: white; padding: 8px 0; font-size: 14px; text-align: right; font-family: monospace;">${data.orderId}</td>
                </tr>
                <tr>
                  <td style="color: #9CA3AF; padding: 8px 0; font-size: 14px;">Name</td>
                  <td style="color: white; padding: 8px 0; font-size: 14px; text-align: right;">${data.firstName} ${data.lastName}</td>
                </tr>
                <tr>
                  <td style="color: #9CA3AF; padding: 8px 0; font-size: 14px;">Email</td>
                  <td style="color: white; padding: 8px 0; font-size: 14px; text-align: right;">${data.email}</td>
                </tr>
                <tr style="border-top: 1px solid rgba(255,255,255,0.1);">
                  <td style="color: white; padding: 12px 0; font-size: 16px; font-weight: bold;">Total Paid</td>
                  <td style="color: #F97316; padding: 12px 0; font-size: 16px; font-weight: bold; text-align: right;">$${data.amount}</td>
                </tr>
              </table>
            </div>

            <p style="color: #9CA3AF; font-size: 14px; margin-bottom: 8px;">Cancellation Policy: Full refund if cancelled 24 hours before the class starts.</p>
            <p style="color: #6B7280; font-size: 13px;">See you at class!</p>
            <p style="color: #F97316; font-size: 18px; font-weight: bold; margin-top: 24px;">Frolic</p>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Email send failed:', emailError)
      // Don't fail the booking if email fails
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
